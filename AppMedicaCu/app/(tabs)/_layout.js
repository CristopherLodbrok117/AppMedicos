// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#102E50',
        tabBarInactiveTintColor: '#fff',
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: '#20b2aa',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          paddingTop: 5,
          marginHorizontal: 10,
          marginBottom: 10,
          borderRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="MedicalRecordScreen"
        options={{
          title: 'Evaluación General',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientEvaluationScreen"
        options={{
          title: 'Evaluación del paciente',
          tabBarIcon: ({ color }) => <Ionicons name="pulse" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="FirstEvaluationScreen"
        options={{
          title: 'Evaluación Inicial',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-sharp" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="PhysicalExplorationScreen"
        options={{
          title: 'Exploración Física',
          tabBarIcon: ({ color }) => <Ionicons name="body" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientConditionScreen"
        options={{
          title: 'Condición de Paciente',
          tabBarIcon: ({ color }) => <Ionicons name="sad" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="PatientTransferScreen"
        options={{
          title: 'Traslado de paciente',
          tabBarIcon: ({ color }) => <Ionicons name="bus" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="DeployedResourcesScreen"
        options={{
          title: 'Recursos utilizados',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={28} color={color} />,
        }}
      />
      {/* ¡OJO! No incluyas aquí protocolos ni recursos */}
    </Tabs>
  );
}
