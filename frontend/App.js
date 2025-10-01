import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/Login";
import ConsumerScreen from "./screens/Consumer";
import DistributorScreen from "./screens/Distributor";
import FarmerScreen from "./screens/Farmer";
import InspectorScreen from "./screens/Inspector";
import RetailerScreen from "./screens/Retailer";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
