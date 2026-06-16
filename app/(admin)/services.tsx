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
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllServices, createService, updateService, deleteService } from '@/src/storage/adminStorage';
import { Service } from '@/src/types/Service';
import AdminTabBar from '@/components/AdminTabBar';

function getInitial(text: string) {
  return (text ?? '').trim().charAt(0).toUpperCase() || '?';
}

type FormMode = 'create' | 'edit';

interface FormState {
  titulo: string;
  descricao: string;
  categoria: string;
  preco: string;
  telefone: string;
  regiao: string;
  prestadorEmail: string;
}

const EMPTY_FORM: FormState = {
  titulo: '', descricao: '', categoria: '', preco: '',
  telefone: '', regiao: '', prestadorEmail: '',
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
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
      getAllServices()
        .then((data) => { if (active) setServices(data); })
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

  function openEdit(item: Service) {
    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria,
      preco: item.preco,
      telefone: item.telefone,
      regiao: item.regiao,
      prestadorEmail: item.prestadorEmail,
    });
    setModalMode('edit');
    setEditingId(item.id);
    setModalVisible(true);
  }

  async function handleSave() {
    const { titulo, descricao, categoria, preco, telefone, regiao, prestadorEmail } = form;
    if (!titulo.trim() || !descricao.trim() || !categoria.trim() || !preco.trim() ||
        !telefone.trim() || !regiao.trim() || !prestadorEmail.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        preco: preco.trim(),
        telefone: telefone.trim(),
        regiao: regiao.trim(),
        prestadorEmail: prestadorEmail.trim(),
      };

      if (modalMode === 'create') {
        const created = await createService(payload);
        setServices((prev) => [created, ...prev]);
      } else {
        const updated = await updateService(editingId!, payload);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function execDelete(item: Service) {
    setActionId(item.id);
    try {
      await deleteService(item.id);
      setServices((prev) => prev.filter((s) => s.id !== item.id));
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível excluir o serviço.');
    } finally {
      setActionId(null);
    }
  }

  function confirmDelete(item: Service) {
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${item.titulo}" permanentemente?`)) execDelete(item);
      return;
    }
    execDelete(item);
  }

  function renderItem({ item }: { item: Service }) {
    const isActioning = actionId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(item.titulo)}</Text>
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
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEdit(item)}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => confirmDelete(item)}
              disabled={isActioning}
              hitSlop={8}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Serviços</Text>
        {!loading && <Text style={styles.headerCount}>{services.length}</Text>}
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
                {modalMode === 'create' ? 'Novo serviço' : 'Editar serviço'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              {(
                [
                  { key: 'titulo',         label: 'Título',           placeholder: 'Nome do serviço' },
                  { key: 'descricao',      label: 'Descrição',        placeholder: 'Descrição detalhada' },
                  { key: 'categoria',      label: 'Categoria',        placeholder: 'Ex: Elétrica, Limpeza' },
                  { key: 'preco',          label: 'Preço (R$)',       placeholder: 'Ex: 150' },
                  { key: 'telefone',       label: 'Telefone',         placeholder: '(11) 99999-9999' },
                  { key: 'regiao',         label: 'Região',           placeholder: 'Ex: São Paulo' },
                  { key: 'prestadorEmail', label: 'E-mail prestador', placeholder: 'prestador@email.com' },
                ] as Array<{ key: keyof FormState; label: string; placeholder: string }>
              ).map(({ key, label, placeholder }) => (
                <View key={key}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={[styles.input, key === 'descricao' && { height: 80, textAlignVertical: 'top' }]}
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    multiline={key === 'descricao'}
                    keyboardType={key === 'preco' ? 'numeric' : key === 'prestadorEmail' ? 'email-address' : 'default'}
                    autoCapitalize={key === 'prestadorEmail' ? 'none' : 'sentences'}
                  />
                </View>
              ))}

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
                    {modalMode === 'create' ? 'Criar serviço' : 'Salvar alterações'}
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
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

  card: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  cardProvider: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#10B981', flexShrink: 0 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  cardActions: { marginLeft: 'auto', flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 4 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  formContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 4 },
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
  saveBtn: {
    marginTop: 20, backgroundColor: '#10B981',
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
