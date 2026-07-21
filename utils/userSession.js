import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_NAME_KEY = "kidintime_user_name";

export async function getSavedUserName() {
  try {
    const savedName = await AsyncStorage.getItem(USER_NAME_KEY);
    return savedName?.trim() ?? "";
  } catch (error) {
    console.warn("No se pudo leer el nombre guardado:", error);
    return "";
  }
}

export async function saveUserName(name) {
  const cleanName = name.trim().replace(/\s+/g, " ");

  if (!cleanName) {
    throw new Error("El nombre no puede estar vacío.");
  }

  await AsyncStorage.setItem(USER_NAME_KEY, cleanName);
  return cleanName;
}
