import { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

export default function ConsumerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [produce, setProduce] = useState(null);
  const [manualId, setManualId] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const fetchProduce = async (id) => {
    if (!id) {
      Alert.alert("Error", "Produce ID cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getProduce/${id}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const result = await res.json();
      if (!result.produce) throw new Error("Produce not found");
      setProduce(result.produce);
    } catch (err) {
      Alert.alert("Error fetching produce", err.message);
      setProduce(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
    await fetchProduce(data);
  };

  if (hasPermission === null && useCamera)
    return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false && useCamera)
    return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consumer Dashboard</Text>

      <View style={{ marginBottom: 12 }}>
        <Button
          title={useCamera ? "Use Manual Entry" : "Scan QR Code"}
          color={colors.darkGreen}
          onPress={() => {
            setUseCamera(!useCamera);
            setScanned(false);
            setProduce(null);
          }}
        />
      </View>

      {useCamera ? (
        !scanned ? (
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1 }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            {/* Overlay */}
            <View style={cameraStyles.overlay}>
              <View style={cameraStyles.topBottomOverlay} />
              <View style={cameraStyles.middleRow}>
                <View style={cameraStyles.sideOverlay} />
                <View style={cameraStyles.scanArea} />
                <View style={cameraStyles.sideOverlay} />
              </View>
              <View style={cameraStyles.topBottomOverlay} />
            </View>
          </View>
        ) : (
          <Button
            title="Scan Again"
            color={colors.darkGreen}
            onPress={() => {
              setScanned(false);
              setProduce(null);
            }}
          />
        )
      ) : (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter Produce ID"
            value={manualId}
            onChangeText={setManualId}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.midGreen }]}
            onPress={() => fetchProduce(manualId)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Loading..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {produce && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: colors.darkGreen, fontSize: 16 }}>
            {JSON.stringify(produce, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const cameraStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  topBottomOverlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleRow: {
    flexDirection: "row",
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: colors.midGreen,
    borderRadius: 12,
  },
});
