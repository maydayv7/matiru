import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/Login";
import FarmerScreen from "./screens/Farmer";
import DistributorScreen from "./screens/Distributor";
import RetailerScreen from "./screens/Retailer";
import InspectorScreen from "./screens/Inspector";
import ConsumerScreen from "./screens/Consumer";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelect"
        screenOptions={{
          headerStyle: { backgroundColor: "#2e7d32" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Farmer" component={FarmerScreen} />
        <Stack.Screen name="Distributor" component={DistributorScreen} />
        <Stack.Screen name="Retailer" component={RetailerScreen} />
        <Stack.Screen name="Inspector" component={InspectorScreen} />
        <Stack.Screen name="Consumer" component={ConsumerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
