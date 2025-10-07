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
import TransferOwnershipForm from "../components/TransferOwnershipForm";

import { api } from "../services/api";
import styles from "../styles";
import { AuthContext } from "../AuthContext";

export default function DistributorScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;

  const [active, setActive] = useState(null);
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [storageConditions, setStorageConditions] = useState("");

  const resetCommon = () => {
    setProduceId("");
  };

  const updateLocation = async () => {
    try {
      await api.updateLocation(
        {
          produceId,
          actorId: userId,
          newLocation: location,
        },
        token
      );
      Alert.alert("Location Updated", "Location updated successfully");
      resetCommon();
      setLocation("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const transferOwnership = async ({
    produceId,
    newOwnerId,
    qty,
    salePrice,
    onComplete,
  }) => {
    if (!produceId || !newOwnerId || !qty)
      return Alert.alert(
        "Error",
        "Please provide Produce ID, New Owner ID, and Quantity."
      );
    try {
      await api.transferOwnership(
        {
          produceId,
          newOwnerId,
          qty: parseFloat(qty),
          salePrice: parseFloat(salePrice),
        },
        token
      );
      Alert.alert("Transferred", "Ownership transferred successfully");
      onComplete();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const markAsUnavailable = async () => {
    try {
      await api.markAsUnavailable(
        { produceId, actorId: userId, reason, newStatus },
        token
      );
      Alert.alert("Marked Unavailable", "Produce marked as unavailable");
      resetCommon();
      setReason("");
      setNewStatus("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateStorageConditions = async () => {
    try {
      await api.updateDetails(
        {
          produceId,
          actorId: userId,
          details: {
            storageConditions: storageConditions
              ? storageConditions.split(",").map((c) => c.trim())
              : [],
          },
        },
        token
      );
      Alert.alert("Updated", "Storage conditions updated successfully");
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
            text="Update Storage"
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
          <TransferOwnershipForm onSubmit={transferOwnership} />
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
              placeholder="New Status (e.g., Removed, Missing)"
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
              placeholder="Storage Conditions (comma separated)"
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
