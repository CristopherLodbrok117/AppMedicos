import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import SideNavigationBar from "./components/SideNavigationBar";

export default function Layout() {
  return (
    <View style={styles.container}>
      <SideNavigationBar />
      <View style={styles.content}>
        <Stack />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
