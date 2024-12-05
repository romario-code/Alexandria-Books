import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Button,
  ActivityIndicator,
} from 'react-native';

export default function BookListScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const response = await axios.get('http://192.168.1.11:3030/api/books');
        setBooks(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <Text>{item.title}</Text>
          <Text>{item.id}</Text>
          <Text>{item.authors}</Text>
          <Text>{item.publisher}</Text>
          <Image
            style={{ objectFit: 'scale-down' }}
            width={150}
            height={300}
            source={{
              uri: item.thumbnail || 'https://via.placeholder.com/150',
            }}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});
