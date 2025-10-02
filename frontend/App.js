import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthProvider } from "./AuthContext";

import HomeScreen from "./screens/Home";
import LoginScreen from "./screens/Login";
import FarmerScreen from "./screens/Farmer";
import DistributorScreen from "./screens/Distributor";
import RetailerScreen from "./screens/Retailer";
import InspectorScreen from "./screens/Inspector";
import SearchScreen from "./screens/Search";

const Stack = createStackNavigator();

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Farmer" component={FarmerScreen} />
        <Stack.Screen name="Distributor" component={DistributorScreen} />
        <Stack.Screen name="Retailer" component={RetailerScreen} />
        <Stack.Screen name="Inspector" component={InspectorScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
