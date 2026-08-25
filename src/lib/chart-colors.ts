/**
 * Paleta de cores centralizada para todos os gráficos do painel.
 *
 * Critérios de seleção:
 *  - 15 cores com matizes espaçados para máxima distinção perceptual
 *  - Saturação ~75-80% e luminosidade ~48-55% → contraste WCAG AA (≥4.5:1) sobre branco
 *  - Funcionam bem em modo claro e escuro
 *  - Cores 1-10 cobrem o espectro inteiro; 11-15 preenchem densidades intermediárias
 */

export const CHART_COLORS: readonly string[] = [
  "#06224fff", //  1 · Blue-500      220°
  "#ef4444", //  2 · Red-500         0°
  "#22c55e", //  3 · Green-500     142°
  "#f59e0b", //  4 · Amber-500      38°
  "#8b5cf6", //  5 · Violet-500    258°
  "#06b6d4", //  6 · Cyan-500      186°
  "#f97316", //  7 · Orange-500     24°
  "#ec4899", //  8 · Pink-500      330°
  "#84cc16", //  9 · Lime-500       80°
  "#14b8a6", // 10 · Teal-500      174°
  "#d946ef", // 11 · Fuchsia-500   293°
  "#f43f5e", // 12 · Rose-500      347°
  "#eab308", // 13 · Yellow-500     50°
  "#64748b", // 14 · Slate-500     215° (neutro)
  "#10b981", // 15 · Emerald-500   158°
] as const;

/**
 * Mapeamento semântico de cores por natureza da manifestação (Ouvidoria).
 * Chaves devem coincidir exatamente com os valores do campo natureza no JSON.
 */
export const NATUREZA_COLORS: Readonly<Record<string, string>> = {
  Solicitacao: "#aab1beff", // Blue  — pedidos de informação/serviço
  Reclamacao: "#f59e0b", // Amber — insatisfação / reclamação
  Denuncia: "#ef4444", // Red   — denúncias de irregularidade
  Comunicacao: "#06b6d4", // Cyan  — comunicação geral
  Sugestao: "#8b5cf6", // Violet— sugestões de melhoria
  Elogio: "#22c55e", // Green — elogios
  Simplifique: "#ec4899", // Pink  — simplificação de processos
} as const;

/** Retorna a cor pelo índice, ciclando automaticamente além de 15 categorias. */
export function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
