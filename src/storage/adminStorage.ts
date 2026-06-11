import api from "../lib/axios";
import { User } from "../types/User";
import { Service } from "../types/Service";
import { Contract } from "./contractStorage";

export interface AdminStats {
  usuarios: number;
  prestadores: number;
  servicos: number;
  contratos: {
    total: number;
    pendente: number;
    confirmado: number;
    cancelado: number;
  };
}

export type AdminUser = Omit<User, "senha">;

function apiError(error: any, fallback: string): Error {
  return new Error(error.response?.data?.message ?? fallback);
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { data } = await api.get<AdminStats>("/admin/stats");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar estatísticas"); }
}

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const { data } = await api.get<AdminUser[]>("/admin/users");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar usuários"); }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir usuário"); }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const { data } = await api.get<Service[]>("/admin/services");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar serviços"); }
}

export async function deleteService(id: number): Promise<void> {
  try {
    await api.delete(`/admin/services/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir serviço"); }
}

export async function getAllContracts(): Promise<Contract[]> {
  try {
    const { data } = await api.get<Contract[]>("/admin/contracts");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar contratos"); }
}

export async function deleteContract(id: number): Promise<void> {
  try {
    await api.delete(`/admin/contracts/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir contrato"); }
}

export async function updateContractStatus(
  id: number,
  status: "pendente" | "confirmado" | "cancelado"
): Promise<Contract> {
  try {
    const { data } = await api.patch<Contract>(`/admin/contracts/${id}/status`, { status });
    return data;
  } catch (e) { throw apiError(e, "Erro ao atualizar status"); }
}
