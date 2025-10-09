import { useState, useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles, { colors } from "../styles";

export default function DatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  const handleChange = (event, selectedDate) => {
    setShow(false);
    if (event.type === "dismissed") return;

    if (selectedDate) {
      setSelected(selectedDate);
      const formatted = selectedDate.toISOString().split("T")[0];
      onChange(formatted);
    }
  };

  return (
    <View style={{ marginVertical: 8 }}>
      {label && (
        <Text
          style={{
            color: colors.gray,
            marginBottom: 4,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[
          styles.input,
          {
            justifyContent: "center",
            backgroundColor: "white",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: selected ? colors.gray : "#999",
          }}
        >
          {selected ? `${selected.toISOString().split("T")[0]}` : "Select Date"}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={selected || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          minimumDate={new Date()}
          accentColor={colors.darkGreen}
        />
      )}
    </View>
  );
}
