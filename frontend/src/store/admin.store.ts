import { create } from "zustand";
import api from "@/lib/axios";
import { User } from "@/@types/user.type";
import { Document as DocType } from "@/@types/document.type";

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

  fetchSubjects: () => Promise<void>;
  fetchMajors: () => Promise<void>;
  fetchUsers: (search?: string, role?: string, sortBy?: string) => Promise<void>;
  fetchDocuments: (search?: string) => Promise<void>;

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

  fetchSubjects: async () => {
    const res = await api.get("/admin/subjects");
    set({ subjects: res.data });
  },
  fetchMajors: async () => {
    const res = await api.get("/admin/majors");
    set({ majors: res.data });
  },
  fetchUsers: async (search?: string, role?: string, sortBy?: string) => {
    const params: Record<string, unknown> = { limit: 100 };
    if (search) params.search = search;
    if (role) params.role = role;
    if (sortBy) params.sortBy = sortBy;
    const res = await api.get("/admin/users", { params });
    set({ users: res.data.data });
  },
  fetchDocuments: async (search?: string) => {
    const res = await api.get("/admin/documents", { params: { search, limit: 100 } });
    set({ documents: res.data.data });
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
    await get().fetchUsers();
  },
  unblockUser: async (id) => {
    await api.post(`/admin/users/${id}/unblock`);
    await get().fetchUsers();
  },
  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    await get().fetchUsers();
    return res.data;
  },
  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
    await get().fetchUsers();
  },
  resetPassword: async (id) => {
    const res = await api.post(`/admin/users/${id}/reset-password`);
    return res.data;
  },

  blockDocument: async (id) => {
    await api.post(`/admin/documents/${id}/block`);
    await get().fetchDocuments();
  },
  unblockDocument: async (id) => {
    await api.post(`/admin/documents/${id}/unblock`);
    await get().fetchDocuments();
  },
  deleteDocument: async (id) => {
    await api.delete(`/admin/documents/${id}`);
    await get().fetchDocuments();
  },
}));
