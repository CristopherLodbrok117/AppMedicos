import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Text, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const INJURIES = ["Fractura", "Esguince", "Luxación"]; // 🔹 Tipos de lesión

const CheckListV1 = ({items, selectedItems, setSelectedItems}) => {
  

  useEffect(() => {
    console.log("Tipo de lesión:", selectedItems);
  }, [selectedItems]);

  // ✅ Maneja el estado del checklist
  const toggleItem = (injury) => {
    setSelectedItems((prev) =>
      prev.includes(injury) ? prev.filter((item) => item !== injury) : [...prev, injury]
    );
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Checklist de lesiones */}
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.checklistItem} onPress={() => toggleItem(item)}>
            <Icon
              name={selectedItems.includes(item) ? "check-box" : "check-box-outline-blank"}
              size={24}
              color="black"
            />
            <Text style={styles.checklistText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  checklistText: {
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    position: "absolute",
  },
};

export default CheckListV1;
