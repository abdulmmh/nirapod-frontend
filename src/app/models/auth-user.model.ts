import { Role } from "../core/constants/roles.constants";

export interface AuthUser {
  id: number;
  taxpayerId?: number | null;
  taxpayerType?: string;
  tinNumber?:    string;   
  fullName: string;
  email: string;
  role: Role;
  token?: string;
  photoUrl?: string; 
  approvalStatus?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}