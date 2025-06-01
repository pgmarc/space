import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addPricingVersion } from '@/api/services/servicesApi';
import useAuth from '@/hooks/useAuth';
import type { Service } from '@/types/Services';

interface AddVersionModalProps {
  open: boolean;
  onClose: (service?: Service) => void;
  serviceName: string;
}

export default function AddVersionModal({ open, onClose, serviceName }: AddVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  const handleFile = (selected: File | null) => {
    setError('');
    if (selected && !/\.(ya?ml)$/i.test(selected.name)) {
      setError('Only .yml or .yaml files are allowed.');
      setFile(null);
      return;
    }
    setFile(selected || null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a .yml or .yaml file.');
      return;
    }
    setError('');
    addPricingVersion(user.apiKey, serviceName, file)
      .then((service: Service) => {
        setFile(null);
        onClose(service);
      })
      .catch(async error => {
        setError(error.message);
      });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border border-indigo-100 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold text-indigo-700 dark:text-white mb-2">Add New Pricing Version</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
              Upload a YAML file (.yml or .yaml) to add a new pricing version for <span className="font-semibold text-indigo-700 dark:text-white">{serviceName}</span>.
            </p>
            <div
              className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${dragActive ? 'border-indigo-400 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40' : 'border-indigo-200 dark:border-gray-600 bg-indigo-100/60 dark:bg-gray-800/60'}`}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              style={{ minHeight: 120 }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".yml,.yaml"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center py-6">
                <svg
                  className="w-10 h-10 text-indigo-400 dark:text-indigo-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16v-8m0 0l-4 4m4-4l4 4m-8 8h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-indigo-700 dark:text-indigo-200 font-medium">
                  Drag & drop your .yml or .yaml file here
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to select a file</span>
                {file && (
                  <span className="mt-2 text-indigo-600 dark:text-indigo-200 text-sm font-semibold">{file.name}</span>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 dark:text-red-400 text-sm mt-2 mb-1">{error}</div>}
            <div className="flex gap-3 mt-4 w-full">
              <button
                className="cursor-pointer flex-1 px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                onClick={() => { onClose() }}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer flex-1 px-4 py-2 rounded bg-indigo-600 dark:bg-indigo-700 text-white font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
