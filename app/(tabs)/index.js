//import ANIMALS from '@/utils/animalAssets';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InicioScreen() {
  const router = useRouter();

const ANIMALS = [
  {
    id: "dino",
    label: "Dinosaurio",
    image: require("@/assets/images/Dino.jpg"),
  },
  {
    id: "koala",
    label: "Koala",
    image: require("@/assets/images/Koala.jpg"),
  },
  {
    id: "gato",
    label: "Gato",
    image: require("@/assets/images/Gato.jpg"),
  },
  {
    id: "leon",
    label: "León",
    image: require("@/assets/images/Leon.png"),
  },
];

export default function InicioScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo-kidintime.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Pinta a tu animal favorito</Text>

      <View style={styles.grid}>
        {ANIMALS.map((animal) => (
          <TouchableOpacity
            key={animal.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/draw",
                params: {
                  animal: animal.id,
                },
              })
            }
          >
            <Image
              source={animal.image}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.relleno}>Lienzo en blanco para expandir tu creatividad</Text>

      <TouchableOpacity
        style={styles.banner}
        onPress={() =>
          router.push({
            pathname: "/draw",
            params: {
              animal: "libre",
            },
          })
        }
      >
        <View style={styles.bannerImageBox}>
          <Image
            source={require("@/assets/images/lapiz.png")}
            style={styles.bannerIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.bannerText}>Crea, colorea y diviértete con tu propio lienzo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { alignItems: 'center', paddingBottom: 30 },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: { width: 150, height: 80, top: 25 },


  title: { fontSize: 16, fontWeight: '600', marginTop: 30, marginBottom: 16, left: -60 },
  relleno: { fontSize: 14, color: '#888', marginTop: 20, marginBottom: 10 , left: -20},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
    closeIcon: { width: 36, height: 36, top: 25 },

  card: {
    width: 150,
    height: 190,
    borderWidth: 2,
    borderColor: '#378ADD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardImage: { width: '85%', height: '85%' },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    marginTop: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    gap: 14,
    marginTop: 18,
    borderWidth: 2,
    borderColor: '#378ADD',
    borderRadius: 10,
    padding: 12,
  },
  bannerImageBox: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#378ADD',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: { width: 34, height: 34 },
  bannerText: { flex: 1, fontSize: 13, color: '#444', fontWeight: '500' },
  bannerLines: { flex: 1, gap: 8 },
  bannerLine: { height: 6, borderRadius: 3, backgroundColor: '#222' },
});