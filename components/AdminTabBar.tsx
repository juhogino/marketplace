import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'dashboard', label: 'Dashboard', icon: 'grid-outline' as const,   iconActive: 'grid' as const,        route: '/(admin)/dashboard', match: '/dashboard' },
  { name: 'users',     label: 'Usuários',  icon: 'people-outline' as const,  iconActive: 'people' as const,      route: '/(admin)/users',     match: '/users'     },
  { name: 'services',  label: 'Serviços',  icon: 'list-outline' as const,    iconActive: 'list' as const,        route: '/(admin)/services',  match: '/services'  },
  { name: 'contracts', label: 'Contratos', icon: 'receipt-outline' as const, iconActive: 'receipt' as const,     route: '/(admin)/contracts', match: '/contracts' },
] as const;

export default function AdminTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.match;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => { if (!isActive) router.push(tab.route as any); }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
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
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
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
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
