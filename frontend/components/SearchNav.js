import { View, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles";

export default function SearchNav() {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 12,
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.darkGreen,
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => navigation.navigate("Search")}
      >
        <MaterialCommunityIcons name="magnify" color="white" size={20} />
        <Text style={{ color: "white", marginLeft: 6 }}>Go to Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.midGreen,
          padding: 12,
          borderRadius: 8,
        }}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" color="white" size={20} />
        <Text style={{ color: "white", marginLeft: 6 }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}
