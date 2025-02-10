import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
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
  label: {
    fontSize: 16,
    color: '#03826f',
    marginTop: 20,
    marginBottom: 5,
    alignSelf: 'flex-start',
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
    borderLeftWidth: 4,
    borderLeftColor: '#20b2aa',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  saveButton: {
    width: '100%',
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default globalStyles;
