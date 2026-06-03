import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import {
  getProviderAvailability,
  saveProviderAvailability,
  NewSlot,
} from '@/src/storage/availabilityStorage';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORARIOS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

// slots selecionados: Set de "diaSemana-hora", ex: "1-08:00"
function slotKey(dia: number, hora: string) {
  return `${dia}-${hora}`;
}

export default function Availability() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getProviderAvailability(user?.email ?? '')
        .then((slots) => {
          if (!active) return;
          const keys = new Set(slots.map((s) => slotKey(s.diaSemana, s.hora)));
          setSelected(keys);
        })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [user?.email])
  );

  function toggle(dia: number, hora: string) {
    const key = slotKey(dia, hora);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDia(dia: number) {
    const allSelected = HORARIOS.every((h) => selected.has(slotKey(dia, h)));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        HORARIOS.forEach((h) => next.delete(slotKey(dia, h)));
      } else {
        HORARIOS.forEach((h) => next.add(slotKey(dia, h)));
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const slots: NewSlot[] = Array.from(selected).map((key) => {
        const [dia, hora] = key.split('-');
        return { diaSemana: Number(dia), hora };
      });
      await saveProviderAvailability(user?.email ?? '', slots);
      Alert.alert('Disponibilidade salva!', 'Os clientes verão seus horários ao agendar.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a disponibilidade. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const totalSelecionados = selected.size;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Disponibilidade</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Selecione os dias e horários em que você está disponível (8h–18h).
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3A7DFF" size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {DIAS.map((nomeDia, dia) => {
            const quantSelecionados = HORARIOS.filter((h) =>
              selected.has(slotKey(dia, h))
            ).length;
            const todosAtivos = quantSelecionados === HORARIOS.length;

            return (
              <View key={dia} style={styles.diaSection}>
                <View style={styles.diaHeader}>
                  <Text style={styles.diaNome}>{nomeDia}</Text>
                  <TouchableOpacity
                    style={[styles.toggleDiaBtn, todosAtivos && styles.toggleDiaBtnActive]}
                    onPress={() => toggleDia(dia)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toggleDiaText, todosAtivos && styles.toggleDiaTextActive]}>
                      {todosAtivos ? 'Desmarcar todos' : 'Marcar todos'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.horasGrid}>
                  {HORARIOS.map((hora) => {
                    const ativo = selected.has(slotKey(dia, hora));
                    return (
                      <TouchableOpacity
                        key={hora}
                        style={[styles.horaBtn, ativo && styles.horaBtnActive]}
                        onPress={() => toggle(dia, hora)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.horaText, ativo && styles.horaTextActive]}>
                          {hora}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerCount}>
          {totalSelecionados} slot{totalSelecionados !== 1 ? 's' : ''} selecionado{totalSelecionados !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Salvar disponibilidade</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },

  diaSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  diaNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  toggleDiaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
  },
  toggleDiaBtnActive: {
    backgroundColor: '#EEF2FF',
  },
  toggleDiaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  toggleDiaTextActive: {
    color: '#3A7DFF',
  },

  horasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  horaBtnActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  horaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
  },
  horaTextActive: {
    color: '#FFFFFF',
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 10,
  },
  footerCount: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3A7DFF',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
