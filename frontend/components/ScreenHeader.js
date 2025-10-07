import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, { colors } from "../styles";

export default function ScreenHeader({
  title,
  navigation,
  role,
  showBack,
  hideSearchButton,
  hideNotificationsButton,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={colors.darkGreen}
            />
          </TouchableOpacity>
        )}
        {!hideNotificationsButton && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={{ marginLeft: showBack ? 16 : 0 }}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={28}
              color={colors.darkGreen}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { flex: 2, marginBottom: 0 }]}>{title}</Text>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {!hideSearchButton && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Search", { fromRole: role })}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={28}
              color={colors.darkGreen}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
