/**
 * Mapa interativo do Brasil usando Leaflet + GeoJSON oficial das UFs.
 * Geometria precisa carregada de /public/brasil-estados.geojson.
 *
 * Funcionalidades:
 *  - Coroplético: intensidade de cor proporcional ao número de manifestações
 *  - Tooltip ao hover: nome, UF, quantidade, %
 *  - Clique: destaca estado e filtra tabela lateral
 *  - Legenda de intensidade
 *  - Sem tile layer: fundo limpo, apenas o território brasileiro
 */

import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Escala de intensidade (6 níveis)
// ─────────────────────────────────────────────────────────────────────────────
const INTENSITY_STOPS = [
  { color: "#CCCCCC", label: "Sem dados" },
  { color: "#b29ed9ff", label: "Baixa" },
  { color: "#ffa500", label: "Média" },
  { color: "#ff8c00", label: "Alta" },
  { color: "#4a90e2", label: "Muito Alta" },
  { color: "#003d82", label: "Máxima" },
];

function getColor(value: number, max: number): string {
  if (max === 0 || value === 0) return INTENSITY_STOPS[0].color;
  const r = value / max;
  if (r <= 0.2) return INTENSITY_STOPS[1].color;
  if (r <= 0.4) return INTENSITY_STOPS[2].color;
  if (r <= 0.6) return INTENSITY_STOPS[3].color;
  if (r <= 0.8) return INTENSITY_STOPS[4].color;
  return INTENSITY_STOPS[5].color;
}

// ─────────────────────────────────────────────────────────────────────────────
// Correção do ícone padrão do Leaflet (quebrado em bundlers)
// ─────────────────────────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)["_getIconUrl"];
L.Icon.Default.mergeOptions({ iconRetinaUrl: "", iconUrl: "", shadowUrl: "" });

// ─────────────────────────────────────────────────────────────────────────────
// Mapa principal (Leaflet imperativo via useEffect + ref)
// ─────────────────────────────────────────────────────────────────────────────
interface LeafletMapProps {
  data: Record<string, number>;
  selectedUF: string | null;
  onStateClick: (uf: string | null) => void;
}

function LeafletBrazilMap({ data, selectedUF, onStateClick }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  const total = useMemo(() => Object.values(data).reduce((s, v) => s + v, 0), [data]);
  const max = useMemo(() => Math.max(...Object.values(data), 1), [data]);

  // ── Inicializa o mapa uma única vez ─────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      minZoom: 3,
      maxZoom: 8,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    // Carrega GeoJSON
    fetch("/brasil-estados.geojson")
      .then(r => r.json())
      .then(geojson => {
        const layer = L.geoJSON(geojson, {
          style: (feature) => stateStyle(feature, data, max, selectedUF),
          onEachFeature: (feature, layer) => bindHandlers(feature, layer, data, total),
        });

        layer.addTo(map);
        layerRef.current = layer;
        map.fitBounds(layer.getBounds(), { padding: [12, 12] });
      });

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Só uma vez

  // ── Atualiza estilo quando dados ou seleção mudam ───────────────────────
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setStyle((feature) => stateStyle(feature, data, max, selectedUF));

    // Rebind tooltips com novos valores
    layerRef.current.eachLayer((layer: L.Layer) => {
      const gl = layer as L.GeoJSON & { feature?: GeoJSON.Feature };
      if (!gl.feature) return;
      const uf = gl.feature.properties?.sigla ?? "";
      const nome = gl.feature.properties?.name ?? uf;
      const count = data[uf] ?? 0;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

      (layer as L.Path).unbindTooltip();
      (layer as L.Path).bindTooltip(
        `<div class="lf-tip"><b>${uf} — ${nome}</b><br/>
           ${count.toLocaleString("pt-BR")} manifestações<br/>
           <span class="lf-tip-pct">${pct}% do total</span></div>`,
        { sticky: true, direction: "auto", className: "lf-tip-wrapper" }
      );
    });
  }, [data, selectedUF, max, total]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function stateStyle(
    feature: GeoJSON.Feature | undefined,
    d: Record<string, number>,
    mx: number,
    sel: string | null,
  ): L.PathOptions {
    const uf = feature?.properties?.sigla ?? "";
    const value = d[uf] ?? 0;
    const isSelected = sel === uf;
    return {
      fillColor: getColor(value, mx),
      fillOpacity: sel && !isSelected ? 0.45 : 0.82,
      color: isSelected ? "#f59e0b" : "#ffffff",
      weight: isSelected ? 2.5 : 1,
    };
  }

  function bindHandlers(feature: GeoJSON.Feature, layer: L.Layer, d?: Record<string, number>, tot?: number) {
    const uf = feature.properties?.sigla ?? "";
    const nome = feature.properties?.name ?? uf;
    const count = (d ?? data)[uf] ?? 0;
    const t = tot ?? total;
    const pct = t > 0 ? ((count / t) * 100).toFixed(1) : "0.0";

    (layer as L.Path).bindTooltip(
      `<div class="lf-tip"><b>${uf} — ${nome}</b><br/>
         ${count.toLocaleString("pt-BR")} manifestações<br/>
         <span class="lf-tip-pct">${pct}% do total</span></div>`,
      { sticky: true, direction: "auto", className: "lf-tip-wrapper" }
    );

    layer.on({
      mouseover(e: L.LeafletMouseEvent) {
        (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 1 });
        (e.target as L.Path).bringToFront();
      },
      mouseout(e: L.LeafletMouseEvent) {
        layerRef.current?.resetStyle(e.target as L.Path);
      },
      click() {
        onStateClick(selectedUF === uf ? null : uf);
      },
    });
  }

  return (
    <div
      ref={containerRef}
      style={{ height: "440px", width: "100%", borderRadius: "12px", background: "#f8fafc" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card exportado — mapa + tabela lateral
// ─────────────────────────────────────────────────────────────────────────────
interface BrazilMapCardProps {
  data: Record<string, number>;
}

export function BrazilMapCard({ data }: BrazilMapCardProps) {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);

  const total = useMemo(() => Object.values(data).reduce((s, v) => s + v, 0), [data]);
  const sorted = useMemo(() => Object.entries(data).sort(([, a], [, b]) => b - a), [data]);
  const tableRows = selectedUF ? sorted.filter(([uf]) => uf === selectedUF) : sorted.slice(0, 12);

  return (
    <>
      {/* CSS do tooltip (inline style tag para não exigir CSS global) */}
      <style>{`
        .lf-tip-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; }
        .lf-tip { background: #0f172a; color: #f8fafc; font-size: 12px; line-height: 1.5;
                  padding: 8px 12px; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,.35);
                  border: 1px solid rgba(255,255,255,.1); white-space: nowrap; }
        .lf-tip b { color: #60a5fa; }
        .lf-tip-pct { color: #94a3b8; font-size: 11px; }
        /* Remove o triângulo do tooltip padrão */
        .lf-tip-wrapper::before, .lf-tip-wrapper.leaflet-tooltip-left::before,
        .lf-tip-wrapper.leaflet-tooltip-right::before,
        .lf-tip-wrapper.leaflet-tooltip-top::before,
        .lf-tip-wrapper.leaflet-tooltip-bottom::before { display: none !important; }
      `}</style>

      <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Distribuição Geográfica por Estado (UF)
            {selectedUF && (
              <button
                onClick={() => setSelectedUF(null)}
                className="ml-auto flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full hover:bg-amber-100 transition-colors font-medium"
              >
                {selectedUF}
                <X className="h-3 w-3" />
              </button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Mapa (2/3) ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <LeafletBrazilMap
                data={data}
                selectedUF={selectedUF}
                onStateClick={setSelectedUF}
              />

              {/* Legenda */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-center mt-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Intensidade:
                </span>
                {INTENSITY_STOPS.map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3 rounded-sm border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabela (1/3) ────────────────────────────────────────────── */}
            <div className="flex flex-col">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                {selectedUF ? "Estado selecionado" : `Top ${Math.min(sorted.length, 12)} estados`}
              </p>

              {sorted.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sem dados</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-[10px] text-muted-foreground font-medium pb-1 uppercase tracking-wider">UF</th>
                      <th className="text-right text-[10px] text-muted-foreground font-medium pb-1 uppercase tracking-wider">Qtd.</th>
                      <th className="text-right text-[10px] text-muted-foreground font-medium pb-1 pr-1 uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(([uf, count]) => {
                      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                      return (
                        <tr
                          key={uf}
                          className={[
                            "border-b border-border/20 last:border-0 cursor-pointer",
                            "hover:bg-muted/50 transition-colors",
                            selectedUF === uf ? "bg-amber-50 dark:bg-amber-900/20" : "",
                          ].join(" ")}
                          onClick={() => setSelectedUF(selectedUF === uf ? null : uf)}
                        >
                          <td className="py-1.5 font-bold text-card-foreground">{uf}</td>
                          <td className="py-1.5 text-right font-semibold text-card-foreground">
                            {count.toLocaleString("pt-BR")}
                          </td>
                          <td className="py-1.5 text-right text-muted-foreground pr-1">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {!selectedUF && sorted.length > 12 && (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  + {sorted.length - 12} outros — clique no mapa para ver
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
