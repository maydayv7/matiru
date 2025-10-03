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
import { API_BASE } from "../config";
import styles from "../styles";
import { AuthContext } from "../AuthContext";

export default function InspectorScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;
  const [active, setActive] = useState(null);

  const [produceId, setProduceId] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const resetCommon = () => {
    setProduceId("");
  };

  const inspectProduce = async () => {
    try {
      const res = await fetch(`${API_BASE}/inspectProduce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produceId,
          inspectorId: userId,
          qualityUpdate: { quality, expiryDate },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      Alert.alert("Inspected", "Inspection recorded successfully");
      resetCommon();
      setQuality("");
      setExpiryDate("");
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
            icon="shield-check"
            text="Inspect Produce"
            onPress={() => setActive("inspect")}
          />
        </View>

        {active === "inspect" && (
          <View>
            <Scanner value={produceId} onChange={setProduceId} />
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
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={inspectProduce}
            >
              <Text style={styles.buttonText}>Submit Inspection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
