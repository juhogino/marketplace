import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import { User } from "../types/User";
import { saveUser } from "../storage/authStorage";

const USER_KEY = "@marketplace:user";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  register: (userData: User) => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  async function register(userData: User) {
    await saveUser(userData);
  }

  function login(userData: User) {
    setUser(userData);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    AsyncStorage.removeItem(USER_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
