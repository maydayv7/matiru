import { useContext, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScreenHeader from "../components/ScreenHeader";
import ProduceCard from "../components/ProduceCard";

import { AuthContext } from "../AuthContext";
import { api } from "../services/api";
import styles, { colors } from "../styles";

const sortByLastAction = (a, b) => {
  const getLatestTimestamp = (produce) => {
    if (produce.actionHistory && produce.actionHistory.length > 0)
      return produce.actionHistory[produce.actionHistory.length - 1].timestamp;
    return produce.harvestDate;
  };

  const timeA = getLatestTimestamp(a);
  const timeB = getLatestTimestamp(b);

  return new Date(timeB) - new Date(timeA);
};

export default function InventoryScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const routeUserId = route.params?.userId || user?.id;
  const role = route.params?.role || user?.role;
  const [loading, setLoading] = useState(false);
  const [produces, setProduces] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const CACHE_KEY = `@inventory_${routeUserId}`;

  const loadInventory = useCallback(
    async (isRefreshing = false) => {
      if (!isRefreshing) setLoading(true);

      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData && !isRefreshing) {
          const parsedData = JSON.parse(cachedData);
          parsedData.sort(sortByLastAction);
          setProduces(parsedData);
        }
      } catch (e) {
        console.error("Failed to load cache:", e);
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

        fetchedProduces.sort(sortByLastAction);
        setProduces(fetchedProduces);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fetchedProduces));
      } catch (err) {
        if (!produces.length) Alert.alert("Error", "Failed to fetch inventory");
      } finally {
        if (!isRefreshing) setLoading(false);
      }
    },
    [role, routeUserId, produces.length]
  );

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventory(true);
    setRefreshing(false);
  }, [loadInventory]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={route.params?.title || "My Inventory"}
        navigation={navigation}
        role={role}
        hideSearchButton={true}
        hideNotificationsButton={true}
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={{ padding: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
