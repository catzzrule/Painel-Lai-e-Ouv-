"use client"

import { useState } from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"

function toPath(points: { x: number; y: number }[]) {
  return points.reduce((path, point, index) => {
    return index === 0
      ? `M ${point.x},${point.y}`
      : `${path} L ${point.x},${point.y}`
  }, "")
}

function formatDelta(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value)}%`
}

export interface LineGraphData {
  ano: string;
  quantidade: number;
  tempoMedio: number;
}

export function LineGraph({ data }: { data: LineGraphData[] }) {
  const width = 800;
  const height = 400;
  const paddingX = 60;
  const paddingTop = 40;
  const paddingBottom = 40;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxQtd = Math.max(...data.map(d => d.quantidade), 1) * 1.1; // 10% headroom
  const maxTempo = Math.max(...data.map(d => d.tempoMedio), 1) * 1.2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * innerWidth;
    return {
      x,
      yQtd: height - paddingBottom - (d.quantidade / maxQtd) * innerHeight,
      yTempo: height - paddingBottom - (d.tempoMedio / maxTempo) * innerHeight,
      ...d
    };
  });

  const lineQtd = toPath(points.map(p => ({ x: p.x, y: p.yQtd })));
  const lineTempo = toPath(points.map(p => ({ x: p.x, y: p.yTempo })));

  const [active, setActive] = useState<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);

  const onHover = (index: number) => {
    setActive(index)
    if (index > 0) {
      const current = data[index].quantidade
      const previous = data[index - 1].quantidade
      if (previous > 0) {
         setDelta(((current - previous) / previous) * 100)
      } else {
         setDelta(null)
      }
    } else {
      setDelta(null)
    }
  }

  const onLeave = () => {
    setActive(null)
    setDelta(null)
  }

  const negative = delta !== null && delta < 0
  const tooltip = active !== null ? points[active] : null

  // Grid lines (5 horizontal lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = height - paddingBottom - pct * innerHeight;
    return { y, valQtd: pct * maxQtd, valTempo: pct * maxTempo };
  });

  return (
    <div className="relative w-full overflow-hidden" onPointerLeave={onLeave}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#12a594" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#12a594" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid and Y-Axes labels */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <motion.line
              x1={paddingX}
              y1={line.y}
              x2={width - paddingX}
              y2={line.y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            {/* Left Y Axis (Quantidade) */}
            <text x={paddingX - 10} y={line.y + 4} fill="#64748b" fontSize={11} textAnchor="end">
              {Math.round(line.valQtd)}
            </text>
            {/* Right Y Axis (Tempo Médio) */}
            <text x={width - paddingX + 10} y={line.y + 4} fill="#64748b" fontSize={11} textAnchor="start">
              {Math.round(line.valTempo)}
            </text>
          </g>
        ))}

        {/* X-Axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 15} fill="#64748b" fontSize={12} textAnchor="middle">
            {p.ano}
          </text>
        ))}

        {/* Quantidade Area */}
        <motion.path
          d={`${lineQtd} L ${width - paddingX},${height - paddingBottom} L ${paddingX},${height - paddingBottom} Z`}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Quantidade Line */}
        <motion.path
          d={lineQtd}
          fill="none"
          stroke="#12a594"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Tempo Médio Line */}
        <motion.path
          d={lineTempo}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        <motion.g
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { delayChildren: 0.1, staggerChildren: 1.5 / Math.max(points.length, 1) } },
          }}
        >
          {points.map((point, index) => (
            <g key={index}>
              {/* Interaction Overlay */}
              <motion.rect
                x={point.x - (innerWidth / points.length) / 2}
                y={paddingTop}
                width={innerWidth / points.length}
                height={innerHeight}
                fill="transparent"
                onHoverStart={() => onHover(index)}
                style={{ cursor: "pointer" }}
              />
              
              {/* Quantidade Dot */}
              <motion.circle
                cx={point.x}
                cy={point.yQtd}
                r="5"
                fill="#fff"
                stroke="#12a594"
                strokeWidth="2"
                animate={active === index ? { scale: 1.5 } : { scale: 1 }}
                variants={{
                  hidden: { scale: 0.5, opacity: 0 },
                  visible: { scale: 1, opacity: 1 },
                }}
              />

              {/* Tempo Dot */}
              <motion.circle
                cx={point.x}
                cy={point.yTempo}
                r="4"
                fill="#fff"
                stroke="#f59e0b"
                strokeWidth="2"
                animate={active === index ? { scale: 1.5 } : { scale: 1 }}
                variants={{
                  hidden: { scale: 0.5, opacity: 0 },
                  visible: { scale: 1, opacity: 1 },
                }}
              />
            </g>
          ))}
        </motion.g>
      </svg>
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            className="absolute z-50 pointer-events-none bg-white rounded-lg shadow-xl border border-slate-100 p-3 w-48 flex flex-col gap-1"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              left: tooltip.x > width / 2 ? 'auto' : `calc(${(tooltip.x / width) * 100}% + 20px)`,
              right: tooltip.x > width / 2 ? `calc(${100 - (tooltip.x / width) * 100}% + 20px)` : 'auto',
              top: '10%',
            }}
          >
            <div className="text-sm font-semibold text-slate-800 mb-1">{tooltip.ano}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#12a594]"></div>
                Quantidade
              </span>
              <span className="font-medium">{tooltip.quantidade}</span>
            </div>
            
            {delta !== null && (
              <MotionConfig transition={{ type: "spring", visualDuration: 0.6, bounce: 0.2 }}>
                <div className="flex items-center gap-1 text-[11px] font-medium justify-end -mt-1 mb-1">
                  <motion.span
                    initial={{ rotate: negative ? 180 : 0 }}
                    animate={{ rotate: negative ? 180 : 0 }}
                    style={{ color: negative ? "#ef4444" : "#10b3a3" }}
                  >
                    ↑
                  </motion.span>
                  <motion.span style={{ color: negative ? "#ef4444" : "#10b3a3" }}>
                    {formatDelta(delta)}
                  </motion.span>
                </div>
              </MotionConfig>
            )}

            <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-slate-100">
              <span className="text-slate-500 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                Tempo Médio
              </span>
              <span className="font-medium">{tooltip.tempoMedio} dias</span>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LineGraph
