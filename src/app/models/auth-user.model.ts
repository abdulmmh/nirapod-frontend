import { Role } from "../core/constants/roles.constants";

export interface AuthUser {
  id: number;
  taxpayerId?: number;
  taxpayerType?: string;
  fullName: string;
  email: string;
  role: Role;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}