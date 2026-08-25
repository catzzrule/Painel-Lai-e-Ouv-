/** Tipos para os dados dos Painéis LAI e Ouvidoria (MESP) */

export interface AlertaItem {
  id: string;
  tipo: "danger" | "warning" | "info";
  titulo: string;
  descricao: string;
  detalhes?: string;
}

export interface MetaDados {
  painel?: string;
  total_registros: number;
  data_geracao: string;
  ultima_atualizacao?: string;
  periodo_referencia?: string;
  fonte?: string;
}

export interface KPIs {
  total: number;
  concluidas: number;
  percentual_concluidas: number;
  em_aberto: number;
  com_recurso: number;
  respondidas_prazo: number;
  taxa_no_prazo: number;
  no_prazo_total: number;
  media_dias_resposta: number;
  media_dias_prazo_sla: number;
  media_dias_folga: number;
  // Específicos para Ouvidoria
  total_elogios?: number;
  total_reclamacoes?: number;
  total_denuncias?: number;
}

export interface DadosMensais {
  meses: string[];
  quantidades: number[];
  media_dias_resposta: number[];
  situacoes_por_mes: Record<string, Record<string, number>>;
  status_prazo_por_mes: Record<string, Record<string, number>>;
  naturezas_por_mes?: Record<string, Record<string, number>>;
}

/** Registro individual do Painel Ouvidoria */
export interface RegistroOuvidoria {
  situacao: string;
  nup: string;
  tipo: string;
  dt_abertura: string | null;
  dt_prazo: string | null;
  dt_resposta: string | null;
  subassunto: string;
  tag: string;
  canal: string;
  uf: string;
  ano_mes: string;
  status_prazo: string;
  area: string;
}

/** Interface para Painel LAI */
export interface DadosLai {
  meta: MetaDados;
  kpis: KPIs;
  situacoes: Record<string, number>;
  decisoes: Record<string, number>;
  subtipos: Record<string, number>;
  status_prazo: Record<string, number>;
  recursos: Record<string, number>;
  generos: Record<string, number>;
  tipos_pessoa: Record<string, number>;
  estados: Record<string, number>;
  mensal: DadosMensais;
  registros?: Record<string, unknown>[];
  principais_areas?: Record<string, Record<string, string>>;
}

/** Alias para retrocompatibilidade */
export type DadosOuvidoria = DadosLai;

/** Interface para o Novo Painel Ouvidoria */
export interface DadosPainelOuvidoria {
  meta: MetaDados;
  alertas: AlertaItem[];
  kpis: KPIs;
  naturezas: Record<string, number>;
  situacoes: Record<string, number>;
  subtipos: Record<string, number>;
  decisoes: Record<string, number>;
  status_prazo: Record<string, number>;
  recursos: Record<string, number>;
  generos: Record<string, number>;
  tipos_pessoa: Record<string, number>;
  estados: Record<string, number>;
  principais_areas?: Record<string, Record<string, string>>;
  mensal: DadosMensais;
  relatorio_mensal_disponivel?: boolean;
  relatorio_mensal_url?: string;
  registros?: RegistroOuvidoria[];
}

