import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { useContext, useState } from "react";

import { AuthContext } from "@/src/context/AuthContext";
import { saveService } from "@/src/storage/serviceStorage";

export default function CreateService() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [telefone, setTelefone] = useState("");

  async function handleCreate() {
    if (
      !titulo ||
      !descricao ||
      !categoria ||
      !preco ||
      !telefone
    ) {
      alert("Preencha todos os campos");
      return;
    }

    await saveService({
      id: Date.now().toString(),
      titulo,
      descricao,
      categoria,
      preco,
      telefone,
      regiao: user?.regiao || "",
      prestadorEmail: user?.email || "",
    });

    alert("Serviço cadastrado com sucesso");

    router.push("/(app)/services");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Cadastro de Serviço
      </Text>

      <TextInput
        placeholder="Título do serviço"
        style={styles.input}
        onChangeText={setTitulo}
      />

      <TextInput
        placeholder="Descrição"
        style={styles.input}
        onChangeText={setDescricao}
      />

      <TextInput
        placeholder="Categoria"
        style={styles.input}
        onChangeText={setCategoria}
      />

      <TextInput
        placeholder="Preço"
        style={styles.input}
        onChangeText={setPreco}
      />

      <TextInput
        placeholder="Telefone"
        style={styles.input}
        onChangeText={setTelefone}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
      >
        <Text style={styles.buttonText}>
          Cadastrar Serviço
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#CBD5F5",
  },

  button: {
    backgroundColor: "#4A6CF7",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});