import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { saveContract } from "@/src/storage/contractStorage";
import { getAvailableSlots } from "@/src/storage/availabilityStorage";

type MetodoPagamento = "pix" | "cartao";

const DIAS_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatarDataISO(date: Date) {
  return date.toISOString().split("T")[0];
}

function diasDoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

function primeiroDiaDaSemana(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay();
}

// ─── Calendário inline ─────────────────────────────────────────────────────────

function Calendario({
  selecionado,
  onSelecionar,
  onFechar,
}: {
  selecionado: Date | null;
  onSelecionar: (d: Date) => void;
  onFechar: () => void;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());

  function navegar(delta: number) {
    const d = new Date(ano, mes + delta, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
  }

  const totalDias = diasDoMes(ano, mes);
  const offset = primeiroDiaDaSemana(ano, mes);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  return (
    <View style={cal.container}>
      <View style={cal.header}>
        <TouchableOpacity onPress={() => navegar(-1)} style={cal.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={cal.mesAno}>{MESES_NOMES[mes]} {ano}</Text>
        <TouchableOpacity onPress={() => navegar(1)} style={cal.navBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color="#0D0D0D" />
        </TouchableOpacity>
      </View>

      <View style={cal.semanaRow}>
        {DIAS_SEMANA_CURTO.map((d, i) => (
          <Text key={i} style={cal.semanaLabel}>{d}</Text>
        ))}
      </View>

      <View style={cal.grid}>
        {cells.map((dia, i) => {
          if (!dia) return <View key={i} style={cal.cell} />;
          const data = new Date(ano, mes, dia);
          const passado = data < hoje;
          const isSelecionado =
            selecionado && formatarDataISO(data) === formatarDataISO(selecionado);
          return (
            <TouchableOpacity
              key={i}
              style={[cal.cell, isSelecionado && cal.cellSelected, passado && cal.cellDisabled]}
              onPress={() => { if (!passado) { onSelecionar(data); onFechar(); } }}
              disabled={passado}
            >
              <Text style={[
                cal.cellText,
                isSelecionado && cal.cellTextSelected,
                passado && cal.cellTextDisabled,
              ]}>
                {dia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Tela principal ────────────────────────────────────────────────────────────

export default function Contract() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { serviceId, titulo, prestadorEmail, preco } = useLocalSearchParams<{
    serviceId: string;
    titulo: string;
    prestadorEmail: string;
    preco: string;
  }>();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [calendarAberto, setCalendarAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 2
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [loading, setLoading] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    if (!dataSelecionada) {
      setSlotsDisponiveis([]);
      setHoraSelecionada(null);
      return;
    }
    setHoraSelecionada(null);
    setLoadingSlots(true);
    getAvailableSlots(prestadorEmail, formatarDataISO(dataSelecionada))
      .then((slots) => setSlotsDisponiveis(slots))
      .finally(() => setLoadingSlots(false));
  }, [dataSelecionada]);

  function formatarCartao(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatarValidade(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function dataFormatadaBR(date: Date) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  async function handleConfirmar() {
    if (metodo === "cartao") {
      const digits = numeroCartao.replace(/\s/g, "");
      if (digits.length < 16 || !validade || cvv.length < 3 || !nomeCartao) {
        alert("Preencha todos os dados do cartão");
        return;
      }
    }
    setLoading(true);
    try {
      await saveContract({
        serviceId: Number(serviceId),
        titulo,
        preco,
        userEmail: user?.email ?? "",
        prestadorEmail,
        metodoPagamento: metodo,
        data: dataSelecionada ? formatarDataISO(dataSelecionada) : undefined,
        hora: horaSelecionada ?? undefined,
      });
      setConcluido(true);
    } catch (error: any) {
      alert(error.message ?? "Erro ao confirmar contratação");
    } finally {
      setLoading(false);
    }
  }

  // ── Sucesso ──
  if (concluido) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Solicitação enviada!</Text>
          <Text style={styles.successText}>
            Sua solicitação de <Text style={{ fontWeight: "700" }}>{titulo}</Text> foi enviada. Aguarde a confirmação do prestador.
          </Text>

          <View style={styles.successCard}>
            {dataSelecionada && (
              <View style={styles.successRow}>
                <Ionicons name="calendar-outline" size={16} color="#3A7DFF" />
                <Text style={styles.successRowText}>
                  {dataFormatadaBR(dataSelecionada)}{horaSelecionada ? ` às ${horaSelecionada}` : ""}
                </Text>
              </View>
            )}
            <View style={styles.successRow}>
              <Ionicons name="cash-outline" size={16} color="#3A7DFF" />
              <Text style={styles.successRowText}>R$ {preco}</Text>
            </View>
            <View style={styles.successRow}>
              <Ionicons
                name={metodo === "pix" ? "qr-code-outline" : "card-outline"}
                size={16}
                color="#3A7DFF"
              />
              <Text style={styles.successRowText}>
                {metodo === "pix" ? "PIX" : "Cartão de crédito"}
              </Text>
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

  // ── Step 1: Agendamento ──
  if (step === 1) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agendar</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          <View style={styles.stepActive}>
            <Text style={styles.stepNumActive}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}>
            <Text style={styles.stepNumInactive}>2</Text>
          </View>
          <Text style={styles.stepInactiveLabel}>Pagamento</Text>
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
            <Text style={styles.servicePrice}>R$ {preco}</Text>
          </View>

          {/* Data */}
          <Text style={styles.sectionTitle}>Data do serviço</Text>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => setCalendarAberto(!calendarAberto)}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar-outline" size={18} color="#3A7DFF" />
            <Text style={[styles.calendarButtonText, !dataSelecionada && { color: "#8E8E93" }]}>
              {dataSelecionada ? dataFormatadaBR(dataSelecionada) : "Escolher data"}
            </Text>
            <Ionicons
              name={calendarAberto ? "chevron-up" : "chevron-down"}
              size={16}
              color="#8E8E93"
            />
          </TouchableOpacity>

          {calendarAberto && (
            <Calendario
              selecionado={dataSelecionada}
              onSelecionar={setDataSelecionada}
              onFechar={() => setCalendarAberto(false)}
            />
          )}

          {/* Horários */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Horário</Text>
          {!dataSelecionada ? (
            <Text style={styles.slotHint}>Selecione uma data para ver os horários disponíveis.</Text>
          ) : loadingSlots ? (
            <ActivityIndicator color="#3A7DFF" style={{ marginVertical: 12 }} />
          ) : slotsDisponiveis.length === 0 ? (
            <View style={styles.emptySlots}>
              <Ionicons name="time-outline" size={28} color="#C7C7CC" />
              <Text style={styles.emptySlotsText}>
                Nenhum horário disponível para esta data.{"\n"}Tente outro dia.
              </Text>
            </View>
          ) : (
            <View style={styles.horariosGrid}>
              {slotsDisponiveis.map((hora) => {
                const ativo = hora === horaSelecionada;
                return (
                  <TouchableOpacity
                    key={hora}
                    style={[styles.horaBtn, ativo && styles.horaBtnActive]}
                    onPress={() => setHoraSelecionada(hora)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.horaText, ativo && styles.horaTextActive]}>{hora}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Resumo */}
          {dataSelecionada && horaSelecionada && (
            <View style={styles.resumoCard}>
              <View style={styles.resumoRow}>
                <Ionicons name="calendar-outline" size={14} color="#3A7DFF" />
                <Text style={styles.resumoText}>{dataFormatadaBR(dataSelecionada)}</Text>
              </View>
              <View style={styles.resumoRow}>
                <Ionicons name="time-outline" size={14} color="#3A7DFF" />
                <Text style={styles.resumoText}>{horaSelecionada}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextButton, (!dataSelecionada || !horaSelecionada) && styles.buttonDisabled]}
            onPress={() => setStep(2)}
            disabled={!dataSelecionada || !horaSelecionada}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Próximo — Pagamento</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step 2: Pagamento ──
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(1)} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <View style={styles.stepDone}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <View style={styles.stepActive}>
          <Text style={styles.stepNumActive}>2</Text>
        </View>
        <Text style={styles.stepActiveLabel}>Pagamento</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo do pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Serviço</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{titulo}</Text>
          </View>
          {dataSelecionada && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Data</Text>
              <Text style={styles.summaryValue}>
                {dataFormatadaBR(dataSelecionada)} às {horaSelecionada}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, { marginTop: 4 }]}>
            <Text style={styles.summaryKey}>Total</Text>
            <Text style={styles.summaryTotal}>R$ {preco}</Text>
          </View>
        </View>

        {/* Método */}
        <Text style={styles.sectionTitle}>Forma de pagamento</Text>
        <View style={styles.metodosRow}>
          {(["pix", "cartao"] as MetodoPagamento[]).map((m) => {
            const isActive = metodo === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.metodoBtn, isActive && styles.metodoBtnActive]}
                onPress={() => setMetodo(m)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={m === "pix" ? "qr-code-outline" : "card-outline"}
                  size={20}
                  color={isActive ? "#3A7DFF" : "#666666"}
                />
                <Text style={[styles.metodoText, isActive && styles.metodoTextActive]}>
                  {m === "pix" ? "PIX" : "Cartão"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PIX */}
        {metodo === "pix" && (
          <View style={styles.pixCard}>
            <Ionicons name="qr-code-outline" size={52} color="#3A7DFF" />
            <Text style={styles.pixChave}>marketplace@pagamento.com</Text>
            <Text style={styles.pixInfo}>
              Após confirmar, você terá 30 minutos para realizar o pagamento.
            </Text>
          </View>
        )}

        {/* Cartão */}
        {metodo === "cartao" && (
          <View style={styles.cartaoCard}>
            <Text style={styles.inputLabel}>Número do cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
              value={numeroCartao}
              onChangeText={(v) => setNumeroCartao(formatarCartao(v))}
              maxLength={19}
            />

            <Text style={styles.inputLabel}>Nome no cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="NOME SOBRENOME"
              placeholderTextColor="#8E8E93"
              autoCapitalize="characters"
              value={nomeCartao}
              onChangeText={setNomeCartao}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Validade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={validade}
                  onChangeText={(v) => setValidade(formatarValidade(v))}
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 3))}
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.buttonDisabled]}
          onPress={handleConfirmar}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Confirmar · R$ {preco}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Simulação para fins educacionais. Nenhum valor real será cobrado.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos do calendário ──────────────────────────────────────────────────────

const cal = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: { padding: 4 },
  mesAno: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D0D0D",
  },
  semanaRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  semanaLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  cellSelected: { backgroundColor: "#3A7DFF" },
  cellDisabled: { opacity: 0.3 },
  cellText: { fontSize: 14, color: "#0D0D0D", fontWeight: "500" },
  cellTextSelected: { color: "#FFFFFF", fontWeight: "700" },
  cellTextDisabled: { color: "#8E8E93" },
});

// ─── Estilos gerais ─────────────────────────────────────────────────────────────

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

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  stepActive: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#3A7DFF",
    alignItems: "center", justifyContent: "center",
  },
  stepInactive: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#E5E5EA",
    alignItems: "center", justifyContent: "center",
  },
  stepDone: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#4CAF50",
    alignItems: "center", justifyContent: "center",
  },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E5E5EA" },
  stepLineDone: { backgroundColor: "#4CAF50" },
  stepNumActive: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  stepNumInactive: { color: "#8E8E93", fontWeight: "700", fontSize: 12 },
  stepInactiveLabel: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
  stepActiveLabel: { fontSize: 13, color: "#3A7DFF", fontWeight: "600" },

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
  servicePrice: { fontSize: 16, fontWeight: "700", color: "#3A7DFF", flexShrink: 0 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D0D0D",
    marginBottom: -4,
  },

  // Calendar button
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
  },
  calendarButtonText: {
    flex: 1,
    fontSize: 15,
    color: "#0D0D0D",
    fontWeight: "500",
  },

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

  // Buttons step 1
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A7DFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  nextButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  buttonDisabled: { opacity: 0.4 },

  // Step 2 — Summary
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryKey: { fontSize: 14, color: "#666666" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#0D0D0D", flexShrink: 1, marginLeft: 12, textAlign: "right" },
  summaryTotal: { fontSize: 18, fontWeight: "700", color: "#3A7DFF" },

  // Métodos
  metodosRow: { flexDirection: "row", gap: 10 },
  metodoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingVertical: 14,
  },
  metodoBtnActive: { borderColor: "#3A7DFF", backgroundColor: "#EEF2FF" },
  metodoText: { color: "#666666", fontWeight: "600", fontSize: 15 },
  metodoTextActive: { color: "#3A7DFF" },

  // PIX
  pixCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  pixChave: { fontSize: 15, fontWeight: "700", color: "#0D0D0D" },
  pixInfo: { fontSize: 13, color: "#666666", textAlign: "center", lineHeight: 20 },

  // Cartão
  cartaoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#666666", marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0D0D0D",
  },
  rowInputs: { flexDirection: "row", gap: 10 },

  // Confirm
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
  confirmButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  disclaimer: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },

  // Sucesso
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
