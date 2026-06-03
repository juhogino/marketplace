import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getServices } from "@/src/storage/serviceStorage";
import { Service } from "@/src/types/Service";

function getInitial(text: string) {
  return (text ?? "").trim().charAt(0).toUpperCase() || "?";
}

export default function ProviderProfile() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((all) => setServices(all.filter((s) => s.prestadorEmail === email)))
      .finally(() => setLoading(false));
  }, [email]);

  const regiao = services[0]?.regiao ?? "—";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prestador</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar + info */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(email ?? "")}</Text>
        </View>
        <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
        <View style={styles.regionRow}>
          <Ionicons name="location-outline" size={14} color="#666666" />
          <Text style={styles.regionText}>{regiao}</Text>
        </View>
      </View>

      {/* Serviços */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Serviços oferecidos</Text>
        {!loading && (
          <Text style={styles.sectionCount}>{services.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(app)/service/[id]",
                  params: {
                    id: item.id,
                    titulo: item.titulo,
                    descricao: item.descricao,
                    categoria: item.categoria,
                    preco: item.preco,
                    telefone: item.telefone,
                    regiao: item.regiao,
                    prestadorEmail: item.prestadorEmail,
                  },
                })
              }
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="construct-outline" size={18} color="#3A7DFF" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.cardCategory} numberOfLines={1}>{item.categoria}</Text>
                </View>
                <Text style={styles.cardPrice}>R$ {item.preco}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="construct-outline" size={44} color="#C7C7CC" />
              <Text style={styles.emptyText}>Nenhum serviço cadastrado</Text>
            </View>
          }
        />
      )}
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

  // Profile section
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#3A7DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D0D",
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  regionText: {
    fontSize: 13,
    color: "#666666",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D0D0D",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E93",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D0D0D",
  },
  cardCategory: {
    fontSize: 12,
    color: "#666666",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A7DFF",
    flexShrink: 0,
  },
});
