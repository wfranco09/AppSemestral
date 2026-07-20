import { StyleSheet, Text, View } from 'react-native';

export default function GaleriaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🖼️</Text>
      <Text style={styles.title}>Tu galería</Text>
      <Text style={styles.subtitle}>Aquí van a aparecer tus dibujos guardados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
});
