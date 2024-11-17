import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, Button, View,Alert,  ActivityIndicator } from 'react-native';
import { fetchBookDetails } from './src/services/api';
import { useCameraPermission, useCameraDevice } from 'react-native-vision-camera';


export interface BookDetails {
  items: Items[]
}
interface Items {
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
  };
}


export default function App() {
  const [isbn, setIsbn] = useState('');
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission } = useCameraPermission();


  const handleFetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    setBookDetails(null);
    
    try {
      const data = await fetchBookDetails(isbn);
      setBookDetails(data);
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
      
      {!hasPermission && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
            Camera use is not currently enabled.
          </Text>
        </View>
      )}



      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
        placeholder="Enter ISBN"
        value={isbn}
        onChangeText={setIsbn}
      />

      <Button title="Fetch Book Details" onPress={handleFetchBookDetails} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />}
      {error && <Text style={{ color: 'red', marginVertical: 20 }}>{error}</Text>}

      {bookDetails && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Title:</Text>
          <Text>{bookDetails.items[0]?.volumeInfo?.title || 'N/A'}</Text>

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Authors:</Text>
          <Text>{bookDetails.items[0]?.volumeInfo?.authors?.join(', ') || 'N/A'}</Text>

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Description:</Text>
          <Text>{bookDetails.items[0]?.volumeInfo?.description || 'N/A'}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}