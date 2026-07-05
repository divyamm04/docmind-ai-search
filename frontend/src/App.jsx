import React from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import SearchBox from "./components/SearchBox";

function App() {
  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✨</div>
          <div className="brand-text">
            <span className="brand-title">DocMind</span>
            <span className="brand-subtitle">RESEARCH WORKSPACE</span>
          </div>
        </div>

        <FileUpload />
      </aside>

      <main className="main-panel">
        <div className="main-panel-inner">
          <SearchBox />
        </div>
      </main>
    </div>
  );
}

export default App;
