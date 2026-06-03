import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/src/context/AuthContext";

export default function AppLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
