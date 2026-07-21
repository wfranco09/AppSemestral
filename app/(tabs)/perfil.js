import { deleteAllDrawings, getDrawings } from "@/utils/drawings";
import { clearUserProfile, getSavedUserName } from "@/utils/userSession";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PREVIEW_LIMIT = 3;

function formatFecha(iso) {
  if (!iso) {
    return "";
  }

  const fecha = new Date(iso);

  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

export default function PerfilScreen() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [dibujos, setDibujos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function cargarPerfil() {
        try {
          setCargando(true);

          const [nombreGuardado, dibujosGuardados] = await Promise.all([
            getSavedUserName(),
            getDrawings(),
          ]);

          if (active) {
            setNombreUsuario(nombreGuardado);
            setDibujos(dibujosGuardados);
          }
        } catch (error) {
          console.error("No se pudo cargar el perfil:", error);

          if (active) {
            Alert.alert(
              "No se pudo cargar el perfil",
              "Inténtalo nuevamente en unos segundos.",
            );
          }
        } finally {
          if (active) {
            setCargando(false);
          }
        }
      }

      cargarPerfil();

      return () => {
        active = false;
      };
    }, []),
  );

  const dibujosRecientes = dibujos.slice(0, PREVIEW_LIMIT);
  const inicial = nombreUsuario.trim().charAt(0).toUpperCase() || "A";
  const resumenDibujos =
    dibujos.length === 1
      ? "1 dibujo guardado"
      : `${dibujos.length} dibujos guardados`;

  function abrirGaleria() {
    router.push("/galeria");
  }

  function confirmarBorrado() {
    Alert.alert(
      "Borrar perfil",
      "Se eliminarán tu perfil y todos tus dibujos guardados. Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar perfil",
          style: "destructive",
          onPress: borrarPerfil,
        },
      ],
    );
  }

  async function borrarPerfil() {
    try {
      setBorrando(true);

      // Primero se eliminan los dibujos y sus imágenes
      await deleteAllDrawings();

      // Después se elimina el nombre del usuario
      await clearUserProfile();

      // Reinicia el flujo de la aplicación
      router.replace("/Bienvenida");
    } catch (error) {
      console.error("No se pudo borrar el perfil:", error);

      Alert.alert("No se pudo borrar el perfil", "Inténtalo nuevamente.");
    } finally {
      setBorrando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require("@/assets/images/logo-kidintime.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>Perfil del artista</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {nombreUsuario || "Artista"}
          </Text>
          <Text style={styles.drawingCount}>
            {cargando ? "Cargando dibujos..." : resumenDibujos}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tus dibujos recientes</Text>
        {dibujos.length > PREVIEW_LIMIT && (
          <Text style={styles.sectionHint}>Últimos {PREVIEW_LIMIT}</Text>
        )}
      </View>

      {cargando ? (
        <View style={styles.emptyPreview}>
          <Text style={styles.emptyPreviewText}>Cargando tu galería...</Text>
        </View>
      ) : dibujosRecientes.length === 0 ? (
        <View style={styles.emptyPreview}>
          <Text style={styles.emptyEmoji}>🎨</Text>
          <Text style={styles.emptyTitle}>Todavía no hay dibujos</Text>
          <Text style={styles.emptyPreviewText}>
            Tus creaciones aparecerán aquí después de guardarlas.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewList}
        >
          {dibujosRecientes.map((dibujo) => (
            <TouchableOpacity
              key={dibujo.id}
              style={styles.previewCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/draw",
                  params: {
                    drawingId: dibujo.id,
                    animal: dibujo.animalId,
                  },
                })
              }
            >
              {dibujo.thumbnailUri ? (
                <Image
                  source={{ uri: dibujo.thumbnailUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Text style={styles.previewEmoji}>🎨</Text>
                </View>
              )}

              <Text style={styles.previewLabel} numberOfLines={1}>
                {dibujo.animalLabel || "Dibujo"}
              </Text>
              <Text style={styles.previewDate}>
                {formatFecha(dibujo.fecha)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.galleryButton}
        activeOpacity={0.8}
        onPress={abrirGaleria}
      >
        <Text style={styles.galleryButtonText}>Ver tu galería de dibujos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, borrando && styles.disabledButton]}
        activeOpacity={0.8}
        disabled={borrando}
        onPress={confirmarBorrado}
      >
        <Text style={styles.deleteButtonText}>
          {borrando ? "Borrando perfil..." : "Borrar perfil"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.deleteNote}>
        Al borrar el perfil, también se eliminarán todos tus dibujos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  logo: {
    width: 165,
    height: 72,
    marginBottom: 8,
  },
  profileCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4FF",
    borderWidth: 2,
    borderColor: "#378ADD",
    borderRadius: 20,
    padding: 18,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#378ADD",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: "#667085",
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#225D91",
  },
  drawingCount: {
    marginTop: 5,
    fontSize: 14,
    color: "#475467",
  },
  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333333",
  },
  sectionHint: {
    fontSize: 12,
    color: "#888888",
  },
  emptyPreview: {
    width: "100%",
    minHeight: 145,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 16,
    padding: 18,
  },
  emptyEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 5,
  },
  emptyPreviewText: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
  },
  previewList: {
    paddingRight: 10,
    gap: 12,
  },
  previewCard: {
    width: 126,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 14,
    padding: 8,
  },
  previewImage: {
    width: "100%",
    height: 102,
    borderRadius: 10,
    backgroundColor: "#F2F4F7",
  },
  previewPlaceholder: {
    width: "100%",
    height: 102,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#F2F4F7",
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },
  previewDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#888888",
  },
  galleryButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#378ADD",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 22,
  },
  galleryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  deleteButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E24B4A",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.55,
  },
  deleteButtonText: {
    color: "#C43232",
    fontSize: 15,
    fontWeight: "800",
  },
  deleteNote: {
    marginTop: 8,
    color: "#888888",
    fontSize: 12,
    textAlign: "center",
  },
});
