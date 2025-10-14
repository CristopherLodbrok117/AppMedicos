import { Stack } from 'expo-router';

export default function SignatureLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      
    }}>
      <Stack.Screen name="SignatureTestScreen"
        options={{
          headerShown: true,
          title: "Firma digital", // Optional: Only needed if you want a custom header
          
        }}
       />
    </Stack>
  );
}