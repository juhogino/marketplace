import api from "../lib/axios";

export type WalletContrato = {
  id: number;
  titulo: string;
  data: string | null;
  hora: string | null;
  preco: string;
  disponivel: boolean;
};

export type WalletInfo = {
  total: number;
  disponivel: number;
  contratos: WalletContrato[];
};

export async function getWalletInfo(prestadorEmail: string): Promise<WalletInfo> {
  try {
    const { data } = await api.get<WalletInfo>("/wallet", {
      params: { prestadorEmail },
    });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? "Erro ao carregar carteira");
  }
}

export async function createSaque(
  prestadorEmail: string,
  chavePix: string
): Promise<{ valor: number }> {
  try {
    const { data } = await api.post<{ valor: number }>("/wallet/saque", {
      prestadorEmail,
      chavePix,
    });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? "Erro ao realizar saque");
  }
}
