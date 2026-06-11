import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { verifyUser } from "@/src/storage/authStorage";

export default function Login() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      alert("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyUser(email, senha);
      if (!result) {
        alert("E-mail ou senha incorretos");
        return;
      }
      login(result.user, result.token);
      if (result.user.tipo === "admin") {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(app)/home");
      }
    } catch (error: any) {
      alert(error.message ?? "Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="storefront" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Marketplace</Text>
          <Text style={styles.brandSub}>Serviços na palma da sua mão</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Entrar</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#8E8E93" />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" />
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!senhaVisivel}
              style={styles.input}
              onChangeText={setSenha}
              value={senha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSenhaVisivel((v) => !v)} hitSlop={8}>
              <Ionicons
                name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não possui conta?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} hitSlop={8}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  flex: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // Brand
  brand: {
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#3A7DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0D0D0D",
  },
  brandSub: {
    fontSize: 14,
    color: "#666666",
  },

  // Form
  form: {
    gap: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D0D0D",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0D0D0D",
    paddingVertical: 0,
  },
  button: {
    backgroundColor: "#3A7DFF",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3A7DFF",
  },
});
