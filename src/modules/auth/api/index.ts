import { apiClient } from "@/shared/http/api-client";
import type { AuthRepository } from "@/modules/auth/api/repository";
import { HttpAuthRepository } from "@/modules/auth/api/http-auth.repository";

export const authRepository: AuthRepository = new HttpAuthRepository(apiClient);
