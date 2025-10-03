import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { colors } from "../styles";

export default function QRModal({ visible, onClose, value }) {
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert("Copied", "Produce ID copied to clipboard");
    } catch (e) {
      Alert.alert("Error", "Failed to copy");
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Produce Registered</Text>
          <Text style={styles.subtitle}>Scan to view provenance</Text>
          <View style={styles.qrWrap}>
            <QRCode value={value} size={180} />
          </View>

          <Text style={styles.idText}>{value}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
              <Text style={styles.buttonText}>Copy ID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.close]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "86%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.darkGreen },
  subtitle: { marginTop: 6, color: colors.midGreen, marginBottom: 12 },
  qrWrap: { padding: 12, backgroundColor: colors.cream, borderRadius: 8 },
  idText: { marginTop: 12, color: colors.darkGreen, fontWeight: "600" },
  row: { flexDirection: "row", marginTop: 14 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.darkGreen,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  close: { backgroundColor: colors.midGreen },
  buttonText: { color: "white", fontWeight: "600" },
});
