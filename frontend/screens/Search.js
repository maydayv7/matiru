/*
  Produce → search by produceId → shows produce asset
  Owner → search by role id (e.g. "farmer1" or "retailer1") → lists all assets owned by entity
  User → search by user key (e.g. "FARMER-farmer1") → shows the user’s profile
*/

import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import Scanner from "../components/Scanner";
import { API_BASE } from "../config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";

const tabs = [
  { key: "produce", label: "Produce", icon: "leaf" },
  { key: "owner", label: "Owner", icon: "account" },
  { key: "user", label: "User", icon: "account-badge" },
];

export default function SearchScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("produce");
  const [produceId, setProduceId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [userKey, setUserKey] = useState("");
  const [result, setResult] = useState(null);

  const fetchResult = async (type, id) => {
    try {
      if (!id) {
        Alert.alert("Error", "Please enter an ID");
        return;
      }
      const url =
        type === "produce"
          ? `${API_BASE}/getProduce/${id}`
          : type === "owner"
            ? `${API_BASE}/getProduceByOwner/${id}`
            : `${API_BASE}/getUser/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Global Search"
        navigation={navigation}
        role="Search"
        showBack={true}
        hideSearchButton={true}
      />

      <Text
        style={{
          marginVertical: 12,
          color: colors.darkGreen,
          textAlign: "center",
        }}
      >
        To view information, select a tab and enter the ID
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 16,
        }}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor:
                activeTab === t.key ? colors.darkGreen : colors.lightGreen,
            }}
            onPress={() => {
              setActiveTab(t.key);
              setResult(null);
            }}
          >
            <MaterialCommunityIcons
              name={t.icon}
              size={20}
              color={activeTab === t.key ? "white" : colors.darkGreen}
            />
            <Text
              style={{
                color: activeTab === t.key ? "white" : colors.darkGreen,
                marginLeft: 6,
                fontWeight: "600",
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {activeTab === "produce" ? (
          <Scanner value={produceId} onChange={setProduceId} />
        ) : activeTab === "owner" ? (
          <TextInput
            style={styles.input}
            placeholder="Enter Owner ID"
            value={ownerId}
            onChangeText={setOwnerId}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Enter User Key"
            value={userKey}
            onChangeText={setUserKey}
          />
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            fetchResult(
              activeTab,
              activeTab === "produce"
                ? produceId
                : activeTab === "owner"
                  ? ownerId
                  : userKey
            )
          }
        >
          <Text style={styles.buttonText}>
            Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Text>
        </TouchableOpacity>

        {result && (
          <View
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            <Text style={styles.subtitle}>Search Results:</Text>
            <ScrollView horizontal>
              <Text style={{ fontSize: 12 }}>
                {JSON.stringify(result, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
