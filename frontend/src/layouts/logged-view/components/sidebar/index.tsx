import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router';
import useAuth from '@/hooks/useAuth';

const tabs = [
  { label: 'Overview', path: '/' },
  { label: 'Users Management', path: '/users' },
  { label: 'Pricings Management', path: '/pricings' },
  { label: 'Settings', path: '/settings' },
];

function getSelectedTab(pathname: string) {
  if (pathname.startsWith('/users')) return '/users';
  if (pathname.startsWith('/pricings')) return '/pricings';
  if (pathname.startsWith('/settings')) return '/settings';
  return '/main';
}

interface SidebarProps {
  readonly collapsed: boolean;
  readonly setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const selected = getSelectedTab(location.pathname);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-white/80 shadow-xl border-l border-gray-200 flex flex-col items-stretch fixed left-0 top-0 z-30"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex flex-col items-center py-6 px-4">
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
            {collapsed ? '' : `Welcome, ${user?.username ?? 'Anonymous'}`}
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 transition"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.span animate={{ rotate: collapsed ? 0 : 180 }} className="inline-block">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 18l6-6-6-6"
                />
              </svg>
            </motion.span>
          </button>
        </div>
        {!collapsed && <div className="w-full border-b border-gray-200 my-4" />}
      </div>
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {tabs.map(tab => (
          <motion.button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors
              ${
                selected === tab.path
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              ${collapsed ? 'justify-center px-2' : ''}`}
            whileTap={{ scale: 0.97 }}
            aria-current={selected === tab.path ? 'page' : undefined}
          >
            <span className="text-lg">{tab.label.split(' ')[0][0]}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>
      <div className="flex-0 p-4 text-xs text-gray-400 mt-auto text-center">
        {!collapsed && <span>SPACE &copy; {new Date().getFullYear()}</span>}
      </div>
    </motion.aside>
  );
}
