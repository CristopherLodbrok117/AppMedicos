import React, { useRef, useEffect, useState } from "react";
import { View, TextInput, Animated, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

/**
 * FloatingLabelInput
 * - La etiqueta "flota" arriba cuando:
 *   a) el input está enfocado (focused === true), o
 *   b) hay un value no vacío (por ejemplo, cargado desde la BD).
 * - También evita que el placeholder se encime con el valor.
 */
const FloatingLabelInput = ({
  label,
  iconName,
  value = "",           // valor controlado; puede llegar vacío o cargado desde DB
  onChangeText,
  placeholder,
  containerBg = "#fff", // color de fondo para que el label no choque con el borde
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  // Animación de la posición/tamaño del label:
  // 0 = estado "reposo" (dentro del input), 1 = "flotando" (encima)
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Referencia para hacer foco al tocar la etiqueta
  const inputRef = useRef(null);

  // 🔑 Clave: cuando cambia `value` (por foco o por carga desde la BD),
  // actualizamos la animación para que la etiqueta suba/baje correctamente.
  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: focused || (value != null && String(value).length > 0) ? 1 : 0,
      duration: 120,
      useNativeDriver: false, // cambiamos top/fontSize -> requiere false
    }).start();
  }, [value, focused]);

  // Estilos animados de la etiqueta (posición y tamaño)
  const labelStyle = {
    top: labelPosition.interpolate({ inputRange: [0, 1], outputRange: [10, -12] }),
    fontSize: labelPosition.interpolate({ inputRange: [0, 1], outputRange: [16, 13] }),
    color: focused ? "#03826f" : "gray",
    backgroundColor: containerBg, // "tapamos" el borde debajo del label
    paddingHorizontal: 4,
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {/* Icono opcional al costado izquierdo */}
      {iconName ? <Icon name={iconName} style={styles.icon} /> : null}

      {/* Al tocar el label, pasamos el foco al input */}
      <Animated.Text
        onPress={() => inputRef.current && inputRef.current.focus()}
        style={[styles.label, labelStyle]}
      >
        {label}
      </Animated.Text>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // Para el texto encimado:
        // si hay valor y no hay foco, ocultamos placeholder si no, lo mostramos
        placeholder={focused || !value ? (placeholder || "") : ""}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    marginTop: 35,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    height: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#20b2aa",
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
    fontWeight: "700", // fontSize: 700 por error tipográfico)
    zIndex: 1,         // nos aseguramos que quede sobre el input
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 30,
    borderWidth: 0,
  },
});

export default FloatingLabelInput;
