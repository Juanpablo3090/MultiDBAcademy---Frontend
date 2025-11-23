// USAR STRINGS en lugar de números
export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  id: string;
  userName: string;
  email: string;
  roleId: number;
  token: string;
  refreshToken?: string;
  createAt: string;
  updateAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface DatabaseInstance {
  id: string;
  name: string;
  server: string;
  port: number;
  databaseName: string;
  username: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface CreateInstanceRequest {
  name: string;
  server: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export interface AssignInstanceRequest {
  studentId: string;
  instanceId: string;
}

export interface QueryRequest {
  instanceId: string;
  query: string;
}

export interface QueryResult {
  success: boolean;
  data?: unknown[];
  columns?: string[];
  rowsAffected?: number;
  executionTime?: number;
  message?: string;
  error?: string;
}

export interface StudentInstance {
  instanceId: string;
  instanceName: string;
  assignedAt: string;
}

export interface FormErrors {
  [key: string]: string;
}