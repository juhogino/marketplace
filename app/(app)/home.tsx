import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Olá, {user?.nome} 👋
      </Text>

      <View style={styles.card}>
        <Text style={styles.info}>📧 {user?.email}</Text>
        <Text style={styles.info}>👤 Tipo: {user?.tipo}</Text>
        <Text style={styles.info}>🌎 Região: {user?.regiao}</Text>
      </View>

      {user?.tipo === "prestador" && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(app)/create-service")}
        >
          <Text style={styles.buttonText}>
            Cadastrar Serviço
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(app)/services")}
      >
        <Text style={styles.buttonText}>
          Ver Serviços
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    marginBottom: 20,
  },

  info: {
    fontSize: 16,
    marginBottom: 10,
    color: "#334155",
  },

  button: {
    backgroundColor: "#4A6CF7",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  secondaryButton: {
    backgroundColor: "#6366F1",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});