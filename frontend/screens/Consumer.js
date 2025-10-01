import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { API_BASE } from "../config";
import styles from "../styles";

export default function ConsumerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [produce, setProduce] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
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
      <Text style={styles.title}>Consumer Dashboard</Text>
      {!scanned ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ flex: 1 }}
        />
      ) : (
        <>
          <Button
            title="Scan Again"
            color="#2e7d32"
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
