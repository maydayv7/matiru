// screens/DistributorScreen.js
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
import LocationPicker from "../components/LocationPicker";
import SearchNav from "../components/SearchNav";

export default function DistributorScreen() {
  const [active, setActive] = useState(null);
  const distributorId = "dist1";
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState(null);
  const [newOwner, setNewOwner] = useState("");

  const updateLocation = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateLocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: distributorId,
          newLocation: location,
        }),
      });
      const data = await res.json();
      Alert.alert("Updated", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const transferOwnership = async () => {
    try {
      const res = await fetch(`${API_BASE}/transferOwnership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          newOwnerId: newOwner,
          qty: 1,
          salePrice: 100,
        }),
      });
      const data = await res.json();
      Alert.alert("Transferred", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🚚 Distributor Dashboard</Text>
        <SearchNav />

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("location")}
          >
            <MaterialCommunityIcons name="map-marker" size={20} color="white" />
            <Text style={styles.actionText}>Update Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("transfer")}
          >
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={20}
              color="white"
            />
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {active === "location" && (
          <View>
            <QRScanner onScanned={setProduceId} placeholder="Produce ID" />
            <LocationPicker onPicked={setLocation} />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={updateLocation}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "transfer" && (
          <View>
            <QRScanner onScanned={setProduceId} placeholder="Produce ID" />
            <TextInput
              style={styles.input}
              placeholder="New Owner ID"
              value={newOwner}
              onChangeText={setNewOwner}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={transferOwnership}
            >
              <Text style={styles.buttonText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
