import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import styles, { colors } from "../styles";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

export default function Scanner({ value, onChange }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleScanned = ({ data }) => {
    if (!data) {
      Alert.alert("Scan Failed", "No data found in QR code");
      return;
    }

    setScanned(true);
    onChange(data);
    setUseCamera(false);
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <Button
        title={useCamera ? "Use Manual Entry" : "Scan QR Code"}
        color={colors.darkGreen}
        onPress={() => {
          setUseCamera(!useCamera);
          setScanned(false);
        }}
      />
      {useCamera ? (
        !scanned ? (
          <View style={{ height: SCAN_AREA_SIZE * 1.4, marginTop: 10 }}>
            <CameraView
              style={{ flex: 1 }}
              onBarcodeScanned={scanned ? undefined : handleScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
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
        ) : null
      ) : (
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Enter Produce ID"
          value={value}
          onChangeText={onChange}
        />
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
  },
});
