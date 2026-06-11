import api from "../lib/axios";
import { NewService, Service } from "../types/Service";

export async function getServices(): Promise<Service[]> {
  try {
    const { data } = await api.get<Service[]>("/services");
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao carregar serviços");
  }
}

export async function saveService(service: NewService): Promise<Service> {
  try {
    const { data } = await api.post<Service>("/services", service);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao cadastrar serviço");
  }
}

export async function updateService(id: number, data: Partial<NewService>): Promise<Service> {
  try {
    const { data: updated } = await api.put<Service>(`/services/${id}`, data);
    return updated;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao atualizar serviço");
  }
}

export async function deleteService(id: number): Promise<void> {
  try {
    await api.delete(`/services/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao excluir serviço");
  }
}
