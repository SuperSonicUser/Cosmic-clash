// state/SettingsContext.js
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext({
  musicOn: true,
  setMusicOn: () => {},
  sfxOn: true,
  setSfxOn: () => {},
  hapticsOn: true,
  setHapticsOn: () => {},
});

export function SettingsProvider({ children }) {
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);

  return (
    <SettingsContext.Provider value={{ musicOn, setMusicOn, sfxOn, setSfxOn, hapticsOn, setHapticsOn }}>
      {children}
    </SettingsContext.Provider>
  );
}
