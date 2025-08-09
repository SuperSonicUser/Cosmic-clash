import React, { useContext } from 'react';
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { SettingsContext } from './SettingsContext';
import Game from './Game';


export default function Settings({ navigation }) {
  const { musicOn, setMusicOn, sfxOn, setSfxOn, hapticsOn, setHapticsOn } = useContext(SettingsContext);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Game')} style={styles.backButton}>
          <Text style={styles.backArrow}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Settings rows */}
      <Row label="Music" value={musicOn} onChange={setMusicOn} />
      <Row label="Sound Effects" value={sfxOn} onChange={setSfxOn} />
      <Row label="Vibrations" value={hapticsOn} onChange={setHapticsOn} />
    </View>
  );
}

function Row({ label, value, onChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 12, padding: 4 },
  backArrow: { color: '#fff', fontSize: 28, fontWeight: '900' },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  label: { color: '#fff', fontSize: 16 },
});
