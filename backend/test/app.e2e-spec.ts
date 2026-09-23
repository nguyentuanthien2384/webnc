import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { existsSync } from 'fs';
import { readdir, writeFile } from 'fs/promises';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { MailService } from '../src/auth/mail.service';
import {
  deleteDocumentFiles,
  resolveUploadPath,
} from '../src/common/document-storage';

describe('UniShare API with isolated MongoDB', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let token: string;
  let modToken: string;
  let adminToken: string;
  let userId: string;
  let modId: string;
  let adminId: string;
  let documentId: string;
  let reportId: string;
  let uploadedPath: string;
  let thumbnailPath: string;
  const emailOutbox: Array<{ to: string; url: string }> = [];
  let mailConfigured = true;
  const ownedFiles: Array<{
    filePath?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    thumbnailPath?: string;
  }> = [];
  const subjectId = new Types.ObjectId();
  const otherSubjectId = new Types.ObjectId();
  const user = {
    email: 'qa@st.phenikaa-uni.edu.vn',
    password: 'Testpass123!',
    fullName: 'QA Student',
  };
  const mod = {
    email: 'qa-mod@st.phenikaa-uni.edu.vn',
    password: 'Testpass123!',
    fullName: 'QA Moderator',
  };
  const admin = {
    email: 'qa-admin@st.phenikaa-uni.edu.vn',
    password: 'Testpass123!',
    fullName: 'QA Admin',
  };
  const wordFile = Buffer.from([
    0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0,
  ]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue({
        isConfigured: () => mailConfigured,
        sendPasswordReset: (to: string, url: string) => {
          emailOutbox.push({ to, url });
          return Promise.resolve();
        },
      })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    db = app.get<Connection>(getConnectionToken());
    if (!/^unishare_e2e_\d+_[0-9a-f]+$/.test(db.name))
      throw new Error('Unsafe test database');
    await Promise.all(Object.values(db.models).map((model) => model.init()));
    await db.collection('subjects').insertMany([
      {
        _id: subjectId,
        name: 'Testing',
        code: 'QA101',
        managingFaculty: 'QA Faculty',
      },
      {
        _id: otherSubjectId,
        name: 'Other',
        code: 'QA102',
        managingFaculty: 'Other Faculty',
      },
    ]);
  });

  afterAll(async () => {
    for (const file of ownedFiles) await deleteDocumentFiles(file);
    if (db && /^unishare_e2e_\d+_[0-9a-f]+$/.test(db.name))
      await db.dropDatabase();
    if (app) await app.close();
  });

  const login = async (account: typeof user) => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(account)
      .expect(400);
    // A login body cannot contain fullName: whitelist validation must apply.
    expect(response.body.message).toBeDefined();
    const ok = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: account.email, password: account.password })
      .expect(200);
    return ok.body.accessToken as string;
  };

  it('rejects invalid registrations and role injection', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...user, email: 'qa@example.com' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...user, role: 'ADMIN' })
      .expect(400);
  });

  it('registers students, rejects duplicates, logs in and excludes passwords', async () => {
    for (const account of [user, mod, admin]) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(account)
        .expect(201);
      expect(response.body.password).toBeUndefined();
      if (account === user) userId = response.body._id;
      if (account === mod) modId = response.body._id;
      if (account === admin) adminId = response.body._id;
    }
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(user)
      .expect(409);
    await db
      .collection('users')
      .updateOne(
        { _id: new Types.ObjectId(modId) },
        { $set: { role: 'MODERATOR' } },
      );
    await db
      .collection('users')
      .updateOne(
        { _id: new Types.ObjectId(adminId) },
        { $set: { role: 'ADMIN' } },
      );
    token = await login(user);
    modToken = await login(mod);
    adminToken = await login(admin);
    const me = await request(app.getHttpServer())
      .get('/api/users/me/profile')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(me.body.email).toBe(user.email);
    expect(me.body.password).toBeUndefined();
  });

  it('does not disclose accounts through forgot-password', async () => {
    const messages: string[] = [];
    for (const email of [user.email, 'absent@st.phenikaa-uni.edu.vn']) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email })
        .expect(200);
      expect(Object.keys(response.body)).toEqual(['message']);
      messages.push(response.body.message);
    }
    expect(messages[0]).toBe(messages[1]);
    expect(emailOutbox).toHaveLength(1);
    expect(emailOutbox[0].to).toBe(user.email);
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: {} })
      .expect(400);
    token = await login(user);
  });

  it('reports unavailable email service without changing passwords', async () => {
    mailConfigured = false;
    try {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: user.email })
        .expect(503);
    } finally {
      mailConfigured = true;
    }
    token = await login(user);
  });

  it('enforces authentication and admin/moderator roles', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    await request(app.getHttpServer()).get('/api/users/me/profile').expect(401);
    await request(app.getHttpServer())
      .post('/api/documents/upload')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/statistics/platform')
      .auth(token, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/users')
      .auth(token, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/subjects')
      .auth(modToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/statistics/platform')
      .auth(modToken, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/admin/logs')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/categories/subjects')
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/categories/majors')
      .expect(200);
  });

  it.each([
    'page=0',
    'page=abc',
    'page=1.5',
    'limit=101',
    'limit=-1',
    'uploader=bad',
    'subject=bad',
    'subjects=bad',
    'sortBy=password',
    'month=13',
  ])('rejects invalid list query %s', async (query) => {
    await request(app.getHttpServer())
      .get('/api/documents?' + query)
      .expect(400);
  });

  it('uploads a document and updates counts', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/documents/upload')
      .auth(token, { type: 'bearer' })
      .field('title', 'QA document [draft]')
      .field('subject', String(subjectId))
      .attach('file', wordFile, {
        filename: 'qa-document.doc',
        contentType: 'application/msword',
      })
      .expect(201);
    documentId = response.body._id;
    uploadedPath = resolveUploadPath(response.body.filePath) as string;
    ownedFiles.push(response.body);
    expect(existsSync(uploadedPath)).toBe(true);
    const stats = await request(app.getHttpServer())
      .get('/api/users/me/stats')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(stats.body.totalUploads).toBe(1);
  });

  it('rejects unsupported file types with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/documents/upload')
      .auth(token, { type: 'bearer' })
      .field('title', 'Bad file')
      .field('subject', String(subjectId))
      .attach('file', Buffer.from('<html>test</html>'), {
        filename: 'test.html',
        contentType: 'application/pdf',
      })
      .expect(400);
  });

  it('removes a file when metadata validation fails', async () => {
    const before = new Set(await readdir('uploads'));
    await request(app.getHttpServer())
      .post('/api/documents/upload')
      .auth(token, { type: 'bearer' })
      .field('title', 'Invalid subject')
      .field('subject', 'not-an-object-id')
      .attach('file', wordFile, {
        filename: 'invalid.doc',
        contentType: 'application/msword',
      })
      .expect(400);
    const after = (await readdir('uploads')).filter(
      (name) => !before.has(name),
    );
    expect(after).toEqual([]);
  });

  it('supports numeric pagination, literal search and subject/faculty intersection', async () => {
    const page = await request(app.getHttpServer())
      .get('/api/documents?page=1&limit=1')
      .expect(200);
    expect(page.body.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
    const search = await request(app.getHttpServer())
      .get('/api/documents')
      .query({ search: '[draft]' })
      .expect(200);
    expect(search.body.data).toHaveLength(1);
    const subjects = await request(app.getHttpServer())
      .get('/api/documents')
      .query({ subjects: String(subjectId) })
      .expect(200);
    expect(subjects.body.data).toHaveLength(1);
    const many = await request(app.getHttpServer())
      .get(
        '/api/documents?subjects=' +
          String(subjectId) +
          '&subjects=' +
          String(otherSubjectId),
      )
      .expect(200);
    expect(many.body.data).toHaveLength(1);
    const none = await request(app.getHttpServer())
      .get('/api/documents')
      .query({ faculty: 'Missing' })
      .expect(200);
    expect(none.body.data).toHaveLength(0);
    const intersection = await request(app.getHttpServer())
      .get('/api/documents')
      .query({ faculty: 'Other Faculty', subjects: String(subjectId) })
      .expect(200);
    expect(intersection.body.data).toHaveLength(0);
  });

  it('previews, downloads and protects file URLs and ownership', async () => {
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId)
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId + '/preview')
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId + '/download')
      .expect(401);
    const download = await request(app.getHttpServer())
      .get('/api/documents/' + documentId + '/download')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(download.headers['content-disposition']).toContain('attachment;');
    await request(app.getHttpServer())
      .get('/uploads/' + uploadedPath.split(/[\\/]/).pop())
      .expect(404);
    await request(app.getHttpServer())
      .patch('/api/documents/' + documentId)
      .auth(modToken, { type: 'bearer' })
      .send({ title: 'Stolen' })
      .expect(403);
    await request(app.getHttpServer())
      .delete('/api/documents/' + documentId)
      .auth(modToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .patch('/api/documents/' + documentId)
      .auth(token, { type: 'bearer' })
      .send({ title: 'Updated QA document' })
      .expect(200);
  });

  it('serves thumbnails only through the visible document', async () => {
    thumbnailPath = `uploads/thumbnails/qa-${documentId}.png`;
    await writeFile(thumbnailPath, Buffer.from('89504e470d0a1a0a', 'hex'));
    ownedFiles.push({ thumbnailPath });
    await db.collection('documents').updateOne(
      { _id: new Types.ObjectId(documentId) },
      {
        $set: {
          thumbnailPath,
          thumbnailUrl: `http://localhost:8000/api/documents/${documentId}/thumbnail`,
        },
      },
    );
    await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/thumbnail`)
      .expect(200)
      .expect('Content-Type', /image\/png/);
    await request(app.getHttpServer())
      .get(`/uploads/thumbnails/qa-${documentId}.png`)
      .expect(404);
  });

  it('saves private editor drafts linked to documents with version checks', async () => {
    const content = {
      blocks: [{ type: 'paragraph', data: { text: 'Ghi chú QA' } }],
    };
    await request(app.getHttpServer()).get('/api/editor/drafts').expect(401);
    const created = await request(app.getHttpServer())
      .post('/api/editor/drafts')
      .auth(token, { type: 'bearer' })
      .send({
        title: 'Bản nháp của tôi',
        content,
        sourceDocumentId: documentId,
      })
      .expect(201);
    const id = created.body._id as string;
    expect(created.body.version).toBe(0);
    await request(app.getHttpServer())
      .get(`/api/editor/drafts/${id}`)
      .auth(modToken, { type: 'bearer' })
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/editor/drafts/${id}`)
      .auth(modToken, { type: 'bearer' })
      .send({ version: 0, title: 'Stolen' })
      .expect(404);
    const linked = await request(app.getHttpServer())
      .get(`/api/editor/drafts/for-document/${documentId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(linked.body._id).toBe(id);
    const list = await request(app.getHttpServer())
      .get('/api/editor/drafts?page=1')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0].content).toBeUndefined();
    const updated = await request(app.getHttpServer())
      .patch(`/api/editor/drafts/${id}`)
      .auth(token, { type: 'bearer' })
      .send({ version: 0, title: 'Đã sửa', content })
      .expect(200);
    expect(updated.body.version).toBe(1);
    await request(app.getHttpServer())
      .patch(`/api/editor/drafts/${id}`)
      .auth(token, { type: 'bearer' })
      .send({ version: 0, title: 'Bản cũ' })
      .expect(409);
    await request(app.getHttpServer())
      .post('/api/editor/drafts')
      .auth(token, { type: 'bearer' })
      .send({
        title: 'Bad',
        content: { blocks: [{ type: 'script', data: {} }] },
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/editor/drafts')
      .auth(token, { type: 'bearer' })
      .send({ title: '   ', content })
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/api/editor/drafts/${id}`)
      .auth(token, { type: 'bearer' })
      .send({ version: 1 })
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/api/editor/drafts/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
  });

  it('filters personal documents before pagination and sorts by download count', async () => {
    const entries = Array.from({ length: 13 }, (_, index) => ({
      title: 'Fixture ' + index,
      uploader: new Types.ObjectId(userId),
      subject: subjectId,
      status: 'VISIBLE',
      uploadDate: new Date('2025-02-15T12:00:00Z'),
      downloadCount: index,
      fileType: 'application/msword',
      fileSize: 12,
      fileUrl: 'http://localhost:8000/uploads/missing-fixture.doc',
    }));
    await db.collection('documents').insertMany(entries);
    const mine = await request(app.getHttpServer())
      .get(
        '/api/documents/my-uploads?year=2025&month=2&page=2&limit=10&sortBy=downloadCount',
      )
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(mine.body.pagination.total).toBe(13);
    expect(mine.body.data).toHaveLength(3);
    expect(mine.body.data[0].downloadCount).toBe(2);
    const publicPage = await request(app.getHttpServer())
      .get(
        '/api/documents/user/' +
          userId +
          '/uploads?page=2&limit=10&sortBy=downloadCount',
      )
      .expect(200);
    expect(publicPage.body.data.length).toBe(4);
  });

  it('paginates admin lists and treats search text literally', async () => {
    const users = await request(app.getHttpServer())
      .get('/api/admin/users?page=1&limit=1')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    expect(users.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 3,
      totalPages: 3,
    });
    expect(users.body.data).toHaveLength(1);
    const documents = await request(app.getHttpServer())
      .get('/api/admin/documents?page=2&limit=10')
      .auth(modToken, { type: 'bearer' })
      .expect(200);
    expect(documents.body.pagination.total).toBe(14);
    expect(documents.body.data).toHaveLength(4);
    for (const path of ['/api/admin/users', '/api/admin/documents']) {
      const result = await request(app.getHttpServer())
        .get(path)
        .query({ search: '[' })
        .auth(adminToken, { type: 'bearer' })
        .expect(200);
      expect(result.body.pagination.total).toBe(0);
    }
    await request(app.getHttpServer())
      .get('/api/admin/users?limit=101')
      .auth(adminToken, { type: 'bearer' })
      .expect(400);
  });

  it('lets only admins manage subjects and majors', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/subjects')
      .auth(modToken, { type: 'bearer' })
      .send({ name: 'QA subject', code: 'QA200', managingFaculty: 'QA' })
      .expect(403);
    const subject = await request(app.getHttpServer())
      .post('/api/admin/subjects')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'QA subject', code: 'QA200', managingFaculty: 'QA' })
      .expect(201);
    const subjectId = subject.body._id as string;
    const major = await request(app.getHttpServer())
      .post('/api/admin/majors')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'QA major', subjects: [subjectId] })
      .expect(201);
    const majorId = major.body._id as string;
    await request(app.getHttpServer())
      .patch(`/api/admin/subjects/${subjectId}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'QA subject updated' })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/admin/majors/${majorId}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: 'QA major updated' })
      .expect(200);
    const publicMajor = await request(app.getHttpServer())
      .get(`/api/categories/majors/${majorId}`)
      .expect(200);
    expect(publicMajor.body.name).toBe('QA major updated');
    await request(app.getHttpServer())
      .delete(`/api/admin/majors/${majorId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/admin/subjects/${subjectId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('accepts reports, prevents duplicate pending reports, and restricts resolution', async () => {
    const payload = {
      documentId,
      reason: 'Nội dung cần được người quản lý kiểm tra.',
    };
    await request(app.getHttpServer())
      .post('/api/reports')
      .send(payload)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/reports')
      .auth(token, { type: 'bearer' })
      .send({ ...payload, reason: 'short' })
      .expect(400);
    const report = await request(app.getHttpServer())
      .post('/api/reports')
      .auth(token, { type: 'bearer' })
      .send(payload)
      .expect(201);
    reportId = report.body.id;
    await request(app.getHttpServer())
      .post('/api/reports')
      .auth(token, { type: 'bearer' })
      .send(payload)
      .expect(409);
    await request(app.getHttpServer())
      .get('/api/reports')
      .auth(token, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .patch('/api/reports/' + reportId)
      .auth(token, { type: 'bearer' })
      .send({ status: 'RESOLVED' })
      .expect(403);
    await request(app.getHttpServer())
      .patch('/api/reports/not-an-id')
      .auth(modToken, { type: 'bearer' })
      .send({ status: 'RESOLVED' })
      .expect(400);
    const list = await request(app.getHttpServer())
      .get('/api/reports?status=OPEN')
      .auth(modToken, { type: 'bearer' })
      .expect(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0].document.title).toBe('Updated QA document');
    await request(app.getHttpServer())
      .patch('/api/reports/' + reportId)
      .auth(modToken, { type: 'bearer' })
      .send({ status: 'RESOLVED' })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/api/reports/' + reportId)
      .auth(modToken, { type: 'bearer' })
      .send({ status: 'DISMISSED' })
      .expect(404);
  });

  it('blocks document access and restores it when unblocked', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/documents/' + documentId + '/block')
      .auth(modToken, { type: 'bearer' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId)
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId + '/preview')
      .expect(404);
    await request(app.getHttpServer())
      .get(`/api/documents/${documentId}/thumbnail`)
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId + '/download')
      .auth(token, { type: 'bearer' })
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/admin/documents/' + documentId + '/unblock')
      .auth(modToken, { type: 'bearer' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/documents/' + documentId)
      .expect(200);
  });

  it('admin deletion removes the file and decrements the uploader count', async () => {
    await request(app.getHttpServer())
      .delete('/api/admin/documents/' + documentId)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    expect(existsSync(uploadedPath)).toBe(false);
    expect(existsSync(thumbnailPath)).toBe(false);
    const stats = await request(app.getHttpServer())
      .get('/api/users/me/stats')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(stats.body.totalUploads).toBe(0);
  });

  it('revokes old tokens after logout and after a password change', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .auth(token, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(401);
    token = await login(user);
    await request(app.getHttpServer())
      .post('/api/users/me/change-password')
      .auth(token, { type: 'bearer' })
      .send({ oldPassword: user.password, newPassword: 'Updatedpass123!' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(401);
    token = await login({ ...user, password: 'Updatedpass123!' });
  });

  it('admin reset revokes sessions and account deletion removes files', async () => {
    const removable = {
      email: 'qa-removable@st.phenikaa-uni.edu.vn',
      password: 'Testpass123!',
      fullName: 'QA Removable',
    };
    const registration = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(removable)
      .expect(201);
    const removableToken = await login(removable);
    await request(app.getHttpServer())
      .post('/api/editor/drafts')
      .auth(removableToken, { type: 'bearer' })
      .send({ title: 'Sẽ xóa', content: { blocks: [] } })
      .expect(201);
    const upload = await request(app.getHttpServer())
      .post('/api/documents/upload')
      .auth(removableToken, { type: 'bearer' })
      .field('title', 'Temporary upload')
      .field('subject', String(otherSubjectId))
      .attach('file', wordFile, {
        filename: 'temporary.doc',
        contentType: 'application/msword',
      })
      .expect(201);
    ownedFiles.push(upload.body);
    const filePath = resolveUploadPath(upload.body.filePath) as string;
    const extraThumbnailPath = `uploads/thumbnails/qa-${upload.body._id}.png`;
    await writeFile(extraThumbnailPath, Buffer.from('89504e470d0a1a0a', 'hex'));
    ownedFiles.push({ thumbnailPath: extraThumbnailPath });
    await db
      .collection('documents')
      .updateOne(
        { _id: new Types.ObjectId(upload.body._id) },
        { $set: { thumbnailPath: extraThumbnailPath } },
      );
    const reset = await request(app.getHttpServer())
      .post(`/api/admin/users/${registration.body._id}/reset-password`)
      .auth(adminToken, { type: 'bearer' })
      .expect(201);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(removableToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: removable.email, password: reset.body.newPassword })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/admin/users/${registration.body._id}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
    expect(existsSync(filePath)).toBe(false);
    expect(existsSync(extraThumbnailPath)).toBe(false);
    expect(
      await db
        .collection('editor_drafts')
        .countDocuments({ owner: new Types.ObjectId(registration.body._id) }),
    ).toBe(0);
  });

  it('recovers a password with a one-time expiring email link', async () => {
    const recoveryUser = {
      email: 'qa-recovery@st.phenikaa-uni.edu.vn',
      password: 'Originalpass123!',
      fullName: 'QA Recovery',
    };
    const registered = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(recoveryUser)
      .expect(201);
    const oldToken = await login(recoveryUser);
    const before = emailOutbox.length;
    const response = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: recoveryUser.email })
      .expect(200);
    expect(Object.keys(response.body)).toEqual(['message']);
    expect(emailOutbox).toHaveLength(before + 1);
    const url = new URL(emailOutbox[before].url);
    expect(url.pathname).toBe('/reset-password');
    const resetToken = url.searchParams.get('token');
    expect(resetToken).toBeTruthy();
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: recoveryUser.email })
      .expect(200);
    expect(emailOutbox).toHaveLength(before + 1);
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({ token: resetToken, newPassword: 'short' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({ token: resetToken, newPassword: 'Recoveredpass123!' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(oldToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({ token: resetToken, newPassword: 'Againpass123!' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: recoveryUser.email, password: 'Recoveredpass123!' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: recoveryUser.email })
      .expect(200);
    const expiredToken = new URL(emailOutbox.at(-1)!.url).searchParams.get(
      'token',
    );
    await db
      .collection('password_reset_tokens')
      .updateOne(
        { user: new Types.ObjectId(registered.body._id) },
        { $set: { expiresAt: new Date(0) } },
      );
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({ token: expiredToken, newPassword: 'Expiredpass123!' })
      .expect(400);
    await request(app.getHttpServer())
      .delete(`/api/admin/users/${registered.body._id}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('deletes only the authenticated user account and requires the password', async () => {
    await request(app.getHttpServer())
      .post('/api/editor/drafts')
      .auth(token, { type: 'bearer' })
      .send({ title: 'Bản nháp cá nhân', content: { blocks: [] } })
      .expect(201);
    const ownThumbnailPath = `uploads/thumbnails/qa-own-${userId}.png`;
    await writeFile(ownThumbnailPath, Buffer.from('89504e470d0a1a0a', 'hex'));
    ownedFiles.push({ thumbnailPath: ownThumbnailPath });
    await db
      .collection('documents')
      .updateOne(
        { uploader: new Types.ObjectId(userId) },
        { $set: { thumbnailPath: ownThumbnailPath } },
      );
    await request(app.getHttpServer())
      .delete('/api/users/me/account')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .delete('/api/users/me/account')
      .auth(token, { type: 'bearer' })
      .send({ password: 'wrongpass' })
      .expect(401);
    await request(app.getHttpServer())
      .delete('/api/users/me/account')
      .auth(token, { type: 'bearer' })
      .send({ password: 'Updatedpass123!' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(401);
    expect(
      await db
        .collection('documents')
        .countDocuments({ uploader: new Types.ObjectId(userId) }),
    ).toBe(0);
    expect(existsSync(ownThumbnailPath)).toBe(false);
    expect(
      await db
        .collection('editor_drafts')
        .countDocuments({ owner: new Types.ObjectId(userId) }),
    ).toBe(0);
  });
});
