import type { AxiosInstance } from "axios";
import type { AuthRepository } from "@/modules/auth/api/repository";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/modules/auth/types/user";
import { parseAuthUser } from "@/modules/auth/schemas/auth.api";

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async login(input: LoginInput): Promise<AuthUser> {
    const { data } = await this.http.post("/api/auth/login", {
      email: input.email,
      password: input.password,
    });
    return parseAuthUser(data);
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    const { data } = await this.http.post("/api/auth/register", {
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      password: input.password,
    });
    return parseAuthUser(data);
  }

  async verify(token: string): Promise<AuthUser> {
    const { data } = await this.http.get("/api/auth/verify", {
      params: { token },
    });
    return parseAuthUser(data);
  }

  async logout(): Promise<void> {
    await this.http.post("/api/auth/logout");
  }

  async getProfile(): Promise<AuthUser> {
    const { data } = await this.http.get("/api/profile");
    return parseAuthUser(data);
  }
}
