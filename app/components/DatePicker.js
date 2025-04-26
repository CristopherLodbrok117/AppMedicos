import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, SafeAreaView, Text, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";


const DatePicker = ({date, setDate, title, withTime}) => {
  const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };


  return (
    <SafeAreaView style={styles.dateArea}>
      <Text style={[styles.dateLabel, styles.title]}>{title}</Text>
      <Text style={styles.dateLabel}>Fecha: {date.toLocaleDateString(undefined, options)}</Text>
      { withTime ? <Text style={styles.dateLabel}>Hora: {date.toLocaleTimeString('en-US')}</Text> : <></>}
      {/* <Button onPress={showDatepicker} title="Cambiar fecha" /> */}
      <CustomButton
        title="Cambiar fecha"
        onPress={showDatepicker}
        fontSize={18}
        padding={9}
        icon="calendar-month" // Icon name from MaterialIcons
        iconColor="white"
        iconSize={24}
      />
      {withTime ?
        <CustomButton
          title="Cambiar hora"
          onPress={showTimepicker}
          fontSize={18}
          padding={9}
          icon="calendar-month" // Icon name from MaterialIcons
          iconColor="white"
          iconSize={24}
        />
        : <></>}

    </SafeAreaView>
  );
};

export default DatePicker;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    color: '#676767',
    alignSelf: 'center',
  },
  dateLabel: {
    fontSize: 16,
    color: '#03826f',
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 20,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  buttonDate: {
    width: 30,
    color: ''
  },
  dateArea: {
    maxWidth: '75%',
    // maxHeight: 250,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});