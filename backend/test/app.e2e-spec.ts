import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { existsSync } from 'fs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { deleteDocumentFiles, resolveUploadPath } from '../src/common/document-storage';

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
  const ownedFiles: Array<{ filePath?: string; fileUrl?: string; thumbnailUrl?: string }> = [];
  const subjectId = new Types.ObjectId();
  const otherSubjectId = new Types.ObjectId();
  const user = { email: 'qa@st.phenikaa-uni.edu.vn', password: 'Testpass123!', fullName: 'QA Student' };
  const mod = { email: 'qa-mod@st.phenikaa-uni.edu.vn', password: 'Testpass123!', fullName: 'QA Moderator' };
  const admin = { email: 'qa-admin@st.phenikaa-uni.edu.vn', password: 'Testpass123!', fullName: 'QA Admin' };
  const wordFile = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    db = app.get<Connection>(getConnectionToken());
    if (!/^unishare_e2e_\d+_[0-9a-f]+$/.test(db.name)) throw new Error('Unsafe test database');
    await Promise.all(Object.values(db.models).map((model) => model.init()));
    await db.collection('subjects').insertMany([
      { _id: subjectId, name: 'Testing', code: 'QA101', managingFaculty: 'QA Faculty' },
      { _id: otherSubjectId, name: 'Other', code: 'QA102', managingFaculty: 'Other Faculty' },
    ]);
  });

  afterAll(async () => {
    for (const file of ownedFiles) await deleteDocumentFiles(file);
    if (db && /^unishare_e2e_\d+_[0-9a-f]+$/.test(db.name)) await db.dropDatabase();
    if (app) await app.close();
  });

  const login = async (account: typeof user) => {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send(account).expect(400);
    // A login body cannot contain fullName: whitelist validation must apply.
    expect(response.body.message).toBeDefined();
    const ok = await request(app.getHttpServer()).post('/api/auth/login')
      .send({ email: account.email, password: account.password }).expect(200);
    return ok.body.accessToken as string;
  };

  it('rejects invalid registrations and role injection', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({ ...user, email: 'qa@example.com' }).expect(400);
    await request(app.getHttpServer()).post('/api/auth/register').send({ ...user, role: 'ADMIN' }).expect(400);
  });

  it('registers students, rejects duplicates, logs in and excludes passwords', async () => {
    for (const account of [user, mod, admin]) {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send(account).expect(201);
      expect(response.body.password).toBeUndefined();
      if (account === user) userId = response.body._id;
      if (account === mod) modId = response.body._id;
      if (account === admin) adminId = response.body._id;
    }
    await request(app.getHttpServer()).post('/api/auth/register').send(user).expect(409);
    await db.collection('users').updateOne({ _id: new Types.ObjectId(modId) }, { $set: { role: 'MODERATOR' } });
    await db.collection('users').updateOne({ _id: new Types.ObjectId(adminId) }, { $set: { role: 'ADMIN' } });
    token = await login(user);
    modToken = await login(mod);
    adminToken = await login(admin);
    const me = await request(app.getHttpServer()).get('/api/users/me/profile').auth(token, { type: 'bearer' }).expect(200);
    expect(me.body.email).toBe(user.email);
    expect(me.body.password).toBeUndefined();
  });

  it('does not disclose or change passwords through forgot-password', async () => {
    for (const email of [user.email, 'absent@st.phenikaa-uni.edu.vn']) {
      const response = await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email }).expect(200);
      expect(Object.keys(response.body)).toEqual(['message']);
    }
    await request(app.getHttpServer()).post('/api/auth/forgot-password').send({ email: {} }).expect(400);
    token = await login(user);
  });

  it('enforces authentication and admin/moderator roles', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    await request(app.getHttpServer()).get('/api/users/me/profile').expect(401);
    await request(app.getHttpServer()).post('/api/documents/upload').expect(401);
    await request(app.getHttpServer()).get('/api/statistics/platform').auth(token, { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/api/admin/users').auth(token, { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/api/admin/subjects').auth(modToken, { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/api/statistics/platform').auth(modToken, { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).get('/api/admin/logs').auth(adminToken, { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).get('/api/categories/subjects').expect(200);
    await request(app.getHttpServer()).get('/api/categories/majors').expect(200);
  });

  it.each(['page=0', 'page=abc', 'page=1.5', 'limit=101', 'limit=-1', 'uploader=bad', 'subject=bad', 'subjects=bad', 'sortBy=password', 'month=13'])(
    'rejects invalid list query %s', async (query) => {
      await request(app.getHttpServer()).get('/api/documents?' + query).expect(400);
    },
  );

  it('uploads a document and updates counts', async () => {
    const response = await request(app.getHttpServer()).post('/api/documents/upload').auth(token, { type: 'bearer' })
      .field('title', 'QA document [draft]').field('subject', String(subjectId))
      .attach('file', wordFile, { filename: 'qa-document.doc', contentType: 'application/msword' }).expect(201);
    documentId = response.body._id;
    uploadedPath = resolveUploadPath(response.body.filePath) as string;
    ownedFiles.push(response.body);
    expect(existsSync(uploadedPath)).toBe(true);
    const stats = await request(app.getHttpServer()).get('/api/users/me/stats').auth(token, { type: 'bearer' }).expect(200);
    expect(stats.body.totalUploads).toBe(1);
  });

  it('rejects unsupported file types with 400', async () => {
    await request(app.getHttpServer()).post('/api/documents/upload').auth(token, { type: 'bearer' })
      .field('title', 'Bad file').field('subject', String(subjectId))
      .attach('file', Buffer.from('<html>test</html>'), { filename: 'test.html', contentType: 'application/pdf' }).expect(400);
  });

  it('supports numeric pagination, literal search and subject/faculty intersection', async () => {
    const page = await request(app.getHttpServer()).get('/api/documents?page=1&limit=1').expect(200);
    expect(page.body.pagination).toEqual({ page: 1, limit: 1, total: 1, totalPages: 1 });
    const search = await request(app.getHttpServer()).get('/api/documents').query({ search: '[draft]' }).expect(200);
    expect(search.body.data).toHaveLength(1);
    const subjects = await request(app.getHttpServer()).get('/api/documents').query({ subjects: String(subjectId) }).expect(200);
    expect(subjects.body.data).toHaveLength(1);
    const many = await request(app.getHttpServer()).get('/api/documents?subjects=' + subjectId + '&subjects=' + otherSubjectId).expect(200);
    expect(many.body.data).toHaveLength(1);
    const none = await request(app.getHttpServer()).get('/api/documents').query({ faculty: 'Missing' }).expect(200);
    expect(none.body.data).toHaveLength(0);
    const intersection = await request(app.getHttpServer()).get('/api/documents').query({ faculty: 'Other Faculty', subjects: String(subjectId) }).expect(200);
    expect(intersection.body.data).toHaveLength(0);
  });

  it('previews, downloads and protects file URLs and ownership', async () => {
    await request(app.getHttpServer()).get('/api/documents/' + documentId).expect(200);
    await request(app.getHttpServer()).get('/api/documents/' + documentId + '/preview').expect(200);
    await request(app.getHttpServer()).get('/api/documents/' + documentId + '/download').expect(401);
    const download = await request(app.getHttpServer()).get('/api/documents/' + documentId + '/download').auth(token, { type: 'bearer' }).expect(200);
    expect(download.headers['content-disposition']).toContain('attachment;');
    await request(app.getHttpServer()).get('/uploads/' + uploadedPath.split(/[\\/]/).pop()).expect(404);
    await request(app.getHttpServer()).patch('/api/documents/' + documentId).auth(modToken, { type: 'bearer' }).send({ title: 'Stolen' }).expect(403);
    await request(app.getHttpServer()).delete('/api/documents/' + documentId).auth(modToken, { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).patch('/api/documents/' + documentId).auth(token, { type: 'bearer' }).send({ title: 'Updated QA document' }).expect(200);
  });

  it('filters personal documents before pagination and sorts by download count', async () => {
    const entries = Array.from({ length: 13 }, (_, index) => ({
      title: 'Fixture ' + index, uploader: new Types.ObjectId(userId), subject: subjectId, status: 'VISIBLE',
      uploadDate: new Date('2025-02-15T12:00:00Z'), downloadCount: index, fileType: 'application/msword', fileSize: 12,
      fileUrl: 'http://localhost:8000/uploads/missing-fixture.doc',
    }));
    await db.collection('documents').insertMany(entries);
    const mine = await request(app.getHttpServer()).get('/api/documents/my-uploads?year=2025&month=2&page=2&limit=10&sortBy=downloadCount')
      .auth(token, { type: 'bearer' }).expect(200);
    expect(mine.body.pagination.total).toBe(13);
    expect(mine.body.data).toHaveLength(3);
    expect(mine.body.data[0].downloadCount).toBe(2);
    const publicPage = await request(app.getHttpServer()).get('/api/documents/user/' + userId + '/uploads?page=2&limit=10&sortBy=downloadCount').expect(200);
    expect(publicPage.body.data.length).toBe(4);
  });

  it('accepts reports, prevents duplicate pending reports, and restricts resolution', async () => {
    const payload = { documentId, reason: 'Nội dung cần được người quản lý kiểm tra.' };
    await request(app.getHttpServer()).post('/api/reports').send(payload).expect(401);
    await request(app.getHttpServer()).post('/api/reports').auth(token, { type: 'bearer' }).send({ ...payload, reason: 'short' }).expect(400);
    const report = await request(app.getHttpServer()).post('/api/reports').auth(token, { type: 'bearer' }).send(payload).expect(201);
    reportId = report.body.id;
    await request(app.getHttpServer()).post('/api/reports').auth(token, { type: 'bearer' }).send(payload).expect(409);
    await request(app.getHttpServer()).get('/api/reports').auth(token, { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).patch('/api/reports/' + reportId).auth(token, { type: 'bearer' }).send({ status: 'RESOLVED' }).expect(403);
    const list = await request(app.getHttpServer()).get('/api/reports?status=OPEN').auth(modToken, { type: 'bearer' }).expect(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0].document.title).toBe('Updated QA document');
    await request(app.getHttpServer()).patch('/api/reports/' + reportId).auth(modToken, { type: 'bearer' }).send({ status: 'RESOLVED' }).expect(200);
    await request(app.getHttpServer()).patch('/api/reports/' + reportId).auth(modToken, { type: 'bearer' }).send({ status: 'DISMISSED' }).expect(404);
  });

  it('blocks document access and restores it when unblocked', async () => {
    await request(app.getHttpServer()).post('/api/admin/documents/' + documentId + '/block').auth(modToken, { type: 'bearer' }).expect(201);
    await request(app.getHttpServer()).get('/api/documents/' + documentId).expect(404);
    await request(app.getHttpServer()).get('/api/documents/' + documentId + '/preview').expect(404);
    await request(app.getHttpServer()).get('/api/documents/' + documentId + '/download').auth(token, { type: 'bearer' }).expect(404);
    await request(app.getHttpServer()).post('/api/admin/documents/' + documentId + '/unblock').auth(modToken, { type: 'bearer' }).expect(201);
    await request(app.getHttpServer()).get('/api/documents/' + documentId).expect(200);
  });

  it('admin deletion removes the file and decrements the uploader count', async () => {
    await request(app.getHttpServer()).delete('/api/admin/documents/' + documentId).auth(adminToken, { type: 'bearer' }).expect(200);
    expect(existsSync(uploadedPath)).toBe(false);
    const stats = await request(app.getHttpServer()).get('/api/users/me/stats').auth(token, { type: 'bearer' }).expect(200);
    expect(stats.body.totalUploads).toBe(0);
  });

  it('revokes old tokens after logout and after a password change', async () => {
    await request(app.getHttpServer()).post('/api/auth/logout').auth(token, { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).get('/api/auth/me').auth(token, { type: 'bearer' }).expect(401);
    token = await login(user);
    await request(app.getHttpServer()).post('/api/users/me/change-password').auth(token, { type: 'bearer' })
      .send({ oldPassword: user.password, newPassword: 'Updatedpass123!' }).expect(201);
    await request(app.getHttpServer()).get('/api/auth/me').auth(token, { type: 'bearer' }).expect(401);
    token = await login({ ...user, password: 'Updatedpass123!' });
  });

  it('deletes only the authenticated user account and requires the password', async () => {
    await request(app.getHttpServer()).delete('/api/users/me/account').auth(token, { type: 'bearer' }).send({ password: 'wrongpass' }).expect(401);
    await request(app.getHttpServer()).delete('/api/users/me/account').auth(token, { type: 'bearer' }).send({ password: 'Updatedpass123!' }).expect(200);
    await request(app.getHttpServer()).get('/api/auth/me').auth(token, { type: 'bearer' }).expect(401);
    expect(await db.collection('documents').countDocuments({ uploader: new Types.ObjectId(userId) })).toBe(0);
  });
});
