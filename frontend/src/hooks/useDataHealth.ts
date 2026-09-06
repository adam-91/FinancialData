import { useQuery } from "@tanstack/react-query";
import {
  getDataHealthSummary,
  getAllIndicesHealth,
  getAllCompaniesHealth,
  getSchedulerInfo,
  EntityHealthDetail,
  DataHealthSummary,
  SchedulerInfo,
} from "../api/dataHealth";

export const useDataHealthSummary = () => {
  return useQuery<DataHealthSummary>({
    queryKey: ["dataHealthSummary"],
    queryFn: getDataHealthSummary,
  });
};

export const useAllIndicesHealth = () => {
  return useQuery<EntityHealthDetail[]>({
    queryKey: ["allIndicesHealth"],
    queryFn: getAllIndicesHealth,
  });
};

export const useAllCompaniesHealth = () => {
  return useQuery<EntityHealthDetail[]>({
    queryKey: ["allCompaniesHealth"],
    queryFn: getAllCompaniesHealth,
  });
};

export const useSchedulerInfo = () => {
  return useQuery<SchedulerInfo>({
    queryKey: ["schedulerInfo"],
    queryFn: getSchedulerInfo,
  });
};
