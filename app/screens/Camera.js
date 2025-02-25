import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Button,
  Platform,
} from 'react-native';
import { supabase } from '../utils/supabase';

// Google API
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function Camera() {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const isValidISBN = (isbn) => {
    // Remove hífens e espaços
    isbn = isbn.replace(/[-\s]/g, '');

    // Verifica se é ISBN-13
    if (isbn.length === 13) {
      // Verifica se contém apenas números
      if (!/^\d{13}$/.test(isbn)) return false;

      // Calcula o dígito verificador
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += (i % 2 === 0) ? parseInt(isbn[i]) : parseInt(isbn[i]) * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return checkDigit === parseInt(isbn[12]);
    }

    // Verifica se é ISBN-10
    if (isbn.length === 10) {
      // Verifica se os primeiros 9 caracteres são números
      if (!/^\d{9}[\dX]$/.test(isbn)) return false;

      // Calcula o dígito verificador
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(isbn[i]) * (10 - i);
      }
      const last = isbn[9].toUpperCase();
      sum += (last === 'X') ? 10 : parseInt(last);

      return sum % 11 === 0;
    }

    return false;
  };

  // Se o usuário não concedeu permissão para a câmera, exiba uma mensagem e um botão para solicitar permissão
  if (!permission) {
    return <View />;
  }

  // // Se o usuário não concedeu permissão para a câmera, exiba uma mensagem e um botão para solicitar permissão
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nós precisamos de sua permissão para mostrar a camêra
        </Text>
        <Button onPress={requestPermission} title="Conceder permissão" />
      </View>
    );
  }
  
  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      // Valida o ISBN antes de prosseguir
      if (!isValidISBN(data)) {
        Alert.alert('Erro', 'ISBN inválido. Por favor, tente novamente.');
        setScanned(false);
        return;
      }

      setScanned(true);
      setLoading(true);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${data}&key=${API_KEY}`,
      );
      const bookData = await response.json();
      console.log(bookData);

      if (bookData.items && bookData.items.length > 0) {
        const bookInfo = bookData.items[0].volumeInfo;

        const newBook = {
          id: data, // ISBN como ID
          title: bookInfo.title,
          authors: bookInfo.authors,
          publisher: bookInfo.publisher,
          publishedDate: bookInfo.publishedDate,
          thumbnail: bookInfo.imageLinks?.thumbnail,
          createdAt: new Date().toISOString(),
        };
        setCurrentBook(newBook);
        // Adicionar o livro à lista de livros
        setBooks((current) => [newBook, ...current]);

        Alert.alert('Livro encontrado', `Deseja salvar: ${newBook.title} ?`, [
          { text: 'Cancelar', onPress: () => setScanned(false) },
          { text: 'Salvar', onPress: () => saveBook(newBook) },
        ]),
          console.log('====================================');
        console.log('Livro encontrado:', newBook);
        console.log('====================================');
      } else {
        Alert.alert('Erro', 'Nenhum livro encontrado com este ISBN');
        setScanned(false);
      }
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      Alert.alert(
        'Erro',
        error.message === 'Sem conexão com a internet'
          ? 'Verifique sua conexão com a internet e tente novamente'
          : 'Erro ao buscar informações do livro. Tente novamente.',
      );
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };
// Enviando o código de barras para o supabase
  const saveBook = async (book) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([book])
        .select();

      if (error) {
        if (error.code === '23505') { // código de erro para violação de chave única
          Alert.alert('Atenção', 'Este livro já está cadastrado');
        } else {
          throw error;
        }
      } else {
        Alert.alert('Sucesso', 'Livro salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Sem conexão com a internet</Text>
        </View>
      )}
      <CameraView
        style={styles.camera}
        barcodeScannerEnabled
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barCodeTypes: ['ean13', 'ean8'],
        }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>
              Buscando informações do livro...
            </Text>
          </View>
        ) : (
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.instructions}>
              Posicione o código de barras do livro dentro da área de
              escaneamento
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 20,
    textAlign: 'left',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  scanArea: {
    marginTop: 100,
    marginHorizontal: 50,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 24,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#fff',
    fontSize: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 8,
  },
  cameraButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});