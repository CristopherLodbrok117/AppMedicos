import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Animated } from 'react-native';

const CustomWheelPicker = ({ label, items}) => {
  const [selected, setSelected] = useState(selectedIndex || 0);
  // const initialData = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedIndex, setSelectedIndex] = React.useState(3);
  
  const ITEM_HEIGHT = 40;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
      <WheelPicker
          initialSelectedIndex={3}
          data={items}
          restElements={2}
          elementHeight={30}
          onChangeValue={(index, value) => {
            console.log(value);
            setSelectedIndex(index);
          }}
          selectedIndex={selectedIndex}
          containerStyle={styles.containerStyle}
          selectedLayoutStyle={styles.selectedLayoutStyle}
          elementTextStyle={styles.elementTextStyle}
        />
      </View>
      {/* <TextInput
        style={styles.input}
        value={selected}
        editable={false}
      /> */}
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     width: 100,
//   },
//   pickerContainer: {
//     height: 120,
//     width: 120,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   itemContainer: {
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   item: {
//     fontSize: 18,
//     color: '#666',
//   },
//   selectedItem: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   input: {
//     width: 100,
//     height: 40,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 5,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

export default CustomWheelPicker;



// Original
// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import { WheelPicker } from 'react-native-infinite-wheel-picker';


// const CustomWheelPicker = () => {
//     const initialData = [1, 2, 3, 4, 5, 6, 7, 8];
//     const [selectedIndex, setSelectedIndex] = React.useState(3);
  
//     return (
//       <View style={styles.container}>
//         <WheelPicker
//           initialSelectedIndex={3}
//           data={initialData}
//           restElements={2}
//           elementHeight={30}
//           onChangeValue={(index, value) => {
//             console.log(value);
//             setSelectedIndex(index);
//           }}
//           selectedIndex={selectedIndex}
//           containerStyle={styles.containerStyle}
//           selectedLayoutStyle={styles.selectedLayoutStyle}
//           elementTextStyle={styles.elementTextStyle}
//         />
//       </View>
//     );
// };

// export default CustomWheelPicker;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    selectedLayoutStyle: {
      backgroundColor: '#00000026',
      borderRadius: 2,
    },
    containerStyle: { 
      backgroundColor: '#0000001a', 
      width: 150,
      height: 190,
    },
    elementTextStyle: { 
      fontSize: 18 
    },
  });

