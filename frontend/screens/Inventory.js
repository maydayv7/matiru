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
import ScreenHeader from "../components/ScreenHeader";
import ProduceCard from "../components/ProduceCard";
import { AuthContext } from "../AuthContext";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

export default function InventoryScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const routeUserId = route.params?.userId || user?.id;
  const role = route.params?.role || user?.role;
  const [loading, setLoading] = useState(false);
  const [produces, setProduces] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchUserDetails = async (userKey) => {
    try {
      const res = await fetch(`${API_BASE}/getUser/${userKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error fetching user");
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setProduces([]);

      if (role.toUpperCase() === "INSPECTOR") {
        const userKey = `INSPECTOR-${routeUserId}`;
        const userDetails = await fetchUserDetails(userKey);
        const inspected = userDetails.inspectedProduce || [];
        const items = [];
        for (const pid of inspected) {
          try {
            const resp = await fetch(`${API_BASE}/getProduce/${pid}`);
            const data = await resp.json();
            if (resp.ok && data.produce) items.push(data.produce);
          } catch (e) {
            // Ignore failure for single produce
          }
        }
        setProduces(items);
      } else {
        const res = await fetch(`${API_BASE}/getProduceByOwner/${routeUserId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error fetching inventory");
        setProduces(data.produces || []);
      }
    } catch (err) {
      Alert.alert("Error", err.message);
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
        showBack={true}
      />
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {loading ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <ActivityIndicator size="large" />
            <Text>Loading...</Text>
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
              onPress={fetchInventory}
            >
              <Text style={styles.secondaryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
