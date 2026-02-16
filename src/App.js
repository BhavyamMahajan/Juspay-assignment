import React from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { ScratchProvider } from "./context/ScratchContext";
import SpriteManager from "./components/SpriteManager";
import "./app.css";

export default function App() {
  return (
    <ScratchProvider>
      <div className="bg-blue-100 pt-20 font-sans">
        <div
          className="overflow-hidden flex flex-row"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div
            className="overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2"
            style={{ flex: 1 }}
          >
            <Sidebar />
            <MidArea />
          </div>
          <div
            className="flex flex-col overflow-hidden bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2"
            style={{ flex: 0.5 }}
          >
            <PreviewArea />
            <SpriteManager />
          </div>
        </div>
      </div>
    </ScratchProvider>
  );
}
