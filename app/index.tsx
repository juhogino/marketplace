import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/src/context/AuthContext";

export default function Index() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#3A7DFF" size="large" />
      </View>
    );
  }

  return <Redirect href={user ? "/(app)/home" : "/(auth)/login"} />;
}
