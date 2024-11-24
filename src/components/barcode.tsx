import { useEffect, useState, FC } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  Alert,
  View,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

interface BarcodeQrCodeScannerProps {
  onScanComplete: (result: string) => void;
}
export function BarcodeQrCodeScanner({
  onScanComplete,
}: BarcodeQrCodeScannerProps): ReturnType<FC> {
  const [enableOnCodeScanned, setEnableOnCodeScanned] = useState(true);

  const { requestPermission: requestCameraPermission } = useCameraPermission();

  const device = useCameraDevice('back');

  useEffect(() => {
    handleCameraPermission();
  }, []);
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (enableOnCodeScanned) {
        const value = codes[0]?.value || '';
        console.log('Scanned code:', value);

        onScanComplete(value);

        setEnableOnCodeScanned(false);
      }
    },
  });

  const handleCameraPermission = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      Alert.alert(
        'Error',
        'Camera permission is required to use the camera. Please grant permission.',
      );

      Linking.openSettings();
    }
  };

  if (device == null)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ margin: 10 }}>Camera Not Found</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onTouchEnd={() => setEnableOnCodeScanned(true)}
      />
    </SafeAreaView>
  );
}
