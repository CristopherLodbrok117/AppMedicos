import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
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
        alignSelf: 'center',
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
        width: '100%',
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#28a745', // Verde azulado
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