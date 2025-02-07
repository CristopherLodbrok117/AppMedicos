import React, { useRef } from "react";
import { View, TextInput, Animated, StyleSheet, TouchableOpacity } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons"; // 
import Icon from "react-native-vector-icons/MaterialIcons";

const FloatingLabelInput = ({ label, iconName, value, onChangeText }) => {
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  const inputRef = useRef(); // No es necesario inicializar con null

  const handleLabelPress = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Evita error de undefined
    }
  };

  const handleFocus = () => {
    Animated.timing(labelPosition, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(labelPosition, {
        toValue: 0,
        duration: 120,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [10, -18], 
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13], 
      fontSize: 700,
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["gray", "#03826f"], 
    }),
  };

  return (
    <View style={styles.container}>
      <Icon name={iconName} style={styles.icon} />
      <Animated.Text onPress={handleLabelPress} style={[styles.label, labelStyle]}>{label}</Animated.Text>

      <TextInput
        ref={inputRef}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: "relative",
    marginTop: 35,
    // borderBottomWidth: 1,
    // borderBottomColor: "gray",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    // Styled
    height: 40,
    backgroundColor: '#fff',
    borderLeftWidth: 4, // Borde izquierdo
    borderLeftColor: '#20b2aa',
    
  },
  icon: {
    position: "absolute",
    color: "#20b2aa",
    fontSize: 20,
    left: 5,
    top: 10,
  },
  label: {
    position: "absolute",
    left: 35,
    userSelect: 'none',
    onFocus: 'none',
    fontFamily: 'sans-serif',
    
  },
  input: {
    flex: 1,
    width: '100%',
    height: 40,
    fontSize: 16,
    paddingLeft: 30, 
    borderWidth: 0,
    outlineStyle: "none", 
    fontFamily: 'sans-serif',
  },
});

export default FloatingLabelInput;
