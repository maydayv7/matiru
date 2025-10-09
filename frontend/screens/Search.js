import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import Scanner from "../components/Scanner";
import ProduceCard from "../components/ProduceCard";
import DetailRow from "../components/DetailRow";

import { api } from "../services/api";
import styles, { colors } from "../styles";

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("Produce");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [produceId, setProduceId] = useState("");
  const [userRole, setUserRole] = useState("FARMER");
  const [userId, setUserId] = useState("");

  const fetchResult = async () => {
    const isProduceSearch = tab === "Produce";
    const searchInput = isProduceSearch ? produceId : userId;
    if (!searchInput.trim())
      return Alert.alert("Invalid Input", "Please enter a valid ID to search");

    try {
      setLoading(true);
      setResult(null);
      let data;
      if (isProduceSearch) {
        data = await api.getProduceById(produceId.trim());
      } else {
        const userKey = `${userRole}-${userId.trim()}`;
        data = await api.getUserDetails(userKey);
      }
      setResult(data);
    } catch (err) {
      Alert.alert("Error", err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = (produce) => (
    <View>
      <Text style={local.subtitle}>Journey Timeline</Text>
      {produce.actionHistory
        ?.slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((a, idx) => (
          <View key={idx} style={local.timelineItem}>
            <MaterialCommunityIcons
              name={
                a.action === "REGISTER"
                  ? "sprout"
                  : a.action === "MOVE"
                    ? "truck-fast"
                    : a.action === "SALE"
                      ? "swap-horizontal-bold"
                      : a.action === "INSPECT"
                        ? "check-decagram"
                        : a.action === "SPLIT"
                          ? "call-split"
                          : a.action === "UPDATED"
                            ? "pencil"
                            : "close-circle"
              }
              size={24}
              color={
                a.action === "REMOVED"
                  ? colors.danger
                  : a.action === "SALE"
                    ? colors.midGreen
                    : colors.darkGreen
              }
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", textTransform: "capitalize" }}>
                {a.action.toLowerCase()}
              </Text>
              <Text style={local.small}>
                {a.action === "SALE" ? "To" : "By"}: {a.currentOwner}
              </Text>
              <Text style={local.small}>
                On: {new Date(a.timestamp).toLocaleString()}
              </Text>
              <Text style={local.small}>
                Location: {a.currentLocation || "N/A"}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );

  const renderUser = (user) => (
    <View style={local.card}>
      <View style={local.userHeader}>
        <View style={local.userAvatar}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color={colors.darkGreen}
          />
        </View>
        <View>
          <Text style={local.title}>{user.name || "Unnamed User"}</Text>
          <View style={local.roleBadge}>
            <Text style={local.roleText}>{user.role}</Text>
          </View>
        </View>
      </View>
      <Text style={local.subtitle}>User Details</Text>
      <DetailRow icon="identifier" label="User ID" value={user.id} />
      {user.location && (
        <DetailRow icon="map-marker" label="Location" value={user.location} />
      )}
      {user.walletId && (
        <DetailRow icon="wallet" label="Wallet ID" value={user.walletId} />
      )}
      {user.certification?.length > 0 && (
        <DetailRow
          icon="certificate"
          label="Certifications"
          value={user.certification.join(", ")}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title="Global Search"
          navigation={navigation}
          hideSearchButton={true}
          hideNotificationsButton={true}
          showBack={true}
        />
        <View style={local.searchContainer}>
          <Text style={local.searchDescription}>
            Search for information about any produce or user in the supply
            chain.
          </Text>
          <View style={local.tabContainer}>
            {["Produce", "User"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  local.tabButton,
                  {
                    backgroundColor:
                      tab === t ? colors.darkGreen : colors.lightGreen,
                  },
                ]}
                onPress={() => {
                  setTab(t);
                  setResult(null);
                  setProduceId("");
                  setUserId("");
                  setUserRole("FARMER");
                }}
              >
                <MaterialCommunityIcons
                  name={t === "Produce" ? "leaf" : "account-badge"}
                  size={20}
                  color={tab === t ? "white" : colors.darkGreen}
                />
                <Text
                  style={[
                    local.tabText,
                    { color: tab === t ? "white" : colors.darkGreen },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {tab === "Produce" ? (
            <Scanner value={produceId} onChange={setProduceId} />
          ) : (
            <View>
              <Text style={local.detailLabel}>1. Select Role</Text>
              <RNPickerSelect
                onValueChange={(value) => setUserRole(value)}
                items={[
                  { label: "Farmer", value: "FARMER" },
                  { label: "Distributor", value: "DISTRIBUTOR" },
                  { label: "Retailer", value: "RETAILER" },
                  { label: "Inspector", value: "INSPECTOR" },
                ]}
                style={pickerSelectStyles}
                value={userRole}
                useNativeAndroidPickerStyle={false}
                placeholder={{}}
              />
              <Text style={[local.detailLabel, { marginTop: 12 }]}>
                2. Enter User ID
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. farmer1, dist1"
                value={userId}
                onChangeText={setUserId}
              />
            </View>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={fetchResult}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.darkGreen}
            style={{ marginTop: 30 }}
          />
        )}
        {!loading && result && (
          <View style={{ marginTop: 16 }}>
            {tab === "Produce" && result.produce ? (
              <>
                <ProduceCard produce={result.produce} />
                {renderTimeline(result.produce)}
              </>
            ) : tab === "User" && result.user ? (
              renderUser(result.user)
            ) : (
              <View style={local.card}>
                <Text style={{ textAlign: "center", fontWeight: "500" }}>
                  No results found for the provided ID.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    margin: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  searchDescription: {
    marginBottom: 16,
    color: colors.gray,
    textAlign: "center",
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  tabText: { marginLeft: 6, fontWeight: "600" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.darkGreen,
  },
  subtitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    color: colors.darkGreen,
    paddingHorizontal: 12,
  },
  timelineItem: {
    flexDirection: "row",
    paddingVertical: 12,
    marginHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreen,
  },
  small: { fontSize: 13, color: "#555", marginTop: 2 },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreen,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  roleBadge: {
    backgroundColor: colors.midGreen,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleText: { color: "white", fontSize: 12, fontWeight: "bold" },
  detailLabel: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    ...styles.input,
    height: 48,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  inputAndroid: {
    ...styles.input,
    height: 48,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  iconContainer: {
    top: 18,
    right: 15,
  },
});
