// app/components/IconImageV1.js
import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// 🔹 exportamos el asset para poder leer su aspect ratio desde la screen
export const BODY_IMAGE = require("../assets/body.png");

// Base en la que definiste los puntos (tu contenedor anterior era 500x450)
const BASE_W = 500;
const BASE_H = 450;

// Puntos "predefinidos" (quedan tal cual los tenías)
const BUTTONS = [
  { name: "Cabeza", top: 15,  left: 250 },
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

export default function IconImageV1({
  /** Si true, muestra los puntos predefinidos */
  presetPoints = false,
}) {
  const [activeButtons, setActiveButtons] = useState([]);
  const [size, setSize] = useState({ w: 0, h: 0 }); // tamaño real del contenedor

  const handlePress = (index) => {
    setActiveButtons((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <View
      style={styles.container}
      pointerEvents={presetPoints ? "auto" : "none"}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: width, h: height });
      }}
    >
      <Image source={BODY_IMAGE} style={styles.image} resizeMode="contain" />

      {presetPoints &&
        BUTTONS.map((btn, index) => {
          // Escala las posiciones a partir de la base 500x450
          const left = (btn.left / BASE_W) * size.w;
          const top  = (btn.top  / BASE_H) * size.h;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.button, { top, left }]}
              onPress={() => handlePress(index)}
            >
              <Icon
                name="adjust"
                size={5}
                color={activeButtons.includes(index) ? "white" : "grey"}
              />
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    // quité tintColor para no teñir la imagen; si lo necesitas, vuelve a ponerlo
    // tintColor: "black",
  },
  button: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 5,
    borderRadius: 30,
  },
});
