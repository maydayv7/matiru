import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { API_BASE } from "../config";
import styles from "../styles";

export default function DistributorScreen() {
  const [produceId, setProduceId] = useState("");
  const [location, setLocation] = useState("");

  const updateLocation = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateLocation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId,
          actorId: "distributor1",
          inTransit: false,
          newLocation: location,
        }),
      });
      const data = await res.json();
      alert("Updated: " + JSON.stringify(data.produce));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Distributor Dashboard</Text>
      <TextInput
        placeholder="Produce ID"
        value={produceId}
        onChangeText={setProduceId}
        style={styles.input}
      />
      <TextInput
        placeholder="New Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <Button title="Update Location" onPress={updateLocation} />
    </View>
  );
}
