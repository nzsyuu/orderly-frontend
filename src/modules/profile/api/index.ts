import { apiClient } from "@/shared/http/api-client";
import type { ProfileRepository } from "@/modules/profile/api/repository";
import { HttpProfileRepository } from "@/modules/profile/api/http-profile.repository";

export const profileRepository: ProfileRepository = new HttpProfileRepository(
  apiClient,
);
