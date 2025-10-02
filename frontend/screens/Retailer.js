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
import ScreenHeader from "../components/ScreenHeader";
import ActionButton from "../components/ActionButton";
import Scanner from "../components/Scanner";
import LocationPicker from "../components/LocationPicker";
import { API_BASE } from "../config";
import styles from "../styles";

export default function RetailerScreen({ navigation, route }) {
  const { userId } = route.params;
  const [active, setActive] = useState(null);

  // Common
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");

  // transferOwnership
  const [newOwnerId, setNewOwnerId] = useState("");
  const [qty, setQty] = useState("");
  const [salePrice, setSalePrice] = useState("");

  // markAsUnavailable
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const updateLocation = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateLocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          newLocation: location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Location Updated", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const transferOwnership = async () => {
    try {
      const res = await fetch(`${API_BASE}/transferOwnership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          newOwnerId,
          qty: parseFloat(qty),
          salePrice: parseFloat(salePrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Sale Recorded", JSON.stringify(data.result, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const markAsUnavailable = async () => {
    try {
      const res = await fetch(`${API_BASE}/markAsUnavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          reason,
          newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Marked Unavailable", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Retailer Dashboard"
        navigation={navigation}
        role="Retailer"
      />
      <ScrollView>
        <View style={styles.actionGrid}>
          <ActionButton
            icon="map-marker"
            text="Update Location"
            onPress={() => setActive("location")}
          />
          <ActionButton
            icon="cash-register"
            text="Record Sale"
            onPress={() => setActive("transfer")}
          />
          <ActionButton
            icon="cancel"
            text="Mark Unavailable"
            onPress={() => setActive("remove")}
          />
        </View>

        {active === "location" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <LocationPicker value={location} onChange={setLocation} />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={updateLocation}
            >
              <Text style={styles.buttonText}>Update Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "transfer" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Customer/User ID"
              value={newOwnerId}
              onChangeText={setNewOwnerId}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity Sold"
              keyboardType="numeric"
              value={qty}
              onChangeText={setQty}
            />
            <TextInput
              style={styles.input}
              placeholder="Sale Price"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={transferOwnership}
            >
              <Text style={styles.buttonText}>Record Sale</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "remove" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={reason}
              onChangeText={setReason}
            />
            <TextInput
              style={styles.input}
              placeholder="New Status (Expired, Spoiled...)"
              value={newStatus}
              onChangeText={setNewStatus}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={markAsUnavailable}
            >
              <Text style={styles.buttonText}>Mark as Unavailable</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
