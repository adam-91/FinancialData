import api from "./config";
import type { AuthUser } from "./auth";

export interface ResetLinkResponse {
  reset_url: string;
  email: string;
}

export async function listUsers(): Promise<AuthUser[]> {
  const response = await api.get<AuthUser[]>("/api/admin/users");
  return response.data;
}

export async function createUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/api/admin/users", {
    email,
    password,
  });
  return response.data;
}

export async function updateUser(
  id: number,
  data: { email?: string; password?: string; is_active?: boolean }
): Promise<AuthUser> {
  const response = await api.put<AuthUser>(`/api/admin/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}`);
}

export async function generateResetLink(
  id: number
): Promise<ResetLinkResponse> {
  const response = await api.post<ResetLinkResponse>(
    `/api/admin/users/${id}/reset-password`
  );
  return response.data;
}
