import api from "../lib/axios";

export interface AvailabilitySlot {
  id: number;
  prestadorEmail: string;
  diaSemana: number;
  hora: string;
}

export interface NewSlot {
  diaSemana: number;
  hora: string;
}

export async function getProviderAvailability(prestadorEmail: string): Promise<AvailabilitySlot[]> {
  try {
    const { data } = await api.get<AvailabilitySlot[]>("/availability", {
      params: { prestadorEmail },
    });
    return data;
  } catch {
    return [];
  }
}

export async function saveProviderAvailability(
  prestadorEmail: string,
  slots: NewSlot[]
): Promise<void> {
  await api.post("/availability", { prestadorEmail, slots });
}

export async function getAvailableSlots(
  prestadorEmail: string,
  data: string // YYYY-MM-DD
): Promise<string[]> {
  try {
    const { data: slots } = await api.get<string[]>("/availability/slots", {
      params: { prestadorEmail, data },
    });
    return slots;
  } catch {
    return [];
  }
}
