import type { DadosOuvidoria } from "@/types/dados";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, 
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LabelList, Cell, PieChart, Pie
} from "recharts";
import {
  TrendingUp, PieChart as PieIcon, BarChart3, FileText, MessageSquare,
  Users, Building,
} from "lucide-react";
import { CHART_COLORS, getColor } from "@/lib/chart-colors";
import { formatMesLabel } from "@/lib/use-date-filter";
import { useEffect, useRef } from "react";
import { BrazilMapCard } from "./brazil-map";

interface ChartCardsProps {
  section: "mensal" | "situacao" | "formulario" | "perfil";
  title: string;
  dados: DadosOuvidoria;
}

// Paleta centralizada importada de @/lib/chart-colors
const COLORS = CHART_COLORS;


const toChartData = (obj: Record<string, number>, topAreas?: Record<string, string>) =>
  Object.entries(obj).map(([name, value]) => ({
    name,
    value,
    topArea: topAreas ? topAreas[name] : undefined
  }));

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-card-foreground">
      {payload.map((p, i) => {
        const itemName = p.payload?.name || label || p.name;
        const displayValue = typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value;
        const topArea = p.payload?.topArea;
        return (
          <div key={i} className="mb-2 last:mb-0">
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: p.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
              <span>{itemName}: {displayValue}</span>
            </p>
            {topArea && topArea !== "Nao informada" && (
              <p className="text-[11px] text-card-foreground/75 ml-4 mt-0.5">
                Area mais demandada: <span className="text-card-foreground font-medium">{topArea}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Renderiza label com cotovelo (linha dobrada) para evitar sobreposicao com a tabela lateral
const renderCustomPieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, index } = props;
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  // Ponto na borda externa da fatia
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const mx = cx + (outerRadius + 8) * cos;
  const my = cy + (outerRadius + 8) * sin;
  // Ponto final da linha (com cotovelo)
  const ex = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const textX = ex + (cos >= 0 ? 3 : -3);

  return (
    <g>
      {/* Linha da fatia ate o cotovelo */}
      <path
        d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${mx},${my}L${ex},${ey}`}
        stroke="#94a3b8"
        strokeWidth={1}
        fill="none"
      />
      {/* Ponto no cotovelo */}
      <circle cx={ex} cy={ey} r={2} fill="#94a3b8" />
      {/* Texto da porcentagem */}
      <text
        x={textX}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fill="#1e293b"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};


function DonutChart({ data, title, icon: Icon, topAreas, colors }: { data: Record<string, number>; title: string; icon: React.ElementType; topAreas?: Record<string, string>; colors?: string[] }) {
  const chartData = toChartData(data, topAreas);
  const total = chartData.reduce((a, b) => a + b.value, 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Forca overflow visible no SVG gerado pelo Recharts para labels nao serem cortadas
    const svg = containerRef.current?.querySelector('svg');
    if (svg) svg.setAttribute('overflow', 'visible');
  });

  return (
    <Card className="border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-gradient-to-b from-white to-slate-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Donut com labels de % dentro */}
          <div ref={containerRef} className="relative flex-shrink-0 w-[240px]">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  labelLine={false}
                  label={renderCustomPieLabel}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors ? colors[i % colors.length] : getColor(i)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total no centro do donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-card-foreground">{total.toLocaleString("pt-BR")}</span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </div>
          </div>

          {/* Tabela lateral com QTD e % */}
          <div className="flex-1 w-full">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-[10px] text-muted-foreground font-medium pb-1 uppercase tracking-wider">Categoria</th>
                  <th className="text-right text-[10px] text-muted-foreground font-medium pb-1 uppercase tracking-wider">Qtd.</th>
                  <th className="text-right text-[10px] text-muted-foreground font-medium pb-1 uppercase tracking-wider pr-1">%</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((entry, i) => {
                  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="py-1.5 flex items-start gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: colors ? colors[i % colors.length] : getColor(i) }} />
                        <span className="text-card-foreground break-words">{entry.name}</span>
                      </td>
                      <td className="text-right font-semibold text-card-foreground py-1.5">{entry.value.toLocaleString("pt-BR")}</td>
                      <td className="text-right text-muted-foreground py-1.5 pr-1">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HorizontalBarChart({ data, title, icon: Icon, color, topAreas }: { data: Record<string, number>; title: string; icon: React.ElementType; color?: string; topAreas?: Record<string, string> }) {
  const rawData = toChartData(data, topAreas);
  const total = rawData.reduce((a, b) => a + b.value, 0);
  const chartData = rawData.map(d => ({
    ...d,
    pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0",
  }));
  const barColor = color || COLORS[0];
  const chartHeight = Math.max(200, chartData.length * 34 + 40);

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 90, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#334155", fontSize: 11 }} width={140} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={22}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value: number) => {
                  const item = chartData.find(d => d.value === value);
                  return `${value.toLocaleString("pt-BR")}  (${item?.pct ?? "0.0"}%)`;
                }}
                style={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChartCards({ section, title, dados }: ChartCardsProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-primary" />
        {title}
      </h2>

      {section === "mensal" && (
        <div className="space-y-4">
          {dados.historico_anual && <HistoricoAnualChart dados={dados} />}
          <MensalChart dados={dados} />
        </div>
      )}
      {section === "situacao" && <SituacaoCharts dados={dados} />}
      {section === "formulario" && <FormularioCharts dados={dados} />}
      {section === "perfil" && <PerfilCharts dados={dados} />}
    </div>
  );
}

function HistoricoAnualChart({ dados }: { dados: DadosOuvidoria }) {
  if (!dados.historico_anual) return null;

  const hist = dados.historico_anual;
  const lastIdx = hist.quantidades.length - 1;

  const maxQtd = Math.max(...hist.quantidades);
  const minTempo = Math.min(...hist.media_dias_resposta);
  const maxTempo = Math.max(...hist.media_dias_resposta);
  const tempoRange = maxTempo - minTempo || 1;

  const chartData = hist.anos.map((ano, i) => {
    const variacao = i > 0 && hist.quantidades[i - 1] > 0
      ? (((hist.quantidades[i] - hist.quantidades[i - 1]) / hist.quantidades[i - 1]) * 100)
      : null;
    // Posição da bolinha calculada em relação ao topo da coluna de CADA ano individual
    const tempoNorm = hist.quantidades[i] * (0.88 + ((hist.media_dias_resposta[i] - minTempo) / tempoRange) * 0.14);
    return { ano: String(ano), quantidade: hist.quantidades[i], tempoMedio: hist.media_dias_resposta[i], tempoNorm, variacao };
  });

  const totalGeral = hist.quantidades.reduce((a, b) => a + b, 0);
  const melhorTempo = Math.min(...hist.media_dias_resposta);
  const melhorTempoAno = hist.anos[hist.media_dias_resposta.indexOf(melhorTempo)];
  const variacaoQtd = lastIdx > 0
    ? (((hist.quantidades[lastIdx] - hist.quantidades[lastIdx - 1]) / hist.quantidades[lastIdx - 1]) * 100).toFixed(1)
    : null;
  const variacaoTempo = lastIdx > 0
    ? (hist.media_dias_resposta[lastIdx] - hist.media_dias_resposta[lastIdx - 1]).toFixed(1)
    : null;

  const CustomLabel = (props: any) => {
    const { x, y, index } = props;
    const item = chartData[index];
    if (!item || item.variacao === null) return null;
    const positive = item.variacao >= 0;
    return (
      <text x={x} y={y - 10} textAnchor="middle" fontSize={11} fontWeight={700} fill={positive ? "#15803d" : "#b91c1c"}>
        {`${positive ? "+" : ""}${item.variacao.toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const tempoPayload = payload.find((p: any) => p.dataKey === "tempoNorm");
    const qtdPayload = payload.find((p: any) => p.dataKey === "quantidade");
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-slate-800 mb-1.5">{label}</p>
        {qtdPayload && (
          <p className="text-slate-600 my-1 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-teal-600" />
            Qtd. Demandas: <strong className="text-slate-900">{qtdPayload.value?.toLocaleString("pt-BR")}</strong>
          </p>
        )}
        {tempoPayload && (
          <p className="text-slate-600 my-1 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900" />
            Tempo Médio: <strong className="text-slate-900">{tempoPayload.payload.tempoMedio} dias</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Evolução Histórica por Ano
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0 rounded-xl m-4 p-4 overflow-hidden border border-slate-200 shadow-sm"
            style={{ backgroundColor: "#f8fafc" }}>
            <ResponsiveContainer width="100%" height={290}>
              <ComposedChart data={chartData} margin={{ top: 36, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="ano" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis yAxisId="left" axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }} tickLine={{ stroke: "#cbd5e1" }} tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }} width={48} tickFormatter={(v) => v.toLocaleString("pt-BR")} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="quantidade" name="Qtd. Demandas"
                  fill="url(#gradBar)" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  <LabelList content={<CustomLabel />} />
                </Bar>
                <Line yAxisId="left" type="linear" dataKey="tempoNorm" name="Tempo Médio (dias)"
                  stroke="#0f172a" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0f172a", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#0f172a" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3 justify-center">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="inline-block w-3 h-2.5 bg-teal-600 rounded-sm" />
                Qtd. Demandas
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="inline-block w-3 h-0.5 bg-slate-900 rounded" />
                Tempo Médio (dias)
              </span>
            </div>
          </div>

          <div className="lg:w-52 flex flex-col gap-3 justify-center p-4 pl-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destaques</p>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Total acumulado</span>
              <span className="text-2xl font-bold text-foreground">{totalGeral.toLocaleString("pt-BR")}</span>
              <span className="text-[11px] text-muted-foreground">{hist.anos[0]} a {hist.anos[lastIdx]}</span>
            </div>
            {variacaoQtd !== null && (
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">Variação {hist.anos[lastIdx - 1]}→{hist.anos[lastIdx]}</span>
                <span className={`text-xl font-bold ${parseFloat(variacaoQtd) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {parseFloat(variacaoQtd) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(variacaoQtd))}%
                </span>
                <span className="text-[11px] text-muted-foreground">em demandas</span>
              </div>
            )}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Melhor tempo médio</span>
              <span className="text-xl font-bold text-amber-500">{melhorTempo} dias</span>
              <span className="text-[11px] text-muted-foreground">em {melhorTempoAno}</span>
            </div>
            {variacaoTempo !== null && (
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">Tempo {hist.anos[lastIdx]} vs. anterior</span>
                <span className={`text-xl font-bold ${parseFloat(variacaoTempo) <= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {parseFloat(variacaoTempo) <= 0 ? "▼" : "▲"} {Math.abs(parseFloat(variacaoTempo))} dias
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MensalChart({ dados }: { dados: DadosOuvidoria }) {
  const chartData = dados.mensal.meses.map((m, i) => ({
    mes: formatMesLabel(m),
    quantidade: dados.mensal.quantidades[i],
    tempoMedio: dados.mensal.media_dias_resposta[i],
  }));

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Manifestacoes por Mês - Tempo Medio de Resposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 24, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
            <Bar yAxisId="left" dataKey="quantidade" name="Manifestacoes" fill="#3ab3a5fa" radius={[4, 4, 0, 0]} maxBarSize={50} opacity={0.9}>
              <LabelList
                dataKey="quantidade"
                position="top"
                style={{ fill: "#000105ff", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
            <Line yAxisId="right" type="linear" dataKey="tempoMedio" name="Tempo Medio (dias)" stroke="#a7a7a7ff" strokeWidth={3} dot={{ r: 5, fill: "#04224eff", stroke: "#fff", strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SituacaoCharts({ dados }: { dados: DadosOuvidoria }) {
  const allowedSituations = ["Concluída", "Cadastrada", "Encaminhada para outro órgão"];
  const situacoesFiltradas = Object.fromEntries(
    Object.entries(dados.situacoes).filter(([key]) => {
        return allowedSituations.some(allowed => key.toLowerCase().includes(allowed.toLowerCase()) || 
            (allowed === "Encaminhada para outro órgão" && key.toLowerCase().includes("encaminhada")));
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DonutChart
        data={situacoesFiltradas}
        title="Distribuicao por Situacao"
        icon={PieIcon}
        topAreas={dados.principais_areas?.situacoes}
        colors={["#7e597fff", "#06b6d4", "#e77409ff", "#4ade80"]}
      />
      <HorizontalBarChart
        data={dados.decisoes}
        title="Especificacao da Decisao"
        icon={BarChart3}
        color="#8b5cf6"
        topAreas={dados.principais_areas?.decisoes}
      />
    </div>
  );
}

function FormularioCharts({ dados }: { dados: DadosOuvidoria }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DonutChart
        data={dados.subtipos}
        title="Subtipo de Formulario"
        icon={FileText}
        topAreas={dados.principais_areas?.subtipos}
        colors={["#4da539ff", "#536ceaf0", "#eaf345ff"]}
      />
      <DonutChart
        data={dados.recursos}
        title="Situacao do Recurso"
        icon={MessageSquare}
        topAreas={dados.principais_areas?.recursos}
        colors={["#15aa84ff", "#536ceaf0", "#fb50c5ff"]}
      />
    </div>
  );
}

function PerfilCharts({ dados }: { dados: DadosOuvidoria }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutChart
          data={dados.generos}
          title="Gênero"
          icon={Users}
          colors={["#3b82f6", "#ec4899", "#8b5cf6"]}
        />
        <DonutChart
          data={dados.tipos_pessoa}
          title="Tipo de Pessoa"
          icon={Building}
          colors={["#a352baff", "#f59e0b", "#06b6d4"]}
        />
      </div>
      {dados.estados && Object.keys(dados.estados).length > 0 && (
        <BrazilMapCard data={dados.estados} />
      )}
    </div>
  );
}