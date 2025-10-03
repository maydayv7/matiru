import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Scanner from "../components/Scanner";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

export default function SearchScreen({ navigation }) {
  const [tab, setTab] = useState("Produce");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchResult = async () => {
    if (!input.trim()) {
      return Alert.alert("Enter a valid ID");
    }
    try {
      setLoading(true);
      setResult(null);

      let url = "";
      if (tab === "Produce") url = `${API_BASE}/getProduce/${input.trim()}`;
      if (tab === "User") url = `${API_BASE}/getUser/${input.trim()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server ${res.status}`);
      setResult(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProduce = (produce) => (
    <View style={local.card}>
      <Text style={local.title}>Produce ID: {produce.id}</Text>
      <Text>Crop: {produce.cropType}</Text>
      <Text>
        Quantity: {produce.qty} {produce.qtyUnit}
      </Text>
      <Text>Price Per Unit: {produce.pricePerUnit}</Text>
      <Text>Quality: {produce.quality}</Text>
      <Text>Status: {produce.status}</Text>
      <Text>Owner: {produce.currentOwner}</Text>
      <Text>Location: {produce.currentLocation}</Text>
      <Text>Harvest Date: {produce.harvestDate}</Text>
      <Text>Expiry: {produce.expiryDate}</Text>
      <Text>Available: {produce.isAvailable ? "Yes" : "No"}</Text>

      {/* Provenance Timeline */}
      {produce.actionHistory && (
        <View style={{ marginTop: 14 }}>
          <Text style={local.subtitle}>Action History:</Text>
          {produce.actionHistory.map((a, idx) => (
            <View key={idx} style={local.timelineItem}>
              <Text>
                • {a.timestamp} → {a.action}
              </Text>
              <Text style={local.small}>
                Location: {a.currentLocation || "N/A"} | Owner:{" "}
                {a.currentOwner || "N/A"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {produce.saleHistory && produce.saleHistory.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Text style={local.subtitle}>Sale History:</Text>
          {produce.saleHistory.map((s, idx) => (
            <View key={idx} style={local.timelineItem}>
              <Text>
                • {s.timestamp} → {s.prevOwner} → {s.newOwner}
              </Text>
              <Text style={local.small}>
                Qty: {s.qtyBought}, Price: {s.salePrice}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderResults = () => {
    if (!result) return null;

    if (tab === "Produce" && result.produce) {
      return renderProduce(result.produce);
    }
    if (tab === "User" && result.user) {
      const u = result.user;
      return (
        <View style={local.card}>
          <Text style={local.title}>{u.role} Profile</Text>
          <Text>ID: {u.id}</Text>
          <Text>Name: {u.name}</Text>
          {u.location && <Text>Location: {u.location}</Text>}
          {u.walletId && <Text>Wallet: {u.walletId}</Text>}
          {u.certification && (
            <Text>Certifications: {u.certification.join(", ")}</Text>
          )}
        </View>
      );
    }

    return <Text style={{ color: "red" }}>No results found.</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Global Search"
        navigation={navigation}
        hideSearchButton={true}
      />

      <Text style={{ marginBottom: 12, color: colors.darkGreen }}>
        Search by Produce ID or User Key
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {["Produce", "User"].map((t) => (
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
              name={t === "Produce" ? "leaf" : "account-badge"}
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

      {/* ✅ For Produce tab → show scanner + input */}
      {tab === "Produce" ? (
        <Scanner value={input} onChange={setInput} />
      ) : (
        <TextInput
          style={[styles.input, { marginTop: 20 }]}
          placeholder={`Enter ${tab} ID`}
          value={input}
          onChangeText={setInput}
        />
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={fetchResult}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 20, paddingHorizontal: 12 }}>
        {loading && <Text>Loading...</Text>}
        {!loading && renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  title: { fontWeight: "700", marginBottom: 6, fontSize: 16 },
  subtitle: { fontWeight: "600", marginTop: 6, marginBottom: 4 },
  timelineItem: { marginLeft: 8, marginBottom: 4 },
  small: { fontSize: 12, color: "#555" },
});
