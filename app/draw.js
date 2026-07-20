import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Mask, Path, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const CANVAS_HEIGHT = height * 0.4;

const MIN_SIZE = 2;
const MAX_SIZE = 30;
const SLIDER_WIDTH = 200;

// ---- Slider de grosor (lápiz / borrador) ----
function SizeSlider({ size, setSize }) {
  const barX = useRef(0);
  const barRef = useRef(null);

  const thumbPos = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * SLIDER_WIDTH;

  const updateFromPageX = (pageX) => {
    let relative = pageX - barX.current;
    relative = Math.max(0, Math.min(SLIDER_WIDTH, relative));
    const newSize = Math.round(
      MIN_SIZE + (relative / SLIDER_WIDTH) * (MAX_SIZE - MIN_SIZE)
    );
    setSize(newSize);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => updateFromPageX(evt.nativeEvent.pageX),
      onPanResponderMove: (evt) => updateFromPageX(evt.nativeEvent.pageX),
    })
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
  const [tool, setTool] = useState("none");
  const [selectedColor, setSelectedColor] = useState("#E24B4A");
  const [brushSize, setBrushSize] = useState(7);

  // Trazos de lápiz
  const [currentStroke, setCurrentStroke] = useState([]);
  const [strokes, setStrokes] = useState([]);

  // Trazos de borrador (se usan como máscara, no se pintan directo)
  const [currentEraserStroke, setCurrentEraserStroke] = useState([]);
  const [eraserStrokes, setEraserStrokes] = useState([]);

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
    }
  }

  function clearCanvas() {
    setCurrentStroke([]);
    setStrokes([]);
    setCurrentEraserStroke([]);
    setEraserStrokes([]);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo-kidintime.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => {
              clearCanvas();
              setTool("none");
            }}
          >
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Image
          source={require("@/assets/images/Dinotext.png")}
          style={styles.titulo}
          resizeMode="contain"
        />

        {/* Herramientas */}
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

        {/* Colores */}
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

        {/* Slider de grosor: aparece con lápiz o borrador */}
        {(tool === "pencil" || tool === "eraser") && (
          <SizeSlider size={brushSize} setSize={setBrushSize} />
        )}

        {/* Zona de dibujo */}
        <View style={styles.dinoContainer}>
          <View style={{ width, height: CANVAS_HEIGHT, position: "relative" }}>
            {/* ========= CAPA 1 ========= */}
            <Image
              source={require("@/assets/images/Dino.jpg")}
              style={{ position: "absolute", width, height: CANVAS_HEIGHT }}
              resizeMode="contain"
            />

            {/* ========= CAPA 2 ========= */}
            <PanGestureHandler
              enabled={tool !== "none"}
              onGestureEvent={onGestureEvent}
              onEnded={onGestureEnd}
            >
              <View style={{ position: "absolute", width, height: CANVAS_HEIGHT }}>
                <Svg width={width} height={CANVAS_HEIGHT}>
                  <Defs>
                    {/*
                      FIX: antes había UNA sola máscara global que tapaba
                      TODOS los trazos del lápiz (pasados y futuros) en las
                      zonas borradas. Por eso, al borrar, ya no se podía
                      pintar de nuevo ahí.

                      Ahora cada trazo tiene su propia máscara que solo
                      contiene los borrones que ocurrieron DESPUÉS de que
                      ese trazo fue dibujado. Así, si pintas de nuevo sobre
                      una zona ya borrada, el nuevo trazo se ve con normalidad.
                    */}
                    {strokes.map((stroke) => {
                      const relevantErasers = eraserStrokes.filter(
                        (e) => e.id > stroke.id
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

                    {/* Máscara para el trazo que se está dibujando ahora mismo */}
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

                  {/* Trazos guardados, cada uno con su propia máscara (si aplica) */}
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

                  {/* Trazo de lápiz en vivo */}
                  {currentStroke.length > 1 && (
                    <Path
                      d={pointsToPath(currentStroke)}
                      stroke={selectedColor}
                      strokeWidth={brushSize}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      mask={eraserStrokes.length > 0 ? "url(#mask-current)" : undefined}
                    />
                  )}

                  {/* Vista previa del borrador mientras se usa (no afecta nada hasta soltar) */}
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

        {/* Barra inferior */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navBtn}>
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
        </View>
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
  closeIcon: { width: 36, height: 36, top: -25 },
  titulo: { width: width * 0.80, height: 100, marginTop: -45 },
  tools: { flexDirection: "row", gap: 29, marginTop: -10, marginBottom:1 },
  toolIcon: { width: 55, height: 55, opacity: 0.5 },
  toolActive: { opacity: 1, transform: [{ scale: 1.15 }] },
  palette: { flexDirection: "row", gap: 10, marginVertical: 14, marginBottom: 20 },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotActive: { borderColor: "#333", transform: [{ scale: 1.2 }] },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
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
  dinoContainer: { flex: 1, width: "100%", alignItems: "center", justifyContent: "flex-end" },
  grass: {
    width: "100%",
    height: 35,
    backgroundColor: "#7BC67E",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60 ,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    marginBottom: -10,
  },
  navBtn: { alignItems: "center", justifyContent: "center", padding: 10 },
  navIcon: { width: 28, height: 28 },
});
