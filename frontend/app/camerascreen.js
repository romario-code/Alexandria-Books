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
// Google API
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function BookScanner() {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

  // // Enviando o código de barras para o seu banco de dados
  const handleBarCodeScanned = async ({ type, data }) => {
    try {
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

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const saveBook = async (book) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(book),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Livro salvo com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar livro');
      }
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      Alert.alert('Erro', 'Erro ao salvar livro');
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
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#242424',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 18,
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
