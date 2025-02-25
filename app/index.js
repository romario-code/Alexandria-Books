import { View, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';

export default function Root() {
  return (
    <View style={styles.container}>
      <Button
        title="Scannear Livros"
        onPress={() => router.push('/screens/Camera')}
      />
      <Button
        title="Listar Livros"
        onPress={() => router.push('/screens/BookList')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    width: 300,
    marginHorizontal: 'auto',
    justifyContent: 'center',
  },
});
