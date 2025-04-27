import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarShowLabel: false, // Quita los textos
      tabBarActiveTintColor: '#102E50', // Color de íconos activos
      tabBarInactiveTintColor: '#fff', // Color de íconos inactivos
      headerTitleAlign: 'center',
      tabBarStyle: {
        backgroundColor: '#20b2aa', // Fondo de la barra
        borderTopWidth: 0,
        elevation: 10, // Sombra en Android
        shadowOpacity: 0.1, // Sombra en iOS
        
        paddingTop: 5,
        // height: 70,
        marginBottom: 10,
        marginHorizontal: 10,
        borderRadius: 20,
      },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="MedicalRecordScreen"
        options={{
          title: 'Evaluación General',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientEvaluationScreen"
        options={{
          title: 'Evaluación del paciente',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="pulse" color={color} />,
        }}
      />
      <Tabs.Screen
        name="FirstEvaluationScreen"
        options={{
          title: 'Evaluación Inicial',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="newspaper-sharp" color={color} />,
        }}
      />
      <Tabs.Screen
        name="PhysicalExplorationScreen"
        options={{
          title: 'Exploración Física',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="body" color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientConditionScreen"
        options={{
          title: 'Condición de Paciente',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="sad" color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientTransferScreen"
        options={{
          title: 'Traslado de paciente',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="bus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="DeployedResourcesScreen"
        options={{
          title: 'Recursos utilizados',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="document-text" color={color} />,
        }}
      />
    </Tabs>
  );
}