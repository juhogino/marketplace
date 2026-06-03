import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { saveSchedule } from "@/src/storage/scheduleStorage";
import { getAvailableSlots } from "@/src/storage/availabilityStorage";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function gerarProximosDias(quantidade: number) {
  const dias = [];
  const hoje = new Date();
  for (let i = 1; i <= quantidade; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }
  return dias;
}

function formatarDataISO(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function Schedule() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { serviceId, titulo, prestadorEmail } = useLocalSearchParams<{
    serviceId: string;
    titulo: string;
    prestadorEmail: string;
  }>();

  const dias = gerarProximosDias(14);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agendado, setAgendado] = useState(false);

  useEffect(() => {
    if (!diaSelecionado) {
      setSlotsDisponiveis([]);
      setHoraSelecionada(null);
      return;
    }
    setHoraSelecionada(null);
    setLoadingSlots(true);
    getAvailableSlots(prestadorEmail, formatarDataISO(diaSelecionado))
      .then((slots) => setSlotsDisponiveis(slots))
      .finally(() => setLoadingSlots(false));
  }, [diaSelecionado]);

  async function handleConfirmar() {
    if (!diaSelecionado || !horaSelecionada) return;
    setLoading(true);
    try {
      await saveSchedule({
        serviceId: Number(serviceId),
        titulo,
        userEmail: user?.email ?? "",
        prestadorEmail,
        data: formatarDataISO(diaSelecionado),
        hora: horaSelecionada,
      });
      setAgendado(true);
    } catch (error: any) {
      alert(error.message ?? "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  }

  // ── Sucesso ──
  if (agendado) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <Ionicons name="calendar" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Agendado!</Text>
          <Text style={styles.successText}>
            Seu agendamento de{" "}
            <Text style={{ fontWeight: "700" }}>{titulo}</Text> foi registrado com sucesso.
          </Text>
          <View style={styles.successCard}>
            {diaSelecionado && (
              <View style={styles.successRow}>
                <Ionicons name="calendar-outline" size={16} color="#3A7DFF" />
                <Text style={styles.successRowText}>
                  {DIAS_SEMANA[diaSelecionado.getDay()]}, {diaSelecionado.getDate()} de {MESES[diaSelecionado.getMonth()]}
                </Text>
              </View>
            )}
            {horaSelecionada && (
              <View style={styles.successRow}>
                <Ionicons name="time-outline" size={16} color="#3A7DFF" />
                <Text style={styles.successRowText}>{horaSelecionada}</Text>
              </View>
            )}
            <View style={styles.successRow}>
              <Ionicons name="person-outline" size={16} color="#3A7DFF" />
              <Text style={styles.successRowText} numberOfLines={1}>{prestadorEmail}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/(app)/home")}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info do serviço */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIconBox}>
            <Ionicons name="construct-outline" size={18} color="#3A7DFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle} numberOfLines={1}>{titulo}</Text>
            <Text style={styles.serviceEmail} numberOfLines={1}>{prestadorEmail}</Text>
          </View>
        </View>

        {/* Seleção de data */}
        <Text style={styles.sectionTitle}>Escolha uma data</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.diasContent}
        >
          {dias.map((dia, index) => {
            const selecionado =
              diaSelecionado && formatarDataISO(dia) === formatarDataISO(diaSelecionado);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.diaBtn, selecionado && styles.diaBtnActive]}
                onPress={() => setDiaSelecionado(dia)}
                activeOpacity={0.75}
              >
                <Text style={[styles.diaSemana, selecionado && styles.diaTextActive]}>
                  {DIAS_SEMANA[dia.getDay()]}
                </Text>
                <Text style={[styles.diaNumero, selecionado && styles.diaTextActive]}>
                  {dia.getDate()}
                </Text>
                <Text style={[styles.diaMes, selecionado && styles.diaTextActive]}>
                  {MESES[dia.getMonth()]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Seleção de horário */}
        <Text style={styles.sectionTitle}>Escolha um horário</Text>
        {!diaSelecionado ? (
          <Text style={styles.slotHint}>Selecione uma data para ver os horários disponíveis.</Text>
        ) : loadingSlots ? (
          <ActivityIndicator color="#3A7DFF" style={{ marginVertical: 12 }} />
        ) : slotsDisponiveis.length === 0 ? (
          <View style={styles.emptySlots}>
            <Ionicons name="time-outline" size={32} color="#C7C7CC" />
            <Text style={styles.emptySlotsText}>
              Nenhum horário disponível para esta data.{"\n"}Tente outro dia.
            </Text>
          </View>
        ) : (
          <View style={styles.horariosGrid}>
            {slotsDisponiveis.map((hora) => {
              const selecionado = hora === horaSelecionada;
              return (
                <TouchableOpacity
                  key={hora}
                  style={[styles.horaBtn, selecionado && styles.horaBtnActive]}
                  onPress={() => setHoraSelecionada(hora)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.horaText, selecionado && styles.horaTextActive]}>
                    {hora}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Resumo */}
        {diaSelecionado && horaSelecionada && (
          <View style={styles.resumoCard}>
            <View style={styles.resumoRow}>
              <Ionicons name="calendar-outline" size={14} color="#3A7DFF" />
              <Text style={styles.resumoText}>
                {DIAS_SEMANA[diaSelecionado.getDay()]}, {diaSelecionado.getDate()} de {MESES[diaSelecionado.getMonth()]}
              </Text>
            </View>
            <View style={styles.resumoRow}>
              <Ionicons name="time-outline" size={14} color="#3A7DFF" />
              <Text style={styles.resumoText}>{horaSelecionada}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!diaSelecionado || !horaSelecionada || loading) && styles.buttonDisabled,
          ]}
          onPress={handleConfirmar}
          disabled={!diaSelecionado || !horaSelecionada || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Confirmar agendamento</Text>
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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },

  // Service card
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },
  serviceIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  serviceTitle: { fontSize: 15, fontWeight: "600", color: "#0D0D0D" },
  serviceEmail: { fontSize: 12, color: "#666666", marginTop: 2 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D0D0D",
    marginBottom: -4,
  },

  // Dias
  diasContent: {
    gap: 8,
    paddingRight: 4,
  },
  diaBtn: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 58,
    gap: 2,
  },
  diaBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#3A7DFF",
  },
  diaSemana: { fontSize: 11, color: "#666666", fontWeight: "600" },
  diaNumero: { fontSize: 20, fontWeight: "700", color: "#0D0D0D" },
  diaMes: { fontSize: 11, color: "#666666" },
  diaTextActive: { color: "#3A7DFF" },

  // Slots
  slotHint: {
    fontSize: 13,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  emptySlots: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  emptySlotsText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  horariosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  horaBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  horaBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#3A7DFF",
  },
  horaText: { fontSize: 14, fontWeight: "600", color: "#444444" },
  horaTextActive: { color: "#3A7DFF" },

  // Resumo
  resumoCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 12,
  },
  resumoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  resumoText: { fontSize: 13, fontWeight: "600", color: "#3A7DFF" },

  // Buttons
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A7DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.4 },
  confirmButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  // Sucesso
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#3A7DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D0D0D",
    textAlign: "center",
  },
  successText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  successCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  successRowText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D0D0D",
    flex: 1,
  },
  homeButton: {
    width: "100%",
    backgroundColor: "#3A7DFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
