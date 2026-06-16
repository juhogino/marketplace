import api from "../lib/axios";

export interface Schedule {
  id: number;
  serviceId: number;
  titulo: string;
  userEmail: string;
  prestadorEmail: string;
  data: string;
  hora: string;
  status: "pendente" | "confirmado" | "cancelado";
  criadoEm: string;
}

export interface NewSchedule {
  serviceId: number;
  titulo: string;
  userEmail: string;
  prestadorEmail: string;
  data: string;
  hora: string;
}

export async function saveSchedule(schedule: NewSchedule): Promise<Schedule> {
  try {
    const { data } = await api.post<Schedule>("/schedules", schedule);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao criar agendamento");
  }
}

export async function getMySchedules(userEmail: string): Promise<Schedule[]> {
  try {
    const { data } = await api.get<Schedule[]>("/schedules", {
      params: { userEmail },
    });
    return data;
  } catch {
    return [];
  }
}

export async function getSchedulesAsPrestador(prestadorEmail: string): Promise<Schedule[]> {
  try {
    const { data } = await api.get<Schedule[]>("/schedules", {
      params: { prestadorEmail },
    });
    return data;
  } catch {
    return [];
  }
}

export async function confirmSchedule(id: number): Promise<Schedule> {
  try {
    const { data } = await api.patch<Schedule>(`/schedules/${id}/confirmar`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao confirmar agendamento");
  }
}

export async function cancelSchedule(id: number): Promise<Schedule> {
  try {
    const { data } = await api.patch<Schedule>(`/schedules/${id}/cancelar`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao cancelar agendamento");
  }
}
