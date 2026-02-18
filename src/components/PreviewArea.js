import React, { useState, useEffect, useRef } from "react";
import CatSprite from "./CatSprite";
import { useScratch } from "../context/ScratchContext";

const SpriteRenderer = ({ sprite, speechBubble, onPointerDown }) => {
  return (
    <g
      transform={`translate(${sprite.x + 400}, ${sprite.y + 300}) rotate(${
        sprite.direction
      })`}
      style={{ transition: "transform 0.05s linear", cursor: "grab" }}
      onMouseDown={(e) => onPointerDown(e, sprite)}
      onTouchStart={(e) => onPointerDown(e.touches ? e.touches[0] : e, sprite)}
    >
      <foreignObject x="-47.5" y="-50" width="95" height="100">
        <div style={{ width: "95px", height: "100px", touchAction: "none" }}>
          <CatSprite />
        </div>
      </foreignObject>
      {speechBubble && (
        <g>
          <rect
            x={-speechBubble.width / 2}
            y={-60}
            width={speechBubble.width}
            height={25}
            fill="white"
            stroke="black"
            strokeWidth="1"
            rx="5"
          />
          <text
            x={-speechBubble.width / 2 + 5}
            y={-42}
            fontSize="12"
            fill="black"
            textAnchor="start"
          >
            {speechBubble.type === "think" ? "..." : ""}
            {speechBubble.text}
          </text>
        </g>
      )}
    </g>
  );
};

export default function PreviewArea() {
  const { sprites, setSprites, isPlaying, setIsPlaying } = useScratch();
  const [speechBubbles, setSpeechBubbles] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const svgRef = useRef(null);
  const dragRef = useRef(null); // { id, offsetX, offsetY }
  const isDraggingRef = useRef(false);

  // Playground bounds in sprite coordinate space (centered at 0,0)
  const BOUNDS = {
    minX: -352.5, //  -400 + half sprite width (47.5)
    maxX: 352.5, //   400 - half sprite width
    minY: -250, //  -300 + half sprite height (50)
    maxY: 250, //   300 - half sprite height
  };

  const clampPosition = (s) => {
    const clamped = {
      ...s,
      x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, s.x)),
      y: Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, s.y)),
    };
    return clamped;
  };

  // Convert client coords to sprite-space (centered at 0,0)
  const clientToSpriteCoords = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const viewBoxWidth = 800;
    const viewBoxHeight = 600;
    const scaleX = viewBoxWidth / rect.width;
    const scaleY = viewBoxHeight / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;
    // convert to centered coords where (400,300) is origin
    return { x: svgX - viewBoxWidth / 2, y: svgY - viewBoxHeight / 2 };
  };

  const onPointerDown = (event, sprite) => {
    if (isRunning || isPlaying) return;
    event.preventDefault?.();
    const clientX = event.clientX;
    const clientY = event.clientY;
    const point = clientToSpriteCoords(clientX, clientY);
    dragRef.current = {
      id: sprite.id,
      offsetX: point.x - (sprite.x || 0),
      offsetY: point.y - (sprite.y || 0),
    };
    isDraggingRef.current = true;

    // Add listeners
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!isDraggingRef.current || !dragRef.current) return;
    e.preventDefault?.();
    const clientX = e.clientX;
    const clientY = e.clientY;
    moveDraggedSprite(clientX, clientY);
  };

  const onTouchMove = (e) => {
    if (!isDraggingRef.current || !dragRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    moveDraggedSprite(t.clientX, t.clientY);
  };

  const moveDraggedSprite = (clientX, clientY) => {
    const dr = dragRef.current;
    if (!dr) return;
    const point = clientToSpriteCoords(clientX, clientY);
    const newPos = {
      x: point.x - dr.offsetX,
      y: point.y - dr.offsetY,
    };
    const clamped = clampPosition(newPos);

    setSprites((prev) =>
      prev.map((s) =>
        s.id === dr.id ? { ...s, x: clamped.x, y: clamped.y } : s,
      ),
    );
  };

  const onPointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    dragRef.current = null;
    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("mouseup", onPointerUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onPointerUp);
  };

  useEffect(() => {
    return () => {
      // cleanup in case component unmounts mid-drag
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  const executeBlock = async (sprite, block, currentSpriteState) => {
    let updatedSprite = { ...currentSpriteState };

    switch (block.type) {
      case "moveSteps": {
        if (updatedSprite.direction) {
          const angle = ((90 - updatedSprite.direction) * Math.PI) / 180;
          updatedSprite.x += Math.cos(angle) * block.params.steps;
          updatedSprite.y += Math.sin(angle) * block.params.steps;
        } else updatedSprite.x += block.params.steps;

        updatedSprite = clampPosition(updatedSprite);

        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? updatedSprite : s)),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        return updatedSprite;
      }
      case "turnRight": {
        updatedSprite.direction += block.params.degrees;
        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? updatedSprite : s)),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        return updatedSprite;
      }
      case "turnLeft": {
        updatedSprite.direction -= block.params.degrees;
        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? updatedSprite : s)),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        return updatedSprite;
      }
      case "goToXY": {
        updatedSprite.x = block.params.x;
        updatedSprite.y = block.params.y;

        updatedSprite = clampPosition(updatedSprite);

        setSprites((prev) =>
          prev.map((s) => (s.id === sprite.id ? updatedSprite : s)),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        return updatedSprite;
      }
      case "say": {
        const width = block.params.text.length * 7 + 20;
        setSpeechBubbles((prev) => ({
          ...prev,
          [sprite.id]: {
            text: block.params.text,
            type: "say",
            duration: block.params.seconds,
            width: width,
          },
        }));
        await new Promise((resolve) =>
          setTimeout(resolve, block.params.seconds * 1000),
        );
        setSpeechBubbles((prev) => {
          const newBubbles = { ...prev };
          delete newBubbles[sprite.id];
          return newBubbles;
        });
        return updatedSprite;
      }
      case "think": {
        const width = block.params.text.length * 7 + 20;
        setSpeechBubbles((prev) => ({
          ...prev,
          [sprite.id]: {
            text: block.params.text,
            type: "think",
            duration: block.params.seconds,
            width: width,
          },
        }));
        await new Promise((resolve) =>
          setTimeout(resolve, block.params.seconds * 1000),
        );
        setSpeechBubbles((prev) => {
          const newBubbles = { ...prev };
          delete newBubbles[sprite.id];
          return newBubbles;
        });
        return updatedSprite;
      }
      case "repeat": {
        const blockIndex = sprite.actions.indexOf(block);
        const blocksToRepeat = sprite.actions.slice(0, blockIndex);
        let repeatSprite = { ...updatedSprite };
        for (let j = 0; j < block.params.times; j++) {
          for (const nestedBlock of blocksToRepeat) {
            if (nestedBlock.type === "repeat") break;
            repeatSprite = await executeBlock(
              sprite,
              nestedBlock,
              repeatSprite,
            );
          }
        }
        return repeatSprite;
      }
      default:
        return updatedSprite;
    }
  };

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPlaying(true);

    // Reset sprite positions
    setSpeechBubbles({});

    // Create working copies with execution tracking
    const spriteStates = {};
    const spriteExecution = {};

    for (const sprite of sprites) {
      spriteStates[sprite.id] = clampPosition({
        ...sprite,
        x: sprite.x || 0,
        y: sprite.y || 0,
        direction: sprite.direction || 0,
      });
      spriteExecution[sprite.id] = {
        actions: [...sprite.actions],
        currentIndex: 0,
      };
    }

    // Execute all sprites step by step
    const maxActions = Math.max(
      ...Object.values(spriteExecution).map((e) => e.actions.length),
    );

    for (let step = 0; step < maxActions; step++) {
      // Execute one action for each sprite
      for (const spriteId in spriteExecution) {
        const execution = spriteExecution[spriteId];

        if (execution.currentIndex < execution.actions.length) {
          const block = execution.actions[execution.currentIndex];
          spriteStates[spriteId] = await executeBlock(
            {
              ...sprites.find((s) => s.id === parseInt(spriteId)),
              actions: execution.actions,
            },
            block,
            spriteStates[spriteId],
          );
          // Ensure state is clamped after execution
          spriteStates[spriteId] = clampPosition(spriteStates[spriteId]);
          execution.currentIndex++;
        }
      }

      // Check for collisions after this step
      const spriteArray = Object.keys(spriteStates).map((id) => ({
        id: parseInt(id),
        ...spriteStates[id],
      }));

      const collidedPairs = new Set();

      for (let i = 0; i < spriteArray.length; i++) {
        for (let j = i + 1; j < spriteArray.length; j++) {
          const pairKey = `${Math.min(
            spriteArray[i].id,
            spriteArray[j].id,
          )}-${Math.max(spriteArray[i].id, spriteArray[j].id)}`;

          if (
            checkCollision(spriteArray[i], spriteArray[j]) &&
            !collidedPairs.has(pairKey)
          ) {
            collidedPairs.add(pairKey);

            // Reverse movement directions for both sprites
            const exec1 = spriteExecution[spriteArray[i].id];
            const exec2 = spriteExecution[spriteArray[j].id];

            // Reverse steps in remaining actions for sprite 1 (modify the actual actions array)
            for (
              let idx = exec1.currentIndex;
              idx < exec1.actions.length;
              idx++
            ) {
              const block = exec1.actions[idx];
              if (block.type === "moveSteps") {
                block.params.steps = -block.params.steps; // Reverse direction
              }
            }

            // Reverse steps in remaining actions for sprite 2 (modify the actual actions array)
            for (
              let idx = exec2.currentIndex;
              idx < exec2.actions.length;
              idx++
            ) {
              const block = exec2.actions[idx];
              if (block.type === "moveSteps") {
                block.params.steps = -block.params.steps; // Reverse direction
              }
            }

            // Separate sprites slightly to prevent them from being stuck together
            const dx = spriteArray[i].x - spriteArray[j].x;
            const dy = spriteArray[i].y - spriteArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50) {
              // Push them apart slightly
              const separation = 55; // Slightly more than collision threshold
              const angle = Math.atan2(dy, dx);

              const newPosI = clampPosition({
                ...spriteStates[spriteArray[i].id],
                x: spriteArray[j].x + Math.cos(angle) * separation,
                y: spriteArray[j].y + Math.sin(angle) * separation,
              });

              const newPosJ = clampPosition({
                ...spriteStates[spriteArray[j].id],
                // Optional small push in opposite direction if needed
                x: spriteArray[i].x - Math.cos(angle) * separation,
                y: spriteArray[i].y - Math.sin(angle) * separation,
              });

              spriteStates[spriteArray[i].id] = newPosI;
              spriteStates[spriteArray[j].id] = newPosJ;

              // Update the sprite state visible immediately
              setSprites((prev) =>
                prev.map((s) =>
                  s.id === spriteArray[i].id
                    ? { ...s, ...spriteStates[spriteArray[i].id] }
                    : s.id === spriteArray[j].id
                      ? { ...s, ...spriteStates[spriteArray[j].id] }
                      : s,
                ),
              );
            }
          }
        }
      }
    }

    // Save final positions back to sprite state
    setSprites((prev) =>
      prev.map((s) => {
        const finalState = spriteStates[s.id];
        if (finalState) {
          const clamped = clampPosition(finalState);
          return {
            ...s,
            x: clamped.x,
            y: clamped.y,
            direction: clamped.direction,
          };
        }
        return s;
      }),
    );

    setIsPlaying(false);
    setIsRunning(false);
  };

  const checkCollision = (sprite1, sprite2) => {
    const distance = Math.sqrt(
      Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2),
    );
    return distance < 50; // Collision threshold
  };

  return (
    <div className="h-[60%] overflow-hidden p-2 bg-gray-50">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className={`absolute top-6 right-6 px-6 py-2 rounded-lg font-semibold shadow-lg text-white ${
          isRunning
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        Run
      </button>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="border-2 border-gray-300 bg-white rounded"
        style={{ display: "block", touchAction: "none" }}
      >
        {sprites && sprites.length > 0 ? (
          sprites.map((sprite) => (
            <SpriteRenderer
              key={sprite.id}
              sprite={sprite}
              speechBubble={speechBubbles[sprite.id]}
              onPointerDown={onPointerDown}
            />
          ))
        ) : (
          <text x="400" y="300" textAnchor="middle" fill="gray" fontSize="16">
            No sprites available
          </text>
        )}
      </svg>
    </div>
  );
}
