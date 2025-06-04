import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  color?: string;
  loading?: boolean;
}

// Convierte los datos en el formato que espera Recharts
function buildChartData(labels: string[], data: number[]) {
  return labels.map((label, i) => ({ label, value: data[i] ?? 0 }));
}

// Formatea números grandes: 1.2k, 3.4M, 5.6B, etc.
function formatNumberShort(n: number): string {
  if (n === null || n === undefined) return '';
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(n % 1e12 === 0 ? 0 : 1) + ' T';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + ' B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + ' M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1) + ' K';
  return n.toString();
}

export default function LineChartCard({ title, labels, data, color = 'indigo', loading }: LineChartCardProps) {
  const chartData = buildChartData(labels, data);
  const lineColor = color === 'indigo' ? '#6366f1' : '#3b82f6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="flex flex-col bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-6 w-full h-full min-h-[260px] border border-gray-100 dark:border-gray-700"
    >
      <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wide mb-2">{title}</div>
      <div className="flex-1 flex items-center w-full h-full min-h-[180px]">
        {loading ? (
          <div className="w-full h-[180px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40} // Asegura espacio para 4 caracteres
                tickFormatter={formatNumberShort}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}
                formatter={(value: number) => formatNumberShort(value as number)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={3}
                dot={{ r: 5, fill: lineColor }}
                activeDot={{ r: 7, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1100}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
