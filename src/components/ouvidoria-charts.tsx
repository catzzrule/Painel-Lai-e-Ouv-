import type { DadosPainelOuvidoria } from "@/types/dados";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line, ComposedChart, LabelList,
} from "recharts";
import {
  TrendingUp, BarChart3, FileText, MessageSquare,
  Users, Building,
} from "lucide-react";
import { NATUREZA_COLORS, getColor } from "@/lib/chart-colors";
import { useEffect, useRef } from "react";
import { BrazilMapCard } from "@/components/brazil-map";

interface OuvidoriaChartsProps {
  section: "mensal" | "natureza" | "situacao" | "perfil";
  title: string;
  dados: DadosPainelOuvidoria;
}


// Renderiza label com cotovelo (linha dobrada) para evitar sobreposicao com a tabela lateral
const renderCustomPieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, index } = props;
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const mx = cx + (outerRadius + 8) * cos;
  const my = cy + (outerRadius + 8) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const textX = ex + (cos >= 0 ? 3 : -3);

  return (
    <g>
      <path
        d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${mx},${my}L${ex},${ey}`}
        stroke="#94a3b8"
        strokeWidth={1}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill="#94a3b8" />
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


const formatMes = (m: string) => {
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [ano, mes] = m.split("-");
  return nomes[parseInt(mes, 10) - 1] + "/" + ano.slice(2);
};

const toChartData = (obj: Record<string, number>, topAreas?: Record<string, string>) =>
  Object.entries(obj || {}).map(([name, value]) => ({
    name,
    value,
    topArea: topAreas ? topAreas[name] : undefined,
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
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: p.color || p.stroke }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke }}></span>
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

function DonutChart({
  data,
  title,
  icon: Icon,
  topAreas,
  colorMap,
  colors,
}: {
  data: Record<string, number>;
  title: string;
  icon: React.ElementType;
  topAreas?: Record<string, string>;
  colorMap?: Record<string, string>;
  colors?: string[];
}) {
  const chartData = toChartData(data, topAreas);
  const total = chartData.reduce((a, b) => a + b.value, 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Forca overflow visible no SVG gerado pelo Recharts para labels nao serem cortadas
    const svg = containerRef.current?.querySelector('svg');
    if (svg) svg.setAttribute('overflow', 'visible');
  });

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Donut Chart */}
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
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={colorMap?.[entry.name] || (colors ? colors[i % colors.length] : getColor(i))}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total no centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-card-foreground">{total.toLocaleString("pt-BR")}</span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </div>
          </div>

          {/* Tabela de legenda com QTD e % */}
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
                  const color = colorMap?.[entry.name] || (colors ? colors[i % colors.length] : getColor(i));
                  return (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="py-1.5 flex items-start gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: color }} />
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

function HorizontalBarChart({
  data,
  title,
  icon: Icon,
  color = "#8b5cf6",
  topAreas,
}: {
  data: Record<string, number>;
  title: string;
  icon: React.ElementType;
  color?: string;
  topAreas?: Record<string, string>;
}) {
  const rawData = toChartData(data, topAreas);
  const total = rawData.reduce((a, b) => a + b.value, 0);
  const chartData = rawData.map(d => ({
    ...d,
    pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0",
  }));

  const barHeight = 32;
  const chartHeight = Math.max(200, chartData.length * barHeight + 40);

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
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 90, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: "#334155", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={24}>
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

export function OuvidoriaCharts({ section, title, dados }: OuvidoriaChartsProps) {
  if (section === "mensal") {
    const mensalData = dados.mensal.meses.map((m, i) => ({
      mes: formatMes(m),
      manifestacoes: dados.mensal.quantidades[i],
      tempoMedio: dados.mensal.media_dias_resposta[i],
    }));

    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Manifestacoes por Mês - Tempo Medio de Resposta (Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={mensalData} margin={{ top: 24, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  unit="d"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  formatter={(value: string) => (
                    <span className="text-xs text-card-foreground/80">
                      {value === "manifestacoes" ? "Total de Manifestacoes" : "Tempo Medio (Dias)"}
                    </span>
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="manifestacoes"
                  fill="#3ab3a5fa"
                  radius={[4, 4, 0, 0]}
                  name="manifestacoes"
                  maxBarSize={50}
                  opacity={0.9}
                >
                  <LabelList
                    dataKey="manifestacoes"
                    position="top"
                    style={{ fill: "#000105ff", fontSize: 11, fontWeight: 700 }}
                  />
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tempoMedio"
                  stroke="#a7a7a7ff"
                  strokeWidth={3}
                  dot={{ fill: "#04224eff", r: 5, stroke: "#fff", strokeWidth: 2 }}
                  name="tempoMedio"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "natureza") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {/* Apenas a Natureza — Situação Atual removida (dados incorretos no campo) */}
        <DonutChart
          data={dados.naturezas || dados.subtipos}
          title="Distribuição por Natureza da Manifestação"
          icon={MessageSquare}
          colorMap={NATUREZA_COLORS}
          topAreas={dados.principais_areas?.naturezas}
        />
      </div>
    );
  }


  if (section === "situacao") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorizontalBarChart
            data={dados.decisoes}
            title="Resultado do Tratamento / Resposta"
            icon={BarChart3}
            color="#8b5cf6"
          />
          <HorizontalBarChart
            data={dados.status_prazo}
            title="Conformidade de Prazos (Nível de Serviço)"
            icon={FileText}
            color="#10b981"
          />
        </div>
      </div>
    );
  }

  if (section === "perfil") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {/* Linha 1: Gênero + Tipo de Pessoa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DonutChart
            data={dados.generos}
            title="Gênero do Solicitante"
            icon={Users}
            colors={["#3b82f6", "#ec4899", "#8b5cf6"]}
          />
          <DonutChart
            data={dados.tipos_pessoa}
            title="Tipo de Pessoa (PF / PJ)"
            icon={Building}
            colors={["#a352baff", "#f59e0b", "#06b6d4"]}
          />
        </div>
        {/* Linha 2: Mapa interativo do Brasil */}
        <BrazilMapCard data={dados.estados || {}} />
      </div>
    );
  }

  return null;
}
