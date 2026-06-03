import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { UserType } from "@/src/types/User";

export default function Register() {
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [tipo, setTipo] = useState<UserType>("usuario");
  const [regiao, setRegiao] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha || !confirmar || !regiao) {
      alert("Preencha todos os campos");
      return;
    }
    if (senha !== confirmar) {
      alert("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await register({ nome, email, senha, tipo, regiao });
      router.replace("/(auth)/login");
    } catch (error: any) {
      alert(error.message ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar conta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipo de conta */}
        <View style={styles.tipoSection}>
          <Text style={styles.sectionLabel}>Tipo de conta</Text>
          <View style={styles.tipoRow}>
            {(["usuario", "prestador"] as UserType[]).map((t) => {
              const isActive = tipo === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tipoBtn, isActive && styles.tipoBtnActive]}
                  onPress={() => setTipo(t)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={t === "usuario" ? "person-outline" : "construct-outline"}
                    size={18}
                    color={isActive ? "#3A7DFF" : "#666666"}
                  />
                  <Text style={[styles.tipoBtnText, isActive && styles.tipoBtnTextActive]}>
                    {t === "usuario" ? "Usuário" : "Prestador"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Campos */}
        <View style={styles.fields}>
          <Field
            icon="person-outline"
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />
          <Field
            icon="mail-outline"
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!senhaVisivel}
            rightIcon={
              <TouchableOpacity onPress={() => setSenhaVisivel((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            }
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Confirmar senha"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry={!senhaVisivel}
          />
          <Field
            icon="location-outline"
            placeholder="Região (ex: Sudeste)"
            value={regiao}
            onChangeText={setRegiao}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui uma conta?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightIcon,
}: {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightIcon?: React.ReactNode;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color="#8E8E93" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={false}
      />
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0D0D0D",
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },

  // Tipo
  tipoSection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipoRow: {
    flexDirection: "row",
    gap: 10,
  },
  tipoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    paddingVertical: 14,
  },
  tipoBtnActive: {
    borderColor: "#3A7DFF",
    backgroundColor: "#EEF2FF",
  },
  tipoBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  tipoBtnTextActive: {
    color: "#3A7DFF",
  },

  // Fields
  fields: {
    gap: 10,
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

  // Button
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
    paddingBottom: 8,
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
