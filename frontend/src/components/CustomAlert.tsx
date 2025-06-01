import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ message, onClose }: CustomAlertProps) {
  // Prevent background scroll when alert is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border border-indigo-100"
        >
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-indigo-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-lg text-gray-800 font-semibold text-center">{message}</span>
          </div>
          <button
            className="mt-6 px-6 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
