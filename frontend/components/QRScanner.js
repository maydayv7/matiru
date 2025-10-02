import { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { colors } from "../styles";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.72;

export default function Scanner({
  onScanned,
  placeholder = "Enter ID manually",
}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    onScanned(data);
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <Button
        title={useCamera ? "Use Manual Entry" : "Scan QR Code"}
        color={colors.darkGreen}
        onPress={() => {
          setUseCamera(!useCamera);
          setScanned(false);
          setManualId("");
        }}
      />

      {useCamera ? (
        <>
          {hasPermission === null && (
            <Text>Requesting camera permission...</Text>
          )}
          {hasPermission === false && <Text>No access to camera</Text>}
          {hasPermission && (
            <View style={{ height: 360, marginTop: 10 }}>
              <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              />

              {/* Overlay */}
              <View style={scannerStyles.overlay}>
                <View style={scannerStyles.topBottomOverlay} />
                <View style={scannerStyles.middleRow}>
                  <View style={scannerStyles.sideOverlay} />
                  <View style={scannerStyles.scanArea} />
                  <View style={scannerStyles.sideOverlay} />
                </View>
                <View style={scannerStyles.topBottomOverlay} />
              </View>

              {scanned && (
                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Scan again"
                    color={colors.midGreen}
                    onPress={() => setScanned(false)}
                  />
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={{ marginTop: 8 }}>
          <TextInput
            placeholder={placeholder}
            value={manualId}
            onChangeText={setManualId}
            style={{
              borderWidth: 1,
              borderColor: colors.cream,
              borderRadius: 10,
              padding: 10,
              backgroundColor: "#fff",
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.midGreen,
              padding: 12,
              borderRadius: 10,
              marginTop: 8,
              alignItems: "center",
            }}
            onPress={() => {
              if (!manualId) {
                Alert.alert("Error", "ID cannot be empty");
                return;
              }
              onScanned(manualId);
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const scannerStyles = StyleSheet.create({
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
  middleRow: { flexDirection: "row" },
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: colors.midGreen,
    borderRadius: 12,
  },
});
