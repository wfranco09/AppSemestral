import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions, Image, KeyboardAvoidingView,
    Platform, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function RegistroScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');

  const puedeContinuar = nombre.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Fondo con animales arriba */}
      <View style={styles.fondoContainer}>
        <Image
          source={require('@/assets/images/Bienvenida.png')}
          style={styles.fondo}
          resizeMode="cover"
        />
      </View>

      {/* Formulario abajo: simple, grande, amigable */}
      <View style={styles.formContainer}>
        <Text style={styles.pregunta}>¿Cómo te llamas? 🐾</Text>

        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Escribe tu nombre"
          placeholderTextColor="#aaa"
          autoFocus
          maxLength={20}
        />

        <TouchableOpacity
          style={[styles.boton, !puedeContinuar && styles.botonDeshabilitado]}
          disabled={!puedeContinuar}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.botonTexto}>¡Vamos a pintar! →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fondoContainer: {
    height: height * 0.45,
    width,
    overflow: 'hidden',
  },
  fondo: {
    width,
    height: height * 0.45,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pregunta: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#378ADD',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  boton: {
    marginTop: 28,
    width: '100%',
    backgroundColor: '#378ADD',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#B5D4F4',
  },
  botonTexto: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
});
