import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getWalletInfo, createSaque, WalletInfo } from '@/src/storage/walletStorage';

function formatCurrency(value: number): string {
  const parts = value.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${intPart},${parts[1]}`;
}

export default function Wallet() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [chavePix, setChavePix] = useState('');
  const [saqueLoading, setSaqueLoading] = useState(false);
  const [saqueError, setSaqueError] = useState<string | null>(null);
  const [saqueResult, setSaqueResult] = useState<{ valor: number; chavePix: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user?.email) return;
      let active = true;
      setLoading(true);
      setLoadError(null);
      setSaqueResult(null);
      setShowForm(false);
      setChavePix('');
      getWalletInfo(user.email)
        .then((d) => { if (active) setWallet(d); })
        .catch((e) => { if (active) setLoadError(e.message ?? 'Erro ao carregar carteira'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [user?.email])
  );

  async function handleSaque() {
    if (!chavePix.trim() || !user?.email) return;
    setSaqueLoading(true);
    setSaqueError(null);
    try {
      const result = await createSaque(user.email, chavePix.trim());
      setSaqueResult({ valor: result.valor, chavePix: chavePix.trim() });
      setShowForm(false);
      setChavePix('');
      const updated = await getWalletInfo(user.email);
      setWallet(updated);
    } catch (e: any) {
      setSaqueError(e.message ?? 'Erro ao realizar saque');
    } finally {
      setSaqueLoading(false);
    }
  }

  const disponivel = wallet?.disponivel ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Carteira</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={48} color="#C7C7CC" />
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner de sucesso */}
          {saqueResult && (
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={36} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Transferência realizada!</Text>
              <Text style={styles.successAmount}>{formatCurrency(saqueResult.valor)}</Text>
              <Text style={styles.successSub}>
                enviado para a chave PIX:{'\n'}
                <Text style={styles.successPix}>{saqueResult.chavePix}</Text>
              </Text>
            </View>
          )}

          {/* Cards de saldo */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceCard}>
              <View style={[styles.balanceIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="wallet-outline" size={20} color="#3A7DFF" />
              </View>
              <Text style={styles.balanceLabel}>Total na carteira</Text>
              <Text style={styles.balanceValue}>{formatCurrency(wallet?.total ?? 0)}</Text>
            </View>

            <View style={[styles.balanceCard, styles.balanceCardGreen]}>
              <View style={[styles.balanceIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.balanceLabel}>Disponível para saque</Text>
              <Text style={[styles.balanceValue, { color: '#10B981' }]}>
                {formatCurrency(disponivel)}
              </Text>
            </View>
          </View>

          {/* Formulário de saque */}
          {disponivel > 0 && !showForm && (
            <TouchableOpacity
              style={styles.saqueBtn}
              onPress={() => { setShowForm(true); setSaqueError(null); }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saqueBtnText}>Sacar {formatCurrency(disponivel)}</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={styles.saqueForm}>
              <Text style={styles.saqueFormTitle}>Dados para transferência PIX</Text>
              <Text style={styles.saqueFormAmount}>{formatCurrency(disponivel)}</Text>

              <Text style={styles.fieldLabel}>Chave PIX</Text>
              <TextInput
                style={styles.input}
                value={chavePix}
                onChangeText={setChavePix}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                placeholderTextColor="#C7C7CC"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {saqueError && (
                <Text style={styles.saqueError}>{saqueError}</Text>
              )}

              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setShowForm(false); setChavePix(''); setSaqueError(null); }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, (!chavePix.trim() || saqueLoading) && styles.confirmBtnDisabled]}
                  onPress={handleSaque}
                  disabled={!chavePix.trim() || saqueLoading}
                  activeOpacity={0.85}
                >
                  {saqueLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirmar transferência</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Lista de contratos na carteira */}
          {(wallet?.contratos?.length ?? 0) > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Serviços na carteira</Text>
              {wallet!.contratos.map((c) => (
                <View key={c.id} style={styles.contractCard}>
                  <View style={styles.contractInfo}>
                    <Text style={styles.contractTitle} numberOfLines={1}>{c.titulo}</Text>
                    <Text style={styles.contractDate}>
                      {c.data ? `${c.data}${c.hora ? ` às ${c.hora}` : ''}` : 'Sem data definida'}
                    </Text>
                  </View>
                  <View style={styles.contractRight}>
                    <Text style={styles.contractPrice}>{formatCurrency(parseFloat(c.preco))}</Text>
                    <View style={[styles.badge, c.disponivel ? styles.badgeGreen : styles.badgeAmber]}>
                      <Text style={[styles.badgeText, c.disponivel ? styles.badgeTextGreen : styles.badgeTextAmber]}>
                        {c.disponivel ? 'Disponível' : 'Aguardando'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : (
            !saqueResult && (
              <View style={styles.emptyCard}>
                <Ionicons name="wallet-outline" size={44} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>Carteira vazia</Text>
                <Text style={styles.emptySub}>
                  Confirme contratos para acumular saldo
                </Text>
              </View>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F2F7' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0D0D0D' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 32 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },

  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  successIconWrap: { marginBottom: 4 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#0D0D0D' },
  successAmount: { fontSize: 28, fontWeight: '800', color: '#10B981', marginVertical: 4 },
  successSub: { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  successPix: { fontWeight: '600', color: '#0D0D0D' },

  balanceRow: { flexDirection: 'row', gap: 10 },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  balanceCardGreen: {
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  balanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4 },
  balanceValue: { fontSize: 20, fontWeight: '800', color: '#0D0D0D' },

  saqueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3A7DFF',
    borderRadius: 16,
    paddingVertical: 16,
  },
  saqueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  saqueForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 4,
  },
  saqueFormTitle: { fontSize: 16, fontWeight: '700', color: '#0D0D0D', marginBottom: 2 },
  saqueFormAmount: { fontSize: 26, fontWeight: '800', color: '#3A7DFF', marginBottom: 8 },
  fieldLabel: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93',
    textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 4,
  },
  saqueError: { fontSize: 13, color: '#EF4444', marginTop: 4 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  confirmBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#3A7DFF',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contractInfo: { flex: 1, gap: 3 },
  contractTitle: { fontSize: 15, fontWeight: '600', color: '#0D0D0D' },
  contractDate: { fontSize: 12, color: '#8E8E93' },
  contractRight: { alignItems: 'flex-end', gap: 6 },
  contractPrice: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeGreen: { backgroundColor: 'rgba(16,185,129,0.12)' },
  badgeAmber: { backgroundColor: 'rgba(245,158,11,0.12)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextGreen: { color: '#10B981' },
  badgeTextAmber: { color: '#F59E0B' },

  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#0D0D0D' },
  emptySub: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
});
