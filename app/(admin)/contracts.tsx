import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllContracts,
  deleteContract,
  updateContractStatus,
} from '@/src/storage/adminStorage';
import { Contract } from '@/src/storage/contractStorage';
import AdminTabBar from '@/components/AdminTabBar';

const STATUS_CONFIG = {
  pendente:   { label: 'Aguardando', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  confirmado: { label: 'Confirmado', color: '#4CAF50', bg: 'rgba(76,175,80,0.15)'   },
  cancelado:  { label: 'Cancelado',  color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
};

const STATUS_OPTIONS: Array<'pendente' | 'confirmado' | 'cancelado'> = [
  'pendente', 'confirmado', 'cancelado',
];

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllContracts()
        .then((data) => { if (active) setContracts(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  async function execChangeStatus(item: Contract, s: 'pendente' | 'confirmado' | 'cancelado') {
    setActionId(item.id);
    try {
      const updated = await updateContractStatus(item.id, s);
      setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível alterar o status.');
    } finally {
      setActionId(null);
    }
  }

  async function execDelete(item: Contract) {
    setActionId(item.id);
    try {
      await deleteContract(item.id);
      setContracts((prev) => prev.filter((c) => c.id !== item.id));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível excluir o contrato.');
    } finally {
      setActionId(null);
    }
  }

  function handleChangeStatus(item: Contract) {
    const options = STATUS_OPTIONS.filter((s) => s !== item.status);
    if (Platform.OS === 'web') {
      const labels = options.map((s, i) => `${i + 1}) ${STATUS_CONFIG[s].label}`).join('\n');
      const input = window.prompt(`Alterar status de "${item.titulo}":\n${labels}\n\nDigite o número:`);
      const idx = parseInt(input ?? '') - 1;
      if (!isNaN(idx) && options[idx]) execChangeStatus(item, options[idx]);
      return;
    }
    Alert.alert(
      'Alterar status',
      `Contrato: ${item.titulo}`,
      [
        ...options.map((s) => ({
          text: STATUS_CONFIG[s].label,
          onPress: () => execChangeStatus(item, s),
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  }

  function confirmDelete(item: Contract) {
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir contrato de "${item.titulo}" permanentemente?`)) execDelete(item);
      return;
    }
    Alert.alert(
      'Excluir contrato',
      `Excluir contrato de "${item.titulo}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => execDelete(item) },
      ]
    );
  }

  function renderItem({ item }: { item: Contract }) {
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pendente;
    const isActioning = actionId === item.id;

    return (
      <View style={styles.card}>
        {/* Título + preço */}
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {item.userEmail} → {item.prestadorEmail}
            </Text>
          </View>
          <Text style={styles.cardPrice}>R$ {item.preco}</Text>
        </View>

        {/* Meta */}
        <View style={styles.cardMeta}>
          {item.data ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.metaText}>{item.data}{item.hora ? ` ${item.hora}` : ''}</Text>
            </View>
          ) : null}
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleChangeStatus(item)}
            disabled={isActioning}
            activeOpacity={0.75}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="swap-horizontal-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.actionBtnText}>Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => confirmDelete(item)}
            disabled={isActioning}
            activeOpacity={0.75}
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contratos</Text>
        {!loading && (
          <Text style={styles.headerCount}>{contracts.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
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
              <Ionicons name="receipt-outline" size={44} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>Nenhum contrato registrado</Text>
            </View>
          }
        />
      )}

      <AdminTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.35)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    color: '#FFFFFF',
  },
  cardSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    flexShrink: 0,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingVertical: 9,
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});
