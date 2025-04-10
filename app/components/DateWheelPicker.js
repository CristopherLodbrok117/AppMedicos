import React from 'react';
import { StyleSheet, View, Text, TextInput} from 'react-native';
import { WheelPicker } from 'react-native-infinite-wheel-picker';
import TopLabelWheelPicker from './TopLabelWheelPicker';

const DateWheelPicker = ({title}) => {

    const days = Array.from({ length: 31 }, (_, index) => 1 + index);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'
        , 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const years = Array.from({ length: 2100 - 2020 + 1 }, (_, index) => 2020 + index);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.wheelContainer}>
          <TopLabelWheelPicker 
            label='Día'
            items={days}
          />

          <TopLabelWheelPicker 
            label='Mes'
            items={months}
          />

          <TopLabelWheelPicker 
            label='Año'
            items={years}
          />
        </View>
      </View>
    );

};

export default DateWheelPicker;

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: 'transparent',
    borderRadius: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  wheelContainer: {
    flexDirection: 'row',
  },
});