import React, { useState } from "react";
import { useScratch } from "../context/ScratchContext";
import Icon from "./Icon";

export default function MidArea() {
  const { sprites, selectedSprite, setSprites } = useScratch();
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);

  const selectedSpriteData = sprites.find((s) => s.id === selectedSprite);
  const blocks = selectedSpriteData?.actions || [];

  const handleDrop = (e, dropIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverIndex(null);
    setIsDraggingFromSidebar(false);

    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const blockData = JSON.parse(jsonData);
        if (blockData && blockData.type) {
          const newBlock = {
            id: blockData.id || Date.now(),
            type: blockData.type,
            params: { ...blockData.params },
          };

          setSprites((prev) =>
            prev.map((sprite) => {
              if (sprite.id === selectedSprite) {
                const newBlocks = [...sprite.actions];
                if (dropIndex !== null && dropIndex >= 0) {
                  newBlocks.splice(dropIndex, 0, newBlock);
                } else {
                  newBlocks.push(newBlock);
                }
                return { ...sprite, actions: newBlocks };
              }
              return sprite;
            })
          );
        }
        return;
      }

      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
      if (!isNaN(fromIndex) && dropIndex !== null && dropIndex !== fromIndex) {
        moveBlock(fromIndex, dropIndex);
      }
    } catch (error) {
      console.error("Error parsing dropped block:", error);
    }
  };

  const handleDragOver = (e, index = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes("application/json")) {
      setIsDraggingFromSidebar(true);
    }

    setDraggedOverIndex(index);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("application/json")) {
      setIsDraggingFromSidebar(true);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOverIndex(null);
      setIsDraggingFromSidebar(false);
    }
  };

  const removeBlock = (blockId) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === selectedSprite
          ? {
              ...sprite,
              actions: sprite.actions.filter((b) => b.id !== blockId),
            }
          : sprite
      )
    );
  };

  const moveBlock = (fromIndex, toIndex) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === selectedSprite) {
          const newBlocks = [...sprite.actions];
          const [removed] = newBlocks.splice(fromIndex, 1);
          newBlocks.splice(toIndex, 0, removed);
          return { ...sprite, actions: newBlocks };
        }
        return sprite;
      })
    );
  };

  const getBlockColor = (type) => {
    if (["moveSteps", "turnRight", "turnLeft", "goToXY"].includes(type))
      return "#4c97ff";
    if (["say", "think"].includes(type)) return "#9966ff";
    return "#ffab19";
  };

  const getBlockText = (block) => {
    switch (block.type) {
      case "moveSteps":
        return <>Move {block.params.steps} steps</>;
      case "turnRight":
        return (
          <>
            Turn <Icon name="redo" size={15} className="text-white mx-2" />{" "}
            {block.params.degrees} degrees
          </>
        );
      case "turnLeft":
        return (
          <>
            Turn <Icon name="undo" size={15} className="text-white mx-2" />{" "}
            {block.params.degrees} degrees
          </>
        );
      case "goToXY":
        return (
          <>
            Go to x: {block.params.x} y: {block.params.y}
          </>
        );
      case "repeat":
        return <>Repeat {block.params.times}</>;
      case "say":
        return (
          <>
            Say "{block.params.text}" for {block.params.seconds} seconds
          </>
        );
      case "think":
        return (
          <>
            Think "{block.params.text}" for {block.params.seconds} seconds
          </>
        );
      default:
        return block.type;
    }
  };

  return (
    <div className="flex-1 h-full overflow-auto p-4">
      <div className="font-bold mb-4">
        Blocks for {selectedSpriteData?.name || "Sprite"}
      </div>
      <div
        className="space-y-2 min-h-[200px]"
        onDrop={handleDrop}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {blocks.map((block, index) => (
          <div key={block.id} className="relative">
            {draggedOverIndex === index && isDraggingFromSidebar && (
              <div className="h-1 bg-blue-400 mb-1"></div>
            )}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
                setIsDraggingFromSidebar(false);
              }}
              onDragOver={(e) => {
                // Only prevent default if not dragging from sidebar
                if (!e.dataTransfer.types.includes("application/json")) {
                  e.preventDefault();
                  handleDragOver(e, index);
                } else {
                  // Allow sidebar drag to pass through
                  e.preventDefault();
                  setDraggedOverIndex(index);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // If dragging from sidebar, let parent handle it
                if (e.dataTransfer.types.includes("application/json")) {
                  handleDrop(e, index);
                  return;
                }

                // Otherwise, handle reordering
                const fromIndex = parseInt(
                  e.dataTransfer.getData("text/plain")
                );
                if (!isNaN(fromIndex) && fromIndex !== index) {
                  moveBlock(fromIndex, index);
                }
                setDraggedOverIndex(null);
              }}
              className={`text-white px-3 py-2 rounded flex items-center justify-between cursor-move hover:opacity-90`}
              style={{ background: getBlockColor(block.type) }}
            >
              <span className="flex items-center">{getBlockText(block)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
                className="ml-4 text-red-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
          <div
            className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded"
            onDrop={handleDrop}
            onDragOver={(e) => handleDragOver(e)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            Drag blocks from the sidebar here
          </div>
        )}
        {draggedOverIndex === blocks.length && isDraggingFromSidebar && (
          <div className="h-1 bg-blue-400 mt-1"></div>
        )}
      </div>
    </div>
  );
}
