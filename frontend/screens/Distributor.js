import { useContext, useState } from "react";
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
import { AuthContext } from "../AuthContext";

export default function DistributorScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;
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

  // updateStorageConditions
  const [storageConditions, setStorageConditions] = useState("");

  const resetCommon = () => {
    setProduceId("");
  };

  const updateLocation = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateLocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          newLocation: location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Location Updated", "Location updated successfully");
      resetCommon();
      setLocation("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const transferOwnership = async () => {
    try {
      const res = await fetch(`${API_BASE}/transferOwnership`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produceId,
          newOwnerId,
          qty: parseFloat(qty),
          salePrice: parseFloat(salePrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Transferred", "Ownership transferred successfully");
      // reset fields
      resetCommon();
      setNewOwnerId("");
      setQty("");
      setSalePrice("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const markAsUnavailable = async () => {
    try {
      const res = await fetch(`${API_BASE}/markAsUnavailable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ produceId, actorId: userId, reason, newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Marked Unavailable", "Produce marked unavailable");
      resetCommon();
      setReason("");
      setNewStatus("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateStorageConditions = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          details: {
            storageConditions: storageConditions
              ? storageConditions.split(",").map((c) => c.trim())
              : [],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Updated Storage Conditions", "Storage conditions updated");
      resetCommon();
      setStorageConditions("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Distributor Dashboard"
        navigation={navigation}
        role="Distributor"
      />
      <ScrollView>
        <View style={styles.actionGrid}>
          <ActionButton
            icon="map-marker"
            text="Update Location"
            onPress={() => setActive("location")}
          />
          <ActionButton
            icon="cash"
            text="Transfer Ownership"
            onPress={() => setActive("transfer")}
          />
          <ActionButton
            icon="cancel"
            text="Mark Unavailable"
            onPress={() => setActive("remove")}
          />
          <ActionButton
            icon="thermometer"
            text="Update Storage Conditions"
            onPress={() => setActive("storage")}
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
              placeholder="New Owner ID"
              value={newOwnerId}
              onChangeText={setNewOwnerId}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
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
              <Text style={styles.buttonText}>Transfer Ownership</Text>
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
              placeholder="New Status (Removed/Missing...)"
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

        {active === "storage" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Enter Storage Conditions (comma separated)"
              value={storageConditions}
              onChangeText={setStorageConditions}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={updateStorageConditions}
            >
              <Text style={styles.buttonText}>Update Storage Conditions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 12 }}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("Inventory", {
              userId,
              role: "Distributor",
            })
          }
        >
          <Text style={styles.secondaryButtonText}>View Inventory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
