import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getServices } from '@/src/storage/serviceStorage';
import { Service } from '@/src/types/Service';
import TabBar from '@/components/TabBar';

const CATEGORIES = [
  { id: 'Limpeza',     label: 'Limpeza',     icon: 'sparkles-outline'            as const },
  { id: 'Elétrica',   label: 'Elétrica',    icon: 'flash-outline'               as const },
  { id: 'Beleza',     label: 'Beleza',      icon: 'cut-outline'                 as const },
  { id: 'Hidráulica', label: 'Hidráulica',  icon: 'water-outline'               as const },
];

const ITEM_HEIGHT = 68;
const ITEM_GAP    = 8;

function getInitial(text: string): string {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

export default function Home() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [services, setServices]       = useState<Service[]>([]);
  const [loading, setLoading]         = useState(true);
  const [busca, setBusca]             = useState('');
  const [listaHeight, setListaHeight] = useState(0);

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

  function handleBusca() {
    const q = busca.trim();
    router.push(
      q
        ? ({ pathname: '/(app)/services' as any, params: { query: q } })
        : ('/(app)/services' as any)
    );
  }

  function handleCategoria(categoriaId: string) {
    router.push({
      pathname: '/(app)/services' as any,
      params: { categoria: categoriaId },
    });
  }

  const maxItems      = listaHeight > 0
    ? Math.max(1, Math.floor((listaHeight + ITEM_GAP) / (ITEM_HEIGHT + ITEM_GAP)))
    : 0;
  const servicosVisiveis = services.slice(0, maxItems);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Olá! Bem vindo 👋</Text>
          <Text style={styles.title} numberOfLines={1}>
            {user?.nome ?? 'Usuário'}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(user?.nome ?? 'U')}</Text>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços"
          placeholderTextColor="#999999"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={handleBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Categorias ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias - Qual a sua?</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/services' as any)} hitSlop={8}>
            <Text style={styles.linkText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => handleCategoria(cat.id)}
              activeOpacity={0.75}
            >
              <View style={styles.categoryIconBox}>
                <Ionicons name={cat.icon} size={26} color="#3A7DFF" />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── CTA Perfil ── */}
      <TouchableOpacity
        style={styles.profileCta}
        onPress={() => router.push('/(app)/profile' as any)}
        activeOpacity={0.7}
      >
        <Text style={styles.profileCtaText}>Já configurou seu perfil?</Text>
        <Ionicons name="chevron-forward" size={16} color="#3A7DFF" />
      </TouchableOpacity>

      {/* ── Card Serviços aceitos ── fills remaining space ── */}
      <View style={styles.servicesCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Serviços aceitos</Text>
          <TouchableOpacity
            onPress={() => router.push('/(app)/services' as any)}
            hitSlop={8}
          >
            <Text style={styles.cardLink}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* measure area once; show loader until measured */}
        <View
          style={styles.servicesList}
          onLayout={(e) => setListaHeight(e.nativeEvent.layout.height)}
        >
          {loading || listaHeight === 0 ? (
            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
          ) : servicosVisiveis.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>Nenhum serviço disponível</Text>
            </View>
          ) : (
            servicosVisiveis.map((service, idx) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceItem, idx > 0 && { marginTop: ITEM_GAP }]}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/service/[id]' as any,
                    params: {
                      id: service.id,
                      titulo: service.titulo,
                      descricao: service.descricao,
                      categoria: service.categoria,
                      preco: service.preco,
                      telefone: service.telefone,
                      regiao: service.regiao,
                      prestadorEmail: service.prestadorEmail,
                    },
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.serviceAvatar}>
                  <Text style={styles.serviceAvatarText}>
                    {getInitial(service.prestadorEmail)}
                  </Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {service.titulo}
                  </Text>
                  <Text style={styles.serviceProvider} numberOfLines={1}>
                    {service.prestadorEmail}
                  </Text>
                </View>
                <View style={styles.serviceRight}>
                  <Ionicons name="leaf" size={18} color="#4CAF50" />
                  <Text style={styles.servicePrice}>R$ {service.preco}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerText: {
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '400',
    color: '#444444',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0D0D0D',
    lineHeight: 32,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3A7DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 999,
    height: 44,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 0,
  },

  // Section shared
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  linkText: {
    fontSize: 13,
    color: '#3A7DFF',
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
  },

  // Profile CTA
  profileCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0D0D',
    textDecorationLine: 'underline',
  },

  // Services card — fills remaining space
  servicesCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#3A7DFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#3A7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardLink: {
    fontSize: 13,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 20,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCardText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },

  // Service items
  servicesList: {
    flex: 1,
  },
  serviceItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  serviceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A7DFF',
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  serviceProvider: {
    fontSize: 12,
    color: '#666666',
  },
  serviceRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0D0D',
  },
});
