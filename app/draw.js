import BottomNavBar from "@/components/BottomNavBar";
import { getDrawingById, saveDrawing } from "@/utils/drawings";
import { exitDrawing } from "@/utils/navigation";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Mask, Path, Rect } from "react-native-svg";
import { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");

const CANVAS_HEIGHT = height * 0.4;
const MIN_SIZE = 2;
const MAX_SIZE = 30;
const SLIDER_WIDTH = 200;

const ANIMAL_LABELS = {
  dino: "Dinosaurio",
  koala: "Koala",
  gato: "Gato",
  leon: "León",
  libre: "Libre",
};

// ---- Imágenes por animal ----
// "libre" no tiene imagen de fondo a propósito: es el lienzo en blanco.
const ANIMAL_IMAGES = {
  dino: require("@/assets/images/Dino.jpg"),
  koala: require("@/assets/images/koala.jpg"),
  gato: require("@/assets/images/Gato.jpg"),
  leon: require("@/assets/images/Leon.png"),
  libre: null,
};

const ANIMAL_TITLES = {
  dino: require("@/assets/images/Dinotext.png"),
  koala: require("@/assets/images/KoalaText1.png"),
  gato: require("@/assets/images/GatoText.png"),
  leon: require("@/assets/images/LeonText.png"),
  // Cambia esta ruta por el nombre real de tu imagen de título "Colorear"
  libre: require("@/assets/images/ColorearText.png"),
};

const TAB_ROUTES = {
  inicio: "/inicio",
  galeria: "/galeria",
  perfil: "/perfil",
};

function SizeSlider({ size, setSize }) {
  const barX = useRef(0);
  const barRef = useRef(null);

  const thumbPos = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * SLIDER_WIDTH;

  const updateFromPageX = (pageX) => {
    let relative = pageX - barX.current;
    relative = Math.max(0, Math.min(SLIDER_WIDTH, relative));
    const newSize = Math.round(
      MIN_SIZE + (relative / SLIDER_WIDTH) * (MAX_SIZE - MIN_SIZE),
    );
    setSize(newSize);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateFromPageX(evt.nativeEvent.pageX),
      onPanResponderMove: (evt) => updateFromPageX(evt.nativeEvent.pageX),
    }),
  ).current;

  return (
    <View style={styles.sliderRow}>
      <View style={[styles.sliderDotPreview, { width: 6, height: 6 }]} />
      <View
        ref={barRef}
        onLayout={() => {
          barRef.current?.measure((fx, fy, w, h, px) => {
            barX.current = px;
          });
        }}
        style={styles.sliderTrack}
        {...panResponder.panHandlers}
      >
        <View style={[styles.sliderFill, { width: thumbPos }]} />
        <View style={[styles.sliderThumb, { left: thumbPos - 11 }]} />
      </View>
      <View style={[styles.sliderDotPreview, { width: 18, height: 18 }]} />
    </View>
  );
}

export default function DrawScreen() {
  const router = useRouter();
  const { drawingId } = useLocalSearchParams();
  const [currentDrawingId, setCurrentDrawingId] = useState(drawingId ?? null);
  const canvasRef = useRef(null);
  const { animal } = useLocalSearchParams();

  const animalKey = Array.isArray(animal) ? animal[0] : animal;

  // Si el animal no existe en el objeto, usamos "dino" por defecto.
  // Si existe pero su valor es null (caso "libre"), respetamos ese null
  // para no mostrar ninguna imagen de fondo.
  const hasAnimalImage =
    animalKey && Object.prototype.hasOwnProperty.call(ANIMAL_IMAGES, animalKey);

  const selectedImage = hasAnimalImage
    ? ANIMAL_IMAGES[animalKey]
    : ANIMAL_IMAGES.dino;

  const hasAnimalTitle =
    animalKey && Object.prototype.hasOwnProperty.call(ANIMAL_TITLES, animalKey);

  const selectedTitle = hasAnimalTitle
    ? ANIMAL_TITLES[animalKey]
    : ANIMAL_TITLES.dino;

  const [tool, setTool] = useState("none");
  const [selectedColor, setSelectedColor] = useState("#E24B4A");
  const [brushSize, setBrushSize] = useState(7);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentStroke, setCurrentStroke] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [currentEraserStroke, setCurrentEraserStroke] = useState([]);
  const [eraserStrokes, setEraserStrokes] = useState([]);

  useEffect(() => {
    if (!drawingId) return;
    (async () => {
      const dibujo = await getDrawingById(drawingId);
      if (dibujo) {
        setStrokes(dibujo.strokes ?? []);
        setEraserStrokes(dibujo.eraserStrokes ?? []);
        setCurrentDrawingId(dibujo.id);
        setHasUnsavedChanges(false);
      }
    })();
  }, [drawingId]);

  const colors = [
    "#E24B4A",
    "#378ADD",
    "#639922",
    "#EF9F27",
    "#D4537E",
    "#1D9E75",
    "#7F77DD",
    "#000000",
  ];

  function selectTool(newTool) {
    setTool((prev) => (prev === newTool ? "none" : newTool));
  }

  function pointsToPath(points) {
    if (points.length < 2) return "";
    const [first, ...rest] = points;
    return (
      `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ")
    );
  }

  function handleExit(routeName) {
    const route = TAB_ROUTES[routeName];

    if (!route) {
      return;
    }

    if (hasUnsavedChanges) {
      exitDrawing(router, route);
    } else {
      router.replace(route);
    }
  }

  function onGestureEvent(event) {
    if (tool === "none") return;
    const { x, y } = event.nativeEvent;

    if (tool === "pencil") {
      setCurrentStroke((prev) => [...prev, { x, y }]);
    }
    if (tool === "eraser") {
      setCurrentEraserStroke((prev) => [...prev, { x, y }]);
    }
  }

  function onGestureEnd() {
    if (tool === "pencil") {
      if (currentStroke.length < 2) {
        setCurrentStroke([]);
        return;
      }
      setStrokes((prev) => [
        ...prev,
        {
          id: Date.now(),
          color: selectedColor,
          strokeWidth: brushSize,
          points: currentStroke,
        },
      ]);
      setCurrentStroke([]);
      setHasUnsavedChanges(true);
    }

    if (tool === "eraser") {
      if (currentEraserStroke.length < 2) {
        setCurrentEraserStroke([]);
        return;
      }
      setEraserStrokes((prev) => [
        ...prev,
        {
          id: Date.now(),
          strokeWidth: brushSize * 2.2,
          points: currentEraserStroke,
        },
      ]);
      setCurrentEraserStroke([]);
      setHasUnsavedChanges(true);
    }
  }

  function clearCanvas() {
    setCurrentStroke([]);
    setStrokes([]);
    setCurrentEraserStroke([]);
    setEraserStrokes([]);
  }

  const DIBUJOS_DIR = FileSystem.documentDirectory + "dibujos/";

  async function asegurarCarpetaDibujos() {
    const info = await FileSystem.getInfoAsync(DIBUJOS_DIR, {
      md5: false,
      size: false,
    });
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DIBUJOS_DIR, { intermediates: true });
    }
  }

  async function guardarDibujo() {
    if (strokes.length === 0) {
      Alert.alert(
        "Nada que guardar",
        "Pinta un poco antes de guardar tu dibujo.",
      );
      return;
    }

    console.log("Iniciando guardado...");

    let thumbnailUri = null;
    const idParaGuardar = currentDrawingId ?? Date.now().toString();

    try {
      console.log("📸 Intentando capturar canvas...");
      console.log("canvasRef:", canvasRef);
      console.log("canvasRef.current:", canvasRef.current);

      // Intenta capturar el canvas
      const result = await captureRef(canvasRef.current, {
        format: "png",
        quality: 0.9,
        result: "tmpfile",
      });

      console.log("Resultado de captureRef:", result);

      if (result) {
        // Asegurar que el directorio existe
        const dirInfo = await FileSystem.getInfoAsync(DIBUJOS_DIR, {
          md5: false,
          size: false,
        });
        if (!dirInfo.exists) {
          console.log("Creando directorio:", DIBUJOS_DIR);
          await FileSystem.makeDirectoryAsync(DIBUJOS_DIR, {
            intermediates: true,
          });
        }

        thumbnailUri = DIBUJOS_DIR + idParaGuardar + "-" + Date.now() + ".png";
        console.log("Copiando a:", thumbnailUri);

        await FileSystem.copyAsync({
          from: result,
          to: thumbnailUri,
        });

        // Si ya existía un dibujo con una miniatura anterior, la borramos
        if (currentDrawingId) {
          const dibujoAnterior = await getDrawingById(currentDrawingId);
          if (
            dibujoAnterior?.thumbnailUri &&
            dibujoAnterior.thumbnailUri !== thumbnailUri
          ) {
            try {
              await FileSystem.deleteAsync(dibujoAnterior.thumbnailUri, {
                idempotent: true,
              });
            } catch (e) {
              console.warn("No se pudo borrar la miniatura anterior:", e);
            }
          }
        }

        // Verificar que se guardó
        const savedFile = await FileSystem.getInfoAsync(thumbnailUri, {
          md5: false,
          size: true,
        });
        console.log("Archivo guardado:", {
          exists: savedFile.exists,
          size: savedFile.exists ? savedFile.size : 0,
          uri: thumbnailUri,
        });

        if (!savedFile.exists) {
          console.error("El archivo no se guardó correctamente");
          thumbnailUri = null;
        }
      } else {
        console.error("captureRef no devolvió resultado");
      }
    } catch (e) {
      console.error("Error:", e);
      console.error("Mensaje:", e?.message);
      console.error("Stack:", e?.stack);
    }

    console.log("Guardando dibujo con thumbnailUri:", thumbnailUri);

    try {
      const guardado = await saveDrawing({
        id: idParaGuardar,
        animalId: animalKey || "dino",
        animalLabel: ANIMAL_LABELS[animalKey] || ANIMAL_LABELS.dino,
        strokes,
        eraserStrokes,
        canvasWidth: width,
        canvasHeight: CANVAS_HEIGHT,
        thumbnailUri,
      });

      console.log("Dibujo guardado exitosamente:", guardado.id);

      setCurrentDrawingId(guardado.id);
      setHasUnsavedChanges(false);
      Alert.alert("¡Guardado!", "Tu dibujo quedó en la galería.", [
        { text: "Seguir pintando", style: "cancel" },
        { text: "Ir a la galería", onPress: () => router.push("/galeria") },
      ]);
    } catch (e) {
      console.error("Error:", e);
      console.error("Mensaje:", e?.message);
      console.error("Stack:", e?.stack);
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo-kidintime.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={guardarDibujo}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                clearCanvas();
                setTool("none");
              }}
            ></TouchableOpacity>
          </View>
        </View>

        {/* Título (dinámico según el animal) */}
        <Image
          source={selectedTitle}
          style={styles.titulo}
          resizeMode="contain"
        />

        <View style={styles.tools}>
          <TouchableOpacity onPress={() => selectTool("pencil")}>
            <Image
              source={require("@/assets/images/lapiz.png")}
              style={[styles.toolIcon, tool === "pencil" && styles.toolActive]}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => selectTool("eraser")}>
            <Image
              source={require("@/assets/images/borrador.jpeg")}
              style={[styles.toolIcon, tool === "eraser" && styles.toolActive]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              clearCanvas();
              setTool("none");
            }}
          >
            <Image
              source={require("@/assets/images/restar.jpeg")}
              style={styles.toolIcon}
            />
          </TouchableOpacity>
        </View>

        {tool === "pencil" && (
          <View style={styles.palette}>
            {colors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {(tool === "pencil" || tool === "eraser") && (
          <SizeSlider size={brushSize} setSize={setBrushSize} />
        )}

        <View style={styles.dinoContainer}>
          <View
            ref={canvasRef}
            collapsable={false}
            style={{
              width,
              height: CANVAS_HEIGHT,
              position: "relative",
            }}
          >
            {/* Imagen de fondo (si existe) */}
            {selectedImage && (
              <Image
                source={selectedImage}
                style={{
                  position: "absolute",
                  width,
                  height: CANVAS_HEIGHT,
                }}
                resizeMode="contain"
              />
            )}

            <PanGestureHandler
              enabled={tool !== "none"}
              onGestureEvent={onGestureEvent}
              onEnded={onGestureEnd}
            >
              <View
                collapsable={false}
                style={{
                  position: "absolute",
                  width,
                  height: CANVAS_HEIGHT,
                }}
              >
                <Svg width={width} height={CANVAS_HEIGHT}>
                  <Defs>
                    {strokes.map((stroke) => {
                      const relevantErasers = eraserStrokes.filter(
                        (e) => e.id > stroke.id,
                      );
                      if (relevantErasers.length === 0) return null;

                      return (
                        <Mask
                          key={`mask-${stroke.id}`}
                          id={`mask-${stroke.id}`}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width={width}
                          height={CANVAS_HEIGHT}
                        >
                          <Rect
                            x="0"
                            y="0"
                            width={width}
                            height={CANVAS_HEIGHT}
                            fill="#fff"
                          />
                          {relevantErasers.map((e) => (
                            <Path
                              key={e.id}
                              d={pointsToPath(e.points)}
                              stroke="#000"
                              strokeWidth={e.strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          ))}
                        </Mask>
                      );
                    })}

                    {currentStroke.length > 1 && eraserStrokes.length > 0 && (
                      <Mask
                        id="mask-current"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width={width}
                        height={CANVAS_HEIGHT}
                      >
                        <Rect
                          x="0"
                          y="0"
                          width={width}
                          height={CANVAS_HEIGHT}
                          fill="#fff"
                        />
                        {eraserStrokes.map((e) => (
                          <Path
                            key={e.id}
                            d={pointsToPath(e.points)}
                            stroke="#000"
                            strokeWidth={e.strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        ))}
                      </Mask>
                    )}
                  </Defs>

                  {strokes.map((stroke) => {
                    const hasMask = eraserStrokes.some((e) => e.id > stroke.id);
                    return (
                      <Path
                        key={stroke.id}
                        d={pointsToPath(stroke.points)}
                        stroke={stroke.color}
                        strokeWidth={stroke.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        mask={hasMask ? `url(#mask-${stroke.id})` : undefined}
                      />
                    );
                  })}

                  {currentStroke.length > 1 && (
                    <Path
                      d={pointsToPath(currentStroke)}
                      stroke={selectedColor}
                      strokeWidth={brushSize}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      mask={
                        eraserStrokes.length > 0
                          ? "url(#mask-current)"
                          : undefined
                      }
                    />
                  )}

                  {currentEraserStroke.length > 1 && (
                    <Path
                      d={pointsToPath(currentEraserStroke)}
                      stroke="rgba(150,150,150,0.35)"
                      strokeWidth={brushSize * 2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}
                </Svg>
              </View>
            </PanGestureHandler>
          </View>

          <View style={styles.grass} />
        </View>

        <BottomNavBar activeRoute={null} onNavigate={handleExit} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: { width: 150, height: 80, top: -25 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    top: -25,
  },
  saveBtn: {
    backgroundColor: "#378ADD",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  titulo: { width: width * 0.8, height: 100, marginTop: -45 },
  tools: { flexDirection: "row", gap: 29, marginTop: -10, marginBottom: 1 },
  toolIcon: { width: 55, height: 55, opacity: 0.5 },
  toolActive: { opacity: 1, transform: [{ scale: 1.15 }] },
  palette: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 14,
    marginBottom: 20,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: { borderColor: "#333", transform: [{ scale: 1.2 }] },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  sliderDotPreview: { backgroundColor: "#555", borderRadius: 999 },
  sliderTrack: { width: SLIDER_WIDTH, height: 30, justifyContent: "center" },
  sliderFill: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#378ADD",
  },
  sliderThumb: {
    position: "absolute",
    top: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#378ADD",
  },
  dinoContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  grass: {
    width: "100%",
    height: 35,
    backgroundColor: "#7BC67E",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});
