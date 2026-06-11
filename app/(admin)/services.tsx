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
import { getAllServices, deleteService } from '@/src/storage/adminStorage';
import { Service } from '@/src/types/Service';
import AdminTabBar from '@/components/AdminTabBar';

function getInitial(text: string) {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllServices()
        .then((data) => { if (active) setServices(data); })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  async function execDelete(item: Service) {
    setDeletingId(item.id);
    try {
      await deleteService(item.id);
      setServices((prev) => prev.filter((s) => s.id !== item.id));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível excluir o serviço.');
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(item: Service) {
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${item.titulo}" permanentemente?`)) execDelete(item);
      return;
    }
    Alert.alert(
      'Excluir serviço',
      `Excluir "${item.titulo}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => execDelete(item) },
      ]
    );
  }

  function renderItem({ item }: { item: Service }) {
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(item.prestadorEmail)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.cardProvider} numberOfLines={1}>{item.prestadorEmail}</Text>
          </View>
          <Text style={styles.cardPrice}>R$ {item.preco}</Text>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.tag}>
            <Ionicons name="folder-outline" size={11} color="rgba(255,255,255,0.5)" />
            <Text style={styles.tagText}>{item.categoria}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.5)" />
            <Text style={styles.tagText}>{item.regiao}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete(item)}
            disabled={isDeleting}
            hitSlop={8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Serviços</Text>
        {!loading && (
          <Text style={styles.headerCount}>{services.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="briefcase-outline" size={44} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>Nenhum serviço cadastrado</Text>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  cardProvider: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    flexShrink: 0,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
});
