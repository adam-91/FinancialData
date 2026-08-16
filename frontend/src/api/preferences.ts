import api from "./config";
import { UserPreferences } from "../types/user";

export const getPreferences = async (): Promise<UserPreferences> => {
  const response = await api.get<UserPreferences>("/api/auth/preferences/");
  return response.data;
};

export const updatePreferences = async (
  preferences: UserPreferences
): Promise<UserPreferences> => {
  const response = await api.put<UserPreferences>(
    "/api/auth/preferences/",
    preferences
  );
  return response.data;
};
