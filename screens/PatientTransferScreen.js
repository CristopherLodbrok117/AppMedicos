import React from 'react';
import { StyleSheet, Text, TextInput, View, Image, ScrollView, Pressable } from 'react-native';
import SideNavigationBar from '../components/SideNavigationBar';
import icon from '../assets/favicon.png';

const PatientTransferScreen = () => {
  return (
    <View style={styles.container}>
      {/* Barra de navegación izquierda */}
      <SideNavigationBar />

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Título */}
        <Text style={styles.title}>Traslado de paciente</Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>Expediente médico</Text>

        {/* Imagen */}
        <Image
          style={styles.image}
          source={icon}
        />

        {/* Disclaimer */}
        <View style={styles.loremContainer}>
          <Text style={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
          </Text>
        </View>

        {/* Información del paciente */}
        <Text style={styles.sectionSubtitle}>Información del paciente</Text>
        <TextInput style={styles.input} placeholder="Nombre del paciente" />
        <TextInput style={styles.input} placeholder="Nombre del testigo" />
        <TextInput style={styles.input} placeholder="Observaciones" />

        {/* Sección de dependencias */}
        <Text style={styles.sectionSubtitle}>Dependencias que atendieron al paciente</Text>
        <TextInput style={styles.input} placeholder="Dependencias" />
        <TextInput style={styles.input} placeholder="Número de unidades" />
        <TextInput style={styles.input} placeholder="Nombre del encargado y/o oficiales" />
        <TextInput style={styles.input} placeholder="Pertenencias" />
        <TextInput style={styles.input} placeholder="Nombre de quien recibe las pertenencias" />

        {/* Entrega */}
        <Text style={styles.sectionSubtitle}>Entrega a paciente</Text>
        <TextInput style={styles.input} placeholder="Paramédico" />

        {/* Medico */}
        <Text style={styles.sectionSubtitle}>Médico que recibe</Text>
        <TextInput style={styles.input} placeholder="Nombre completo" />

        {/* Finalizar */}
        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
};

export default PatientTransferScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Alinea barra lateral y contenido principal en fila
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 20,
    alignSelf: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  loremContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#ddda',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 10,
    marginBottom: 20,
  },
  loremText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'justify',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderLeftWidth: 4, // Borde izquierdo
    borderLeftColor: '#20b2aa', // Color verde azulado
    borderTopWidth: 0, // Sin borde superior
    borderRightWidth: 0, // Sin borde derecho
    borderBottomWidth: 0, // Sin borde inferior
    borderRadius: 0, // Sin esquinas redondeadas
    paddingHorizontal: 10,
    marginTop: 10,
  },
  saveButton: {
    // backgroundColor: '12a4d9',
    // width: 100,
    // height: 60,
    // borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#20b2aa', // Verde azulado
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,

  },
  saveButtonText:{
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
