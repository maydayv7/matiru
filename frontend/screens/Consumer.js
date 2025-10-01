import { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

export default function ConsumerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [produce, setProduce] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const res = await fetch(`${API_BASE}/getProduce/${data}`);
      const result = await res.json();
      setProduce(result.produce);
    } catch (err) {
      alert("Error fetching produce: " + err.message);
    }
  };

  if (hasPermission === null)
    return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {!scanned ? (
        <CameraView
          style={{ flex: 1, width: "100%" }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      ) : (
        <>
          <Button
            title="Scan Again"
            color={colors.midGreen}
            onPress={() => {
              setScanned(false);
              setProduce(null);
            }}
          />
          {produce && <Text>{JSON.stringify(produce, null, 2)}</Text>}
        </>
      )}
    </View>
  );
}
