import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateInstanceRequest,
  AssignInstanceRequest,
  QueryRequest,
  QueryResult,
  DatabaseInstance,
  StudentInstance,
  User,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as { message?: string; errors?: Record<string, string[]> };
      
      if (data?.message) return new Error(data.message);
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        return new Error(errorMessages.join(', '));
      }
      
      switch (error.response.status) {
        case 400: return new Error('Datos inválidos');
        case 401: return new Error('No autenticado');
        case 403: return new Error('Sin permisos');
        case 404: return new Error('No encontrado');
        case 500: return new Error('Error del servidor');
        default: return new Error(`Error ${error.response.status}`);
      }
    }
    
    if (error.request) return new Error('Error de conexión');
    return new Error('Error inesperado');
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    const user: User = {
      id: response.data.id.toString(),
      email: response.data.email,
      name: response.data.userName,
      role: response.data.roleId === 1 ? 'Student' : response.data.roleId === 2 ? 'Teacher' : 'Admin'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async login(data: LoginRequest): Promise<User> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    const user: User = {
      id: response.data.id.toString(),
      email: response.data.email,
      name: response.data.userName,
      role: response.data.roleId === 1 ? 'Student' : response.data.roleId === 2 ? 'Teacher' : 'Admin'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  logout(): void {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No user');
    return JSON.parse(userStr);
  }

  async createInstance(data: CreateInstanceRequest): Promise<DatabaseInstance> {
    const response = await this.axiosInstance.post<DatabaseInstance>('/instances', data);
    return response.data;
  }

  async getInstances(): Promise<DatabaseInstance[]> {
    const response = await this.axiosInstance.get<DatabaseInstance[]>('/instances');
    return response.data;
  }

  async assignInstance(data: AssignInstanceRequest): Promise<void> {
    await this.axiosInstance.post('/instances/assign', data);
  }

  async getStudentInstances(studentId?: string): Promise<StudentInstance[]> {
    const url = studentId ? `/instances/student/${studentId}` : '/instances/my-instances';
    const response = await this.axiosInstance.get<StudentInstance[]>(url);
    return response.data;
  }

  async executeQuery(data: QueryRequest): Promise<QueryResult> {
    const response = await this.axiosInstance.post<QueryResult>('/queries/execute', data);
    return response.data;
  }

  async getStudents(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>('/users/students');
    return response.data;
  }
}

export const apiService = new ApiService();