import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'danger';
}

const ICONS = {
  info: (
    <svg className="w-10 h-10 text-indigo-400 dark:text-indigo-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  warning: (
    <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.09 14A2 2 0 004 21h16a2 2 0 001.8-3.14l-8.09-14a2 2 0 00-3.42 0z" />
    </svg>
  ),
  danger: (
    <svg className="w-10 h-10 text-red-400 dark:text-red-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
    </svg>
  ),
};

const BUTTON_CLASSES = {
  info: 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:ring-indigo-300 dark:focus:ring-indigo-600',
  warning: 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 focus:ring-yellow-300 dark:focus:ring-yellow-500 text-gray-900 dark:text-gray-900',
  danger: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 focus:ring-red-300 dark:focus:ring-red-600',
};

export default function CustomConfirm({ message, onConfirm, onCancel, type = 'info' }: CustomConfirmProps) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border ${type === 'danger' ? 'border-red-200 dark:border-red-500' : type === 'warning' ? 'border-yellow-200 dark:border-yellow-500' : 'border-indigo-200 dark:border-indigo-500'}`}
        >
          <div className="flex flex-col items-center gap-2">
            {ICONS[type]}
            <span className="text-lg text-gray-800 dark:text-gray-100 font-semibold text-center">{message}</span>
          </div>
          <div className="flex gap-4 mt-6 w-full justify-center">
            <button
              className="cursor-pointer px-6 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition focus:outline-none"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`cursor-pointer px-6 py-2 rounded text-white font-semibold transition focus:outline-none focus:ring-2 ${BUTTON_CLASSES[type]}`}
              onClick={onConfirm}
              autoFocus
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
