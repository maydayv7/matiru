import { useState } from "react";
import { Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Enter username and password");
      return;
    }
    navigation.replace(role, { userId: `${role.toLowerCase()}1` });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login as {role}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
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
