import { loadData, saveData } from '@/utils/storage';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const STORAGE_KEY = 'kidintime_perfiles';

export default function PerfilScreen() {
  const [nombre, setNombre] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Cargar datos guardados al abrir la pantalla
  useEffect(() => {
    (async () => {
      const guardados = await loadData(STORAGE_KEY, []);
      setPerfiles(guardados);
      setLoaded(true);
    })();
  }, []);

  // Guardar automáticamente cada vez que cambia la lista
  useEffect(() => {
    if (loaded) saveData(STORAGE_KEY, perfiles);
  }, [perfiles, loaded]);

  function agregarPerfil() {
    const limpio = nombre.trim();
    if (!limpio) return;
    setPerfiles((prev) => [...prev, { id: Date.now().toString(), nombre: limpio }]);
    setNombre('');
  }

  function eliminarPerfil(id) {
    setPerfiles((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-kidintime.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.addRow}>
        <TouchableOpacity style={styles.avatarBox}>
          <Text style={styles.avatarPlus}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nombre del niño/a"
          value={nombre}
          onChangeText={setNombre}
          onSubmitEditing={agregarPerfil}
          returnKeyType="done"
        />
      </View>

      {perfiles.length === 0 && (
        <Text style={styles.empty}>Aún no hay perfiles guardados</Text>
      )}

      {perfiles.map((perfil) => (
        <View key={perfil.id} style={styles.itemRow}>
          <Text style={styles.itemText}>{perfil.nombre}</Text>
          <TouchableOpacity onPress={() => eliminarPerfil(perfil.id)}>
            <Text style={styles.deleteX}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 20 },
  logo: { width: 160, height: 60, marginBottom: 20 },
  addRow: { flexDirection: 'row', alignItems: 'center', width: '85%', gap: 14, marginBottom: 20 },
  avatarBox: {
    width: 55,
    height: 55,
    borderWidth: 2,
    borderColor: '#378ADD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlus: { fontSize: 24, color: '#378ADD' },
  input: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#222',
    fontSize: 16,
    paddingVertical: 4,
  },
  empty: { color: '#999', marginTop: 10 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  itemText: { fontSize: 15, color: '#222' },
  deleteX: { fontSize: 16, color: '#E24B4A', paddingHorizontal: 6 },
});
