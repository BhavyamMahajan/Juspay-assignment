import React, { createContext, useContext, useState, useRef } from "react";

const ScratchContext = createContext();

export const useScratch = () => useContext(ScratchContext);

export const ScratchProvider = ({ children }) => {
  const [sprites, setSprites] = useState([
    { id: 1, name: "Sprite1", x: 0, y: 0, direction: 0, actions: [] },
  ]);
  const [selectedSprite, setSelectedSprite] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRefs = useRef({});

  return (
    <ScratchContext.Provider
      value={{
        sprites,
        setSprites,
        selectedSprite,
        setSelectedSprite,
        isPlaying,
        setIsPlaying,
        animationRefs,
      }}
    >
      {children}
    </ScratchContext.Provider>
  );
};
