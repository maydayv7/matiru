import { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import * as Location from "expo-location";
import { colors } from "../styles";

export default function LocationPicker({ value, onChange }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!value) setCoords(null);
  }, [value]);

  const pickLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location services");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCoords(
        `Lat ${loc.coords.latitude.toFixed(4)}, Lng ${loc.coords.longitude.toFixed(4)}`
      );

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const placeName = address
        ? `${address.name || ""} ${address.street || ""}, ${address.city || ""}, ${address.region || ""}, ${address.country || ""}`.trim()
        : "";

      onChange(
        placeName ||
          `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <Button
        title="Use Current Location"
        color={colors.darkGreen}
        onPress={pickLocation}
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.darkGreen,
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          backgroundColor: "white",
        }}
        placeholder="Enter Location Name"
        value={value}
        onChangeText={onChange}
      />
      {coords && (
        <Text style={{ marginTop: 6, color: colors.darkGreen }}>
          📍 {coords}
        </Text>
      )}
    </View>
  );
}
