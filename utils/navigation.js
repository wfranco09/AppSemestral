import { Alert } from "react-native";

export function exitDrawing(router, route) {
  Alert.alert(
    "¿Salir?",
    "¡Los cambios no se guardarán!",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => router.push(route) },
    ]
  );
}