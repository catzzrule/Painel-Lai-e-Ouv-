import { useState } from "react";
import {
  Menu,
  X,
  Building2,
  FileText,
  ShieldAlert,
  MessageSquare,
  Layers,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PanelType = "lai" | "ouvidoria";

interface AppShellProps {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  children: React.ReactNode;
}

export function AppShell({ activePanel, setActivePanel, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo MESP */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#054579] text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              Ministério do Esporte
            </span>
            <span className="text-xs text-sidebar-foreground">
              Paineis de Gestão & Transparência
            </span>
          </div>
        </div>

        {/* Seletor de Painel (LAI vs Ouvidoria) */}
        <div className="p-3 border-b border-sidebar-border/70">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70 flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-primary" />
            Alternar Painel
          </p>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-lg border border-sidebar-border/50">
            <button
              onClick={() => {
                setActivePanel("lai");
                setSidebarOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
                activePanel === "lai"
                  ? "bg-[#054579] text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 mb-1" />
              <span>Painel LAI</span>
            </button>

            <button
              onClick={() => {
                setActivePanel("ouvidoria");
                setSidebarOpen(false);
              }}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer relative",
                activePanel === "ouvidoria"
                  ? "bg-[#054579] text-white shadow-sm font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 mb-1" />
              <span>Ouvidoria</span>
              {activePanel !== "ouvidoria" && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Slot para os Filtros (Portal) */}
        <div id="sidebar-filter-slot" className="flex-1 px-3 py-3 overflow-y-auto"></div>

        {/* RodapÃ© da Sidebar */}
        <div className="border-t border-sidebar-border p-3.5 bg-black/10">
          <div className="flex items-center justify-between text-xs text-sidebar-foreground/60">
            <span>Fala.BR e MESP</span>
            <span className="text-[10px] bg-sidebar-accent px-1.5 py-0.5 rounded">v2.5 Multi-Painel</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar Header */}
        <div className="p-4 pb-0 z-30 flex-shrink-0 sticky top-0">
          <header className="relative flex items-center bg-[#054579ff] rounded-2xl text-white shadow-lg border border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3.5 px-6 w-full">
              {/* Ícone Mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Ícone Dashboard */}
              <div className="hidden sm:flex items-center justify-center border-2 border-white/20 rounded-xl p-3 bg-white/5">
                <TrendingUp className="h-8 w-8 text-[#D3D3D3]" />
              </div>

              {/* Títulos */}
              <div className="flex flex-col justify-center">
                <h1 className="text-[16px] md:text-xl font-bold tracking-wide uppercase leading-tight">
                  {activePanel === "lai" ? "Pedidos de Acesso a Informação - LAI" : "Manifestações de Ouvidoria"}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/80 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span id="badge-periodo" className="uppercase tracking-wider">
                    PERÍODO: CARREGANDO...
                  </span>
                </div>
              </div>

              <div className="ml-auto hidden md:flex items-center gap-3">
                {/* Alternador Rápido no Header */}
                <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setActivePanel("lai")}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer uppercase",
                      activePanel === "lai"
                        ? "bg-[#FFFAFA] text-[#00204a] shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    LAI
                  </button>
                  <button
                    onClick={() => setActivePanel("ouvidoria")}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer uppercase",
                      activePanel === "ouvidoria"
                        ? "bg-[#FFFAFA] text-[#00204a] shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    Ouvidoria
                  </button>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

