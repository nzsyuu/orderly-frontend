import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/modules/auth/types/user";

export interface AuthRepository {
  login(input: LoginInput): Promise<AuthUser>;
  register(input: RegisterInput): Promise<AuthUser>;
  verify(token: string): Promise<AuthUser>;
  logout(): Promise<void>;
  getProfile(): Promise<AuthUser>;
}
