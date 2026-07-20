import AsyncStorage from "@react-native-async-storage/async-storage";

// Guarda cualquier valor (se convierte a JSON automáticamente)
export async function saveData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Error guardando en AsyncStorage:", e);
  }
}

// Lee un valor guardado. Si no existe, devuelve "fallback"
export async function loadData(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Error leyendo de AsyncStorage:", e);
    return fallback;
  }
}

// Borra un valor guardado
export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn("Error eliminando de AsyncStorage:", e);
  }
}
