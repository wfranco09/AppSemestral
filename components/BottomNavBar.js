import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ITEMS = [
  {
    name: "inicio",
    label: "Inicio",
    icon: require("@/assets/images/inicio1.png"),
  },
  {
    name: "galeria",
    label: "Galería",
    icon: require("@/assets/images/galeria.png"),
  },
  {
    name: "perfil",
    label: "Perfil",
    icon: require("@/assets/images/user.png"),
  },
];

export default function BottomNavBar({ activeRoute, onNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeRoute === item.name;

        return (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            hitSlop={8}
            onPress={() => onNavigate?.(item.name)}
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.navButtonPressed,
            ]}
          >
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Image
                source={item.icon}
                resizeMode="contain"
                style={[styles.icon, isActive && styles.iconActive]}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#D9E2EC",
  },
  navButton: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 18,
  },
  navButtonPressed: {
    opacity: 0.65,
  },
  iconBox: {
    width: 48,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
  iconBoxActive: {
    backgroundColor: "#EAF4FF",
  },
  icon: {
    width: 28,
    height: 28,
    opacity: 0.7,
  },
  iconActive: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
});
