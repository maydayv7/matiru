import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScreenHeader from "../components/ScreenHeader";
import ProduceCard from "../components/ProduceCard";

import { AuthContext } from "../AuthContext";
import { api } from "../services/api";
import styles, { colors } from "../styles";

export default function InventoryScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const routeUserId = route.params?.userId || user?.id;
  const role = route.params?.role || user?.role;
  const [loading, setLoading] = useState(false);
  const [produces, setProduces] = useState([]);

  const CACHE_KEY = `@inventory_${routeUserId}`;

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        parsedData.sort(
          (a, b) => new Date(b.harvestDate) - new Date(a.harvestDate)
        );
        setProduces(parsedData);
      }
    } catch (e) {
      // Failed to load cache, not a critical error
    }

    try {
      let fetchedProduces;
      if (role.toUpperCase() === "INSPECTOR") {
        const userKey = `INSPECTOR-${routeUserId}`;
        const { user: userDetails } = await api.getUserDetails(userKey);
        const inspectedIds = userDetails.inspectedProduce || [];
        const producePromises = inspectedIds.map((pid) =>
          api.getProduceById(pid).catch(() => null)
        );
        const results = await Promise.all(producePromises);
        fetchedProduces = results
          .filter((res) => res && res.produce)
          .map((res) => res.produce);
      } else {
        const { produces: ownerProduces } =
          await api.getProduceByOwner(routeUserId);
        fetchedProduces = ownerProduces || [];
      }

      fetchedProduces.sort(
        (a, b) => new Date(b.harvestDate) - new Date(a.harvestDate)
      );

      setProduces(fetchedProduces);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetchedProduces));
    } catch (err) {
      if (!produces.length)
        Alert.alert("Error", `Failed to fetch inventory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="My Inventory"
        navigation={navigation}
        role={role}
        hideSearchButton={true}
        hideNotificationsButton={true}
        showBack={true}
      />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {loading && produces.length === 0 ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <ActivityIndicator size="large" />
            <Text>Loading Inventory...</Text>
          </View>
        ) : (
          <>
            {produces.length === 0 ? (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: colors.gray }}>No produce found</Text>
              </View>
            ) : (
              produces.map((p) => <ProduceCard key={p.id} produce={p} />)
            )}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loadInventory}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>
                {loading ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
