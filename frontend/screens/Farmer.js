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

export default function FarmerScreen({ navigation, route }) {
  const { userId } = route.params;
  const [active, setActive] = useState(null);

  // Common
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");

  // registerProduce
  const [cropType, setCropType] = useState("");
  const [qty, setQty] = useState("");
  const [qtyUnit, setQtyUnit] = useState("KG");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageConditions, setStorageConditions] = useState("");

  // splitProduce
  const [splitQty, setSplitQty] = useState("");

  const registerProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/registerProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: userId,
          details: {
            cropType,
            qty: parseFloat(qty),
            qtyUnit,
            pricePerUnit: parseFloat(pricePerUnit),
            harvestDate,
            quality,
            expiryDate,
            storageConditions: storageConditions.split(","),
            location,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Registered", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: userId,
          details: {
            pricePerUnit: parseFloat(pricePerUnit),
            storageConditions: storageConditions.split(","),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Updated", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const splitProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/splitProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          qty: parseFloat(splitQty),
          ownerId: userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Split", JSON.stringify(data.result, null, 2));
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
      Alert.alert("Moved", JSON.stringify(data.produce, null, 2));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Farmer Dashboard"
        navigation={navigation}
        role="Farmer"
      />
      <ScrollView>
        <View style={styles.actionGrid}>
          <ActionButton
            icon="plus"
            text="Register Produce"
            onPress={() => setActive("register")}
          />
          <ActionButton
            icon="update"
            text="Update Details"
            onPress={() => setActive("update")}
          />
          <ActionButton
            icon="call-split"
            text="Split Produce"
            onPress={() => setActive("split")}
          />
          <ActionButton
            icon="map-marker"
            text="Update Location"
            onPress={() => setActive("location")}
          />
        </View>

        {active === "register" && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Crop Type"
              value={cropType}
              onChangeText={setCropType}
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
              placeholder="Unit (KG/Number)"
              value={qtyUnit}
              onChangeText={setQtyUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="Price Per Unit"
              keyboardType="numeric"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="Harvest Date (YYYY-MM-DD)"
              value={harvestDate}
              onChangeText={setHarvestDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Quality"
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
            <LocationPicker value={location} onChange={setLocation} />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerProduce}
            >
              <Text style={styles.buttonText}>Submit Registration</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={styles.buttonText}>Update Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "split" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
            <TextInput
              style={styles.input}
              placeholder="Quantity to Split"
              keyboardType="numeric"
              value={splitQty}
              onChangeText={setSplitQty}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={splitProduce}
            >
              <Text style={styles.buttonText}>Split Produce</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
