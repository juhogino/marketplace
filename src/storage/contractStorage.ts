import api from "../lib/axios";

export interface Contract {
  id: number;
  serviceId: number;
  titulo: string;
  preco: string;
  userEmail: string;
  prestadorEmail: string;
  metodoPagamento: "pix" | "cartao";
  data?: string;
  hora?: string;
  status: "pendente" | "confirmado" | "rejeitado" | "cancelado";
  criadoEm: string;
}

export interface NewContract {
  serviceId: number;
  titulo: string;
  preco: string;
  userEmail: string;
  prestadorEmail: string;
  metodoPagamento: "pix" | "cartao";
  data?: string;
  hora?: string;
}

export async function saveContract(contract: NewContract): Promise<Contract> {
  try {
    const { data } = await api.post<Contract>("/contracts", contract);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao registrar contratação");
  }
}

export async function getMyContracts(userEmail: string): Promise<Contract[]> {
  try {
    const { data } = await api.get<Contract[]>("/contracts", {
      params: { userEmail },
    });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao carregar contratos");
  }
}

export async function getContractsAsPrestador(prestadorEmail: string): Promise<Contract[]> {
  try {
    const { data } = await api.get<Contract[]>("/contracts", {
      params: { prestadorEmail },
    });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao carregar contratos");
  }
}

export async function confirmContract(id: number): Promise<Contract> {
  try {
    const { data } = await api.patch<Contract>(`/contracts/${id}/confirmar`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao confirmar contrato");
  }
}

export async function rejectContract(id: number): Promise<Contract> {
  try {
    const { data } = await api.patch<Contract>(`/contracts/${id}/rejeitar`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao rejeitar contrato");
  }
}

export async function cancelContract(id: number): Promise<Contract> {
  try {
    const { data } = await api.patch<Contract>(`/contracts/${id}/cancelar`);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message ?? "Erro ao cancelar contrato");
  }
}
