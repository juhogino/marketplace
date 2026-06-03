import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getServices } from "@/src/storage/serviceStorage";
import { Service } from "@/src/types/Service";

function getInitial(text: string) {
  return (text ?? "").trim().charAt(0).toUpperCase() || "?";
}

export default function Services() {
  const router = useRouter();
  const { query: queryParam, categoria: categoriaParam } =
    useLocalSearchParams<{ query?: string; categoria?: string }>();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(queryParam ?? "");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getServices()
        .then((data) => { if (active) setServices(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const servicosFiltrados = services.filter((s) => {
    const matchQuery = busca.trim()
      ? s.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        s.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        s.categoria.toLowerCase().includes(busca.toLowerCase())
      : true;
    const matchCategoria = categoriaParam
      ? s.categoria.toLowerCase() === categoriaParam.toLowerCase()
      : true;
    return matchQuery && matchCategoria;
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoriaParam ?? "Serviços"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços"
          placeholderTextColor="#999999"
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={servicosFiltrados}
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
                <View style={styles.cardAvatar}>
                  <Text style={styles.cardAvatarText}>
                    {getInitial(item.prestadorEmail)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.cardProvider} numberOfLines={1}>
                    {item.prestadorEmail}
                  </Text>
                </View>
                <Text style={styles.cardPrice}>R$ {item.preco}</Text>
              </View>

              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.descricao}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.tag}>
                  <Ionicons name="folder-outline" size={12} color="#3A7DFF" />
                  <Text style={styles.tagText}>{item.categoria}</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="location-outline" size={12} color="#3A7DFF" />
                  <Text style={styles.tagText}>{item.regiao}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={44} color="#C7C7CC" />
              <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
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

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 999,
    height: 44,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0D0D0D",
    paddingVertical: 0,
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

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A7DFF",
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
  cardProvider: {
    fontSize: 12,
    color: "#666666",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A7DFF",
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3A7DFF",
  },
});
