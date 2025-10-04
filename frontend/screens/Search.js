import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import Scanner from "../components/Scanner";
import { API_BASE } from "../config";
import styles, { colors } from "../styles";

const DetailRow = ({ icon, label, value }) => (
  <View style={local.detailItem}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={colors.darkGreen}
      style={{ marginRight: 12 }}
    />
    <View style={{ flex: 1 }}>
      <Text style={local.detailLabel}>{label}</Text>
      <Text style={local.detailValue}>{value}</Text>
    </View>
  </View>
);

export default function SearchScreen({ navigation }) {
  const [tab, setTab] = useState("Produce");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [produceId, setProduceId] = useState("");
  const [userRole, setUserRole] = useState("FARMER");
  const [userId, setUserId] = useState("");

  const fetchResult = async () => {
    const isProduceSearch = tab === "Produce";
    const searchInput = isProduceSearch ? produceId : userId;
    if (!searchInput.trim()) {
      return Alert.alert("Invalid Input", "Please enter a valid ID to search.");
    }

    try {
      setLoading(true);
      setResult(null);

      let url = "";
      if (isProduceSearch) {
        url = `${API_BASE}/getProduce/${produceId.trim()}`;
      } else {
        const userKey = `${userRole}-${userId.trim()}`;
        url = `${API_BASE}/getUser/${userKey}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || `Server returned status ${res.status}`);
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
      {produce.actionHistory?.map((a, idx) => (
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
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "600", textTransform: "capitalize" }}>
              {a.action.toLowerCase()}
            </Text>
            <Text style={local.small}>
              Location: {a.currentLocation || "N/A"}
            </Text>
            <Text style={local.small}>
              {a.action === "INSPECT" ? "Inspected by" : "Actor"}:{" "}
              {a.currentOwner}
            </Text>
            <Text style={local.small}>
              {new Date(a.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderProduce = (produce) => (
    <View style={local.card}>
      <View style={local.header}>
        <Text style={local.refNoText}>Ref. No.</Text>
        <Text style={local.refNoId}>{produce.id}</Text>
      </View>
      <View style={local.splitRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={local.detailLabel}>Name</Text>
          <Text style={local.title}>{produce.cropType}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={local.detailLabel}>Type / Quality</Text>
          <Text style={local.title}>{produce.quality || "N/A"}</Text>
        </View>
      </View>
      <View style={local.mainContentRow}>
        {produce.imageUrl ? (
          <Image
            source={{ uri: produce.imageUrl }}
            style={local.produceImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[local.produceImage, local.imagePlaceholder]}>
            <MaterialCommunityIcons
              name="image-off"
              size={40}
              color={colors.midGreen}
            />
          </View>
        )}
        <View style={local.detailsContainer}>
          <DetailRow
            icon="weight-kilogram"
            label="Quantity"
            value={`${produce.qty} ${produce.qtyUnit}`}
          />
          <DetailRow
            icon="cash"
            label="Price"
            value={`$${produce.pricePerUnit} / ${produce.qtyUnit}`}
          />
          <DetailRow
            icon="account-circle-outline"
            label="Current Owner"
            value={produce.currentOwner}
          />
        </View>
      </View>
      <View style={local.splitRow}>
        <DetailRow
          icon="calendar-arrow-left"
          label="Date of Harvest"
          value={new Date(produce.harvestDate).toLocaleDateString()}
        />
        <DetailRow
          icon="calendar-arrow-right"
          label="Date of Expiry"
          value={new Date(produce.expiryDate).toLocaleDateString()}
        />
      </View>
      <View style={local.badgesRow}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {produce.certification?.length > 0 ? (
            produce.certification.map((cert, idx) => (
              <View key={idx} style={local.certContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color={colors.darkGreen}
                />
                <Text style={local.certText}>{cert}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#666" }}>No certifications</Text>
          )}
        </View>
        <View style={local.statusContainer}>
          <Text style={local.statusText}>{produce.status}</Text>
        </View>
      </View>
      {renderTimeline(produce)}
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
      {user.certification && (
        <DetailRow
          icon="certificate"
          label="Certifications"
          value={user.certification.join(", ")}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Global Search"
        navigation={navigation}
        hideSearchButton={true}
        showBack={true}
      />

      <View style={local.searchContainer}>
        <Text
          style={{
            marginBottom: 12,
            color: colors.darkGreen,
            textAlign: "center",
          }}
        >
          Search for information about any produce or user in the supply chain
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
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
            <Text style={[local.detailLabel, { marginTop: 20 }]}>
              1. Select Role
            </Text>
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
            <Text
              style={[local.detailLabel, { marginTop: 20, marginBottom: 6 }]}
            >
              2. Enter User ID
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. farmer1, distributor_xyz"
              value={userId}
              onChangeText={setUserId}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 20 }]}
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 4 }}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.darkGreen}
            style={{ marginTop: 30 }}
          />
        )}

        {!loading &&
          result &&
          (tab === "Produce" && result.produce ? (
            renderProduce(result.produce)
          ) : tab === "User" && result.user ? (
            renderUser(result.user)
          ) : (
            <View style={local.card}>
              <Text style={{ textAlign: "center", fontWeight: "500" }}>
                No results found for the provided ID.
              </Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
  tabText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreen,
    paddingBottom: 8,
    marginBottom: 12,
  },
  refNoText: {
    color: "#999",
    fontSize: 12,
  },
  refNoId: {
    color: colors.darkGreen,
    fontSize: 14,
    fontWeight: "500",
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  mainContentRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  produceImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lightGreen,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    height: "100%",
    justifyContent: "space-around",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  detailLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.darkGreen,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGreen,
  },
  certContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  certText: {
    color: colors.darkGreen,
    fontWeight: "600",
    marginLeft: 6,
  },
  statusContainer: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statusText: {
    color: colors.darkGreen,
    fontWeight: "bold",
    fontSize: 14,
  },
  subtitle: {
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    color: colors.darkGreen,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingLeft: 4,
  },
  small: { fontSize: 12, color: "#555" },
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
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
