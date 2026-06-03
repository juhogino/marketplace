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

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/admin/users");
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function getAllServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>("/admin/services");
  return data;
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`/admin/services/${id}`);
}

export async function getAllContracts(): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>("/admin/contracts");
  return data;
}

export async function deleteContract(id: number): Promise<void> {
  await api.delete(`/admin/contracts/${id}`);
}

export async function updateContractStatus(
  id: number,
  status: "pendente" | "confirmado" | "cancelado"
): Promise<Contract> {
  const { data } = await api.patch<Contract>(`/admin/contracts/${id}/status`, { status });
  return data;
}
