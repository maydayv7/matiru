import { useState, useContext } from "react";
import { Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";
import { AuthContext } from "../AuthContext";
import { API_BASE } from "../config";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params || {};
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Enter username and password");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server ${res.status}`);
      }
      const data = await res.json();
      if (role && data.role !== role) {
        return Alert.alert(
          "Error",
          `Account role mismatch. Expected ${role}, got ${data.role}`
        );
      }
      await login({
        token: data.token,
        id: data.id,
        role: data.role,
        username: data.username,
      });
      navigation.replace(data.role, { userId: data.id });
    } catch (err) {
      Alert.alert("Login failed", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login as {role}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[
          styles.bigButton,
          { backgroundColor: colors.darkGreen, width: "100%" },
        ]}
        onPress={handleLogin}
      >
        <MaterialCommunityIcons name="login" size={24} color="white" />
        <Text style={styles.bigButtonText}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
