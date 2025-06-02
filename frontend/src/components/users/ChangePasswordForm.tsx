import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

interface ChangePasswordFormProps {
  username: string;
  onSubmit: (username: string, password: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ChangePasswordForm({ username, onSubmit, onCancel, loading }: ChangePasswordFormProps) {
  const [passwordDraft, setPasswordDraft] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!passwordDraft || !passwordConfirm) {
      setError('Please fill in both fields.');
      return false;
    }
    if (passwordDraft.length < 5) {
      setError('Password must be at least 5 characters.');
      return false;
    }
    if (passwordDraft !== passwordConfirm) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(username, passwordDraft);
    } catch (e: any) {
      setError(e.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center border border-indigo-100"
      onSubmit={handleSubmit}
    >
      <FiLock className="text-indigo-400 mb-2 cursor-pointer" size={32} />
      <div className="text-lg font-semibold text-indigo-800 mb-2">Change password</div>
      <input
        type="password"
        className="rounded-lg border border-gray-200 px-3 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="New password"
        value={passwordDraft}
        onChange={e => setPasswordDraft(e.target.value)}
        autoFocus
      />
      <input
        type="password"
        className="rounded-lg border border-gray-200 px-3 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder="Confirm password"
        value={passwordConfirm}
        onChange={e => setPasswordConfirm(e.target.value)}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="w-full mb-2 text-xs text-red-500 text-center"
        >
          {error}
        </motion.div>
      )}
      <div className="flex gap-2 w-full mt-2">
        <button
          type="button"
          className="flex-1 px-4 py-2 rounded bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition cursor-pointer"
          onClick={onCancel}
          disabled={submitting || loading}
        >Cancel</button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="flex-1 px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
          disabled={submitting || loading}
        >{submitting || loading ? 'Changing...' : 'Change'}</motion.button>
      </div>
    </motion.form>
  );
}
