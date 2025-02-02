import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



const SideNavigationBar = () => {
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="person-outline" size={24} color="white" />
        {/* <AntDesign name="user" size={24} color="white" /> */}
        {/* <Text style={styles.navText}>Inicio</Text> */}
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PatientTransfer')}>
        <Ionicons name="pulse" style={styles.navIcon}  />
        {/* <Ionicons name="medkit-outline" size={24} color="white" /> */}
        {/* <FontAwesome6 name="heart-pulse" size={24} color="white" /> */}
        {/* <Text style={styles.navText}>Traslado</Text> */}
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="newspaper-sharp" style={styles.navIcon} />
        {/* <Text style={styles.navText}>Perfil</Text> */}
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="body" style={styles.navIcon}  />
        {/* <Text style={styles.navText}>Configuración</Text> */}
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="sad" style={styles.navIcon}  />
        {/* <Text style={styles.navText}>Configuración</Text> */}
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="bus" style={styles.navIcon}  />
        {/* <Text style={styles.navText}>Configuración</Text> */}
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="document-text" style={styles.navIcon}  />
        {/* <Text style={styles.navText}>Configuración</Text> */}
      </TouchableOpacity>
    </View>
  );
};

// const styles = StyleSheet.create({
//   sidebar: {
//     width: 90, // Ancho de la barra lateral
//     flexDirection: 'column', // Botones en columna
//     justifyContent: 'space-around', // Espaciado uniforme
//     alignItems: 'center',
//     justifyContent: 'space-evenly',
//     backgroundColor: '#20b2aa', // Verde azulado
//     paddingVertical: 20,
//     elevation: 3, // Sombra en Android
//     shadowColor: '#000', // Sombra en iOS
//     shadowOffset: { width: 2, height: 0 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   button: {
//     width: '80%',
//     paddingVertical: 10,
//     backgroundColor: '#fff2',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
// });

const styles = StyleSheet.create({
  sidebar: {
    width: 60,
    backgroundColor: '#20b2aa',
    paddingTop: 50,
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: {
    // flexDirection: 'row',
    alignItems: 'center',
    
    paddingVertical: 15,
    // paddingHorizontal: 20,
  },
  navIcon: {
    color: '#fff',
    fontSize: 24,
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default SideNavigationBar;
