/*
  Produce → search by produceId → shows produce asset
  Owner → search by role id (e.g. "farmer1" or "retailer1") → lists all assets owned by entity
  User → search by user key (e.g. "FARMER-farmer1") → shows the user’s profile
*/

import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

export default function SearchScreen({ navigation }) {
  const [tab, setTab] = useState("Produce");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const fetchResult = async () => {
    try {
      let url = "";
      if (tab === "Produce") url = `${API_BASE}/getProduce/${input}`;
      if (tab === "Owner") url = `${API_BASE}/getProduceByOwner/${input}`;
      if (tab === "User") url = `${API_BASE}/getUser/${input}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Global Search"
        navigation={navigation}
        hideSearchButton={true}
      />

      <Text style={{ marginBottom: 12, color: colors.darkGreen }}>
        Search by Produce ID, Owner ID, or User Key
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {["Produce", "Owner", "User"].map((t) => (
          <TouchableOpacity
            key={t}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: tab === t ? colors.darkGreen : colors.lightGreen,
            }}
            onPress={() => {
              setTab(t);
              setResult(null);
              setInput("");
            }}
          >
            <MaterialCommunityIcons
              name={
                t === "Produce"
                  ? "leaf"
                  : t === "Owner"
                    ? "account"
                    : "account-badge"
              }
              size={20}
              color={tab === t ? "white" : colors.darkGreen}
            />
            <Text
              style={{
                color: tab === t ? "white" : colors.darkGreen,
                marginLeft: 6,
                fontWeight: "600",
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { marginTop: 20 }]}
        placeholder={`Enter ${tab} ID`}
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={fetchResult}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 20 }}>
        {result && (
          <Text style={{ color: colors.darkGreen }}>
            {JSON.stringify(result, null, 2)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
