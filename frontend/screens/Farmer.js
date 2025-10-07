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
import DatePicker from "../components/DatePicker";
import TransferOwnershipForm from "../components/TransferOwnershipForm";

import { api } from "../services/api";
import styles from "../styles";
import { AuthContext } from "../AuthContext";

export default function FarmerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;

  const [active, setActive] = useState(null);
  const imageUploaderRef = useRef(null);

  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [certification, setCertification] = useState("");

  const [cropType, setCropType] = useState("");
  const [qty, setQty] = useState("");
  const [qtyUnit, setQtyUnit] = useState("KG");
  const [harvestDate, setHarvestDate] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [splitQty, setSplitQty] = useState("");

  const [qrVisible, setQrVisible] = useState(false);
  const [lastProduceId, setLastProduceId] = useState(null);

  const resetRegisterForm = () => {
    setCropType("");
    setQty("");
    setQtyUnit("KG");
    setPricePerUnit("");
    setHarvestDate("");
    setQuality("");
    setExpiryDate("");
    setStorageConditions("");
    setCertification("");
    setLocation("");
    imageUploaderRef.current?.reset();
  };

  const resetCommon = () => {
    setProduceId("");
  };

  const registerProduce = async () => {
    try {
      const imageUrl = await imageUploaderRef.current?.upload();
      const { produce } = await api.registerProduce(
        {
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
              ? storageConditions.split(",").map((c) => c.trim())
              : [],
            certification: certification
              ? certification.split(",").map((c) => c.trim())
              : [],
            location,
          },
        },
        token
      );
      setLastProduceId(produce.id);
      setQrVisible(true);
      resetRegisterForm();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateDetails = async () => {
    if (!produceId) return Alert.alert("Error", "Please enter Produce ID");
    try {
      await api.updateDetails(
        {
          produceId,
          actorId: userId,
          details: {
            pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
            storageConditions: storageConditions
              ? storageConditions.split(",").map((c) => c.trim())
              : undefined,
            certification: certification
              ? certification.split(",").map((c) => c.trim())
              : undefined,
          },
        },
        token
      );
      Alert.alert("Updated", "Produce details updated successfully");
      resetCommon();
      setPricePerUnit("");
      setStorageConditions("");
      setCertification("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const splitProduce = async () => {
    if (!produceId || !splitQty)
      return Alert.alert("Error", "Please enter Produce ID and quantity");
    try {
      await api.splitProduce(
        {
          produceId,
          qty: parseFloat(splitQty),
          ownerId: userId,
        },
        token
      );
      Alert.alert("Split", "Produce split successfully");
      setSplitQty("");
      resetCommon();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateLocation = async () => {
    if (!produceId || !location)
      return Alert.alert("Error", "Please enter Produce ID and location");
    try {
      await api.updateLocation(
        {
          produceId,
          actorId: userId,
          newLocation: location,
        },
        token
      );
      Alert.alert("Moved", "Location updated successfully");
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
          salePrice: salePrice ? parseFloat(salePrice) : 0,
        },
        token
      );
      Alert.alert("Transferred", "Ownership transferred successfully");
      onComplete();
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
          <ActionButton
            icon="cash"
            text="Transfer Ownership"
            onPress={() => setActive("transfer")}
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
            <DatePicker
              label="Harvest Date"
              value={harvestDate}
              onChange={setHarvestDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Quality"
              value={quality}
              onChangeText={setQuality}
            />
            <DatePicker
              label="Expiry Date"
              value={expiryDate}
              onChange={setExpiryDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Storage Conditions (comma separated)"
              value={storageConditions}
              onChangeText={setStorageConditions}
            />
            <TextInput
              style={styles.input}
              placeholder="Certifications (comma separated)"
              value={certification}
              onChangeText={setCertification}
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
            <TextInput
              style={styles.input}
              placeholder="Certifications (comma separated)"
              value={certification}
              onChangeText={setCertification}
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

        {active === "transfer" && (
          <TransferOwnershipForm onSubmit={transferOwnership} />
        )}
      </ScrollView>

      <QRModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        value={lastProduceId || ""}
      />

      <View style={{ padding: 12 }}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("Inventory", { userId: userId, role: "Farmer" })
          }
        >
          <Text style={styles.secondaryButtonText}>View Inventory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
