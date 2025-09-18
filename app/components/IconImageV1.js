// app/components/IconImageV1.js
import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Si quieres conservar la opción de usarlos en otra parte, mantenemos el arreglo:
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

export default function IconImageV1({
  /** Si true, renderiza los puntos predefinidos. Por defecto: false (no mostrar). */
  presetPoints = false,
}) {
  // Este estado sólo se usa si decides mostrar los puntos predefinidos.
  const [activeButtons, setActiveButtons] = useState([]);

  const handlePress = (index) => {
    setActiveButtons((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    // Cuando no hay puntos predefinidos, no intercepta eventos táctiles
    <View style={[styles.container]} pointerEvents={presetPoints ? "auto" : "none"}>
      <Image source={require("../assets/body.png")} style={styles.image} />

      {presetPoints &&
        BUTTONS.map((btn, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { top: btn.top, left: btn.left }]}
            onPress={() => handlePress(index)}
          >
            <Icon
              name="adjust"
              size={5}
              color={activeButtons.includes(index) ? "white" : "grey"}
            />
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "contain",
    tintColor: "black",
  },
  button: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 5,
    borderRadius: 30,
  },
});
