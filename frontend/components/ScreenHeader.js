import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";

export default function ScreenHeader({
  title,
  navigation,
  role,
  showBack,
  hideSearchButton,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={colors.darkGreen}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 28 }} />
      )}

      <Text style={styles.title}>{title}</Text>

      {!hideSearchButton ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("Search", { fromRole: role })}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={28}
            color={colors.darkGreen}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 28 }} />
      )}
    </View>
  );
}
