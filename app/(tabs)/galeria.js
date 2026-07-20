import { deleteDrawing, getDrawings } from '@/utils/drawings';
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const THUMB_SIZE = 150;

function formatFecha(iso) {
  const f = new Date(iso);
  return f.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function GaleriaScreen() {
  const router = useRouter();
  const [dibujos, setDibujos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Recargar cada vez que se entra a la pestaña (por si se guardó uno nuevo)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const lista = await getDrawings();
          console.log('Dibujos cargados:', lista.length);

          // Verificar cada thumbnail
          for (const dibujo of lista) {
            if (dibujo.thumbnailUri) {
              const fileInfo = await FileSystem.getInfoAsync(dibujo.thumbnailUri, {
                md5: false,
                size: true
              });
              console.log(`Thumbnail ${dibujo.id}:`, {
                exists: fileInfo.exists,
                uri: dibujo.thumbnailUri,
                size: fileInfo.exists ? fileInfo.size : 'N/A',
              });

              if (!fileInfo.exists) {
                console.warn(`Thumbnail no encontrado: ${dibujo.thumbnailUri}`);
              }
            } else {
              console.log(`Dibujo ${dibujo.id} no tiene thumbnailUri`);
            }
          }

          setDibujos(lista);
          setLoaded(true);

        } catch (err) {
          console.error('❌ Error cargando dibujos:', err);

          setLoaded(true);
        }
      })();
    }, [])
  );

  function abrirDibujo(dibujo) {
    router.push({ pathname: '/draw', params: { drawingId: dibujo.id } });
  }

  function confirmarBorrar(dibujo) {
    Alert.alert(
      'Borrar dibujo',
      `¿Seguro que quieres borrar tu dibujo de ${dibujo.animalLabel}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await deleteDrawing(dibujo.id);
            setDibujos((prev) => prev.filter((d) => d.id !== dibujo.id));
          },
        },
      ]
    );
  }

  if (loaded && dibujos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🖼️</Text>
        <Text style={styles.title}>Tu galería</Text>
        <Text style={styles.subtitle}>Aquí van a aparecer tus dibujos guardados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu galería</Text>
      <FlatList
        data={dibujos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => abrirDibujo(item)}>
            <View style={styles.thumbBox}>
              {item.thumbnailUri ? (
                <Image
                  source={{ uri: item.thumbnailUri }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={{ fontSize: 28 }}>🎨</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmarBorrar(item)}
              >
                <Text style={styles.deleteX}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardLabel}>{item.animalLabel}</Text>
            <Text style={styles.cardDate}>{formatFecha(item.fecha)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  emoji: { fontSize: 48, marginBottom: 12, alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 24 },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  card: { flex: 1, margin: 8, alignItems: 'center' },
  thumbBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#378ADD',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E24B4A',
  },
  deleteX: { fontSize: 12, color: '#E24B4A' },
  cardLabel: { marginTop: 6, fontSize: 14, fontWeight: '600', color: '#333' },
  cardDate: { fontSize: 12, color: '#999' },
});