import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatMesLabel } from "@/lib/use-date-filter";

interface EvolucaoMensalChartProps {
  meses: string[];
  quantidades: number[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-card-foreground text-xs">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value.toLocaleString("pt-BR")} requisições</p>
    </div>
  );
};

export function EvolucaoMensalChart({ meses, quantidades, title = "Evolução Mensal das Requisições" }: EvolucaoMensalChartProps) {
  const chartData = meses.map((m, i) => ({ mes: formatMesLabel(m), qtd: quantidades[i] ?? 0 }));
  const tickInterval = chartData.length > 8 ? Math.ceil(chartData.length / 8) - 1 : 0;

  return (
    <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="qtd"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="rgba(59,130,246,0.12)"
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
