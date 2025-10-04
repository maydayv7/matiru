import { useContext, useState, useRef } from "react";
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
import QRModal from "../components/QRModal";
import ImageUploader from "../components/ImageUploader";
import { API_BASE } from "../config";
import styles from "../styles";
import { AuthContext } from "../AuthContext";

export default function FarmerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;

  const [active, setActive] = useState(null);
  const imageUploaderRef = useRef(null);

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

  // QR Modal
  const [qrVisible, setQrVisible] = useState(false);
  const [lastProduceId, setLastProduceId] = useState(null);

  // Reset
  const resetRegisterForm = () => {
    setCropType("");
    setQty("");
    setQtyUnit("KG");
    setPricePerUnit("");
    setHarvestDate("");
    setQuality("");
    setExpiryDate("");
    setStorageConditions("");
    setLocation("");
    imageUploaderRef.current?.reset();
  };

  const resetCommon = () => {
    setProduceId("");
  };

  // Functions
  const registerProduce = async () => {
    try {
      const imageUrl = await imageUploaderRef.current?.upload();

      const res = await fetch(`${API_BASE}/registerProduce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId: userId,
          details: {
            imageUrl,
            cropType,
            qty: parseFloat(qty) || 0,
            qtyUnit,
            pricePerUnit: parseFloat(pricePerUnit) || 0,
            harvestDate,
            quality,
            expiryDate,
            storageConditions: storageConditions
              ? storageConditions.split(",")
              : [],
            location,
            farmerName: user?.username || "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      const produced = data.produce;
      setLastProduceId(produced.id);
      setQrVisible(true);

      Alert.alert("Registered", "Produce registered successfully");
      resetRegisterForm();
      resetCommon();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateDetails = async () => {
    if (!produceId) {
      Alert.alert("Error", "Please enter Produce ID");
      return;
    }

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
            pricePerUnit: parseFloat(pricePerUnit),
            storageConditions: storageConditions
              ? storageConditions.split(",")
              : [],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      Alert.alert("Updated", "Produce details updated");
      resetCommon();
      setPricePerUnit("");
      setStorageConditions("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const splitProduce = async () => {
    if (!produceId || !splitQty) {
      Alert.alert("Error", "Please enter Produce ID quantity to split");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/splitProduce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produceId,
          qty: parseFloat(splitQty),
          ownerId: userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      Alert.alert("Split", "Produce split successfully");
      setSplitQty("");
      resetCommon();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateLocation = async () => {
    if (!produceId || !location) {
      Alert.alert("Error", "Please enter Produce ID and pick a location");
      return;
    }

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

      Alert.alert("Moved", "Location updated successfully");
      resetCommon();
      setLocation("");
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
            <ImageUploader ref={imageUploaderRef} token={token} />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerProduce}
            >
              <Text style={styles.buttonText}>Register Produce</Text>
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

      <QRModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        value={lastProduceId || ""}
      />
    </SafeAreaView>
  );
}
