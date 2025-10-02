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

export default function InspectorScreen({ navigation, route }) {
  const { userId } = route.params;
  const [active, setActive] = useState(null);

  // Common
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");

  // inspectProduce
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState("");

  // markAsUnavailable
  const [unavailReason, setUnavailReason] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const inspectProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/inspectProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          inspectorId: userId,
          qualityUpdate: {
            quality,
            expiryDate,
            storageConditions: storageConditions.split(","),
            failed,
            reason,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Inspection Complete", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

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

  const markAsUnavailable = async () => {
    try {
      const res = await fetch(`${API_BASE}/markAsUnavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          reason: unavailReason,
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
        title="Inspector Dashboard"
        navigation={navigation}
        role="Inspector"
      />
      <ScrollView>
        <View style={styles.actionGrid}>
          <ActionButton
            icon="check-decagram"
            text="Inspect Produce"
            onPress={() => setActive("inspect")}
          />
          <ActionButton
            icon="map-marker"
            text="Update Location"
            onPress={() => setActive("location")}
          />
          <ActionButton
            icon="cancel"
            text="Mark Unavailable"
            onPress={() => setActive("remove")}
          />
        </View>

        {active === "inspect" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Quality (e.g., Grade A)"
              value={quality}
              onChangeText={setQuality}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date (YYYY-MM-DD)"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Storage Conditions (comma separated)"
              value={storageConditions}
              onChangeText={setStorageConditions}
            />
            <TextInput
              style={styles.input}
              placeholder="Reason (if failed)"
              value={reason}
              onChangeText={setReason}
            />
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: failed
                    ? "red"
                    : styles.primaryButton.backgroundColor,
                },
              ]}
              onPress={() => setFailed(!failed)}
            >
              <Text style={styles.buttonText}>
                {failed ? "Mark as Passed" : "Mark as Failed"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={inspectProduce}
            >
              <Text style={styles.buttonText}>Submit Inspection</Text>
            </TouchableOpacity>
          </View>
        )}

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

        {active === "remove" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Reason"
              value={unavailReason}
              onChangeText={setUnavailReason}
            />
            <TextInput
              style={styles.input}
              placeholder="New Status (Failed Inspection, Removed...)"
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
