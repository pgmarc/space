import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  color?: string;
  loading?: boolean;
}

export default function ChartCard({ title, labels, data, color = 'indigo', loading }: ChartCardProps) {
  // Simple bar chart SVG (sin dependencias externas)
  const max = Math.max(...data, 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-white/80 rounded-xl shadow p-6 min-w-[260px] min-h-[180px] border border-gray-100"
    >
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">{title}</div>
      <div className="flex-1 flex items-end gap-2 h-24 w-full">
        {loading
          ? Array.from({ length: labels.length }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-6 h-12 bg-gray-200 animate-pulse rounded" />
                <div className="text-[10px] text-gray-400 mt-1">···</div>
              </div>
            ))
          : data.map((v, i) => (
              <div key={labels[i]} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 rounded-t ${color === 'indigo' ? 'bg-indigo-400' : 'bg-blue-400'}`}
                  style={{ height: `${(v / max) * 64 + 8}px`, transition: 'height 0.4s' }}
                />
                <div className="text-[10px] text-gray-400 mt-1">{labels[i]}</div>
              </div>
            ))}
      </div>
    </motion.div>
  );
}
