import { FiChevronDown } from 'react-icons/fi';
import { BiSortAZ, BiSortZA } from 'react-icons/bi';

interface UsersFiltersProps {
  filters: {
    search: string;
    pageSize: number;
    sortBy: 'username' | 'role';
    sortOrder: 'asc' | 'desc';
  };
  setFilters: (f: any) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
}

export default function UsersFilters({
  filters,
  setFilters,
  page,
  setPage,
  totalPages,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end justify-evenly gap-2 mb-6">
      <div className="flex flex-col gap-1 grow min-w-[180px]">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">
          Search by username
        </label>
        <input
          type="text"
          className="rounded-lg dark:border-white px-3 h-[35px] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-900 text-indigo-500 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-300 font-medium bg-white dark:bg-gray-900 shadow-sm transition"
          placeholder="Type username..."
          value={filters.search}
          onChange={e => setFilters((f: any) => ({ ...f, search: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[90px] w-[90px]">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">Page size</label>
        <div className="relative">
          <select
            className="w-full pl-4 appearance-none rounded-lg dark:border-gray-800 px-2 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-900 font-semibold text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 cursor-pointer shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition text-sm"
            value={filters.pageSize}
            onChange={e => setFilters((f: any) => ({ ...f, pageSize: Number(e.target.value) }))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <FiChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            size={16}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 min-w-[110px] w-[110px]">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">Sort by</label>
        <div className="relative">
          <select
            className="appearance-none rounded-lg dark:border-gray-800 px-2 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-900 font-semibold text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 cursor-pointer shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition text-sm"
            value={filters.sortBy}
            onChange={e => setFilters((f: any) => ({ ...f, sortBy: e.target.value }))}
          >
            <option value="username">Username</option>
            <option value="role">Role</option>
          </select>
          <FiChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            size={16}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 min-w-[56px] w-[56px] items-center">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">Order</label>
        <button
          className="rounded-lg dark:border-gray-400 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-900 flex items-center justify-center bg-white dark:bg-gray-900 shadow-sm hover:border-indigo-600 dark:hover:border-indigo-400 transition cursor-pointer"
          onClick={() =>
            setFilters((f: any) => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }))
          }
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {filters.sortOrder === 'asc' ? (
            <BiSortAZ size={20} className="text-gray-500 dark:text-white" />
          ) : (
            <BiSortZA size={20} className="text-gray-500 dark:text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
