import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { API_BASE } from "../config";
import styles from "../styles";

export default function RetailerScreen() {
  const [produceId, setProduceId] = useState("");

  const markSold = async () => {
    try {
      const res = await fetch(`${API_BASE}/transferOwnership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          newOwnerId: "consumer1",
          qty: 1,
          salePrice: 100,
        }),
      });
      const data = await res.json();
      alert("Sold: " + JSON.stringify(data.produce));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Retailer Dashboard</Text>
      <TextInput
        placeholder="Produce ID"
        value={produceId}
        onChangeText={setProduceId}
        style={styles.input}
      />
      <Button title="Mark as Sold to Consumer" onPress={markSold} />
    </View>
  );
}
