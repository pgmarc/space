import { motion } from 'framer-motion';

interface FormErrorProps {
  message: string;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full mb-2 px-4 py-2 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-medium flex items-center gap-2 shadow-sm"
      role="alert"
    >
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
      </svg>
      <span>{message}</span>
    </motion.div>
  );
}
