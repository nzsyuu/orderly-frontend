import type { AxiosInstance } from "axios";
import type { ProfileRepository } from "@/modules/profile/api/repository";
import type { AuthUser } from "@/modules/auth/types/user";
import { parseAuthUser } from "@/modules/auth/schemas/auth.api";

export class HttpProfileRepository implements ProfileRepository {
  constructor(private readonly http: AxiosInstance) {}

  async updateName(name: string): Promise<AuthUser> {
    const { data } = await this.http.patch("/api/profile/name", { name });
    return parseAuthUser(data);
  }

  async updatePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthUser> {
    const { data } = await this.http.patch("/api/profile/password", {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
    return parseAuthUser(data);
  }

  async deleteAccount(password: string): Promise<void> {
    await this.http.delete("/api/profile", { data: { password } });
  }
}
