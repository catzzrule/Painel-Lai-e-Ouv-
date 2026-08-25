import { useState } from "react";
import { AppShell, type PanelType } from "@/components/app-shell";
import { LaiDashboard } from "@/components/lai-dashboard";
import { OuvidoriaDashboard } from "@/components/ouvidoria-dashboard";

function App() {
  const [activePanel, setActivePanel] = useState<PanelType>("lai");

  return (
    <AppShell activePanel={activePanel} setActivePanel={setActivePanel}>
      {activePanel === "lai" ? (
        <LaiDashboard />
      ) : (
        <OuvidoriaDashboard />
      )}
    </AppShell>
  );
}

export default App;
