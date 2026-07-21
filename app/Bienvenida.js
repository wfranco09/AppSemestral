import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function BienvenidaScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/Registro");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/Inicio.png")}
        style={styles.fondo}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fondo: {
    width,
    height,
    position: "absolute",
  },
  logo: {
    width: width * 0.55,
    height: 110,
    top: -height * 0.2,
  },
});
