import { View, SafeAreaView, StyleSheet } from 'react-native';

interface SignaturePadProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSignatureCapture: (base64: string) => void;
}

export default function SignaturePad({ onSignatureCapture: _onSignatureCapture }: SignaturePadProps) {
  // Placeholder para captura de firma
  // TODO: Implementar con react-native-svg-draw o similar

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvasContainer}>
        <View style={styles.signatureBox} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    margin: 10,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  canvas: {
    flex: 1,
  },
});
