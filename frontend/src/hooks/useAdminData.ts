import { useEffect, useMemo } from "react";
import { useAdminStore, Subject, Major } from "@/store/admin.store";
import { User } from "@/@types/user.type";
import { Document as DocType } from "@/@types/document.type";

export type { Subject, Major };

interface AdminUsersResponse {
  data: User[];
  pagination: { total: number; page: number; totalPages: number };
}

interface AdminDocumentsResponse {
  data: DocType[];
  pagination: { total: number; page: number; totalPages: number };
}

export const useAdminSubjects = () => {
  const subjects = useAdminStore((s) => s.subjects);
  const fetchSubjects = useAdminStore((s) => s.fetchSubjects);
  useEffect(() => {
    if (subjects.length === 0) fetchSubjects();
  }, [subjects.length, fetchSubjects]);
  return { data: subjects, isLoading: false };
};

export const useAdminMajors = () => {
  const majors = useAdminStore((s) => s.majors);
  const fetchMajors = useAdminStore((s) => s.fetchMajors);
  useEffect(() => {
    if (majors.length === 0) fetchMajors();
  }, [majors.length, fetchMajors]);
  return { data: majors, isLoading: false };
};

export const useAdminDocuments = (search: string, page = 1) => {
  const documents = useAdminStore((s) => s.documents);
  const fetchDocuments = useAdminStore((s) => s.fetchDocuments);
  const pagination = useAdminStore((s) => s.documentsPagination);
  const isLoading = useAdminStore((s) => s.documentsLoading);
  const isError = useAdminStore((s) => s.documentsError);

  useEffect(() => {
    void fetchDocuments(search, page).catch(() => undefined);
  }, [search, page, fetchDocuments]);

  const result: AdminDocumentsResponse = useMemo(
    () => ({
      data: documents,
      pagination,
    }),
    [documents, pagination],
  );
  return { data: result, isLoading, isError };
};

export const useAdminUsers = (
  search: string,
  role?: string,
  sortBy?: string,
  page = 1,
) => {
  const users = useAdminStore((s) => s.users);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const pagination = useAdminStore((s) => s.usersPagination);
  const isLoading = useAdminStore((s) => s.usersLoading);
  const isError = useAdminStore((s) => s.usersError);

  useEffect(() => {
    void fetchUsers(search, role, sortBy, page).catch(() => undefined);
  }, [search, role, sortBy, page, fetchUsers]);

  const result: AdminUsersResponse = useMemo(
    () => ({
      data: users,
      pagination,
    }),
    [users, pagination],
  );
  return { data: result, isLoading, isError };
};
