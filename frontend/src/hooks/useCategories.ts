import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Subject {
  _id: string;
  name: string;
  code: string;
  managingFaculty?: string;
}

export interface Major {
  _id: string;
  name: string;
  subjects: Subject[];
}

const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get("/categories/subjects");
  return response.data;
};

export const useSubjects = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000,
  });
};

const getMajors = async (): Promise<Major[]> => {
  const response = await api.get("/categories/majors");
  return response.data;
};

export const useMajors = () => {
  return useQuery({
    queryKey: ["majors"],
    queryFn: getMajors,
    staleTime: 5 * 60 * 1000,
  });
};
