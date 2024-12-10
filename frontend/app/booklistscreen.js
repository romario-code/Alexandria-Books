import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';

export default function BookListScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const response = await fetch('http://192.168.1.11:3030/api/books');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, []);

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (books.length === 0) {
    return (
      <View style={styles.nenhumLivroCadastrado}>
        <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 8 }}>
          Nenhum livro cadastrado!
        </Text>
        <Button
          title="Cadastrar Livros"
          onPress={() => router.push('/camerascreen')}
        />
      </View>
    );
  }
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <Text>{`Dynamic content: ${item.id}`}</Text>
          <Text>{`Titulo: ${item.title}`}</Text>
          <Text>{item.authors}</Text>
          <Text>{item.publisher}</Text>
          <Image
            source={{
              uri: item.thumbnail
                ? item.thumbnail
                : 'https://via.placeholder.com/150',
            }}
            style={{ width: 150, height: 200, borderRadius: 5 }}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    backgroundColor: '#f9c2ff',
    alignItems: 'center',
    borderRadius: 10,
  },
  nenhumLivroCadastrado: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 60,
  },
});
