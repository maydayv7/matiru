import { useState, forwardRef, useImperativeHandle } from "react";
import {
  Button,
  Image,
  View,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import { API_BASE } from "../config";
import { colors } from "../styles";

const ImageUploader = forwardRef(({ token }, ref) => {
  const [imageAsset, setImageAsset] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useImperativeHandle(ref, () => ({
    upload: async () => {
      if (!imageAsset) return null;
      setIsUploading(true);

      try {
        const imageUrl = await handleUpload();
        return imageUrl;
      } catch (error) {
        Alert.alert("Upload Failed", error.message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },

    reset: () => {
      setImageAsset(null);
      setIsUploading(false);
    },
  }));

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: "Images",
    });

    if (!result.canceled) setImageAsset(result.assets[0]);
  };

  const handleUpload = async () => {
    const data = new FormData();

    if (Platform.OS === "web") {
      const response = await fetch(imageAsset.uri);
      const blob = await response.blob();
      const fileName = imageAsset.fileName || `web-image-${Date.now()}.jpg`;
      data.append("image", blob, fileName);
    } else {
      data.append("image", {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || "image/jpeg",
        name:
          imageAsset.fileName ||
          imageAsset.uri.split("/").pop() ||
          `image-${Date.now()}.jpg`,
      });
    }

    const res = await fetch(`${API_BASE}/uploadImage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.error || "Image upload failed");
    return responseData.url;
  };

  const removeImage = () => {
    setImageAsset(null);
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {imageAsset && (
        <View>
          <Image
            source={{ uri: imageAsset.uri }}
            style={{
              width: "100%",
              height: 200,
              resizeMode: "contain",
              marginBottom: 10,
            }}
          />
          <Button
            title="Remove Image"
            color={colors.danger}
            onPress={removeImage}
          />
        </View>
      )}

      {isUploading ? (
        <View style={{ alignItems: "center", padding: 20 }}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text>Uploading...</Text>
        </View>
      ) : (
        !imageAsset && (
          <Button
            title="Pick Image"
            color={colors.darkGreen}
            onPress={pickImage}
          />
        )
      )}
    </View>
  );
});

export default ImageUploader;
