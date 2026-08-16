export type Role = "user" | "admin";

export interface User {
  id: number;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface UserPreferences {
  default_exchange: string | null;
  default_currencies: string[];
}
