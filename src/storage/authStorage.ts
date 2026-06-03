import api from "../lib/axios";
import { User } from "../types/User";

export async function saveUser(user: User): Promise<void> {
  try {
    await api.post("/users", user);
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao cadastrar usuário");
  }
}

export async function verifyUser(
  email: string,
  senha: string
): Promise<{ user: User; token: string } | null> {
  try {
    const { data } = await api.post<{ user: User; token: string }>("/users/login", { email, senha });
    return data;
  } catch {
    return null;
  }
}
