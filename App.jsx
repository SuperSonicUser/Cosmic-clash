
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Pressable } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

// Game constants
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PLAYER_R = 16;
const MAX_LIVES = 3;

function clamp(v, min, max){ return Math.max(min, Math.min(v, max)); }

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Game />
    </View>
  );
}

function Game(){
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Player position
  const playerRef = useRef({ x: SCREEN_W/2, y: SCREEN_H * 0.8 });
  const [player, setPlayer] = useState(playerRef.current);

  // Objects
  const objectsRef = useRef([]); // {id, type:'enemy'|'coin', x,y, size, vy}
  const [objects, setObjects] = useState([]);

  // Timing
  const lastTimeRef = useRef(0);
  const spawnAccRef = useRef(0);
  const spawnIntervalRef = useRef(800); // ms, decreases over time
  const diffAccRef = useRef(0);

  const rafRef = useRef(null);

  const reset = () => {
    setScore(0);
    setLives(MAX_LIVES);
    setPaused(false);
    setGameOver(false);
    playerRef.current = { x: SCREEN_W/2, y: SCREEN_H * 0.8 };
    setPlayer(playerRef.current);
    objectsRef.current = [];
    setObjects([]);
    spawnIntervalRef.current = 800;
    lastTimeRef.current = 0;
    spawnAccRef.current = 0;
    diffAccRef.current = 0;
    loop();
  };

  useEffect(() => { reset(); return () => cancelAnimationFrame(rafRef.current); }, []);

  // Pan to move player
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const x = clamp(playerRef.current.x + gesture.dx, PLAYER_R, SCREEN_W - PLAYER_R);
        const y = clamp(playerRef.current.y + gesture.dy, PLAYER_R, SCREEN_H - PLAYER_R);
        playerRef.current = { x, y };
        setPlayer(playerRef.current);
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  // Game loop
  const loop = (t=0) => {
    if (paused || gameOver) { rafRef.current = requestAnimationFrame(loop); return; }
    if (!lastTimeRef.current) lastTimeRef.current = t;
    const dt = Math.min(32, t - lastTimeRef.current); // ms
    lastTimeRef.current = t;

    // Increase difficulty
    diffAccRef.current += dt;
    if (diffAccRef.current > 5000) {
      diffAccRef.current = 0;
      spawnIntervalRef.current = Math.max(250, spawnIntervalRef.current - 40);
    }

    // Spawn
    spawnAccRef.current += dt;
    if (spawnAccRef.current > spawnIntervalRef.current) {
      spawnAccRef.current = 0;
      const isEnemy = Math.random() < 0.55;
      const size = isEnemy ? (16 + Math.random()*24) : 12;
      const x = 20 + Math.random()*(SCREEN_W-40);
      const y = -40;
      const vy = isEnemy ? (250 + Math.random()*220) : (220 + Math.random()*180);
      const id = String(Date.now()) + Math.random();
      objectsRef.current.push({ id, type: isEnemy?'enemy':'coin', x, y, size, vy });
    }

    // Update objects
    const next = [];
    for (const o of objectsRef.current) {
      const ny = o.y + (o.vy * dt / 1000);
      if (ny < SCREEN_H + 80) {
        o.y = ny;
        // collision with player
        const dx = o.x - playerRef.current.x;
        const dy = o.y - playerRef.current.y;
        const dist2 = dx*dx + dy*dy;
        const collDist = (o.type === 'coin' ? o.size : o.size*0.7) + PLAYER_R;
        if (dist2 <= collDist*collDist) {
          if (o.type === 'coin') {
            setScore(s => s + 1);
            // heal occasionally
            if ((score+1) % 10 === 0) setLives(l => Math.min(MAX_LIVES, l+1));
          } else {
            // hit
            setLives(l => {
              const nl = l - 1;
              if (nl <= 0) { setGameOver(true); }
              return nl;
            });
          }
          continue; // remove collided object
        }
        next.push(o);
      }
    }
    objectsRef.current = next;
    setObjects(next);

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, gameOver]);

  return (
    <View style={styles.game} {...panResponder.panHandlers}>
      <View style={styles.hud}>
        <Text style={styles.badge}>★ {score}</Text>
        <Text style={styles.badge}>❤︎ {lives}</Text>
        <Pressable onPress={() => setPaused(p => !p)} style={styles.button}>
          <Text style={styles.buttonLabel}>{paused ? '▶' : 'II'}</Text>
        </Pressable>
      </View>

      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        {/* Player */}
        <Circle cx={player.x} cy={player.y} r={PLAYER_R} fill="#ffffff" />
        {/* Objects */}
        {objects.map(o => o.type === 'enemy' ? (
          <Rect key={o.id} x={o.x - o.size/2} y={o.y - o.size/2} width={o.size} height={o.size} rx={6} fill="#ff2d55" />
        ) : (
          <Circle key={o.id} cx={o.x} cy={o.y} r={o.size} fill="#ffd60a" />
        ))}
      </Svg>

      {gameOver && (
        <View style={styles.modal}>
          <Text style={styles.gameOver}>Game Over</Text>
          <Text style={styles.modalText}>Score: {score}</Text>
          <View style={styles.modalRow}>
            <Pressable style={[styles.cta, styles.ctaPrimary]} onPress={reset}>
              <Text style={styles.ctaLabel}>Restart</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  game: { flex: 1, backgroundColor: '#000' },
  hud: {
    position: 'absolute', top: 40, left: 16, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  badge: {
    color: '#fff', fontSize: 20, fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999
  },
  button: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center'
  },
  buttonLabel: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modal: {
    position: 'absolute', left: 24, right: 24, top: SCREEN_H/2 - 120,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20, borderRadius: 16, alignItems: 'center'
  },
  gameOver: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 8 },
  modalText: { color: '#ddd', fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 12 },
  cta: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ctaPrimary: { backgroundColor: '#1e90ff', borderColor: '#1e90ff' },
  ctaLabel: { color: '#fff', fontWeight: '800' },
});
