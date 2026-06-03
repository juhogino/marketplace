import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { saveService } from "@/src/storage/serviceStorage";

const CATEGORIES = [
  { id: "Limpeza",     label: "Limpeza",     icon: "sparkles-outline"            as const },
  { id: "Elétrica",   label: "Elétrica",    icon: "flash-outline"               as const },
  { id: "Beleza",     label: "Beleza",      icon: "cut-outline"                 as const },
  { id: "Hidráulica", label: "Hidráulica",  icon: "water-outline"               as const },
  { id: "Pintura",    label: "Pintura",     icon: "color-palette-outline"       as const },
  { id: "Reforma",    label: "Reforma",     icon: "construct-outline"           as const },
  { id: "Jardinagem", label: "Jardinagem",  icon: "leaf-outline"                as const },
  { id: "Outros",     label: "Outros",      icon: "ellipsis-horizontal-outline" as const },
];

export default function CreateService() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [categoriaCustom, setCategoriaCustom] = useState("");
  const [preco, setPreco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  function getCategoriaFinal(): string {
    if (!categoriaSelecionada) return "";
    if (categoriaSelecionada === "Outros") return categoriaCustom.trim() || "Outros";
    return categoriaSelecionada;
  }

  async function handleCreate() {
    const categoria = getCategoriaFinal();
    if (!titulo || !descricao || !categoria || !preco || !telefone) {
      alert("Preencha todos os campos, incluindo a categoria");
      return;
    }
    setLoading(true);
    try {
      await saveService({
        titulo,
        descricao,
        categoria,
        preco,
        telefone,
        regiao: user?.regiao ?? "",
        prestadorEmail: user?.email ?? "",
      });
      router.back();
    } catch (error: any) {
      alert(error.message ?? "Erro ao cadastrar serviço");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Campos básicos */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Informações</Text>

          <TextInput
            placeholder="Título do serviço"
            placeholderTextColor="#8E8E93"
            style={styles.input}
            onChangeText={setTitulo}
            value={titulo}
          />

          <TextInput
            placeholder="Descrição do serviço"
            placeholderTextColor="#8E8E93"
            style={[styles.input, styles.inputMultiline]}
            onChangeText={setDescricao}
            value={descricao}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.rowInputs}>
            <TextInput
              placeholder="Preço (ex: 150.00)"
              placeholderTextColor="#8E8E93"
              style={[styles.input, styles.inputHalf]}
              keyboardType="decimal-pad"
              onChangeText={setPreco}
              value={preco}
            />
            <TextInput
              placeholder="Telefone"
              placeholderTextColor="#8E8E93"
              style={[styles.input, styles.inputHalf]}
              keyboardType="phone-pad"
              onChangeText={setTelefone}
              value={telefone}
            />
          </View>
        </View>

        {/* Categoria */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Categoria</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = categoriaSelecionada === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                  onPress={() => {
                    setCategoriaSelecionada(cat.id);
                    if (cat.id !== "Outros") setCategoriaCustom("");
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isActive ? "#3A7DFF" : "#666666"}
                  />
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {categoriaSelecionada === "Outros" && (
            <TextInput
              placeholder="Descreva a categoria (ex: Marcenaria)"
              placeholderTextColor="#8E8E93"
              style={[styles.input, { marginTop: 4 }]}
              onChangeText={setCategoriaCustom}
              value={categoriaCustom}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cadastrar serviço</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 16,
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0D0D0D",
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },

  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#3A7DFF",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666666",
  },
  categoryLabelActive: {
    color: "#3A7DFF",
    fontWeight: "600",
  },

  // Button
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A7DFF",
    paddingVertical: 16,
    borderRadius: 14,
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
});
