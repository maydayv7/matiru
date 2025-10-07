import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Scanner from "./Scanner";
import styles from "../styles";

export default function TransferOwnershipForm({ onSubmit }) {
  const [produceId, setProduceId] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [qty, setQty] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const handleSubmit = () => {
    onSubmit({
      produceId,
      newOwnerId,
      qty,
      salePrice,
      onComplete: () => {
        setProduceId("");
        setNewOwnerId("");
        setQty("");
        setSalePrice("");
      },
    });
  };

  return (
    <View>
      <Scanner value={produceId} onChange={setProduceId} />
      <TextInput
        style={styles.input}
        placeholder="New Owner ID"
        value={newOwnerId}
        onChangeText={setNewOwnerId}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        keyboardType="numeric"
        value={qty}
        onChangeText={setQty}
      />
      <TextInput
        style={styles.input}
        placeholder="Sale Price"
        keyboardType="numeric"
        value={salePrice}
        onChangeText={setSalePrice}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Transfer Ownership</Text>
      </TouchableOpacity>
    </View>
  );
}
