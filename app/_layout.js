// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* 1) Tu grupo de pestañas */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      {/* 2) Historial (fuera de las tabs) */}
      <Stack.Screen
        name="protocolos"
        options={{
          title: 'Historial',
          headerTitleAlign: 'center',
        }}
      />

      {/* 3) Pendientes (fuera de las tabs) */}
      <Stack.Screen
        name="recursos"
        options={{
          title: 'Pendientes',
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
