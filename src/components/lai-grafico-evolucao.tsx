import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LaiGraficoEvolucaoProps {
  registros: any[];
}

export function LaiGraficoEvolucao({ registros }: LaiGraficoEvolucaoProps) {
  const data = useMemo(() => {
    if (!registros || registros.length === 0) return [];

    const anos = [2023, 2024, 2025, 2026];
    
    return anos.map((ano) => {
      const registrosAno = registros.filter((r) => {
        const dataCadastro = r["Data de Cadastro"];
        return dataCadastro && dataCadastro.startsWith(ano.toString());
      });

      const qtd_manifestacoes = registrosAno.length;
      
      const prorrogadas = registrosAno.filter((r) => {
        const prazoSla = r["Dias de Prazo (SLA)"];
        const prazoResp = r["Dias para Resposta"];
        const prazo = prazoSla !== undefined && prazoSla !== null ? prazoSla : prazoResp;
        
        if (typeof prazo === 'number') {
          return prazo >= 25 && prazo <= 35;
        }
        return false;
      }).length;

      // Calcular tempo médio de resposta
      let somaDiasResposta = 0;
      let countDias = 0;
      registrosAno.forEach(r => {
        const dias = r["Dias para Resposta"];
        if (typeof dias === 'number') {
          somaDiasResposta += dias;
          countDias++;
        }
      });
      
      const tempo_medio = countDias > 0 ? (somaDiasResposta / countDias) : 0;

      return {
        ano: ano.toString(),
        qtd_manifestacoes,
        qtd_prorrogadas: prorrogadas,
        tempo_medio: parseFloat(tempo_medio.toFixed(1)),
      };
    });
  }, [registros]);

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Evolução Histórica (2023-2026)</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" vertical={false} />
            <XAxis dataKey="ano" scale="band" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            
            {/* Eixo Y Esquerdo (Quantidade) */}
            <YAxis 
              yAxisId="left" 
              tick={{ fill: '#64748b' }} 
              axisLine={false} 
              tickLine={false} 
            />
            
            {/* Eixo Y Direito (Tempo Médio) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#64748b' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `${value}d`}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar 
              yAxisId="left" 
              dataKey="qtd_manifestacoes" 
              name="Qtd Manifestações" 
              barSize={40} 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="left" 
              dataKey="qtd_prorrogadas" 
              name="Qtd Prorrogadas (25-35 dias)" 
              barSize={40} 
              fill="#f59e0b" 
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="tempo_medio" 
              name="Tempo Médio Resposta (dias)" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
