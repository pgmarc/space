import { motion } from 'framer-motion';

interface SettingToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function SettingToggle({ label, checked, onChange }: SettingToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between py-4 px-6 bg-white/80 dark:bg-gray-800 rounded-xl shadow mb-4"
    >
      <span className="text-gray-700 dark:text-gray-200 font-medium text-lg">{label}</span>
      <button
        className={`cursor-pointer w-14 h-8 flex items-center rounded-full p-1 duration-300 focus:outline-none ${checked ? 'bg-indigo-500' : 'bg-gray-300'}`}
        onClick={() => onChange(!checked)}
        aria-label={label}
        type="button"
      >
        <motion.div
          layout
          className={`w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow transform duration-300 ${checked ? 'translate-x-6' : ''}`}
        />
      </button>
    </motion.div>
  );
}
