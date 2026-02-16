import React, { useState } from "react";
import Icon from "./Icon";

export default function Sidebar() {
  const [activeAction, setActiveAction] = useState("MOTION");

  const actionMenu = {
    MOTION: {
      actionColor: "#4c97ff",
      items: [
        {
          type: "moveSteps",
          params: { steps: 10 },
          bgColor: "bg-blue-500",
          component: (params, setParams) => (
            <>
              Move{" "}
              <input
                type="number"
                value={params.steps}
                onChange={(e) =>
                  setParams({
                    ...params,
                    steps: parseInt(e.target.value),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-blue-600 text-white border-none px-1 mx-1 rounded"
              />{" "}
              steps
            </>
          ),
        },
        {
          type: "turnRight",
          params: { degrees: 15 },
          bgColor: "bg-blue-500",
          component: (params, setParams) => (
            <>
              Turn <Icon name="redo" size={15} className="text-white mx-2" />
              <input
                type="number"
                value={params.degrees}
                onChange={(e) =>
                  setParams({
                    ...params,
                    degrees: parseInt(e.target.value),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-blue-600 text-white border-none px-1 mx-1 rounded"
              />{" "}
              degrees
            </>
          ),
        },
        {
          type: "turnLeft",
          params: { degrees: 15 },
          bgColor: "bg-blue-500",
          component: (params, setParams) => (
            <>
              Turn <Icon name="undo" size={15} className="text-white mx-2" />
              <input
                type="number"
                value={params.degrees}
                onChange={(e) =>
                  setParams({
                    ...params,
                    degrees: parseInt(e.target.value),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-blue-600 text-white border-none px-1 mx-1 rounded"
              />{" "}
              degrees
            </>
          ),
        },
        {
          type: "goToXY",
          params: { x: 0, y: 0 },
          bgColor: "bg-blue-500",
          component: (params, setParams) => (
            <>
              Go to x:{" "}
              <input
                type="number"
                placeholder="0"
                value={params.x}
                onChange={(e) =>
                  setParams({ ...params, x: parseInt(e.target.value) })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-blue-600 text-white border-none px-1 mx-1 rounded"
              />
              y:{" "}
              <input
                type="number"
                placeholder="0"
                value={params.y}
                onChange={(e) =>
                  setParams({ ...params, y: parseInt(e.target.value) })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-blue-600 text-white border-none px-1 mx-1 rounded"
              />
            </>
          ),
        },
      ],
    },
    LOOKS: {
      actionColor: "#9966ff",
      items: [
        {
          type: "say",
          params: { text: "Hello!", seconds: 2 },
          bgColor: "bg-purple-500",
          component: (params, setParams) => (
            <>
              Say{" "}
              <input
                type="text"
                value={params.text || "Hello!"}
                onChange={(e) => setParams({ ...params, text: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-20 bg-purple-600 text-white border-none px-1 mx-1 rounded"
              />
              for{" "}
              <input
                type="number"
                value={params.seconds || 2}
                onChange={(e) =>
                  setParams({
                    ...params,
                    seconds: parseFloat(e.target.value) || 2,
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-purple-600 text-white border-none px-1 mx-1 rounded"
              />{" "}
              seconds
            </>
          ),
        },
        {
          type: "think",
          params: { text: "Hmm...", seconds: 2 },
          bgColor: "bg-purple-500",
          component: (params, setParams) => (
            <>
              Think{" "}
              <input
                type="text"
                value={params.text || "Hmm..."}
                onChange={(e) => setParams({ ...params, text: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-20 bg-purple-600 text-white border-none px-1 mx-1 rounded"
              />
              for{" "}
              <input
                type="number"
                value={params.seconds || 2}
                onChange={(e) =>
                  setParams({
                    ...params,
                    seconds: parseFloat(e.target.value) || 2,
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 bg-purple-600 text-white border-none px-1 mx-1 rounded"
              />{" "}
              seconds
            </>
          ),
        },
      ],
    },
    CONTROLS: {
      actionColor: "#ffab19",
      items: [
        {
          type: "repeat",
          params: { times: 10 },
          bgColor: "bg-orange-500",
          component: (params, setParams) => (
            <>
              Repeat{" "}
              <input
                type="number"
                value={params.times}
                onChange={(e) =>
                  setParams({
                    ...params,
                    times: parseInt(e.target.value),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 text-black border-none px-1 mx-1 rounded"
              />
            </>
          ),
        },
      ],
    },
  };

  const DraggableBlock = ({ template, bgColor }) => {
    const [localParams, setLocalParams] = useState(template.params);

    const handleDragStart = (e) => {
      const blockData = {
        id: Date.now(),
        type: template.type,
        params: { ...localParams },
      };

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify(blockData));
      e.dataTransfer.setData("text/plain", JSON.stringify(blockData)); // Fallback
    };

    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className={`text-white px-2 py-1 my-2 text-sm cursor-move hover:opacity-90 flex flex-row flex-wrap items-center select-none rounded-lg`}
        style={{ background: bgColor }}
      >
        {typeof template.component === "function"
          ? template.component(localParams, setLocalParams)
          : template.component}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto flex items-start p-2 border-r border-gray-200">
      <div
        className="border-r-2 h-full flex flex-col items-center"
        style={{ minWidth: 50 }}
      >
        {Object.keys(actionMenu).map((ele) => (
          <div
            className={`w-full text-xs flex flex-col items-center cursor-pointer py-2 capitalize ${
              activeAction === ele && "bg-gray-300"
            }`}
            onClick={() => setActiveAction(ele)}
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{ background: actionMenu[ele]["actionColor"] }}
            />
            {ele.toLowerCase()}
          </div>
        ))}
      </div>
      <div className="pl-2" style={{ width: 250 }}>
        {actionMenu[activeAction]["items"].map((item) => (
          <DraggableBlock
            key={item.type}
            template={item}
            bgColor={actionMenu[activeAction]["actionColor"]}
          />
        ))}
      </div>
    </div>
  );
}
