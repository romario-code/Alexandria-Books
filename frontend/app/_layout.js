import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Página Inicial' }} />
      <Stack.Screen
        name="camerascreen"
        options={{ headerTitle: 'Scanear Camêra' }}
      />
    </Stack>
  );
}
