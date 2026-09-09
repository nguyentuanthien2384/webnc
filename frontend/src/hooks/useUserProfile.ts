import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { User } from "@/@types/user.type";
import { Document } from "@/@types/document.type";

interface UserStats {
  totalUploads: number;
  totalDownloads: number;
  avgDownloadsPerDoc: number;
}

interface UserDocumentsResponse {
  data: Document[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const getUserProfile = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};

const getUserStats = async (userId: string): Promise<UserStats> => {
  const response = await api.get(`/users/${userId}/stats`);
  return response.data;
};

const getUserDocuments = async (userId: string): Promise<UserDocumentsResponse> => {
  const response = await api.get(`/documents/user/${userId}/uploads`);
  return response.data;
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
  });
};

export const useUserDocuments = (userId: string) => {
  return useQuery({
    queryKey: ["userDocuments", userId],
    queryFn: () => getUserDocuments(userId),
    enabled: !!userId,
  });
};
