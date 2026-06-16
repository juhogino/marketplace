import api from "../lib/axios";
import { User } from "../types/User";
import { Service } from "../types/Service";
import { Contract } from "./contractStorage";
import { Schedule } from "./scheduleStorage";

export interface AdminStats {
  usuarios: number;
  prestadores: number;
  admins: number;
  servicos: number;
  contratos: {
    total: number;
    pendente: number;
    confirmado: number;
    rejeitado: number;
    cancelado: number;
  };
}

export type AdminUser = Omit<User, "senha">;

function apiError(error: any, fallback: string): Error {
  return new Error(error.response?.data?.message ?? fallback);
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { data } = await api.get<AdminStats>("/admin/stats");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar estatísticas"); }
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const { data } = await api.get<AdminUser[]>("/admin/users");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar usuários"); }
}

export async function createUser(payload: {
  nome: string;
  email: string;
  senha: string;
  tipo: "usuario" | "prestador" | "admin";
  regiao: string;
}): Promise<AdminUser> {
  try {
    const { data } = await api.post<AdminUser>("/admin/users", payload);
    return data;
  } catch (e) { throw apiError(e, "Erro ao criar usuário"); }
}

export async function updateUser(
  id: number,
  payload: { nome?: string; tipo?: "usuario" | "prestador" | "admin"; regiao?: string }
): Promise<AdminUser> {
  try {
    const { data } = await api.patch<AdminUser>(`/admin/users/${id}`, payload);
    return data;
  } catch (e) { throw apiError(e, "Erro ao atualizar usuário"); }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir usuário"); }
}

// ── Services ───────────────────────────────────────────────────────────────

export async function getAllServices(): Promise<Service[]> {
  try {
    const { data } = await api.get<Service[]>("/admin/services");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar serviços"); }
}

export async function createService(payload: Omit<Service, "id">): Promise<Service> {
  try {
    const { data } = await api.post<Service>("/admin/services", payload);
    return data;
  } catch (e) { throw apiError(e, "Erro ao criar serviço"); }
}

export async function updateService(id: number, payload: Partial<Omit<Service, "id">>): Promise<Service> {
  try {
    const { data } = await api.patch<Service>(`/admin/services/${id}`, payload);
    return data;
  } catch (e) { throw apiError(e, "Erro ao atualizar serviço"); }
}

export async function deleteService(id: number): Promise<void> {
  try {
    await api.delete(`/admin/services/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir serviço"); }
}

// ── Contracts ──────────────────────────────────────────────────────────────

export async function getAllContracts(): Promise<Contract[]> {
  try {
    const { data } = await api.get<Contract[]>("/admin/contracts");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar contratos"); }
}

export async function updateContractStatus(
  id: number,
  status: "pendente" | "confirmado" | "rejeitado" | "cancelado"
): Promise<Contract> {
  try {
    const { data } = await api.patch<Contract>(`/admin/contracts/${id}/status`, { status });
    return data;
  } catch (e) { throw apiError(e, "Erro ao atualizar status"); }
}

export async function deleteContract(id: number): Promise<void> {
  try {
    await api.delete(`/admin/contracts/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir contrato"); }
}

// ── Schedules ──────────────────────────────────────────────────────────────

export async function getAllSchedules(): Promise<Schedule[]> {
  try {
    const { data } = await api.get<Schedule[]>("/admin/schedules");
    return data;
  } catch (e) { throw apiError(e, "Erro ao carregar agendamentos"); }
}

export async function updateScheduleStatus(
  id: number,
  status: "pendente" | "confirmado" | "cancelado"
): Promise<Schedule> {
  try {
    const { data } = await api.patch<Schedule>(`/admin/schedules/${id}/status`, { status });
    return data;
  } catch (e) { throw apiError(e, "Erro ao atualizar status do agendamento"); }
}

export async function deleteSchedule(id: number): Promise<void> {
  try {
    await api.delete(`/admin/schedules/${id}`);
  } catch (e) { throw apiError(e, "Erro ao excluir agendamento"); }
}
