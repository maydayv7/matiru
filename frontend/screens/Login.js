import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles, { colors } from "../styles";

export default function LoginScreen({ navigation }) {
  const roles = ["Farmer", "Distributor", "Retailer", "Inspector", "Consumer"];

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Matiru.</Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../assets/logo.png")}
          style={{
            width: 180,
            height: 280,
            resizeMode: "cover",
            borderRadius: 12,
          }}
        />
        <View style={{ marginTop: 20, width: "90%", alignItems: "center" }}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.button, { backgroundColor: colors.midGreen }]}
              onPress={() =>
                navigation.replace("Dashboard", {
                  role: r,
                  id: `${r.toUpperCase()}-1`,
                })
              }
            >
              <Text style={styles.buttonText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
