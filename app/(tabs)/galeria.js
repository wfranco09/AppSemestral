import { deleteDrawing, getDrawings } from "@/utils/drawings";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const THUMB_SIZE = 150;

function formatFecha(iso) {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

export default function GaleriaScreen() {
  const router = useRouter();
  const [dibujos, setDibujos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function cargarDibujos() {
        try {
          const lista = await getDrawings();

          for (const dibujo of lista) {
            if (!dibujo.thumbnailUri) {
              continue;
            }

            const fileInfo = await FileSystem.getInfoAsync(
              dibujo.thumbnailUri,
              {
                md5: false,
                size: true,
              },
            );

            if (!fileInfo.exists) {
              console.warn(
                `Thumbnail no encontrado: ${dibujo.thumbnailUri}`,
              );
            }
          }

          if (active) {
            setDibujos(lista);
          }
        } catch (error) {
          console.error("Error cargando dibujos:", error);

          if (active) {
            Alert.alert(
              "No se pudo cargar la galería",
              "Inténtalo nuevamente.",
            );
          }
        } finally {
          if (active) {
            setLoaded(true);
          }
        }
      }

      cargarDibujos();

      return () => {
        active = false;
      };
    }, []),
  );

  function abrirDibujo(dibujo) {
    router.push({
      pathname: "/draw",
      params: {
        drawingId: dibujo.id,
        animal: dibujo.animalId,
      },
    });
  }

  function confirmarBorrar(dibujo) {
    Alert.alert(
      "Borrar dibujo",
      `¿Seguro que quieres borrar tu dibujo de ${dibujo.animalLabel}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDrawing(dibujo.id);
              setDibujos((prev) =>
                prev.filter((item) => item.id !== dibujo.id),
              );
            } catch (error) {
              console.error("No se pudo borrar el dibujo:", error);
              Alert.alert(
                "No se pudo borrar",
                "Inténtalo nuevamente.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo-kidintime.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Tus dibujos</Text>
        <Text style={styles.subtitle}>
          Abre una creación para seguir pintando.
        </Text>
      </View>

      {!loaded ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#378ADD" />
          <Text style={styles.loadingText}>Cargando tu galería...</Text>
        </View>
      ) : dibujos.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emoji}>🖼️</Text>
          <Text style={styles.emptyTitle}>Tu galería está vacía</Text>
          <Text style={styles.emptyText}>
            Aquí aparecerán los dibujos que guardes.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dibujos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => abrirDibujo(item)}
            >
              <View style={styles.thumbBox}>
                {item.thumbnailUri ? (
                  <Image
                    source={{ uri: item.thumbnailUri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Text style={styles.placeholderEmoji}>🎨</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmarBorrar(item);
                  }}
                >
                  <Text style={styles.deleteX}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardLabel} numberOfLines={1}>
                {item.animalLabel || "Dibujo"}
              </Text>
              <Text style={styles.cardDate}>{formatFecha(item.fecha)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 165,
    height: 72,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333333",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#667085",
  },
  emoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    margin: 8,
    alignItems: "center",
  },
  thumbBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#378ADD",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  placeholderEmoji: {
    fontSize: 30,
  },
  deleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E24B4A",
  },
  deleteX: {
    fontSize: 12,
    color: "#E24B4A",
    fontWeight: "800",
  },
  cardLabel: {
    marginTop: 7,
    maxWidth: THUMB_SIZE,
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
  cardDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#999999",
  },
});
