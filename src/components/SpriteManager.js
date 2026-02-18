import React, { useEffect, useState } from "react";
import { useScratch } from "../context/ScratchContext";

export default function SpriteManager() {
  const { sprites, setSprites, selectedSprite, setSelectedSprite } =
    useScratch();

  const [activeSpriteInfo, setActiveSpriteInfo] = useState({});

  const addSprite = () => {
    const newSprite = {
      id: Date.now(),
      name: `Sprite${sprites.length + 1}`,
      x: 0,
      y: 0,
      direction: 0,
      actions: [],
    };
    setSprites((prev) => [...prev, newSprite]);
    setSelectedSprite(newSprite.id);
  };

  useEffect(() => {
    for (const item of sprites) {
      if (item.id === selectedSprite) {
        setActiveSpriteInfo(item);
        break;
      }
    }
  }, [selectedSprite, sprites]);

  return (
    <div>
      <div className="border-b border-gray-200 p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold">Sprites</div>
          <button
            onClick={addSprite}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            + Add Sprite
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sprites.map((sprite, idx) => (
            <div
              key={sprite.id}
              onClick={() => setSelectedSprite(sprite.id)}
              className={`relative px-3 py-1 rounded cursor-pointer ${
                selectedSprite === sprite.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {sprite.name}
              {!!idx && (
                <span
                  className="absolute z-10 bg-blue-500 rounded-full pb-1 flex items-center justify-center"
                  style={{
                    top: -9,
                    right: -9,
                    width: 20,
                    height: 20,
                    border: "1px solid #fff",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedSprite === sprite.id && idx) {
                      setSelectedSprite(sprites[idx - 1].id);
                    }
                    const sp = [...sprites];
                    sp.splice(idx, 1);
                    setSprites(sp);
                  }}
                >
                  x
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-10 p-2">
        <p>
          &#8596; x:{" "}
          <span className="border border-gray-200 py-1 px-4 rounded-full">
            {activeSpriteInfo?.x ? activeSpriteInfo?.x?.toFixed(2) : 0}
          </span>
        </p>
        <p>
          &#8597; y:{" "}
          <span className="border border-gray-200 py-1 px-4 rounded-full">
            {activeSpriteInfo?.y ? activeSpriteInfo?.y?.toFixed(2) : 0}
          </span>
        </p>
      </div>
    </div>
  );
}
