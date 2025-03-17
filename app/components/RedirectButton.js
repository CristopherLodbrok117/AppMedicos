import React from "react";
import { View } from "react-native-web";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { Link } from "expo-router";


const RedirectButton = ( {refName, iconName, } ) => {
  return (
    <View style={styles.container}>
      <Link href={`/${refName}`} asChild style={styles.link}>
        <TouchableOpacity style={styles.button}>
          <Icon name={iconName} style={styles.icon} />
          <Text style={styles.text}>Firma</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

export default RedirectButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  
  link: {
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '90%',
  },
  button: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    backgroundColor: '#aab',
    paddingVertical: 5,
    // paddingHorizontal: 10,
    borderRadius: 5,
  },
  icon: {
    // position: "absolute",
    color: "#fff",
    fontSize: 24,

  },
  text: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    paddingLeft: 4,
    
  },
});