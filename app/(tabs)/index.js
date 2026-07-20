import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ANIMALS = [
  { id: 'dino', label: 'Dinosaurio', image: require('@/assets/images/Dino.jpg') },
  { id: 'koala', label: 'koala', image: require('@/assets/images/Dino.jpg') },
  { id: 'gato', label: 'Gato', image: require('@/assets/images/Dino.jpg') },
  { id: 'leon', label: 'León', image: require('@/assets/images/Dino.jpg') },
];

export default function InicioScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
      <Text style={styles.title}>Pinta a tu animal favorito</Text>

      <View style={styles.grid}>
        {ANIMALS.map((animal) => (
          <TouchableOpacity
            key={animal.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/draw', params: { animal: animal.id } })
            }
          >
            <Image source={animal.image} style={styles.cardImage} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.relleno}>Lienzo en blanco para expandir tu creatividad</Text>

      <View style={styles.banner}>
        <View style={styles.bannerImageBox} /> 
        <Text style={styles.relleno}>Crrea, colorea y divierte con nuestro</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  },
  bannerImageBox: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#378ADD',
    borderRadius: 10,
  },
  bannerLines: { flex: 1, gap: 8 },
  bannerLine: { height: 6, borderRadius: 3, backgroundColor: '#222' },
});
