import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import {
  getMyContracts,
  getContractsAsPrestador,
  confirmContract,
  rejectContract,
  cancelContract,
  Contract,
} from '@/src/storage/contractStorage';
import TabBar from '@/components/TabBar';

const METODO_LABEL: Record<string, string> = {
  pix: 'PIX',
  cartao: 'Cartão',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pendente: {
    label: 'Aguardando',
    color: '#F59E0B',
    bg: '#FEF3C7',
    icon: 'time-outline',
  },
  confirmado: {
    label: 'Confirmado',
    color: '#4CAF50',
    bg: '#E8F5E9',
    icon: 'checkmark-circle-outline',
  },
  rejeitado: {
    label: 'Rejeitado',
    color: '#EF4444',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
  },
  cancelado: {
    label: 'Cancelado',
    color: '#8E8E93',
    bg: '#F2F2F7',
    icon: 'ban-outline',
  },
};

export default function MyServices() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isPrestador = user?.tipo === 'prestador';

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);

      const fetch = isPrestador
        ? getContractsAsPrestador(user?.email ?? '')
        : getMyContracts(user?.email ?? '');

      fetch
        .then((data) => { if (active) setContracts(data); })
        .catch((e) => { if (active) setError(e.message ?? 'Erro ao carregar contratos'); })
        .finally(() => { if (active) setLoading(false); });

      return () => { active = false; };
    }, [user?.email, isPrestador])
  );

  function updateContract(updated: Contract) {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function handleConfirmar(item: Contract) {
    setActionLoading(item.id);
    try {
      updateContract(await confirmContract(item.id));
    } catch {
      Alert.alert('Erro', 'Não foi possível confirmar o contrato.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejeitar(item: Contract) {
    setActionLoading(item.id);
    try {
      updateContract(await rejectContract(item.id));
    } catch {
      Alert.alert('Erro', 'Não foi possível rejeitar o contrato.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelar(item: Contract) {
    setActionLoading(item.id);
    try {
      updateContract(await cancelContract(item.id));
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar o contrato.');
    } finally {
      setActionLoading(null);
    }
  }

  function openChat(item: Contract) {
    router.push({
      pathname: '/(app)/chat/[contractId]' as any,
      params: {
        contractId: item.id.toString(),
        otherEmail: isPrestador ? item.userEmail : item.prestadorEmail,
        titulo: item.titulo,
      },
    });
  }

  function renderItem({ item }: { item: Contract }) {
    const subtitle = isPrestador ? item.userEmail : item.prestadorEmail;
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pendente;
    const isActioning = actionLoading === item.id;
    const isPendente = item.status === 'pendente';
    const isConfirmado = item.status === 'confirmado';
    const isEncerrado = item.status === 'cancelado' || item.status === 'rejeitado';

    return (
      <View style={styles.card}>
        {/* Topo */}
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name="construct-outline" size={20} color="#3A7DFF" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>{subtitle}</Text>
          </View>
          <Text style={styles.cardPrice}>R$ {item.preco}</Text>
        </View>

        <View style={styles.divider} />

        {/* Metadados */}
        <View style={styles.cardMeta}>
          {item.data ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color="#666666" />
              <Text style={styles.metaText}>
                {item.data}{item.hora ? ` às ${item.hora}` : ''}
              </Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <Ionicons name="card-outline" size={13} color="#666666" />
            <Text style={styles.metaText}>
              {METODO_LABEL[item.metodoPagamento] ?? item.metodoPagamento}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Prestador: Rejeitar / Confirmar — só quando pendente */}
        {isPrestador && isPendente && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnReject]}
              onPress={() => handleRejeitar(item)}
              disabled={isActioning}
              activeOpacity={0.75}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-outline" size={16} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Rejeitar</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnConfirm]}
              onPress={() => handleConfirmar(item)}
              disabled={isActioning}
              activeOpacity={0.75}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Confirmar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Cancelar — disponível para ambos apenas após confirmação */}
        {isConfirmado && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancelar(item)}
            disabled={isActioning}
            activeOpacity={0.75}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text style={styles.cancelBtnText}>Cancelar contrato</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Chat — disponível enquanto não encerrado */}
        {!isEncerrado && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => openChat(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#3A7DFF" />
            <Text style={styles.chatButtonText}>
              {isPrestador ? 'Responder cliente' : 'Falar com prestador'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const screenTitle = isPrestador ? 'Solicitações' : 'Meus Serviços';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        {!loading && contracts.length > 0 && (
          <Text style={styles.headerCount}>{contracts.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name={isPrestador ? 'chatbubbles-outline' : 'receipt-outline'}
                size={48}
                color="#C7C7CC"
              />
              <Text style={styles.emptyText}>
                {isPrestador
                  ? 'Nenhuma solicitação recebida ainda'
                  : 'Nenhum serviço contratado ainda'}
              </Text>
              {!isPrestador && (
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push('/(app)/services' as any)}
                >
                  <Text style={styles.browseButtonText}>Explorar serviços</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 8,
    backgroundColor: '#3A7DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  cardSub: {
    fontSize: 12,
    color: '#666666',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A7DFF',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
  },

  // Meta
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Ações
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnReject: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnConfirm: {
    backgroundColor: '#3A7DFF',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Cancelar
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Chat
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 10,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A7DFF',
  },
});
