import { View, Text, Image, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles";
import DetailRow from "./DetailRow";

export default function ProduceCard({ produce }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const status = (produce.status || "").toLowerCase();
  const statusStyle = getStatusStyle(status);

  return (
    <View style={local.card}>
      <View style={local.header}>
        <Text style={local.refNoText}>Ref. ID </Text>
        <Text style={local.refNoId} numberOfLines={2} ellipsizeMode="middle">
          {produce.id}
        </Text>
      </View>

      <View style={local.splitRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={local.detailLabel}>Crop Type</Text>
          <Text style={local.title}>{produce.cropType || "N/A"}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={local.detailLabel}>Owner</Text>
          <Text style={local.title}>{produce.currentOwner}</Text>
        </View>
      </View>

      <View
        style={[
          local.mainContentRow,
          isSmallScreen && {
            flexDirection: "column",
            alignItems: "flex-start",
          },
        ]}
      >
        {produce.imageUrl ? (
          <Image
            source={{ uri: produce.imageUrl }}
            style={[
              local.produceImage,
              isSmallScreen && { width: "100%", height: 150, marginBottom: 12 },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              local.produceImage,
              local.imagePlaceholder,
              isSmallScreen && { width: "100%", height: 150, marginBottom: 12 },
            ]}
          >
            <MaterialCommunityIcons
              name="image-off-outline"
              size={40}
              color={colors.midGreen}
            />
          </View>
        )}

        <View
          style={[local.detailsContainer, isSmallScreen && { marginLeft: 0 }]}
        >
          <DetailRow
            icon="weight"
            label="Quantity"
            value={`${produce.qty} ${produce.qtyUnit}`}
          />
          <DetailRow
            icon="cash"
            label="Price"
            value={`₹${produce.pricePerUnit} / ${produce.qtyUnit}`}
          />
          <DetailRow
            icon="shield-star"
            label="Quality"
            value={produce.quality || "N/A"}
          />
          <DetailRow
            icon="thermometer"
            label="Storage Conditions"
            value={produce.storageConditions?.join(", ") || "N/A"}
          />
        </View>
      </View>

      <View style={local.splitRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <DetailRow
            icon="calendar-check"
            label="Harvest Date"
            value={
              produce.harvestDate
                ? new Date(produce.harvestDate).toLocaleDateString()
                : "N/A"
            }
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <DetailRow
            icon="calendar-alert"
            label="Expiry Date"
            value={
              produce.expiryDate
                ? new Date(produce.expiryDate).toLocaleDateString()
                : "N/A"
            }
          />
        </View>
      </View>

      <View style={local.badgesRow}>
        <View style={local.badgesLeft}>
          {produce.certification?.length > 0 ? (
            produce.certification.map((cert, idx) => (
              <View key={idx} style={local.certPill}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={colors.darkGreen}
                />
                <Text style={local.certText}>{cert} </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.gray, fontSize: 13, flexShrink: 1 }}>
              No certification
            </Text>
          )}
        </View>

        <View style={[local.statusContainer, statusStyle.container]}>
          <Text style={[local.statusText, statusStyle.text]}>
            {produce.status || "Unknown"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "harvested":
      return {
        container: { backgroundColor: "#e4f8e4" },
        text: { color: "#228b22" },
      };
    case "in transit":
      return {
        container: { backgroundColor: "#fff7d6" },
        text: { color: "#c28c00" },
      };
    case "retail":
      return {
        container: { backgroundColor: "#e2f0ff" },
        text: { color: "#005fb8" },
      };
    case "failed inspection":
    case "removed":
    case "missing":
      return {
        container: { backgroundColor: "#fde7e7" },
        text: { color: "#d22" },
      };
    case "sold":
      return {
        container: { backgroundColor: "#f3e6ff" },
        text: { color: "#7a3fc9" },
      };
    default:
      return {
        container: { backgroundColor: "#efefef" },
        text: { color: colors.gray },
      };
  }
}

const local = {
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  refNoText: { color: colors.gray, fontSize: 12, marginRight: 8 },
  refNoId: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  splitRow: { flexDirection: "row", marginTop: 8 },
  detailLabel: { fontSize: 12, color: colors.gray },
  title: { fontSize: 16, fontWeight: "700" },
  mainContentRow: { flexDirection: "row", marginTop: 12, alignItems: "center" },
  produceImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 30,
  },
  imagePlaceholder: {
    backgroundColor: "#f4f7f4",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContainer: { flex: 1 },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  badgesLeft: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: "60%",
  },
  certPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f0",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  certText: {
    marginLeft: 6,
    color: colors.gray,
    fontSize: 13,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },
};
