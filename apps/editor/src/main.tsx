import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ margin: 0 }}>Editor is running ✅</h1>
      <p style={{ opacity: 0.8 }}>Next: plug in Asset Dashboard + AI Preview Panel.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
