import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { API_BASE } from "../config";
import styles from "../styles";

export default function InspectorScreen() {
  const [produceId, setProduceId] = useState("");
  const [quality, setQuality] = useState("");

  const inspect = async () => {
    try {
      const res = await fetch(`${API_BASE}/inspectProduce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          inspectorId: "inspector1",
          qualityUpdate: quality,
        }),
      });
      const data = await res.json();
      alert("Inspected: " + JSON.stringify(data.produce));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Inspector Dashboard</Text>
      <TextInput
        placeholder="Produce ID"
        value={produceId}
        onChangeText={setProduceId}
        style={styles.input}
      />
      <TextInput
        placeholder="Quality"
        value={quality}
        onChangeText={setQuality}
        style={styles.input}
      />
      <Button title="Inspect Produce" onPress={inspect} />
    </View>
  );
}
