import { create } from "zustand";
import api from "@/lib/axios";
import { User } from "@/@types/user.type";
import { Document as DocType } from "@/@types/document.type";

let usersRequestId = 0;
let documentsRequestId = 0;

export interface Subject {
  _id: string;
  name: string;
  code: string;
  managingFaculty: string;
}

export interface Major {
  _id: string;
  name: string;
  subjects: Subject[];
}

interface AdminState {
  subjects: Subject[];
  majors: Major[];
  users: User[];
  documents: DocType[];
  usersPagination: { total: number; page: number; totalPages: number };
  documentsPagination: { total: number; page: number; totalPages: number };
  usersLoading: boolean;
  documentsLoading: boolean;
  usersError: boolean;
  documentsError: boolean;
  usersQuery: { search?: string; role?: string; sortBy?: string; page: number };
  documentsQuery: { search?: string; page: number };

  fetchSubjects: () => Promise<void>;
  fetchMajors: () => Promise<void>;
  fetchUsers: (search?: string, role?: string, sortBy?: string, page?: number) => Promise<void>;
  fetchDocuments: (search?: string, page?: number) => Promise<void>;

  addSubject: (s: Omit<Subject, "_id">) => Promise<void>;
  updateSubject: (id: string, s: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  addMajor: (name: string, subjectIds: string[]) => Promise<void>;
  updateMajor: (id: string, name: string, subjectIds: string[]) => Promise<void>;
  deleteMajor: (id: string) => Promise<void>;

  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  updateUserRole: (id: string, role: User["role"]) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<{ message: string; newPassword: string }>;

  blockDocument: (id: string) => Promise<void>;
  unblockDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  subjects: [],
  majors: [],
  users: [],
  documents: [],
  usersPagination: { total: 0, page: 1, totalPages: 0 },
  documentsPagination: { total: 0, page: 1, totalPages: 0 },
  usersLoading: false,
  documentsLoading: false,
  usersError: false,
  documentsError: false,
  usersQuery: { page: 1 },
  documentsQuery: { page: 1 },

  fetchSubjects: async () => {
    const res = await api.get("/admin/subjects");
    set({ subjects: res.data });
  },
  fetchMajors: async () => {
    const res = await api.get("/admin/majors");
    set({ majors: res.data });
  },
  fetchUsers: async (search?: string, role?: string, sortBy?: string, page = 1) => {
    const requestId = ++usersRequestId;
    set({ users: [], usersLoading: true, usersError: false, usersQuery: { search, role, sortBy, page } });
    const params: Record<string, unknown> = { page, limit: 20 };
    if (search) params.search = search;
    if (role) params.role = role;
    if (sortBy) params.sortBy = sortBy;
    try {
      const res = await api.get("/admin/users", { params });
      if (requestId === usersRequestId) {
        set({ users: res.data.data, usersPagination: res.data.pagination, usersLoading: false });
      }
    } catch (error) {
      if (requestId !== usersRequestId) return;
      set({ usersError: true, usersLoading: false });
      throw error;
    }
  },
  fetchDocuments: async (search?: string, page = 1) => {
    const requestId = ++documentsRequestId;
    set({ documents: [], documentsLoading: true, documentsError: false, documentsQuery: { search, page } });
    try {
      const res = await api.get("/admin/documents", { params: { search, page, limit: 20 } });
      if (requestId === documentsRequestId) {
        set({ documents: res.data.data, documentsPagination: res.data.pagination, documentsLoading: false });
      }
    } catch (error) {
      if (requestId !== documentsRequestId) return;
      set({ documentsError: true, documentsLoading: false });
      throw error;
    }
  },

  addSubject: async (s) => {
    await api.post("/admin/subjects", s);
    await get().fetchSubjects();
  },
  updateSubject: async (id, data) => {
    await api.patch(`/admin/subjects/${id}`, data);
    await get().fetchSubjects();
  },
  deleteSubject: async (id) => {
    await api.delete(`/admin/subjects/${id}`);
    await get().fetchSubjects();
  },

  addMajor: async (name, subjectIds) => {
    await api.post("/admin/majors", { name, subjects: subjectIds });
    await get().fetchMajors();
  },
  updateMajor: async (id, name, subjectIds) => {
    await api.patch(`/admin/majors/${id}`, { name, subjects: subjectIds });
    await get().fetchMajors();
  },
  deleteMajor: async (id) => {
    await api.delete(`/admin/majors/${id}`);
    await get().fetchMajors();
  },

  blockUser: async (id) => {
    await api.post(`/admin/users/${id}/block`);
    const q = get().usersQuery;
    await get().fetchUsers(q.search, q.role, q.sortBy, q.page);
  },
  unblockUser: async (id) => {
    await api.post(`/admin/users/${id}/unblock`);
    const q = get().usersQuery;
    await get().fetchUsers(q.search, q.role, q.sortBy, q.page);
  },
  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    const q = get().usersQuery;
    await get().fetchUsers(q.search, q.role, q.sortBy, q.page);
    return res.data;
  },
  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
    const q = get().usersQuery;
    await get().fetchUsers(q.search, q.role, q.sortBy, q.page);
  },
  resetPassword: async (id) => {
    const res = await api.post(`/admin/users/${id}/reset-password`);
    return res.data;
  },

  blockDocument: async (id) => {
    await api.post(`/admin/documents/${id}/block`);
    const q = get().documentsQuery;
    await get().fetchDocuments(q.search, q.page);
  },
  unblockDocument: async (id) => {
    await api.post(`/admin/documents/${id}/unblock`);
    const q = get().documentsQuery;
    await get().fetchDocuments(q.search, q.page);
  },
  deleteDocument: async (id) => {
    await api.delete(`/admin/documents/${id}`);
    const q = get().documentsQuery;
    await get().fetchDocuments(q.search, q.page);
  },
}));
