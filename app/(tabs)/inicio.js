import { ANIMALS } from "@/utils/animalAssets";
import { getSavedUserName } from "@/utils/userSession";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InicioScreen() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function cargarNombre() {
        const savedName = await getSavedUserName();

        if (active) {
          setNombreUsuario(savedName);
        }
      }

      cargarNombre();

      return () => {
        active = false;
      };
    }, []),
  );

  function abrirEditor(animalId) {
    router.push({
      pathname: "/draw",
      params: { animal: animalId },
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo-kidintime.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeLabel}>Bienvenido,</Text>
          <Text style={styles.welcomeName} numberOfLines={1}>
            {nombreUsuario || "artista"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Pinta a tu animal favorito</Text>

      <View style={styles.grid}>
        {ANIMALS.map((animal) => (
          <TouchableOpacity
            key={animal.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => abrirEditor(animal.id)}
          >
            <Image
              source={animal.image}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.relleno}>
        Lienzo en blanco para expandir tu creatividad
      </Text>

      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.8}
        onPress={() => abrirEditor("libre")}
      >
        <View style={styles.bannerImageBox}>
          <Image
            source={require("@/assets/images/lapiz.png")}
            style={styles.bannerIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.bannerText}>
          Crea, colorea y diviértete con tu propio lienzo
        </Text>
      </TouchableOpacity>
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
    paddingBottom: 30,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: {
    width: 140,
    height: 76,
  },
  welcomeBox: {
    flexShrink: 1,
    maxWidth: "52%",
    backgroundColor: "#EAF4FF",
    borderWidth: 2,
    borderColor: "#378ADD",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  welcomeLabel: {
    fontSize: 12,
    color: "#667085",
  },
  welcomeName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#225D91",
  },
  title: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 16,
    marginLeft: 24,
    color: "#333",
  },
  relleno: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "#888",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  card: {
    width: 150,
    height: 190,
    borderWidth: 2,
    borderColor: "#378ADD",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  cardImage: {
    width: "85%",
    height: "85%",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    width: "88%",
    gap: 14,
    marginTop: 18,
    borderWidth: 2,
    borderColor: "#378ADD",
    borderRadius: 10,
    padding: 12,
  },
  bannerImageBox: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: "#378ADD",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerIcon: {
    width: 34,
    height: 34,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
});
