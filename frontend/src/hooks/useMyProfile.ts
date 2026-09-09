// src/hooks/useMyProfile.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { User } from "@/@types/user.type";

const getMyProfile = async (): Promise<User> => {
  const response = await api.get("/users/me/profile");
  return response.data;
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"], // Key cache
    queryFn: getMyProfile,
  });
};
