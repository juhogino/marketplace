import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import TabBar from '@/components/TabBar';

function getInitial(text: string): string {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

function handleLogout() {
    logout();
    router.replace('/(auth)/login');
  }

  const rows = [
    { icon: 'mail-outline' as const,     label: 'E-mail',  value: user?.email ?? '—' },
    { icon: 'person-outline' as const,   label: 'Tipo',    value: user?.tipo === 'prestador' ? 'Prestador' : 'Usuário' },
    { icon: 'location-outline' as const, label: 'Região',  value: user?.regiao ?? '—' },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* Avatar e nome */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(user?.nome ?? 'U')}</Text>
          </View>
          <Text style={styles.userName}>{user?.nome ?? '—'}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {user?.tipo === 'prestador' ? 'Prestador' : 'Usuário'}
            </Text>
          </View>
        </View>

        {/* Dados */}
        <View style={styles.card}>
          {rows.map((row, i) => (
            <View key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <View style={styles.rowIcon}>
                <Ionicons name={row.icon} size={18} color="#3A7DFF" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ações */}
        {user?.tipo === 'prestador' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/create-service' as any)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#3A7DFF" />
              <Text style={styles.actionButtonText}>Cadastrar novo serviço</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/availability' as any)}
            >
              <Ionicons name="calendar-outline" size={20} color="#3A7DFF" />
              <Text style={styles.actionButtonText}>Gerenciar disponibilidade</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3A7DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  typeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A7DFF',
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0D0D0D',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0D0D0D',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
