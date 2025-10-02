// screens/Home.js
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
    >
      <StatusBar
        translucent={false}
        backgroundColor={colors.darkGreen}
        barStyle="light-content"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.overlay}>
          <View style={styles.topContent}>
            <Text style={styles.welcome}>Welcome to Matiru!</Text>

            <TouchableOpacity
              style={[
                styles.bigButton,
                { backgroundColor: "#444", marginBottom: 30 },
              ]}
              onPress={() => navigation.navigate("Search")}
            >
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
              <Text style={styles.bigButtonText}>Global Search</Text>
            </TouchableOpacity>

            <Text style={styles.subtitle}> Continue As </Text>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Login", { role: "Farmer" })}
            >
              <MaterialCommunityIcons name="tractor" size={24} color="white" />
              <Text style={styles.bigButtonText}>Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() =>
                navigation.navigate("Login", { role: "Distributor" })
              }
            >
              <MaterialCommunityIcons name="truck" size={24} color="white" />
              <Text style={styles.bigButtonText}>Distributor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Login", { role: "Retailer" })}
            >
              <MaterialCommunityIcons name="store" size={24} color="white" />
              <Text style={styles.bigButtonText}>Retailer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() =>
                navigation.navigate("Login", { role: "Inspector" })
              }
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="white"
              />
              <Text style={styles.bigButtonText}>Inspector</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.brand}>Matiru.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
