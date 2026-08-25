/**
 * LaiTable — Tabela rolável de NUPs/Protocolos LAI com busca e cópia rápida.
 * Sempre visível no painel; mostra todos os registros do período filtrado.
 */

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hash, Search, Copy, Check, X } from "lucide-react";
import type { DadosLai } from "@/types/dados";

type RegistroLai = NonNullable<DadosLai["registros"]>[0];

interface LaiTableProps {
  registros: RegistroLai[];
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  "Respondida no prazo":       { label: "No Prazo",     cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "Respondida fora do prazo":  { label: "Fora Prazo",   cls: "bg-red-100    text-red-700    border-red-200"   },
  "Em aberto - no prazo":      { label: "Andamento",    cls: "bg-blue-100   text-blue-700   border-blue-200"  },
  "Em atraso":                 { label: "Em Atraso",    cls: "bg-red-100    text-red-700    border-red-200"   },
};

function statusBadge(status: string) {
  const s = STATUS_BADGE[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  // Aceita YYYY-MM-DD ou DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, dd] = d.slice(0, 10).split("-");
    return `${dd}/${m}/${y}`;
  }
  return d.slice(0, 10);
}

export function LaiTable({ registros }: LaiTableProps) {
  const [search, setSearch] = useState("");
  const [copiedNup, setCopiedNup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!registros?.length) return [];
    const q = search.trim().toLowerCase();
    if (!q) return registros;
    return registros.filter((r: any) => {
      const nup = String(r["Nup"] || "").toLowerCase();
      const tipo = String(r["Subtipo de Formulário"] || "").toLowerCase();
      const decisao = String(r["Especificação Decisão"] || "").toLowerCase();
      const uf = String(r["Estado"] || "").toLowerCase();
      return nup.includes(q) || tipo.includes(q) || decisao.includes(q) || uf.includes(q);
    });
  }, [registros, search]);

  const handleCopy = (nup: string) => {
    navigator.clipboard.writeText(nup);
    setCopiedNup(nup);
    setTimeout(() => setCopiedNup(null), 2000);
  };

  if (!registros?.length) return null;

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Registro de Protocolos LAI
            <span className="text-[11px] text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">
              {filtered.length.toLocaleString("pt-BR")} de {registros.length.toLocaleString("pt-BR")}
            </span>
          </CardTitle>

          {/* Campo de busca */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar NUP, tipo ou UF..."
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                         transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum Protocolo encontrado para "{search}"
          </p>
        ) : (
          <div className="overflow-auto max-h-80 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10 border-b border-border">
                <tr>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                    NUP / Protocolo
                  </th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 hidden sm:table-cell">
                    Subtipo / Decisão
                  </th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 hidden md:table-cell">
                    Cadastro
                  </th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 hidden lg:table-cell">
                    UF
                  </th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                    Status
                  </th>
                  <th className="w-8 px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((r: any, i) => {
                  const nup = String(r["Nup"] || "");
                  return (
                    <tr
                      key={`${nup}-${i}`}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* NUP */}
                      <td className="px-4 py-2 font-mono text-[11px] text-card-foreground font-semibold whitespace-nowrap">
                        {nup || "—"}
                      </td>
                      {/* Tipo */}
                      <td className="px-2 py-2 text-muted-foreground hidden sm:table-cell max-w-[180px]">
                        <span className="truncate block">{r["Subtipo de Formulário"] || r["Especificação Decisão"] || r["Situação"] || "—"}</span>
                      </td>
                      {/* Data Cadastro */}
                      <td className="px-2 py-2 text-muted-foreground tabular-nums hidden md:table-cell whitespace-nowrap">
                        {formatDate(r["Data de Cadastro"])}
                      </td>
                      {/* UF */}
                      <td className="px-2 py-2 text-muted-foreground uppercase hidden lg:table-cell">
                        {r["Estado"] || "—"}
                      </td>
                      {/* Status */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {statusBadge(r["Status do Prazo"] || "")}
                      </td>
                      {/* Copiar */}
                      <td className="px-2 py-2">
                        <button
                          onClick={() => nup && handleCopy(nup)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-500"
                          title="Copiar Protocolo"
                        >
                          {copiedNup === nup
                            ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                            : <Copy className="h-3.5 w-3.5" />
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
