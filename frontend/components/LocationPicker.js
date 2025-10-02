import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import * as Location from "expo-location";
import { colors } from "../styles";

export default function LocationPicker({ onPicked }) {
  const [manual, setManual] = useState("");
  const [place, setPlace] = useState("");

  const pickGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permission denied", "Enable location services.");
      }
      const pos = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(pos.coords);
      if (geo.length > 0) {
        const name = `${geo[0].city || ""} ${geo[0].name || ""}`;
        setPlace(name);
        onPicked(name);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Button
        title="Use Current Location"
        color={colors.darkGreen}
        onPress={pickGPS}
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.darkGreen,
          borderRadius: 8,
          padding: 10,
          marginTop: 10,
          backgroundColor: "white",
        }}
        placeholder="Or enter place manually"
        value={manual}
        onChangeText={(t) => {
          setManual(t);
          onPicked(t);
        }}
      />
      {place ? <Text style={{ marginTop: 6 }}>📍 {place}</Text> : null}
    </View>
  );
}
