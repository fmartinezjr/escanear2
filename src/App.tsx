import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Button,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { fetchBookDetails } from './services/api';
import { uploadToS3 } from './services/upload';
import { BarcodeQrCodeScanner } from './components/barcode';

export interface BookInformation {
  isbn: string;
  title: string;
  authors: string;
  description: string;
}
export interface BookDetails {
  items: BookItem[];
}

export interface BookItem {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    industryIdentifiers: IndustryIdentifiers[];
  };
}

interface IndustryIdentifiers {
  type: string;
  identifier: string;
}

export default function App() {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [BookInformation, setBookInformation] = useState<BookInformation[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleScanComplete = (scannedText: string) => {
    setIsbn(scannedText);
    setScannerVisible(false);
  };

  const handleFetchBookDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const { items: currentItems }: BookDetails = await fetchBookDetails(isbn);

      setBookInformation((previousItems: BookInformation[]) => {
        console.log('previousItems', previousItems);
        console.log('currentItems', currentItems);

        if (previousItems) {
          const currentBookItems: BookInformation[] = currentItems.reduce(
            (acc, item) => {
              const { volumeInfo } = item;
              const { title, description, industryIdentifiers, authors } =
                volumeInfo;

              const currentBookInformation: BookInformation = {
                title: title || 'N/A',
                description: description || 'N/A',
                authors: authors?.join(', ') || 'N/A',
                isbn:
                  industryIdentifiers.find(
                    (item: IndustryIdentifiers) => item.type === 'ISBN_13',
                  )?.identifier || 'N/A',
              };
              acc.push(currentBookInformation);

              return acc;
            },
            [] as BookInformation[],
          );

          const mergedItems = previousItems.concat(currentBookItems);
          return mergedItems;
        }

        return [];
      });
    } catch (err) {
      setError(`Failed to fetch book details: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginVertical: 20 }}>
        Book Scanner
      </Text>

      <TouchableOpacity
        style={{
          height: 40,
          backgroundColor: '#007BFF',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          marginBottom: 10,
        }}
        onPress={() => setScannerVisible(true)}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Scan Book ISBN
        </Text>
      </TouchableOpacity>

      <Modal visible={scannerVisible} animationType="slide" transparent={false}>
        <BarcodeQrCodeScanner onScanComplete={handleScanComplete} />
      </Modal>

      <Button title="Fetch Book Details" onPress={handleFetchBookDetails} />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginVertical: 20 }}
        />
      )}
      {error && (
        <Text style={{ color: 'red', marginVertical: 20 }}>{error}</Text>
      )}

      {BookInformation.length > 0 && (
        <Button
          title={`Upload to Amazon s3 ${BookInformation.length} book items`}
          onPress={() => uploadToS3(BookInformation)}
        />
      )}

      {BookInformation.length > 0 && (
        <ScrollView style={{ marginTop: 20 }}>
          {BookInformation.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>ISBN:</Text>
              <Text>{item?.isbn || 'N/A'}</Text>
              <Text style={{ fontWeight: 'bold' }}>Title:</Text>
              <Text>{item?.title || 'N/A'}</Text>
              <Text style={{ fontWeight: 'bold' }}>Authors:</Text>
              <Text>{item?.authors || 'N/A'}</Text>
              <Text style={{ fontWeight: 'bold' }}>Description:</Text>
              <Text>{item?.description || 'N/A'}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
