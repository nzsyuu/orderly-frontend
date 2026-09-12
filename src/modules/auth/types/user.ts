export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

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
