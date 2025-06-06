import { useState, useEffect, useMemo } from 'react';
import useAuth from '@/hooks/useAuth';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import UsersFilters from '@/components/users/UsersFilters';
import UsersList from '@/components/users/UsersList';
import AddUserModal from '@/components/users/AddUserModal';
import { getUsers } from '@/api/users/usersApi';

// Tipado para usuario
interface UserEntry {
  username: string;
  apiKey: string;
  role: 'ADMIN' | 'MANAGER' | 'EVALUATOR';
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    search: string;
    pageSize: number;
    sortBy: 'username' | 'role';
    sortOrder: 'asc' | 'desc';
  }>({
    search: '',
    pageSize: 10,
    sortBy: 'username',
    sortOrder: 'asc',
  });
  const [page, setPage] = useState(1);
  const [showAlert, alertElement] = useCustomAlert();
  const [refreshKey, setRefreshKey] = useState(0);
  const [addUserOpen, setAddUserOpen] = useState(false);

  // Refresca usuarios desde el server
  const refreshUsers = () => {
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    setLoading(true);
    getUsers(user.apiKey)
      .then((data: UserEntry[]) => setUsers(data))
      .catch((e) => showAlert(e.message ?? 'Failed to fetch users', 'danger'))
      .finally(() => setLoading(false));
  }, [user.apiKey, filters, refreshKey]);

  // Filtros y ordenación en cliente
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (filters.search) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    filtered = [...filtered].sort((a, b) => {
      let vA = a[filters.sortBy as 'username' | 'role'];
      let vB = b[filters.sortBy as 'username' | 'role'];
      if (typeof vA === 'string' && typeof vB === 'string') {
        vA = vA.toLowerCase();
        vB = vB.toLowerCase();
      }
      if (vA < vB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (vA > vB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [users, filters]);

  // Paginación en cliente
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * filters.pageSize;
    return filteredUsers.slice(start, start + filters.pageSize);
  }, [filteredUsers, page, filters.pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / filters.pageSize) || 1;

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-gray-100">Users</h1>
        <button
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-900"
          onClick={() => setAddUserOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add user
        </button>
      </div>
      {alertElement}
      <UsersFilters
        filters={filters}
        setFilters={setFilters}
      />
      <UsersList
        users={pagedUsers}
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        onUserChanged={refreshUsers}
      />
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onUserCreated={() => {
          showAlert('User created successfully', 'info');
          refreshUsers();
        }}
      />
    </div>
  );
}
