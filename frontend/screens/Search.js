import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

  const renderTimeline = (produce) => (
    <View style={{ marginTop: 14 }}>
      <Text style={local.subtitle}>Journey Timeline</Text>
      {produce.actionHistory?.map((a, idx) => (
        <View key={idx} style={local.timelineItem}>
          <MaterialCommunityIcons
            name={
              a.action === "REGISTER"
                ? "sprout"
                : a.action === "MOVE"
                  ? "truck"
                  : a.action === "SALE"
                    ? "cash"
                    : a.action === "INSPECT"
                      ? "check-decagram"
                      : "close-circle"
            }
            size={22}
            color={
              a.action === "REMOVED"
                ? "red"
                : a.action === "SALE"
                  ? "orange"
                  : colors.darkGreen
            }
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontWeight: "600" }}>
              {a.action} at {a.currentLocation || "N/A"}
            </Text>
            <Text style={local.small}>
              Owner: {a.currentOwner} | Time: {a.timestamp}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderProduce = (produce) => (
    <View style={local.card}>
      {produce.imageUrl && (
        <Image
          source={{ uri: produce.imageUrl }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}
      <Text style={local.title}>{produce.cropType}</Text>
      <Text>
        Quantity: {produce.qty} {produce.qtyUnit}
      </Text>
      <Text>Price Per Unit: {produce.pricePerUnit}</Text>
      <Text>Quality: {produce.quality}</Text>
      <Text>Status: {produce.status}</Text>
      <Text>Owner: {produce.currentOwner}</Text>
      <Text>Location: {produce.currentLocation}</Text>
      <Text>Storage: {produce.storageConditions}</Text>
      <Text>Harvest Date: {produce.harvestDate}</Text>
      <Text>Expiry Date: {produce.expiryDate}</Text>
      <Text>Available: {produce.isAvailable ? "Yes" : "No"}</Text>
      {renderTimeline(produce)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Global Search"
        navigation={navigation}
        hideSearchButton={true}
        showBack={true}
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
        {!loading &&
          result &&
          (tab === "Produce" && result.produce ? (
            renderProduce(result.produce)
          ) : tab === "User" && result.user ? (
            <View style={local.card}>
              <Text style={local.title}>{result.user.role} Profile</Text>
              <Text>ID: {result.user.id}</Text>
              <Text>Name: {result.user.name}</Text>
              {result.user.location && (
                <Text>Location: {result.user.location}</Text>
              )}
              {result.user.walletId && (
                <Text>Wallet: {result.user.walletId}</Text>
              )}
              {result.user.certification && (
                <Text>
                  Certifications: {result.user.certification.join(", ")}
                </Text>
              )}
            </View>
          ) : (
            <Text>No results found.</Text>
          ))}
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
  title: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 18,
    color: colors.darkGreen,
  },
  subtitle: { fontWeight: "600", marginTop: 6, marginBottom: 4, fontSize: 16 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  small: { fontSize: 12, color: "#555" },
});
