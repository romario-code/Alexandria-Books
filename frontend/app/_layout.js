import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Página Inicial' }} />
      <Stack.Screen
        name="camerascreen"
        options={{ headerTitle: 'Scanear Livro' }}
      />
      <Stack.Screen
        name="booklistscreen"
        options={{ headerTitle: 'Lista de livros' }}
      />
    </Stack>
  );
}
