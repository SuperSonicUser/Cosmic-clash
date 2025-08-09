import React, { useEffect, useRef, useState } from 'react';     
import { Text, Animated } from 'react-native';

export default function TypewriterText({
  text,
  speed = 35,       // ms per character
  delay = 300,       // initial delay before typing
  loop = false,      // repeat after finish
  showCursor = true, // blinking cursor
  cursorChar = '▌',  // symbol for cursor
  style,
}) {
  const [shown, setShown] = useState('');
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  // Blink animation for cursor
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!showCursor) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [cursorOpacity, showCursor]);

  // Typing effect
  useEffect(() => {
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      timerRef.current = setInterval(() => {
        idxRef.current += 1;
        const next = text.slice(0, idxRef.current);
        setShown(next);

        if (idxRef.current >= text.length) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (loop) {
            setTimeout(() => {
              idxRef.current = 0;
              setShown('');
              start();
            }, 700);
          }
        }
      }, speed);
    };

    const kickoff = setTimeout(start, delay);

    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, speed, delay, loop]);

  return (
    <Text style={style}>
      {shown}
      {showCursor ? (
        <Animated.Text style={{ opacity: cursorOpacity }}>
          {cursorChar}
        </Animated.Text>
      ) : null}
    </Text>
  );
}
