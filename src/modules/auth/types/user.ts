export type UserRole = "ROLE_USER" | "ROLE_ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function getHomeRouteByRole(role: UserRole): string {
  return role === "ROLE_ADMIN" ? "/painel" : "/cardapio";
}

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  cpf: string;
  email: string;
  password: string;
};
