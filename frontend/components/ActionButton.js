import { TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles";

export default function ActionButton({ icon, text, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color="white" />
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  );
}
