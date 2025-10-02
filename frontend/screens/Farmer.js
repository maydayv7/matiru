import { useState } from "react";
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

export default function FarmerScreen() {
  const [active, setActive] = useState(null);
  const farmerId = "farmer1";

  const [cropType, setCropType] = useState("");
  const [qty, setQty] = useState("");
  const [qtyUnit, setQtyUnit] = useState("KG");
  const [harvestDate, setHarvestDate] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [location, setLocation] = useState(null);

  const [produceId, setProduceId] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [storageUpdate, setStorageUpdate] = useState("");
  const [splitId, setSplitId] = useState("");
  const [splitQty, setSplitQty] = useState("");

  const registerProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/registerProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId,
          details: {
            cropType,
            qty,
            qtyUnit,
            harvestDate,
            quality,
            expiryDate,
            storageConditions,
            currentLocation: location || "Unknown",
          },
        }),
      });
      const data = await res.json();
      Alert.alert("Success", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const updateDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: farmerId,
          details: { pricePerUnit, storageConditions: storageUpdate },
        }),
      });
      const data = await res.json();
      Alert.alert("Updated", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const splitProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/splitProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId: splitId,
          qty: splitQty,
          OwnerId: farmerId,
        }),
      });
      const data = await res.json();
      Alert.alert("Split Done", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>👨‍🌾 Farmer Dashboard</Text>
        <SearchNav />

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("register")}
          >
            <MaterialCommunityIcons name="plus-box" size={20} color="white" />
            <Text style={styles.actionText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("update")}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="white" />
            <Text style={styles.actionText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActive("split")}
          >
            <MaterialCommunityIcons
              name="content-cut"
              size={20}
              color="white"
            />
            <Text style={styles.actionText}>Split</Text>
          </TouchableOpacity>
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
              placeholder="Harvest Date"
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
              placeholder="Expiry Date"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Storage Conditions"
              value={storageConditions}
              onChangeText={setStorageConditions}
            />
            <LocationPicker onPicked={setLocation} />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerProduce}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "update" && (
          <View>
            <QRScanner onScanned={setProduceId} placeholder="Produce ID" />
            <TextInput
              style={styles.input}
              placeholder="Price/Unit"
              keyboardType="numeric"
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="Storage Conditions"
              value={storageUpdate}
              onChangeText={setStorageUpdate}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={updateDetails}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        )}

        {active === "split" && (
          <View>
            <QRScanner onScanned={setSplitId} placeholder="Produce ID" />
            <TextInput
              style={styles.input}
              placeholder="Qty to Split"
              keyboardType="numeric"
              value={splitQty}
              onChangeText={setSplitQty}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={splitProduce}
            >
              <Text style={styles.buttonText}>Split</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
