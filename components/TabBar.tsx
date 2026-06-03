import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContext } from 'react';
import { AuthContext } from '@/src/context/AuthContext';

const TABS = [
  {
    name: 'home',
    label: 'Home',
    icon: 'home-outline' as const,
    iconActive: 'home' as const,
    route: '/(app)/home',
    match: '/home',
  },
  {
    name: 'search',
    label: 'Buscar',
    icon: 'search-outline' as const,
    iconActive: 'search' as const,
    route: '/(app)/services',
    match: '/services',
  },
  {
    name: 'my-services',
    label: 'Meus serviços',
    labelPrestador: 'Meus chats',
    icon: 'list-outline' as const,
    iconActive: 'list' as const,
    route: '/(app)/my-services',
    match: '/my-services',
  },
  {
    name: 'profile',
    label: 'Perfil',
    icon: 'person-outline' as const,
    iconActive: 'person' as const,
    route: '/(app)/profile',
    match: '/profile',
  },
] as const;

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const isPrestador = user?.tipo === 'prestador';

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.match;
        const label =
          tab.name === 'my-services' && isPrestador
            ? 'Meus chats'
            : tab.label;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => {
              if (!isActive) router.push(tab.route as any);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? '#3A7DFF' : '#8E8E93'}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '400',
  },
  tabLabelActive: {
    color: '#3A7DFF',
    fontWeight: '600',
  },
});
