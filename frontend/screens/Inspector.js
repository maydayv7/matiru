import { useContext, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import ActionButton from "../components/ActionButton";
import Scanner from "../components/Scanner";
import DatePicker from "../components/DatePicker";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";
import { AuthContext } from "../AuthContext";

export default function InspectorScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const userId = route.params?.userId || user?.id;
  const token = user?.token;
  const [active, setActive] = useState(null);

  const [produceId, setProduceId] = useState("");
  const [quality, setQuality] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [markFailed, setMarkFailed] = useState(false);
  const [reason, setReason] = useState("");

  const resetCommon = () => {
    setProduceId("");
    setQuality("");
    setExpiryDate("");
    setMarkFailed(false);
    setReason("");
  };

  const inspectProduce = async () => {
    if (!produceId) {
      Alert.alert("Error", "Enter a Produce ID");
      return;
    }

    try {
      const body = {
        produceId,
        inspectorId: userId,
        qualityUpdate: {
          quality,
          expiryDate,
          failed: markFailed,
          reason: markFailed ? reason || "Failed Inspection" : undefined,
        },
      };

      const res = await fetch(`${API_BASE}/inspectProduce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      Alert.alert(
        markFailed ? "Marked as Failed" : "Inspection Recorded",
        markFailed
          ? "Produce marked as failed."
          : "Inspection data submitted successfully."
      );
      resetCommon();
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
              placeholder="Quality (e.g. A+, Good)"
              value={quality}
              onChangeText={setQuality}
            />
            <DatePicker
              label="Expiry Date"
              value={expiryDate}
              onChange={setExpiryDate}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ flex: 1, fontWeight: "600", color: colors.gray }}>
                Mark as Failed
              </Text>
              <Switch
                value={markFailed}
                onValueChange={setMarkFailed}
                thumbColor={markFailed ? colors.danger : colors.gray}
              />
            </View>
            {markFailed && (
              <TextInput
                style={styles.input}
                placeholder="Failure Reason"
                value={reason}
                onChangeText={setReason}
              />
            )}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                markFailed && { backgroundColor: colors.danger },
              ]}
              onPress={inspectProduce}
            >
              <Text style={styles.buttonText}>
                {markFailed ? "Mark as Failed" : "Submit Inspection"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 12 }}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("Inventory", {
              userId: userId,
              role: "Inspector",
            })
          }
        >
          <Text style={styles.secondaryButtonText}>View Inspected Produce</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
