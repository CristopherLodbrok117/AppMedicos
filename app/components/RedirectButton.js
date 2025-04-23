// RedirectButton.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native"; // Changed import
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Link } from "expo-router";

const RedirectButton = ({ refName, iconName }) => {
  return (
    <View style={styles.container}>
      <Link href={`/${refName}`} asChild>
        <TouchableOpacity style={styles.button}>
          <Icon name={iconName} style={styles.icon} />
          <Text style={styles.text}>Firma</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#20b2aa', // Changed to match your theme
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  icon: {
    color: "#fff",
    fontSize: 24,
    marginRight: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RedirectButton;