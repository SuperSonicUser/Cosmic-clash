import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // make sure you have react-navigation
import Svg, { Circle, Rect } from 'react-native-svg';

// Game constants
const PLAYER_R = 16;
const MAX_LIVES = 3;

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}

export default function Game({ navigation }) {
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);

  // Player position
  const playerRef = useRef({ x: SCREEN_W / 2, y: SCREEN_H * 0.8 });
  const [player, setPlayer] = useState(playerRef.current);
  const startRef = useRef({ x: playerRef.current.x, y: playerRef.current.y });

  // Objects
  const objectsRef = useRef([]); // {id, type:'enemy'|'coin', x,y, size, vy}
  const [objects, setObjects] = useState([]);

  // Timing
  const lastTimeRef = useRef(0);
  const spawnAccRef = useRef(0);
  const spawnIntervalRef = useRef(800); // ms, decreases over time
  const diffAccRef = useRef(0);

  const rafRef = useRef(null);

  const loop = (t = 0) => {
    if (gameOver) {
      // stop scheduling frames
      rafRef.current = null;
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = t;
    const dt = Math.min(32, t - lastTimeRef.current); // ms clamp
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
      const size = isEnemy ? 16 + Math.random() * 24 : 12;
      const x = 20 + Math.random() * (SCREEN_W - 40);
      const y = -40;
      const vy = isEnemy ? 250 + Math.random() * 220 : 220 + Math.random() * 180;
      const id = String(Date.now()) + Math.random();
      objectsRef.current.push({ id, type: isEnemy ? 'enemy' : 'coin', x, y, size, vy });
    }

    // Update objects
    const next = [];
    for (const o of objectsRef.current) {
      const ny = o.y + (o.vy * dt) / 1000;
      if (ny < SCREEN_H + 80) {
        o.y = ny;

        // collision with player
        const dx = o.x - playerRef.current.x;
        const dy = o.y - playerRef.current.y;
        const dist2 = dx * dx + dy * dy;
        const collDist = (o.type === 'coin' ? o.size : o.size * 0.7) + PLAYER_R;

        if (dist2 <= collDist * collDist) {
          if (o.type === 'coin') {
            setScore((s) => {
              const nextScore = s + 1;
              if (nextScore % 10 === 0) {
                setLives((l) => Math.min(MAX_LIVES, l + 1));
              }
              return nextScore;
            });
          } else {
            setLives((l) => {
              const nl = l - 1;
              if (nl <= 0) setGameOver(true);
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

    // schedule next frame
    rafRef.current = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const reset = () => {
    stopLoop();
    setScore(0);
    setLives(MAX_LIVES);
    setGameOver(false);

    playerRef.current = { x: SCREEN_W / 2, y: SCREEN_H * 0.8 };
    setPlayer(playerRef.current);
    startRef.current = { ...playerRef.current };

    objectsRef.current = [];
    setObjects([]);
    spawnIntervalRef.current = 800;
    lastTimeRef.current = 0;
    spawnAccRef.current = 0;
    diffAccRef.current = 0;

    startLoop();
  };

  // Start on mount; stop on unmount
  useEffect(() => {
    reset();
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop loop when screen blurs (navigate away), resume when focused and not game over
  useFocusEffect(
    React.useCallback(() => {
      if (!gameOver && !rafRef.current) startLoop();
      return () => stopLoop();
    }, [gameOver])
  );

  // Pan to move player
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = { ...playerRef.current };
      },
      onPanResponderMove: (_, gesture) => {
        if (gameOver) return;
        const x = clamp(startRef.current.x + gesture.dx, PLAYER_R, SCREEN_W - PLAYER_R);
        const y = clamp(startRef.current.y + gesture.dy, PLAYER_R, SCREEN_H - PLAYER_R);
        playerRef.current = { x, y };
        setPlayer(playerRef.current);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const endGameNow = () => setGameOver(true);

  return (
    <View style={styles.game} {...panResponder.panHandlers}>
      {/* HUD */}
      <View style={styles.hud}>
        <Text style={styles.badge}>★ {score}</Text>
        <Text style={styles.badge}>❤︎ {lives}</Text>

        {/* End Game button (replaces Pause) */}
        <Pressable onPress={endGameNow} style={styles.button}>
          <Text style={styles.buttonLabel}>End</Text>
        </Pressable>
      </View>

      {/* Scene */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
        {/* Player */}
        <Circle cx={player.x} cy={player.y} r={PLAYER_R} fill="#ffffff" />
        {/* Objects */}
        {objects.map((o) =>
          o.type === 'enemy' ? (
            <Rect
              key={o.id}
              x={o.x - o.size / 2}
              y={o.y - o.size / 2}
              width={o.size}
              height={o.size}
              rx={6}
              fill="#ff2d55"
            />
          ) : (
            <Circle key={o.id} cx={o.x} cy={o.y} r={o.size} fill="#ffd60a" />
          )
        )}
      </Svg>

      {/* Game Over modal */}
      {gameOver && (
        <View style={[styles.modal, { top: SCREEN_H / 2 - 120 }]}>
          <Text style={styles.gameOver}>Game Over</Text>
          <Text style={styles.modalText}>Score: {score}</Text>
          <View style={styles.modalRow}>
            <Pressable style={[styles.cta, styles.ctaPrimary]} onPress={reset}>
              <Text style={styles.ctaLabel}>Restart</Text>
            </Pressable>
            <Pressable
              style={styles.cta}
              onPress={() => {
                // if you have a Settings screen wired in navigation:
                if (navigation?.navigate) navigation.navigate('Settings');
              }}
            >
              <Text style={styles.ctaLabel}>Settings</Text>
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
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  button: {
    height: 44,
    minWidth: 64,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modal: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  gameOver: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 8 },
  modalText: { color: '#ddd', fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 12 },
  cta: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 6,
  },
  ctaPrimary: { backgroundColor: '#1e90ff', borderColor: '#1e90ff' },
  ctaLabel: { color: '#fff', fontWeight: '800' },
});
