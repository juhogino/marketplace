import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getAdminStats, AdminStats } from '@/src/storage/adminStorage';
import AdminTabBar from '@/components/AdminTabBar';

function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={[styles.statIconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);
      getAdminStats()
        .then((data) => { if (active) setStats(data); })
        .catch((e) => { if (active) setError(e.message ?? 'Erro ao carregar dados'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  function handleLogout() {
    logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Painel Admin</Text>
          <Text style={styles.headerName}>{user?.nome ?? user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} hitSlop={8}>
          <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, textAlign: 'center', paddingHorizontal: 32 }}>
            {error}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Usuários */}
          <Text style={styles.sectionTitle}>Usuários</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="person-outline"
              label="Usuários"
              value={stats?.usuarios ?? 0}
              color="#3A7DFF"
              onPress={() => router.push('/(admin)/users' as any)}
            />
            <StatCard
              icon="construct-outline"
              label="Prestadores"
              value={stats?.prestadores ?? 0}
              color="#8B5CF6"
              onPress={() => router.push('/(admin)/users' as any)}
            />
            <StatCard
              icon="shield-outline"
              label="Admins"
              value={stats?.admins ?? 0}
              color="#EF4444"
              onPress={() => router.push('/(admin)/users' as any)}
            />
          </View>

          {/* Serviços */}
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="briefcase-outline"
              label="Serviços"
              value={stats?.servicos ?? 0}
              color="#10B981"
              onPress={() => router.push('/(admin)/services' as any)}
            />
          </View>

          {/* Contratos */}
          <Text style={styles.sectionTitle}>Contratos</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="receipt-outline"
              label="Total"
              value={stats?.contratos.total ?? 0}
              color="#F59E0B"
              onPress={() => router.push('/(admin)/contracts' as any)}
            />
            <StatCard
              icon="time-outline"
              label="Pendentes"
              value={stats?.contratos.pendente ?? 0}
              color="#F59E0B"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="checkmark-circle-outline"
              label="Confirmados"
              value={stats?.contratos.confirmado ?? 0}
              color="#4CAF50"
            />
            <StatCard
              icon="close-circle-outline"
              label="Rejeitados"
              value={stats?.contratos.rejeitado ?? 0}
              color="#F97316"
            />
            <StatCard
              icon="ban-outline"
              label="Cancelados"
              value={stats?.contratos.cancelado ?? 0}
              color="#8E8E93"
            />
          </View>

          {/* Ações rápidas */}
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          {[
            { label: 'Gerenciar usuários',  icon: 'people-outline' as const,  route: '/(admin)/users'     },
            { label: 'Gerenciar serviços',  icon: 'list-outline' as const,    route: '/(admin)/services'  },
            { label: 'Gerenciar contratos', icon: 'receipt-outline' as const, route: '/(admin)/contracts' },
          ].map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.actionRow}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconBox}>
                <Ionicons name={item.icon} size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutBtn: {
    padding: 8,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: -2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
