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

export default function RetailerScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;
  const [active, setActive] = useState(null);

  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [storageConditions, setStorageConditions] = useState("");

  const [newOwnerId, setNewOwnerId] = useState("");
  const [qty, setQty] = useState("");
  const [salePrice, setSalePrice] = useState("");

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
      Alert.alert("Transferred", "Sale / Transfer successful");
      resetCommon();
      setNewOwnerId("");
      setQty("");
      setSalePrice("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateDetails = async () => {
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
              ? storageConditions.split(",").map((c) => c.trim())
              : [],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Updated Details", "Produce details updated");
      resetCommon();
      setPricePerUnit("");
      setStorageConditions("");
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
              <Text style={styles.buttonText}>Confirm Sale</Text>
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
