import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "./styles";

import FarmerScreen from "./screens/Farmer";
import DistributorScreen from "./screens/Distributor";
import RetailerScreen from "./screens/Retailer";
import InspectorScreen from "./screens/Inspector";
import SearchScreen from "./screens/Search";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("./assets/background.png")}
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

            <Text style={styles.subtitle}>Continue As</Text>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Farmer")}
            >
              <MaterialCommunityIcons name="tractor" size={24} color="white" />
              <Text style={styles.bigButtonText}>Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Distributor")}
            >
              <MaterialCommunityIcons name="truck" size={24} color="white" />
              <Text style={styles.bigButtonText}>Distributor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Retailer")}
            >
              <MaterialCommunityIcons name="store" size={24} color="white" />
              <Text style={styles.bigButtonText}>Retailer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("Inspector")}
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Farmer" component={FarmerScreen} />
        <Stack.Screen name="Distributor" component={DistributorScreen} />
        <Stack.Screen name="Retailer" component={RetailerScreen} />
        <Stack.Screen name="Inspector" component={InspectorScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
