import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import { api } from "../services/api";
import { AuthContext } from "../AuthContext";
import styles, { colors } from "../styles";

export default function NotificationsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications(user.token);
        setNotifications(data.notifications || []);
      } catch (err) {
        Alert.alert("Error", "Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user.token]);

  const renderItem = ({ item }) => (
    <View style={localStyles.card}>
      <MaterialCommunityIcons
        name={item.read ? "email-open-outline" : "email-outline"}
        size={24}
        color={colors.darkGreen}
        style={localStyles.icon}
      />
      <View style={localStyles.content}>
        <Text style={localStyles.title}>{item.title}</Text>
        <Text style={localStyles.message}>{item.message}</Text>
        <Text style={localStyles.date}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Notifications"
        navigation={navigation}
        showBack={true}
        hideSearchButton={true}
        hideNotificationsButton={true}
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.darkGreen}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={localStyles.emptyText}>No notifications</Text>
          }
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 16,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkGreen,
  },
  message: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: colors.gray,
  },
});
