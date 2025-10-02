// screens/InspectorScreen.js
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";
import QRScanner from "../components/QRScanner";
import SearchNav from "../components/SearchNav";

export default function InspectorScreen() {
  const [active, setActive] = useState(null);
  const inspectorId = "insp1";
  const [produceId, setProduceId] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [reason, setReason] = useState("");

  const inspectProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/inspectProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          inspectorId,
          qualityUpdate: { quality, expiryDate },
        }),
      });
      const data = await res.json();
      Alert.alert("Inspected", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const markUnavailable = async () => {
    try {
      const res = await fetch(`${API_BASE}/markAsUnavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: inspectorId,
          reason,
          newStatus: "Removed",
        }),
      });
      const data = await res.json();
      Alert.alert("Marked", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🕵️ Inspector Dashboard</Text>
        <SearchNav />

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("inspect")}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={20}
              color="white"
            />
            <Text style={styles.actionText}>Inspect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("remove")}
          >
            <MaterialCommunityIcons
              name="close-octagon"
              size={20}
              color="white"
            />
            <Text style={styles.actionText}>Mark Unavailable</Text>
          </TouchableOpacity>
        </View>

        {active === "inspect" && (
          <View>
            <QRScanner onScanned={setProduceId} placeholder="Produce ID" />
            <TextInput
              style={styles.input}
              placeholder="Quality"
              value={quality}
              onChangeText={setQuality}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={inspectProduce}
            >
              <Text style={styles.buttonText}>Inspect</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "remove" && (
          <View>
            <QRScanner onScanned={setProduceId} placeholder="Produce ID" />
            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={reason}
              onChangeText={setReason}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={markUnavailable}
            >
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
