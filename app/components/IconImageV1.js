import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const BUTTONS = [
  { name: "Cabeza", top: 15, left: 250 },
  { name: "Ojos", top: 30, left: 233 },
  { name: "Cuello", top: 40, left: 248 },
  { name: "Hombro derecho", top: 50, left: 270 },
  { name: "Hombro izquierdo", top: 50, left: 215 },
  { name: "Creptación (C)", top: 60, left: 275 },
  { name: "Heridas (H)", top: 70, left: 245 },
  { name: "Fracturas (P)", top: 80, left: 210 },
  { name: "Efisema suticutaneo (ES)", top: 90, left: 280 },
  { name: "Quemaduras (Q)", top: 100, left: 200 },
  { name: "Laceraciones (L)", top: 110, left: 285 },
  { name: "Edema (E)", top: 120, left: 190 },
  { name: "Alteración de sensibilidad (AS)", top: 130, left: 295 },
  { name: "Alteración de movilidad (AM)", top: 140, left: 220 },
  { name: "Dolor (DO)", top: 150, left: 265 },
];


const IconImageV1 = () => {
  const [activeButtons, setActiveButtons] = useState([]); // Controla qué botones están activos
  const [selectedButtons, setSelectedButtons] = useState([]); // Almacena los nombres seleccionados

  useEffect(() => {
    console.log("Seleccionados:", selectedButtons);
  }, [selectedButtons]); // Se ejecuta cuando `selectedButtons` cambia

  const handlePress = (index, buttonName) => {
    setActiveButtons((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

    setSelectedButtons((prev) => {
      const newSelection = prev.includes(buttonName)
        ? prev.filter((name) => name !== buttonName)
        : [...prev, buttonName];

      return newSelection; // Retorna el nuevo estado correctamente
    });
  };

  return (
    <View style={styles.container}>
      {/* Imagen de fondo */}
      <Image source={require('../assets/body.png')} style={styles.image} />

      {BUTTONS.map((btn, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { top: btn.top, left: btn.left }]}
          onPress={() => handlePress(index, btn.name)}
        >
          <Icon
            name='adjust'//{btn.iconName}
            size={5}
            color={activeButtons.includes(index) ? "white" : "grey"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: 'contain',
    tintColor: 'black',
  },
  button: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 5,
    borderRadius: 30,
  },
  icon: {
    fontSize: 18,
    color: '#fff',
  },
  button1: { top: 50, left: 50 },
  button2: { top: 200, right: 50 },
  button3: { bottom: 100, left: 100 },
  button4: { bottom: 100, right: 50 },
});

export default IconImageV1;
