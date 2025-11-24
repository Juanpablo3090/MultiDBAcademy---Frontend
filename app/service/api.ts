import axios, { AxiosError, AxiosInstance } from "axios";
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
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: { "Content-Type": "application/json" },
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
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  public clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as { message?: string; errors?: Record<string, string[]> };

      if (data?.message) return new Error(data.message);
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        return new Error(errorMessages.join(", "));
      }

      switch (error.response.status) {
        case 400:
          return new Error("Datos invalidos");
        case 401:
          return new Error("No autenticado");
        case 403:
          return new Error("Sin permisos");
        case 404:
          return new Error("No encontrado");
        case 500:
          return new Error("Error del servidor");
        default:
          return new Error(`Error ${error.response.status}`);
      }
    }

    if (error.request) return new Error("Error de conexion");
    return new Error("Error inesperado");
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await this.axiosInstance.post<AuthResponse>("/auth/register", data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }

    const user: User = {
      id: response.data.id.toString(),
      email: response.data.email,
      name: response.data.userName,
      role: response.data.roleId === 1 ? "Admin" : "Student",
    };

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  async login(data: LoginRequest): Promise<User> {
    const response = await this.axiosInstance.post<AuthResponse>("/auth/login", data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }

    const user: User = {
      id: response.data.id.toString(),
      email: response.data.email,
      name: response.data.userName,
      role: response.data.roleId === 1 ? "Admin" : "Student",
    };

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  logout(): void {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const userStr = localStorage.getItem("user");
    if (!userStr) throw new Error("No user");
    return JSON.parse(userStr);
  }

  async createInstance(data: CreateInstanceRequest): Promise<DatabaseInstance> {
    const response = await this.axiosInstance.post<DatabaseInstance>("/instances", data);
    return response.data;
  }

  async getInstances(): Promise<DatabaseInstance[]> {
    const response = await this.axiosInstance.get<any[]>("/instances");
    return response.data.map((i, idx) => {
      const statusVal = typeof i.status === "number" ? i.status : undefined;
      const statusName = (i.statusName || i.status || "").toString().toLowerCase();
      const isActive =
        i.isActive === true ||
        statusVal === 2 ||
        statusName === "active" ||
        statusName === "activo";

      return {
        id: (i.id ?? idx).toString(),
        name: i.name ?? i.databaseName ?? `Instancia ${idx + 1}`,
        server: i.host ?? i.server ?? "localhost",
        port: i.port ?? 0,
        databaseName: i.databaseName ?? "",
        username: i.userName ?? i.username ?? "",
        createdAt: i.createAt ?? i.createdAt ?? new Date().toISOString(),
        createdBy: i.userEmail ?? i.userName ?? "",
        isActive,
      } as DatabaseInstance;
    });
  }

  async deleteInstance(id: string | number): Promise<void> {
    await this.axiosInstance.delete(`/instances/${id}`);
  }

  async assignInstance(data: AssignInstanceRequest): Promise<void> {
    await this.axiosInstance.post(`/instances/${data.instanceId}/assign`, {
      studentId: data.studentId,
    });
  }

  async getStudentInstances(studentId?: string): Promise<StudentInstance[]> {
    const url = studentId ? `/instances/student/${studentId}` : "/instances/my-instances";
    const response = await this.axiosInstance.get<any[]>(url);
    return response.data.map((i, idx) => ({
      instanceId: (i.instanceId ?? i.id ?? idx).toString(),
      instanceName: i.instanceName ?? i.name ?? i.databaseName ?? `Instancia ${idx + 1}`,
      assignedAt: i.assignedAt ?? i.createAt ?? i.createdAt ?? "",
      databaseName: i.databaseName ?? i.instanceName ?? undefined,
      engineType: i.engineType ?? i.engine ?? undefined,
    }));
  }

  async executeQuery(data: QueryRequest): Promise<QueryResult> {
    const response = await this.axiosInstance.post<QueryResult>("/query/execute", data);
    return response.data;
  }

  async getStudents(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>("/user");
    return response.data.filter((u: any) => u.roleId === 2);
  }

  async getUsers(): Promise<any[]> {
    const response = await this.axiosInstance.get<any[]>("/user");
    return response.data;
  }
}

export const apiService = new ApiService();
