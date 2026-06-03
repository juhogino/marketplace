import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/src/context/AuthContext';
import { getMessages, sendMessage, Message } from '@/src/storage/messageStorage';

const POLL_INTERVAL = 3000;

function getInitial(email: string) {
  return (email ?? '').trim().charAt(0).toUpperCase() || '?';
}

export default function Chat() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { contractId, otherEmail, titulo } = useLocalSearchParams<{
    contractId: string;
    otherEmail: string;
    titulo: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    const data = await getMessages(Number(contractId));
    setMessages(data);
    setLoading(false);
  }, [contractId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage({
        contractId: Number(contractId),
        senderEmail: user?.email ?? '',
        text: trimmed,
      });
      await fetchMessages();
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  function scrollToEnd() {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#0D0D0D" />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(otherEmail ?? '')}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{titulo}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{otherEmail}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#3A7DFF" size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
            renderItem={({ item }) => {
              const isMe = item.senderEmail === user?.email;
              return (
                <View style={[styles.bubbleRow, isMe ? styles.rowMe : styles.rowOther]}>
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMe ? styles.textMe : styles.textOther]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.bubbleTime, isMe ? styles.timeMe : styles.timeOther]}>
                      {new Date(item.criadoEm).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubble-outline" size={52} color="#C7C7CC" />
                <Text style={styles.emptyText}>
                  Nenhuma mensagem ainda.{'\n'}Diga olá!
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem..."
            placeholderTextColor="#999999"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: {
    padding: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A7DFF',
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D0D0D',
  },
  headerSub: {
    fontSize: 12,
    color: '#666666',
  },

  // Messages list
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
    gap: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Bubbles
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: '#3A7DFF',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#0D0D0D',
  },
  bubbleTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: 'rgba(255,255,255,0.65)',
  },
  timeOther: {
    color: '#999999',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0D0D0D',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3A7DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#B0C4FF',
  },
});
