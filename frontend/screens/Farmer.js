import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { API_BASE } from "../config";
import styles from "../styles";

export default function FarmerScreen() {
  const [cropType, setCropType] = useState("");
  const [qty, setQty] = useState("");
  const [produceId, setProduceId] = useState("");

  const registerProduce = async () => {
    const res = await fetch(`${API_BASE}/registerProduce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerId: "farmer1",
        details: { cropType, qty: parseInt(qty), pricePerUnit: 30 },
      }),
    });
    const data = await res.json();
    alert("Registered: " + JSON.stringify(data.produce));
  };

  const updateDetails = async () => {
    const res = await fetch(`${API_BASE}/updateDetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produceId,
        actorId: "farmer1",
        details: { storageConditions: "Cold", pricePerUnit: 35 },
      }),
    });
    alert(await res.text());
  };

  const splitProduce = async () => {
    const res = await fetch(`${API_BASE}/splitProduce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produceId, qty: 50, OwnerId: "farmer1" }),
    });
    alert(await res.text());
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Farmer Dashboard</Text>
      <TextInput
        style={styles.input}
        placeholder="Crop Type"
        value={cropType}
        onChangeText={setCropType}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={qty}
        onChangeText={setQty}
        keyboardType="numeric"
      />
      <Button title="Register Produce" onPress={registerProduce} />

      <TextInput
        style={styles.input}
        placeholder="Produce ID"
        value={produceId}
        onChangeText={setProduceId}
      />
      <Button title="Update Details" onPress={updateDetails} />
      <Button title="Split Produce" onPress={splitProduce} />
    </ScrollView>
  );
}
