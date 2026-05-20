import AsyncStorage from "@react-native-async-storage/async-storage";
import { Service } from "../types/Service";

const STORAGE_KEY = "@services";

export async function saveService(service: Service) {
  const services = await getServices();

  services.push(service);

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(services)
  );
}

export async function getServices(): Promise<Service[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);
}