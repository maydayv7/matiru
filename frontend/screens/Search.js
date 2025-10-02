/*
  Produce → search by produceId → shows produce asset
  Owner → search by role id (e.g. "farmer1" or "retailer1") → lists all assets owned by entity
  User → search by user key (e.g. "FARMER-farmer1") → shows the user’s profile
*/

import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import styles, { colors } from "../styles";
import { API_BASE } from "../config";
import Scanner from "../components/QRScanner";

export default function SearchScreen() {
  const [mode, setMode] = useState("produce"); // produce | owner | user
  const [queryId, setQueryId] = useState("");
  const [result, setResult] = useState(null);

  const searchProduce = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/getProduce/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setResult({ type: "produce", data: data.produce });
    } catch (err) {
      Alert.alert("Error", err.message);
      setResult(null);
    }
  };

  const searchOwner = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/getOwner/${id}`);
      const data = await res.json();
      setResult({ type: "owner", data: data.produces });
    } catch (err) {
      Alert.alert("Error", err.message);
      setResult(null);
    }
  };

  const getUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/getUser/${id}`);
      const data = await res.json();
      setResult({ type: "user", data: data.user });
    } catch (err) {
      Alert.alert("Error", err.message);
      setResult(null);
    }
  };

  const handleSearch = (id) => {
    if (!id) return Alert.alert("Error", "ID required");
    setQueryId(id);
    if (mode === "produce") searchProduce(id);
    if (mode === "owner") searchOwner(id);
    if (mode === "user") getUser(id);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Global Search</Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginVertical: 10,
        }}
      >
        {["produce", "owner", "user"].map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  mode === m ? colors.midGreen : colors.lightGreen,
                width: "30%",
              },
            ]}
            onPress={() => {
              setMode(m);
              setResult(null);
            }}
          >
            <Text style={styles.actionText}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Scanner onScanned={handleSearch} placeholder={`Enter ${mode} ID`} />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "700", color: colors.darkGreen }}>
          Result
        </Text>
        {result ? (
          <View style={styles.card}>
            <Text style={{ color: colors.darkGreen }}>
              {JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={{ color: "#666", marginTop: 8 }}>No results</Text>
        )}
      </View>
    </ScrollView>
  );
}
