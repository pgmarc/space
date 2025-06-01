import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCopy, FiKey, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useAuth from '@/hooks/useAuth';
import type { User } from '@/types/User';
import { updateUsername, changeUserRole, changeUserPassword } from '@/api/users/usersApi';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { useCustomConfirm } from '@/hooks/useCustomConfirm';
import ChangePasswordForm from './ChangePasswordForm';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 border-red-300',
  MANAGER: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  EVALUATOR: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};
const ROLE_TEXT_COLORS: Record<string, string> = {
  ADMIN: 'text-red-700',
  MANAGER: 'text-yellow-700',
  EVALUATOR: 'text-indigo-700',
};
const ROLE_BG_HOVER: Record<string, string> = {
  ADMIN: 'hover:bg-red-100',
  MANAGER: 'hover:bg-yellow-100',
  EVALUATOR: 'hover:bg-indigo-100',
};

const ROLES = ['ADMIN', 'MANAGER', 'EVALUATOR'];

function censorApiKey(apiKey: string) {
  if (!apiKey) return '';
  return apiKey.slice(0, 6) + '****';
}

export default function UsersList({
  users,
  loading,
  page,
  setPage,
  totalPages,
  onUserChanged,
}: {
  users: User[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onUserChanged?: () => void;
}) {
  const { user: loggedUser, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAlert, alertElement] = useCustomAlert();
  const [showConfirm, confirmElement] = useCustomConfirm();

  async function handleEditUsername(username: string) {
    setEditing(username);
    setUsernameDraft(username);
  }
  async function handleSaveUsername(username: string) {
    if (!usernameDraft || usernameDraft === username) {
      setEditing(null);
      return;
    }
    try {
      const updated = await updateUsername(loggedUser.apiKey, username, usernameDraft);
      showAlert('Username updated successfully', 'info');
      setEditing(null);
      if (username === loggedUser.username) {
        updateUser({ username: updated.username });
      }
      if (onUserChanged) onUserChanged();
    } catch (e: any) {
      showAlert(e.message, 'danger');
    }
  }
  function handleCopy(apiKey: string, username: string) {
    navigator.clipboard.writeText(apiKey);
    setCopied(username);
    setTimeout(() => setCopied(null), 1200);
  }
  async function handleChangeRole(username: string, newRole: string) {
    // Confirmación antes de cambiar el rol
    showConfirm(
      `Are you sure you want to change the role of "${username}" to "${newRole}"?`,
      'warning'
    )
      .then(async confirmed => {
        if (confirmed) {
          const updated = await changeUserRole(loggedUser.apiKey, username, newRole as any);
          showAlert('Role updated successfully', 'info');
          setRoleDropdown(null);
          if (username === loggedUser.username) {
            if (updated.role === 'EVALUATOR') {
              logout();
            } else {
              updateUser({ role: updated.role });
            }
          }
        }
        if (onUserChanged) onUserChanged();
      })
      .catch(e => {
        showAlert(e.message, 'danger');
      });
  }
  // New function to pass to ChangePasswordForm
  async function handleChangePassword(username: string, password: string) {
    try {
      await changeUserPassword(loggedUser.apiKey, username, password);
      showAlert('Password changed successfully', 'info');
      setPasswordModal(null);
      if (onUserChanged) onUserChanged();
    } catch (e: any) {
      throw e; // The error is displayed directly in the form
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Username</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">API Key</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-10 text-center text-indigo-500 font-semibold">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-10 text-center text-gray-400 font-medium">
                No users found
              </td>
            </tr>
          ) : (
            users.map((u: any) => (
              <tr key={u.username} className="hover:bg-indigo-50/30 transition">
                {/* Editable username */}
                <td className="px-4 py-3">
                  {editing === u.username ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={usernameDraft}
                        onChange={e => setUsernameDraft(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveUsername(u.username);
                          if (e.key === 'Escape') setEditing(null);
                        }}
                      />
                      <button
                        className="text-indigo-600 hover:text-indigo-900 font-bold text-xs cursor-pointer"
                        onClick={() => handleSaveUsername(u.username)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-sm text-indigo-800 cursor-pointer hover:underline"
                        onClick={() => handleEditUsername(u.username)}
                      >
                        {u.username}
                      </span>
                      <FiEdit2
                        className="text-gray-400 cursor-pointer hover:text-indigo-500"
                        size={15}
                        onClick={() => handleEditUsername(u.username)}
                      />
                    </div>
                  )}
                </td>
                {/* Censored API Key and copy */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-700 select-all">
                      {censorApiKey(u.apiKey)}
                    </span>
                    <button
                      className="p-1 rounded hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                      onClick={() => handleCopy(u.apiKey, u.username)}
                      title="Copy API Key"
                    >
                      {copied === u.username ? (
                        <span className="text-green-600 font-semibold text-xs">Copied!</span>
                      ) : (
                        <FiCopy size={16} className="cursor-pointer" />
                      )}
                    </button>
                  </div>
                </td>
                {/* Rol with tag and dropdown */}
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <button
                      className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${
                        ROLE_COLORS[u.role]
                      } cursor-pointer`}
                      onClick={() =>
                        setRoleDropdown(roleDropdown === u.username ? null : u.username)
                      }
                    >
                      {u.role}
                      {roleDropdown === u.username ? (
                        <FiChevronUp size={14} className="cursor-pointer" />
                      ) : (
                        <FiChevronDown size={14} className="cursor-pointer" />
                      )}
                    </button>
                    <AnimatePresence>
                      {roleDropdown === u.username && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ type: 'spring', duration: 0.18 }}
                          className="absolute left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                        >
                          {ROLES.filter(r => {
                            if (loggedUser?.role === 'MANAGER') {
                              // A manager can only switch between MANAGER and EVALUATOR, never to ADMIN nor demote an ADMIN
                              if (u.role === 'ADMIN' || r === 'ADMIN') return false;
                              if (u.role === 'MANAGER' && r === 'EVALUATOR') return true;
                              if (u.role === 'EVALUATOR' && r === 'MANAGER') return true;
                              return false;
                            }
                            // Admins can change any role
                            return r !== u.role;
                          }).map(r => (
                            <button
                              key={r}
                              className={`w-full text-left px-4 py-2 text-xs font-medium bg-white ${ROLE_TEXT_COLORS[r]} ${ROLE_BG_HOVER[r]} cursor-pointer transition`}
                              onClick={() => handleChangeRole(u.username, r)}
                            >
                              {r}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
                {/* Acciones */}
                <td className="px-4 py-3">
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer disabled:opacity-50"
                    onClick={() => setPasswordModal(u.username)}
                    disabled={u.role === 'ADMIN' && loggedUser?.role !== 'ADMIN'}
                  >
                    <FiKey size={14} className="cursor-pointer" /> Change password
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal para cambiar contraseña */}
      <AnimatePresence>
        {passwordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <ChangePasswordForm
              username={passwordModal}
              onSubmit={async (username, password) => {
                await handleChangePassword(username, password);
              }}
              onCancel={() => setPasswordModal(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Paginación debajo de la tabla */}
      <div className="flex justify-center gap-2 items-center py-4">
        <button
          className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span className="text-sm font-medium text-gray-700">
          {page} / {totalPages}
        </span>
        <button
          className="px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
      {/* Justo antes del return principal, añade el alertElement para mostrar alertas */}
      {alertElement}
      {confirmElement}
    </div>
  );
}
