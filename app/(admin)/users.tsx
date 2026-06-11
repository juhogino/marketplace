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
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getAllUsers, deleteUser, AdminUser } from '@/src/storage/adminStorage';
import AdminTabBar from '@/components/AdminTabBar';

const TIPO_CONFIG = {
  usuario:   { label: 'Usuário',   color: '#3A7DFF', bg: '#EEF2FF' },
  prestador: { label: 'Prestador', color: '#8B5CF6', bg: '#F3F0FF' },
  admin:     { label: 'Admin',     color: '#EF4444', bg: '#FEE2E2' },
};

function getInitial(text: string) {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

export default function AdminUsers() {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllUsers()
        .then((data) => { if (active) setUsers(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  async function execDelete(item: AdminUser) {
    setDeletingId(item.id!);
    try {
      await deleteUser(item.id!);
      setUsers((prev) => prev.filter((u) => u.id !== item.id));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível excluir o usuário.');
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(item: AdminUser) {
    if (item.email === me?.email) {
      Alert.alert('Ação não permitida', 'Você não pode excluir sua própria conta.');
      return;
    }
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${item.nome}" permanentemente?`)) execDelete(item);
      return;
    }
    Alert.alert(
      'Excluir usuário',
      `Excluir "${item.nome}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => execDelete(item) },
      ]
    );
  }

  function renderItem({ item }: { item: AdminUser }) {
    const tipo = TIPO_CONFIG[item.tipo as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.usuario;
    const isDeleting = deletingId === item.id;
    const isMe = item.email === me?.email;

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(item.nome ?? item.email)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{item.nome ?? '—'}</Text>
            <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.badge, { backgroundColor: tipo.bg }]}>
                <Text style={[styles.badgeText, { color: tipo.color }]}>{tipo.label}</Text>
              </View>
              {item.regiao ? (
                <View style={styles.regionRow}>
                  <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.regionText}>{item.regiao}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {!isMe && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item)}
            disabled={isDeleting}
            hitSlop={8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usuários</Text>
        {!loading && (
          <Text style={styles.headerCount}>{users.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={44} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  regionText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
