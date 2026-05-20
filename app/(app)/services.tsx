import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useEffect, useState } from "react";

import { getServices } from "@/src/storage/serviceStorage";
import { Service } from "@/src/types/Service";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  async function loadServices() {
    const data = await getServices();
    setServices(data);
  }

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Serviços Disponíveis
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.titulo}
            </Text>

            <Text>{item.descricao}</Text>

            <Text>📂 {item.categoria}</Text>

            <Text>💰 R$ {item.preco}</Text>

            <Text>📞 {item.telefone}</Text>

            <Text>🌎 {item.regiao}</Text>

            <Text>
              📧 {item.prestadorEmail}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#CBD5F5",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E3A8A",
  },
});