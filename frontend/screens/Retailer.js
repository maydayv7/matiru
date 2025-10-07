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

export default function RetailerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;

  const [active, setActive] = useState(null);
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
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
      setActive(null);
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
      Alert.alert("Transferred", "Sale / Transfer successful");
      onComplete();
      setActive(null);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateDetails = async () => {
    try {
      await api.updateDetails(
        {
          produceId,
          actorId: userId,
          details: {
            pricePerUnit: parseFloat(pricePerUnit),
            storageConditions: storageConditions
              ? storageConditions.split(",").map((c) => c.trim())
              : [],
          },
        },
        token
      );
      Alert.alert("Updated Details", "Produce details updated successfully");
      resetCommon();
      setPricePerUnit("");
      setStorageConditions("");
      setActive(null);
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
            icon="cash"
            text="Sell / Transfer"
            onPress={() => setActive("transfer")}
          />
          <ActionButton
            icon="update"
            text="Update Details"
            onPress={() => setActive("update")}
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

        {active === "update" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="New Price Per Unit"
              keyboardType="numeric"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="Storage Conditions (comma separated)"
              value={storageConditions}
              onChangeText={setStorageConditions}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={updateDetails}
            >
              <Text style={styles.buttonText}>Update</Text>
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
              role: "Retailer",
            })
          }
        >
          <Text style={styles.secondaryButtonText}>View Inventory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
