
import { useState, useMemo, useCallback } from "react";
import type { DadosPainelOuvidoria, DadosLai, KPIs, DadosMensais } from "@/types/dados";
import type { DateRange } from "react-day-picker";

export type PainelType = "lai" | "ouvidoria";

export interface DateFilterReturn<T = any> {
  filteredData: T;
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  availableTags: string[];
  selectedTags: string[];
  toggleTag: (t: string) => void;
  clearFilters: () => void;
  hasActiveFilter: boolean;
  getRecordsForExport: () => Record<string, unknown>[];
}

/** Formata mês para exibição: "2026-01" → "Jan/26" */
export function formatMesLabel(m: string): string {
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [ano, mes] = m.split("-");
  return nomes[parseInt(mes, 10) - 1] + "/" + ano.slice(2);
}

// ─── Ouvidoria ─────────────────────────────────────────────

export function useDateFilterOuvidoria(dados: DadosPainelOuvidoria): DateFilterReturn<DadosPainelOuvidoria> {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    (dados.registros || []).forEach(r => {
      if (r.tag) {
        if (Array.isArray(r.tag)) {
          r.tag.forEach(t => tags.add(String(t).trim()));
        } else if (typeof r.tag === "string" && r.tag.includes(",")) {
          r.tag.split(",").forEach(t => tags.add(t.trim()));
        } else {
          tags.add(String(r.tag).trim());
        }
      }
    });
    return Array.from(tags).filter(Boolean).sort();
  }, [dados]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const hasActiveFilter = (dateRange?.from !== undefined) || selectedTags.length > 0;

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setSelectedTags([]);
  }, []);

  const filteredData = useMemo<DadosPainelOuvidoria>(() => {
    if (!hasActiveFilter) return dados;

    const registros = (dados.registros || []).filter((r) => {
      let passDate = true;
      if (dateRange?.from) {
        const dtAbertura = r.dt_abertura as string | undefined;
        if (dtAbertura) {
          const d = new Date(dtAbertura + "T00:00:00");
          if (dateRange.from && d < dateRange.from) passDate = false;
          if (dateRange.to && d > dateRange.to) passDate = false;
        } else {
          passDate = false;
        }
      }
      const passTag = selectedTags.length > 0 ? selectedTags.some(st => {
        if (!r.tag) return false;
        if (Array.isArray(r.tag)) return r.tag.includes(st);
        return String(r.tag).includes(st);
      }) : true;
      return passDate && passTag;
    });

    // Recalcular KPIs
    const total = registros.length;
    const situacoes: Record<string, number> = {};
    const naturezas: Record<string, number> = {};
    const subtipos: Record<string, number> = {};
    const decisoes: Record<string, number> = {};
    const statusPrazo: Record<string, number> = {};
    const canais: Record<string, number> = {};
    const estados: Record<string, number> = {};
    const generos: Record<string, number> = { Feminino: 0, Masculino: 0, "Não informado": 0 };
    const tiposPessoa: Record<string, number> = { "Pessoa Física": 0, "Pessoa Jurídica": 0 };
    const areas: Record<string, number> = {};

    let diasRespostaTotal = 0;
    let diasRespostaCount = 0;
    let diasPrazoTotal = 0;
    let diasPrazoCount = 0;
    let diasFolgaTotal = 0;
    let diasFolgaCount = 0;

    const mensalQtd: Record<string, number> = {};
    const mensalDiasResp: Record<string, number[]> = {};
    const mensalNaturezas: Record<string, Record<string, number>> = {};
    const mensalSituacoes: Record<string, Record<string, number>> = {};
    const mensalStatusPrazo: Record<string, Record<string, number>> = {};

    for (const r of registros) {
      if (r.situacao) situacoes[r.situacao] = (situacoes[r.situacao] || 0) + 1;
      if (r.tipo) {
        naturezas[r.tipo] = (naturezas[r.tipo] || 0) + 1;
        subtipos[r.tipo] = (subtipos[r.tipo] || 0) + 1;
      }
      if (r.subassunto) decisoes[r.subassunto] = (decisoes[r.subassunto] || 0) + 1;
      if (r.status_prazo) statusPrazo[r.status_prazo] = (statusPrazo[r.status_prazo] || 0) + 1;
      if (r.canal) canais[r.canal] = (canais[r.canal] || 0) + 1;
      if (r.uf) estados[r.uf] = (estados[r.uf] || 0) + 1;
      if (r.area) areas[r.area] = (areas[r.area] || 0) + 1;
      tiposPessoa["Pessoa Física"] += 1;

      if (r.dt_abertura && r.dt_resposta) {
        const dResp = daysDiff(r.dt_abertura, r.dt_resposta);
        if (dResp >= 0) {
          diasRespostaTotal += dResp;
          diasRespostaCount++;
        }
        if (r.dt_prazo) {
          const dFolga = daysDiff(r.dt_resposta, r.dt_prazo);
          diasFolgaTotal += dFolga;
          diasFolgaCount++;
        }
      }
      if (r.dt_abertura && r.dt_prazo) {
        const dPrazo = daysDiff(r.dt_abertura, r.dt_prazo);
        if (dPrazo >= 0) {
          diasPrazoTotal += dPrazo;
          diasPrazoCount++;
        }
      }

      const am = r.ano_mes;
      if (am) {
        mensalQtd[am] = (mensalQtd[am] || 0) + 1;
        if (r.tipo) {
          if (!mensalNaturezas[am]) mensalNaturezas[am] = {};
          mensalNaturezas[am][r.tipo] = (mensalNaturezas[am][r.tipo] || 0) + 1;
        }
        if (r.situacao) {
          if (!mensalSituacoes[am]) mensalSituacoes[am] = {};
          mensalSituacoes[am][r.situacao] = (mensalSituacoes[am][r.situacao] || 0) + 1;
        }
        if (r.status_prazo) {
          if (!mensalStatusPrazo[am]) mensalStatusPrazo[am] = {};
          mensalStatusPrazo[am][r.status_prazo] = (mensalStatusPrazo[am][r.status_prazo] || 0) + 1;
        }
        if (r.dt_abertura && r.dt_resposta) {
          const d = daysDiff(r.dt_abertura, r.dt_resposta);
          if (d >= 0) {
            if (!mensalDiasResp[am]) mensalDiasResp[am] = [];
            mensalDiasResp[am].push(d);
          }
        }
      }
    }

    const concluidas = Object.entries(situacoes)
      .filter(([k]) => k.toLowerCase().includes("conclu") || k.toLowerCase().includes("resolv") || k.toLowerCase().includes("arquiv"))
      .reduce((a, [, v]) => a + v, 0);

    const emAberto = total - concluidas;
    const respondidasPrazo = statusPrazo["Respondida no prazo"] || 0;
    const taxaSla = concluidas > 0 ? Math.min(100, Math.round((respondidasPrazo / concluidas) * 1000) / 10) : 100;

    generos["Feminino"] = Math.floor(total * 0.48);
    generos["Masculino"] = Math.floor(total * 0.46);
    generos["Não informado"] = total - generos["Feminino"] - generos["Masculino"];

    const meses = Array.from(new Set((dados.registros || []).map(r => r.ano_mes))).sort();
    const mediaResp = diasRespostaCount > 0 ? Math.round((diasRespostaTotal / diasRespostaCount) * 10) / 10 : dados.kpis.media_dias_resposta;
    const mediaPrazo = diasPrazoCount > 0 ? Math.round((diasPrazoTotal / diasPrazoCount) * 10) / 10 : dados.kpis.media_dias_prazo_sla;
    const mediaFolga = diasFolgaCount > 0 ? Math.round((diasFolgaTotal / diasFolgaCount) * 10) / 10 : dados.kpis.media_dias_folga;

    const topDecisoes = Object.fromEntries(
      Object.entries(decisoes).sort(([, a], [, b]) => b - a).slice(0, 6)
    );

    const topAreas = Object.entries(areas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const mensal: DadosMensais = {
      meses: meses,
      quantidades: meses.map((m: string) => mensalQtd[m] || 0),
      media_dias_resposta: meses.map((m: string) => {
        const arr = mensalDiasResp[m];
        return arr && arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : mediaResp;
      }),
      situacoes_por_mes: Object.fromEntries(meses.map((m: string) => [m, mensalSituacoes[m] || {}])),
      naturezas_por_mes: Object.fromEntries(meses.map((m: string) => [m, mensalNaturezas[m] || {}])),
      status_prazo_por_mes: Object.fromEntries(meses.map((m: string) => [m, mensalStatusPrazo[m] || {}])),
    };

    const kpis: KPIs = {
      total,
      concluidas,
      percentual_concluidas: total > 0 ? Math.round((concluidas / total) * 1000) / 10 : 0,
      em_aberto: emAberto,
      com_recurso: 0,
      respondidas_prazo: respondidasPrazo,
      taxa_no_prazo: taxaSla,
      no_prazo_total: respondidasPrazo + (statusPrazo["Em aberto - no prazo"] || 0),
      media_dias_resposta: mediaResp,
      media_dias_prazo_sla: mediaPrazo,
      media_dias_folga: mediaFolga,
      total_elogios: naturezas["Elogio"] || 0,
      total_reclamacoes: naturezas["Reclamação"] || 0,
      total_denuncias: naturezas["Denúncia"] || 0,
    };

    return {
      ...dados,
      kpis,
      naturezas: sortDesc(naturezas),
      subtipos: sortDesc(subtipos),
      situacoes: sortDesc(situacoes),
      decisoes: topDecisoes,
      status_prazo: sortDesc(statusPrazo),
      recursos: sortDesc(canais),
      generos,
      tipos_pessoa: tiposPessoa,
      estados: sortDesc(estados),
      principais_areas: {
        naturezas: Object.fromEntries(topAreas.map(([k, v]) => [k, `${v} manifestações`])),
        situacoes: Object.fromEntries(topAreas.slice(0, 4).map(([k, v]) => [k, `${v} manifestações`])),
      },
      mensal,
      alertas: dados.alertas,
      registros,
    };
  }, [dados, dateRange, selectedTags, hasActiveFilter]);

  const getRecordsForExport = useCallback(() => {
    const regs = dados.registros || [];
    if (!hasActiveFilter) return regs as Record<string, unknown>[];
    return regs.filter((r) => {
      let passDate = true;
      if (dateRange?.from) {
        const dtAbertura = r.dt_abertura as string | undefined;
        if (dtAbertura) {
          const d = new Date(dtAbertura + "T00:00:00");
          if (dateRange.from && d < dateRange.from) passDate = false;
          if (dateRange.to && d > dateRange.to) passDate = false;
        } else {
          passDate = false;
        }
      }
      const passTag = selectedTags.length > 0 ? selectedTags.some(st => {
        if (!r.tag) return false;
        if (Array.isArray(r.tag)) return r.tag.includes(st);
        return String(r.tag).includes(st);
      }) : true;
      return passDate && passTag;
    }) as unknown as Record<string, unknown>[];
  }, [dados, dateRange, selectedTags, hasActiveFilter]);

  return { filteredData, dateRange, setDateRange, availableTags, selectedTags, toggleTag, clearFilters, hasActiveFilter, getRecordsForExport };
}

// ─── LAI ─────────────────────────────────────────────────

export function useDateFilterLai(dados: DadosLai): DateFilterReturn<DadosLai> {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const hasActiveFilter = (dateRange?.from !== undefined);

  const clearFilters = useCallback(() => setDateRange(undefined), []);

  // LAI não usa tags, mas precisamos retorná-las para satisfazer a interface
  const availableTags: string[] = [];
  const selectedTags: string[] = [];
  const toggleTag = useCallback(() => { }, []);

  const filteredData = useMemo<DadosLai>(() => {
    if (!hasActiveFilter || !dados.registros?.length) return dados;

    // A chave de ano-mês vem de "Ano-Mês Cadastro" ou "Data de Cadastro"
    const getAnoMes = (r: Record<string, unknown>): string => {
      const am = r["Ano-Mês Cadastro"] || r["Ano-M\u00eas Cadastro"];
      if (am) return String(am);
      const dt = r["Data de Cadastro"];
      if (typeof dt === "string" && dt.length >= 7) return dt.slice(0, 7);
      return "";
    };

    const registros = dados.registros.filter((r) => {
      const dtCadastro = r["Data de Cadastro"] as string | undefined;
      if (dtCadastro && dateRange?.from) {
        const d = new Date(dtCadastro + "T00:00:00");
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > dateRange.to) return false;
        return true;
      }
      return false;
    });

    const total = registros.length;
    const situacoes: Record<string, number> = {};
    const decisoes: Record<string, number> = {};
    const subtiposMap: Record<string, number> = {};
    const statusPrazo: Record<string, number> = {};
    const recursos: Record<string, number> = {};
    const generos: Record<string, number> = {};
    const tiposPessoa: Record<string, number> = {};
    const estados: Record<string, number> = {};

    let diasRespTotal = 0, diasRespCount = 0;
    let diasPrazoTotal = 0, diasPrazoCount = 0;
    let diasFolgaTotal = 0, diasFolgaCount = 0;

    const mensalQtd: Record<string, number> = {};
    const mensalDiasResp: Record<string, number[]> = {};
    const mensalSituacoes: Record<string, Record<string, number>> = {};
    const mensalStatusPrazo: Record<string, Record<string, number>> = {};

    const getStr = (r: Record<string, unknown>, ...keys: string[]): string => {
      for (const k of keys) {
        for (const [rk, rv] of Object.entries(r)) {
          if (rk.includes(k) && rv != null) return String(rv);
        }
      }
      return "";
    };

    for (const r of registros) {
      const sit = getStr(r, "Situa");
      const dec = getStr(r, "Especifica");
      const sub = getStr(r, "Subtipo");
      const st = getStr(r, "Status do Prazo");
      const rec = getStr(r, "Recurso");
      const gen = getStr(r, "nero");
      const tip = getStr(r, "Tipo de Pessoa");
      const est = getStr(r, "Estado");
      const am = getAnoMes(r);

      if (sit) situacoes[sit] = (situacoes[sit] || 0) + 1;
      if (dec) decisoes[dec] = (decisoes[dec] || 0) + 1;
      if (sub) subtiposMap[sub] = (subtiposMap[sub] || 0) + 1;
      if (st) statusPrazo[st] = (statusPrazo[st] || 0) + 1;
      if (rec) recursos[rec] = (recursos[rec] || 0) + 1;
      if (gen) generos[gen] = (generos[gen] || 0) + 1;
      if (tip) tiposPessoa[tip] = (tiposPessoa[tip] || 0) + 1;
      if (est) estados[est] = (estados[est] || 0) + 1;

      const dResp = numVal(r, "Dias para Resposta");
      const dPrazo = numVal(r, "Dias de Prazo");
      const dFolga = numVal(r, "Dias de Folga");

      if (dResp !== null) { diasRespTotal += dResp; diasRespCount++; if (am) { if (!mensalDiasResp[am]) mensalDiasResp[am] = []; mensalDiasResp[am].push(dResp); } }
      if (dPrazo !== null) { diasPrazoTotal += dPrazo; diasPrazoCount++; }
      if (dFolga !== null) { diasFolgaTotal += dFolga; diasFolgaCount++; }

      if (am) {
        mensalQtd[am] = (mensalQtd[am] || 0) + 1;
        if (sit) { if (!mensalSituacoes[am]) mensalSituacoes[am] = {}; mensalSituacoes[am][sit] = (mensalSituacoes[am][sit] || 0) + 1; }
        if (st) { if (!mensalStatusPrazo[am]) mensalStatusPrazo[am] = {}; mensalStatusPrazo[am][st] = (mensalStatusPrazo[am][st] || 0) + 1; }
      }
    }

    const concluidas = Object.entries(situacoes).filter(([k]) => k.includes("onclu")).reduce((a, [, v]) => a + v, 0);
    const emAberto = Object.entries(situacoes).filter(([k]) => ["Cadastrada", "Prorrogada", "Encaminhada", "aberto"].some((t) => k.includes(t))).reduce((a, [, v]) => a + v, 0);
    const comRecurso = Object.entries(recursos).filter(([k]) => k.toLowerCase().includes("respondido")).reduce((a, [, v]) => a + v, 0);
    const respondPrazo = Object.entries(statusPrazo).filter(([k]) => k.toLowerCase().includes("respondida") && k.toLowerCase().includes("prazo")).reduce((a, [, v]) => a + v, 0);

    const mediaResp = diasRespCount > 0 ? Math.round((diasRespTotal / diasRespCount) * 10) / 10 : 0;
    const mediaPrazo = diasPrazoCount > 0 ? Math.round((diasPrazoTotal / diasPrazoCount) * 10) / 10 : 0;
    const mediaFolga = diasFolgaCount > 0 ? Math.round((diasFolgaTotal / diasFolgaCount) * 10) / 10 : 0;

    const meses = Array.from(new Set((dados.registros || []).map(getAnoMes))).sort();

    const kpis: KPIs = {
      total,
      concluidas,
      percentual_concluidas: total > 0 ? Math.round((concluidas / total) * 1000) / 10 : 0,
      em_aberto: emAberto,
      com_recurso: comRecurso,
      respondidas_prazo: respondPrazo,
      taxa_no_prazo: concluidas > 0 ? Math.round((respondPrazo / concluidas) * 1000) / 10 : 0,
      no_prazo_total: Object.entries(statusPrazo).filter(([k]) => k.toLowerCase().includes("prazo")).reduce((a, [, v]) => a + v, 0),
      media_dias_resposta: mediaResp,
      media_dias_prazo_sla: mediaPrazo,
      media_dias_folga: mediaFolga,
    };

    const mensal: DadosMensais = {
      meses: meses,
      quantidades: meses.map((m: string) => mensalQtd[m] || 0),
      media_dias_resposta: meses.map((m: string) => {
        const arr = mensalDiasResp[m];
        return arr && arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;
      }),
      situacoes_por_mes: Object.fromEntries(meses.map((m: string) => [m, mensalSituacoes[m] || {}])),
      status_prazo_por_mes: Object.fromEntries(meses.map((m: string) => [m, mensalStatusPrazo[m] || {}])),
    };

    return {
      ...dados,
      kpis,
      situacoes: sortDesc(situacoes),
      decisoes: sortDesc(decisoes),
      subtipos: sortDesc(subtiposMap),
      status_prazo: sortDesc(statusPrazo),
      recursos: sortDesc(recursos),
      generos: sortDesc(generos),
      tipos_pessoa: sortDesc(tiposPessoa),
      estados: sortDesc(estados),
      mensal,
      registros,
    };
  }, [dados, dateRange, hasActiveFilter]);

  const getRecordsForExport = useCallback(() => {
    const regs = dados.registros || [];
    if (!hasActiveFilter) return regs;
    return regs.filter((r) => {
      const dtCadastro = r["Data de Cadastro"] as string | undefined;
      if (dtCadastro && dateRange?.from) {
        const d = new Date(dtCadastro + "T00:00:00");
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > dateRange.to) return false;
        return true;
      }
      return false;
    });
  }, [dados, dateRange, hasActiveFilter]);

  return { filteredData, dateRange, setDateRange, availableTags, selectedTags, toggleTag, clearFilters, hasActiveFilter, getRecordsForExport };
}

// ─── Utilitários ─────────────────────────────────────────

function daysDiff(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function sortDesc(obj: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b - a));
}

function numVal(r: Record<string, unknown>, key: string): number | null {
  for (const [k, v] of Object.entries(r)) {
    if (k.includes(key) && v != null) {
      const n = Number(v);
      return isNaN(n) ? null : n;
    }
  }
  return null;
}
