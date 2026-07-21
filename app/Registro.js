import { getSavedUserName, saveUserName } from "@/utils/userSession";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RegistroScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const puedeContinuar = nombre.trim().length > 0 && !guardando;

  useEffect(() => {
    let active = true;

    async function cargarNombre() {
      const savedName = await getSavedUserName();

      if (active && savedName) {
        setNombre(savedName);
      }
    }

    cargarNombre();

    return () => {
      active = false;
    };
  }, []);

  async function continuar() {
    if (!puedeContinuar) {
      return;
    }

    try {
      setGuardando(true);
      await saveUserName(nombre);
      router.replace("/inicio");
    } catch (error) {
      console.error("No se pudo guardar el nombre:", error);
      Alert.alert(
        "No se pudo guardar",
        "Revisa el nombre e inténtalo nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.fondoContainer}>
        <Image
          source={require("@/assets/images/Registro.png")}
          style={styles.fondo}
          resizeMode="cover"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.pregunta}>Dinos tu nombre!</Text>

        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Escribe tu nombre"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={continuar}
        />

        <TouchableOpacity
          style={[styles.boton, !puedeContinuar && styles.botonDeshabilitado]}
          disabled={!puedeContinuar}
          activeOpacity={0.8}
          onPress={continuar}
        >
          <Text style={styles.botonTexto}>
            {guardando ? "Guardando..." : "¡Vamos a pintar! →"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fondoContainer: {
    height: height * 0.67,
    width,
    overflow: "hidden",
  },
  fondo: {
    width,
    height: height * 0.66,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  pregunta: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 3,
    borderColor: "#378ADD",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    color: "#333",
    textAlign: "center",
  },
  boton: {
    marginTop: 28,
    width: "100%",
    backgroundColor: "#378ADD",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  botonDeshabilitado: {
    backgroundColor: "#B5D4F4",
  },
  botonTexto: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },
});
