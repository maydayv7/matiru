import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles";

export default function DetailRow({ icon, label, value }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={colors.darkGreen}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.gray }}>{label}</Text>
        <Text style={{ fontSize: 15, fontWeight: "600" }}>{value}</Text>
      </View>
    </View>
  );
}
