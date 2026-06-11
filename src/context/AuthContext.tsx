import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import { User } from "../types/User";
import { saveUser } from "../storage/authStorage";
import api from "../lib/axios";

const USER_KEY  = "@marketplace:user";
const TOKEN_KEY = "@marketplace:token";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  register: (userData: User) => Promise<void>;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: any) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(USER_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ])
      .then(([rawUser, token]) => {
        if (rawUser) setUser(JSON.parse(rawUser));
        if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      })
      .finally(() => setLoading(false));
  }, []);

  async function register(userData: User) {
    await saveUser(userData);
  }

  function login(userData: User, token: string) {
    setUser(userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    AsyncStorage.setItem(TOKEN_KEY, token);
  }

  function logout() {
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    AsyncStorage.removeItem(USER_KEY);
    AsyncStorage.removeItem(TOKEN_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
