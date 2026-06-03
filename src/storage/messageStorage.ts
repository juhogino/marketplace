import api from "../lib/axios";

export interface Message {
  id: number;
  contractId: number;
  senderEmail: string;
  text: string;
  criadoEm: string;
}

export interface NewMessage {
  contractId: number;
  senderEmail: string;
  text: string;
}

export async function getMessages(contractId: number): Promise<Message[]> {
  try {
    const { data } = await api.get<Message[]>("/messages", {
      params: { contractId },
    });
    return data;
  } catch {
    return [];
  }
}

export async function sendMessage(msg: NewMessage): Promise<Message> {
  const { data } = await api.post<Message>("/messages", msg);
  return data;
}
