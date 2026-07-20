import { loadData, saveData } from '@/utils/storage';
import * as FileSystem from "expo-file-system";

const STORAGE_KEY = 'kidintime_dibujos';

// Devuelve todos los dibujos guardados, más recientes primero
export async function getDrawings() {
  const dibujos = await loadData(STORAGE_KEY, []);
  return [...dibujos].sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
}

// Busca un dibujo por id (para reabrirlo en draw.js)
export async function getDrawingById(id) {
  const dibujos = await loadData(STORAGE_KEY, []);
  return dibujos.find((d) => d.id === id) ?? null;
}

// Crea o actualiza un dibujo.
// Si viene con id existente, actualiza (re-edición). Si no, crea uno nuevo.
export async function saveDrawing({
  id,
  animalId,
  animalLabel,
  strokes,
  eraserStrokes,
  canvasWidth,
  canvasHeight,
  thumbnailUri,
}) {
  console.log('Guardando dibujo con thumbnailUri:', thumbnailUri);
  console.log('Tipo de thumbnailUri:', typeof thumbnailUri);

  const dibujos = await loadData(STORAGE_KEY, []);
  const fecha = new Date().toISOString();

  if (id) {
    const idx = dibujos.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const actualizado = {
        ...dibujos[idx],
        animalId,
        animalLabel,
        strokes,
        eraserStrokes,
        canvasWidth,
        canvasHeight,
        thumbnailUri,
        fecha,
      };
      dibujos[idx] = actualizado;
      await saveData(STORAGE_KEY, dibujos);
      console.log('Dibujo actualizado:', actualizado.id);
      return actualizado;
    }
  }

  const nuevo = {
    id: id ?? Date.now().toString(),
    animalId,
    animalLabel,
    fecha,
    strokes,
    eraserStrokes,
    canvasWidth,
    canvasHeight,
    thumbnailUri,
  };
  await saveData(STORAGE_KEY, [...dibujos, nuevo]);
  console.log('Dibujo guardado:', nuevo.id);
  return nuevo;
}

// Borra un dibujo por id (y su archivo de imagen, si tiene)
export async function deleteDrawing(id) {
  const dibujos = await loadData(STORAGE_KEY, []);
  const dibujo = dibujos.find((d) => d.id === id);

  if (!dibujo) {
    console.warn('Dibujo no encontrado para eliminar:', id);
    return null;
  }

  if (dibujo.thumbnailUri) {
    try {
      await FileSystem.deleteAsync(dibujo.thumbnailUri, { idempotent: true });
      console.log('Archivo de imagen eliminado:', dibujo.thumbnailUri);
    } catch (e) {
      console.warn('No se pudo borrar el archivo de imagen:', e);
    }
  }

  const updatedDrawings = dibujos.filter((d) => d.id !== id);
  await saveData(STORAGE_KEY, updatedDrawings);
  
  console.log('Dibujo eliminado:', id);
  return dibujo;
}