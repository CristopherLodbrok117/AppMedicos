
// Repo: https://github.com/SimformSolutionsPvtLtd/react-native-infinite-wheel-picker?tab=readme-ov-file
import React from 'react';
import { StyleSheet, View, Text, TextInput} from 'react-native';
import { WheelPicker } from 'react-native-infinite-wheel-picker';


const MyWheelPicker = ({label, items}) => {

    const [selectedIndex, setSelectedIndex] = React.useState(3);


  
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <WheelPicker
          initialSelectedIndex={0}
          data={items}
          restElements={1}
          elementHeight={30}
          onChangeValue={(index, value) => {
            console.log(value);
            setSelectedIndex(index);
          }}
          infiniteScroll={false}
          selectedIndex={selectedIndex}
          containerStyle={styles.containerStyle}
          selectedLayoutStyle={styles.selectedLayoutStyle}
          elementTextStyle={styles.elementTextStyle}
          decelerationRate={10}
        />

      </View>
    );
};

export default MyWheelPicker;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      // backgroundColor: '#fff',
      alignItems: 'center',
      width: '60%',
      borderRadius: 15,
      marginBottom: 20, 
    },
    selectedLayoutStyle: {
      backgroundColor: '#00000000',
      color: '#03826f',
      borderRadius: 20,
      
      // borderBottomWidth: 2, // Borde superior
      // borderBottomColor: '#20b2aa',
      // borderTopWidth: 2, // Borde inferior
      // borderTopColor: '#20b2aa',

      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      // Shadow for Android
      elevation: 10,
    },
    containerStyle: { 
      backgroundColor: '#ffffffff', 
      borderRadius: 35,
      width: 105,
      height: 100,
      
      
  },
    elementTextStyle: { 
      fontSize: 18 
    },
    label: {
      width: '50%',
      fontSize: 16,
      color: '#03826f',
      // marginRight: 25,
      alignSelf: 'center',
    },
  });

