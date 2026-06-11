import {
  FlatList,
  ScrollView,
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

type Ordem = "relevancia" | "menor" | "maior";

const CATEGORIAS = [
  { id: "Limpeza",     icon: "sparkles-outline"            as const },
  { id: "Elétrica",   icon: "flash-outline"               as const },
  { id: "Beleza",     icon: "cut-outline"                 as const },
  { id: "Hidráulica", icon: "water-outline"               as const },
  { id: "Pintura",    icon: "color-palette-outline"       as const },
  { id: "Reforma",    icon: "construct-outline"           as const },
  { id: "Jardinagem", icon: "leaf-outline"                as const },
  { id: "Outros",     icon: "ellipsis-horizontal-outline" as const },
];

const PRECOS = [
  { label: "Até R$ 100",  value: 100 },
  { label: "Até R$ 200",  value: 200 },
  { label: "Até R$ 500",  value: 500 },
  { label: "Até R$ 1000", value: 1000 },
];

const ORDENS: { id: Ordem; label: string }[] = [
  { id: "relevancia", label: "Relevância" },
  { id: "menor",      label: "Menor preço" },
  { id: "maior",      label: "Maior preço" },
];

function getInitial(text: string) {
  return (text ?? "").trim().charAt(0).toUpperCase() || "?";
}

export default function Services() {
  const router = useRouter();
  const { query: queryParam, categoria: categoriaParam } =
    useLocalSearchParams<{ query?: string; categoria?: string }>();

  const [services, setServices]       = useState<Service[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [busca, setBusca]             = useState(queryParam ?? "");
  const [filtroAberto, setFiltroAberto] = useState(false);

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(categoriaParam ?? null);
  const [precoMax, setPrecoMax]               = useState<number | null>(null);
  const [ordem, setOrdem]                     = useState<Ordem>("relevancia");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);
      getServices()
        .then((data) => { if (active) setServices(data); })
        .catch((e) => { if (active) setError(e.message ?? 'Erro ao carregar serviços'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  const filtrosAtivos = [
    categoriaFiltro !== null,
    precoMax !== null,
    ordem !== "relevancia",
  ].filter(Boolean).length;

  function limparFiltros() {
    setCategoriaFiltro(null);
    setPrecoMax(null);
    setOrdem("relevancia");
  }

  const servicosFiltrados = services
    .filter((s) => {
      const q = busca.trim().toLowerCase();
      const matchQuery = q
        ? s.titulo.toLowerCase().includes(q) ||
          s.descricao.toLowerCase().includes(q) ||
          s.categoria.toLowerCase().includes(q)
        : true;
      const matchCategoria = categoriaFiltro
        ? s.categoria.toLowerCase() === categoriaFiltro.toLowerCase()
        : true;
      const matchPreco = precoMax !== null
        ? parseFloat(s.preco) <= precoMax
        : true;
      return matchQuery && matchCategoria && matchPreco;
    })
    .sort((a, b) => {
      if (ordem === "menor") return parseFloat(a.preco) - parseFloat(b.preco);
      if (ordem === "maior") return parseFloat(b.preco) - parseFloat(a.preco);
      return 0;
    });

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Serviços</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search + botão filtro */}
      <View style={styles.searchRow}>
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

        <TouchableOpacity
          style={[styles.filterBtn, filtroAberto && styles.filterBtnActive]}
          onPress={() => setFiltroAberto((v) => !v)}
          activeOpacity={0.75}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={filtroAberto ? "#FFFFFF" : "#3A7DFF"}
          />
          {filtrosAtivos > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filtrosAtivos}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Painel de filtros */}
      {filtroAberto && (
        <View style={styles.filterPanel}>
          {/* Categoria */}
          <Text style={styles.filterLabel}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <TouchableOpacity
              style={[styles.chip, categoriaFiltro === null && styles.chipActive]}
              onPress={() => setCategoriaFiltro(null)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, categoriaFiltro === null && styles.chipTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            {CATEGORIAS.map((cat) => {
              const isActive = categoriaFiltro === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setCategoriaFiltro(isActive ? null : cat.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={cat.icon}
                    size={13}
                    color={isActive ? "#FFFFFF" : "#666666"}
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {cat.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Preço máximo */}
          <Text style={styles.filterLabel}>Preço máximo</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity
              style={[styles.pill, precoMax === null && styles.pillActive]}
              onPress={() => setPrecoMax(null)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, precoMax === null && styles.pillTextActive]}>
                Qualquer
              </Text>
            </TouchableOpacity>
            {PRECOS.map((p) => {
              const isActive = precoMax === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => setPrecoMax(isActive ? null : p.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ordenação */}
          <Text style={styles.filterLabel}>Ordenar por</Text>
          <View style={styles.pillsRow}>
            {ORDENS.map((o) => {
              const isActive = ordem === o.id;
              return (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => setOrdem(o.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Limpar */}
          {filtrosAtivos > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={limparFiltros}>
              <Ionicons name="refresh-outline" size={14} color="#EF4444" />
              <Text style={styles.clearBtnText}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contador de resultados */}
      {!loading && (
        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>
            {servicosFiltrados.length}{" "}
            {servicosFiltrados.length === 1 ? "serviço encontrado" : "serviços encontrados"}
          </Text>
          {filtrosAtivos > 0 && (
            <TouchableOpacity onPress={limparFiltros} hitSlop={8}>
              <Text style={styles.clearInline}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={44} color="#C7C7CC" />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={servicosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              {filtrosAtivos > 0 && (
                <TouchableOpacity style={styles.clearEmptyBtn} onPress={limparFiltros}>
                  <Text style={styles.clearEmptyBtnText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
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

  // Search row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 999,
    height: 44,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0D0D0D",
    paddingVertical: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  filterBtnActive: {
    backgroundColor: "#3A7DFF",
    borderColor: "#3A7DFF",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Filter panel
  filterPanel: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F2F2F7",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#3A7DFF",
    borderColor: "#3A7DFF",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F2F2F7",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#3A7DFF",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
  },
  pillTextActive: {
    color: "#3A7DFF",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingTop: 4,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },

  // Result counter
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  clearInline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3A7DFF",
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
  clearEmptyBtn: {
    backgroundColor: "#3A7DFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginTop: 4,
  },
  clearEmptyBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
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
