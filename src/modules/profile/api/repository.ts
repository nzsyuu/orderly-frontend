import type { AuthUser } from "@/modules/auth/types/user";

export interface ProfileRepository {
  updateName(name: string): Promise<AuthUser>;
  updatePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthUser>;
  deleteAccount(password: string): Promise<void>;
}
