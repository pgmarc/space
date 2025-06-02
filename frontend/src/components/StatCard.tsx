import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  color?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, color = 'text-indigo-600', loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 min-w-[160px] min-h-[120px] border border-gray-100 dark:border-gray-700"
    >
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-3xl font-bold mb-1 dark:text-white">
        {loading ? <span className="animate-pulse text-gray-300 dark:text-gray-700">···</span> : value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wide text-center">{title}</div>
    </motion.div>
  );
}
