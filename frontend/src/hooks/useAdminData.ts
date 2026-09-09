import { useEffect, useMemo } from "react";
import { useAdminStore, Subject, Major } from "@/store/admin.store";
import { User } from "@/@types/user.type";
import { Document as DocType } from "@/@types/document.type";

export type { Subject, Major };

interface AdminUsersResponse {
  data: User[];
  pagination: { total: number };
}

interface AdminDocumentsResponse {
  data: DocType[];
  pagination: { total: number };
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

export const useAdminDocuments = (search: string) => {
  const documents = useAdminStore((s) => s.documents);
  const fetchDocuments = useAdminStore((s) => s.fetchDocuments);

  useEffect(() => {
    fetchDocuments(search);
  }, [search, fetchDocuments]);

  const result: AdminDocumentsResponse = useMemo(
    () => ({
      data: documents,
      pagination: { total: documents.length },
    }),
    [documents],
  );
  return { data: result, isLoading: false };
};

export const useAdminUsers = (
  search: string,
  role?: string,
  sortBy?: string,
) => {
  const users = useAdminStore((s) => s.users);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchUsers(search, role, sortBy);
  }, [search, role, sortBy, fetchUsers]);

  const result: AdminUsersResponse = useMemo(
    () => ({
      data: users,
      pagination: { total: users.length },
    }),
    [users],
  );
  return { data: result, isLoading: false };
};
