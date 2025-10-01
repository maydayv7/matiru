import { StyleSheet } from "react-native";

export const colors = {
  darkGreen: "#184B2C",
  midGreen: "#8FBF6F",
  cream: "#F3F7EE",
  lightGreen: "#DCEFCF",
  accent: "#BEE7A9",
};

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  headerBar: {
    height: 80,
    backgroundColor: colors.darkGreen,
    paddingTop: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  boxCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.midGreen,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGreen,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
