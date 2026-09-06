import api from "./config";

export interface AuthUser {
  id: number;
  email: string;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  email: string;
  must_change_password: boolean;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function fetchMe(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/api/auth/me");
  return response.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/api/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/api/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await api.post("/api/auth/reset-password", {
    token,
    new_password: newPassword,
  });
}
