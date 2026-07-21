import BottomNavBar from "@/components/BottomNavBar";
import { Tabs } from "expo-router";

function CustomTabBar({ state, navigation }) {
  const activeRoute = state.routes[state.index]?.name;

  function navigateTo(routeName) {
    const targetRoute = state.routes.find((route) => route.name === routeName);

    if (!targetRoute) {
      return;
    }

    const event = navigation.emit({
      type: "tabPress",
      target: targetRoute.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }

  return (
    <BottomNavBar
      activeRoute={activeRoute}
      onNavigate={navigateTo}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: "Inicio" }} />
      <Tabs.Screen name="galeria" options={{ title: "Galería" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
