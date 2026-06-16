import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, AdminUser } from '@/src/storage/adminStorage';
import AdminTabBar from '@/components/AdminTabBar';

const TIPO_CONFIG = {
  usuario:   { label: 'Usuário',   color: '#3A7DFF', bg: '#EEF2FF' },
  prestador: { label: 'Prestador', color: '#8B5CF6', bg: '#F3F0FF' },
  admin:     { label: 'Admin',     color: '#EF4444', bg: '#FEE2E2' },
};

const TIPOS: Array<'usuario' | 'prestador' | 'admin'> = ['usuario', 'prestador', 'admin'];

function getInitial(text: string) {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

type FormMode = 'create' | 'edit';

interface FormState {
  nome: string;
  email: string;
  senha: string;
  tipo: 'usuario' | 'prestador' | 'admin';
  regiao: string;
}

const EMPTY_FORM: FormState = { nome: '', email: '', senha: '', tipo: 'usuario', regiao: '' };

export default function AdminUsers() {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalMode('create');
    setEditingId(null);
    setModalVisible(true);
  }

  function openEdit(item: AdminUser) {
    setForm({
      nome: item.nome ?? '',
      email: item.email,
      senha: '',
      tipo: (item.tipo as any) ?? 'usuario',
      regiao: item.regiao ?? '',
    });
    setModalMode('edit');
    setEditingId(item.id!);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.regiao.trim()) {
      Alert.alert('Campos obrigatórios', 'Nome e região são obrigatórios.');
      return;
    }
    if (modalMode === 'create' && (!form.email.trim() || !form.senha.trim())) {
      Alert.alert('Campos obrigatórios', 'E-mail e senha são obrigatórios para criar usuário.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'create') {
        const created = await createUser({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          tipo: form.tipo,
          regiao: form.regiao.trim(),
        });
        setUsers((prev) => [created, ...prev]);
      } else {
        const updated = await updateUser(editingId!, {
          nome: form.nome.trim(),
          tipo: form.tipo,
          regiao: form.regiao.trim(),
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function execDelete(item: AdminUser) {
    setActionId(item.id!);
    try {
      await deleteUser(item.id!);
      setUsers((prev) => prev.filter((u) => u.id !== item.id));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível excluir o usuário.');
    } finally {
      setActionId(null);
    }
  }

  function confirmDelete(item: AdminUser) {
    if (item.email === me?.email) {
      Alert.alert('Ação não permitida', 'Você não pode excluir sua própria conta.');
      return;
    }
    execDelete(item);
  }

  function renderItem({ item }: { item: AdminUser }) {
    const tipo = TIPO_CONFIG[item.tipo as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.usuario;
    const isDeleting = actionId === item.id;
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

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => openEdit(item)}
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          {!isMe && (
            <TouchableOpacity
              style={styles.iconBtn}
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
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usuários</Text>
        {!loading && <Text style={styles.headerCount}>{users.length}</Text>}
        <TouchableOpacity style={styles.addBtn} onPress={openCreate} hitSlop={8}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
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

      {/* Modal criar/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'create' ? 'Novo usuário' : 'Editar usuário'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <Text style={styles.fieldLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
                placeholder="Nome completo"
                placeholderTextColor="rgba(255,255,255,0.25)"
              />

              {modalMode === 'create' && (
                <>
                  <Text style={styles.fieldLabel}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    value={form.email}
                    onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                    placeholder="email@exemplo.com"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.fieldLabel}>Senha</Text>
                  <TextInput
                    style={styles.input}
                    value={form.senha}
                    onChangeText={(v) => setForm((f) => ({ ...f, senha: v }))}
                    placeholder="Senha inicial"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    secureTextEntry
                  />
                </>
              )}

              <Text style={styles.fieldLabel}>Tipo</Text>
              <View style={styles.tipoRow}>
                {TIPOS.map((t) => {
                  const cfg = TIPO_CONFIG[t];
                  const active = form.tipo === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tipoBtn, active && { borderColor: cfg.color, backgroundColor: cfg.color + '22' }]}
                      onPress={() => setForm((f) => ({ ...f, tipo: t }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.tipoBtnText, active && { color: cfg.color }]}>{cfg.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Região</Text>
              <TextInput
                style={styles.input}
                value={form.regiao}
                onChangeText={(v) => setForm((f) => ({ ...f, regiao: v }))}
                placeholder="Ex: São Paulo"
                placeholderTextColor="rgba(255,255,255,0.25)"
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {modalMode === 'create' ? 'Criar usuário' : 'Salvar alterações'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  headerCount: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 60 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.35)' },
  listContent: { paddingHorizontal: 20, paddingBottom: 16, gap: 8, flexGrow: 1 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  cardEmail: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  regionText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  cardActions: { flexDirection: 'row', gap: 4, flexShrink: 0 },
  iconBtn: { padding: 4 },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  formContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 6 },
  fieldLabel: {
    fontSize: 12, fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  tipoRow: { flexDirection: 'row', gap: 8 },
  tipoBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  tipoBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#3A7DFF',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
