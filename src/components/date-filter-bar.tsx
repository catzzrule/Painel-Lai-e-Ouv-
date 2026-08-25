import { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Download, X, Filter, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { GlassButton } from "@/components/ui/glass-button";
import type { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";

interface DateFilterBarProps {
  /** Range de datas selecionado */
  dateRange: DateRange | undefined;
  /** Função para atualizar o range de datas */
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  /** Tags disponíveis (Ouvidoria) */
  availableTags?: string[];
  /** Tags selecionadas (Ouvidoria) */
  selectedTags?: string[];
  /** Callback ao selecionar uma tag */
  toggleTag?: (tag: string) => void;
  /** Callback para limpar filtros */
  clearFilters: () => void;
  /** Se há filtro ativo */
  hasActiveFilter: boolean;
  /** Retorna os registros para download (filtrados ou todos) */
  getRecordsForExport: () => Record<string, unknown>[];
  /** Nome do painel para o nome do arquivo */
  panelName: "LAI" | "Ouvidoria";
  /** Cor de destaque: blue para LAI, emerald para Ouvidoria */
  accentColor?: "blue" | "emerald";
}

export function DateFilterBar({
  dateRange,
  setDateRange,
  availableTags,
  selectedTags,
  toggleTag,
  clearFilters,
  hasActiveFilter,
  getRecordsForExport,
  panelName,
  accentColor = "blue",
}: DateFilterBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = useCallback(() => {
    setDownloading(true);

    try {
      const records = getRecordsForExport();
      if (!records || records.length === 0) {
        setDownloading(false);
        return;
      }

      // Criar worksheet a partir dos registros
      const ws = XLSX.utils.json_to_sheet(records);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, panelName);

      const suffixDate = dateRange?.from
        ? `${dateRange.from.toISOString().slice(0, 10)}${dateRange.to ? `_ate_${dateRange.to.toISOString().slice(0, 10)}` : ''}`
        : '';
      const suffix = hasActiveFilter
        ? `_Filtrado_${suffixDate}`
        : "_Completo";
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Painel_${panelName}_MESP${suffix}_${dateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Erro ao gerar planilha:", err);
    }

    setTimeout(() => setDownloading(false), 800);
  }, [getRecordsForExport, panelName, hasActiveFilter, dateRange]);

  const accentClasses = {
    blue: {
      dot: "bg-[#006400]",
      filterBadge: "bg-[#00008B]/15 text-[#00008B] border-[#00008B]/30",
    },
    emerald: {
      dot: "bg-[#008028]",
      filterBadge: "bg-[#008028]/15 text-[#008028] border-[#008028]/30",
    },
  }[accentColor];

  const filterContent = (
    <div className="bg-transparent border border-sidebar-border/50 rounded-xl p-3 shadow-sm">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg backdrop-blur-md shadow-inner border border-slate-300", accentColor === "blue" ? "bg-[#00008B]/20" : "bg-[#008028]/20")}>
              <Filter className={cn("h-3.5 w-3.5", accentColor === "blue" ? "text-sidebar-foreground" : "text-emerald-400")} />
            </div>
            <span className="text-xs font-semibold text-sidebar-foreground tracking-wider">
              FILTRAR PERÍODO
            </span>
          </div>

          <div className="flex flex-col gap-2 w-full mt-1">
            {/* Download */}
            <GlassButton
              variant={accentColor === "blue" ? "activeBlue" : "activeEmerald"}
              onClick={handleDownload}
              disabled={downloading}
              className="w-full justify-center text-[11px] py-1.5"
            >
              {downloading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>{hasActiveFilter ? "Baixar Filtrado" : "Baixar Tudo"}</span>
                </>
              )}
            </GlassButton>

            {/* Limpar Filtros */}
            {hasActiveFilter && (
              <GlassButton
                size="sm"
                variant="default"
                onClick={clearFilters}
                className="w-full justify-center text-[11px] py-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Limpar Filtros</span>
              </GlassButton>
            )}
          </div>
        </div>

        {/* Calendário */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-sidebar-foreground/70" />
            <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">Período:</span>
          </div>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            accentColor={accentColor}
          />
        </div>

        {/* Tags chips / dropdown (Ouvidoria) */}
        {availableTags && availableTags.length > 0 && toggleTag && selectedTags && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-1.5">
              <TagIcon className="h-3.5 w-3.5 text-sidebar-foreground/70" />
              <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">Tags:</span>
            </div>

            {/* Native styled select */}
            <select
              className="bg-sidebar-accent border border-sidebar-border rounded-md text-[11px] font-medium text-sidebar-foreground px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none w-full shadow-sm cursor-pointer hover:bg-sidebar-accent/80 transition-colors"
              onChange={(e) => {
                if (e.target.value) {
                  toggleTag(e.target.value);
                  e.target.value = "";
                }
              }}
              value=""
            >
              <option value="" disabled className="bg-slate-800 text-slate-300">Filtro por Tag...</option>
              {availableTags.filter(t => !selectedTags.includes(t)).map(tag => (
                <option key={tag} value={tag} className="bg-slate-800 text-slate-100">{tag}</option>
              ))}
            </select>

            {/* Selected Tags Chips */}
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedTags.map((tag) => (
                <GlassButton
                  key={tag}
                  size="sm"
                  variant={accentColor === "blue" ? "activeBlue" : "activeEmerald"}
                  onClick={() => toggleTag(tag)}
                  className="text-[10px] px-2 py-0.5"
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </GlassButton>
              ))}
            </div>
          </div>
        )}

        {/* Active filter summary */}
        {hasActiveFilter && (
          <div className="flex items-start gap-1.5 text-[10px] text-sidebar-foreground/80 bg-sidebar-accent/50 p-2 rounded-lg mt-2">
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse mt-1 shrink-0", accentClasses.dot)} />
            <span className="leading-tight">
              Filtrado:{" "}
              <strong className="text-sidebar-foreground font-semibold">
                {[
                  dateRange?.from ? (dateRange.to ? `${dateRange.from.toLocaleDateString("pt-BR")} até ${dateRange.to.toLocaleDateString("pt-BR")}` : dateRange.from.toLocaleDateString("pt-BR")) : null,
                  ...(selectedTags || [])
                ].filter(Boolean).join(", ")}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  const slot = document.getElementById("sidebar-filter-slot");
  if (slot) {
    return createPortal(filterContent, slot);
  }
  
  return filterContent;
}
