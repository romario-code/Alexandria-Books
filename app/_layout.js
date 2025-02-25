import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: 'Alexandria Books' }} />
      <Stack.Screen
        name="screens/Camera"
        options={{ headerTitle: 'Scanear Livro' }}
      />
      <Stack.Screen
        name="screens/BookList"
        options={{ headerTitle: 'Lista de livros' }}
      />
    </Stack>
  );
}
