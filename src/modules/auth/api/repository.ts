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
  forgotPassword(email: string): Promise<void>;
  validateResetToken(token: string): Promise<void>;
  confirmPasswordReset(token: string, newPassword: string): Promise<void>;
}
