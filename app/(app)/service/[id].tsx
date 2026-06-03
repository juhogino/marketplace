import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";

function getInitial(text: string) {
  return (text ?? "").trim().charAt(0).toUpperCase() || "?";
}

export default function ServiceDetail() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const { id, titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail } =
    useLocalSearchParams<{
      id: string;
      titulo: string;
      descricao: string;
      categoria: string;
      preco: string;
      telefone: string;
      regiao: string;
      prestadorEmail: string;
    }>();

  const infoRows = [
    { icon: "folder-outline" as const,   label: "Categoria", value: categoria },
    { icon: "cash-outline" as const,      label: "Preço",     value: `R$ ${preco}` },
    { icon: "call-outline" as const,      label: "Telefone",  value: telefone },
    { icon: "location-outline" as const,  label: "Região",    value: regiao },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalhe do serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prestador */}
        <TouchableOpacity
          style={styles.providerCard}
          onPress={() =>
            router.push({
              pathname: "/(app)/provider/[email]",
              params: { email: prestadorEmail },
            })
          }
          activeOpacity={0.75}
        >
          <View style={styles.providerAvatar}>
            <Text style={styles.providerAvatarText}>{getInitial(prestadorEmail)}</Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerLabel}>Prestador</Text>
            <Text style={styles.providerEmail} numberOfLines={1}>{prestadorEmail}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Título e descrição */}
        <View style={styles.section}>
          <Text style={styles.serviceTitle}>{titulo}</Text>
          <Text style={styles.serviceDescription}>{descricao}</Text>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View
              key={row.label}
              style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}
            >
              <View style={styles.infoIconBox}>
                <Ionicons name={row.icon} size={16} color="#3A7DFF" />
              </View>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Botão contratar */}
        {user?.tipo === "usuario" && (
          <TouchableOpacity
            style={styles.contractButton}
            onPress={() =>
              router.push({
                pathname: "/(app)/contract/[serviceId]",
                params: { serviceId: id, titulo, prestadorEmail, preco },
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.contractButtonText}>Contratar serviço</Text>
          </TouchableOpacity>
        )}
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

  // Provider card
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3A7DFF",
  },
  providerInfo: {
    flex: 1,
    gap: 2,
  },
  providerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  providerEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D0D0D",
  },

  // Title + description
  section: {
    gap: 6,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D0D0D",
  },
  serviceDescription: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
  },

  // Info card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#666666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D0D0D",
    flexShrink: 1,
  },

  // Contract button
  contractButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A7DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  contractButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
