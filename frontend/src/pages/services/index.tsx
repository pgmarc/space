import { getServices } from "@/api/services/servicesApi";
import { useEffect, useState } from "react";
import type { Service, ServiceQueryFilters } from "@/types/Services";
import useAuth from "@/hooks/useAuth";
import ServicesLoader from "../../components/services-loader";
import ServicesFilters from "../../components/services-filters";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiServer } from "react-icons/fi";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<ServiceQueryFilters>({ page: 1, limit: 10, order: 'asc' });
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getServices(user.apiKey, filters).then((data: Service[]) => {
      setServices(data);
      setTotal(data.length);
      setLoading(false);
    });
  }, [filters, user.apiKey]);

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? 10)));
  const currentPage = filters.page ?? 1;

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 md:px-0">
      <h1 className="text-3xl font-bold text-indigo-800 mb-2">Services Management</h1>
      <p className="text-gray-500 mb-6">Browse and manage all available services. Click on a service to view its pricing versions and details.</p>
      <ServicesFilters filters={filters} setFilters={setFilters} />
      {loading ? (
        <ServicesLoader />
      ) : (
        <>
          <AnimatePresence>
            {services.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center text-gray-400 py-20"
              >
                No services found with the current filters.
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map(service => (
                  <motion.button
                    key={service.name}
                    layout
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 24px 0 rgba(99,102,241,0.10)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                    className="flex items-center gap-4 w-full bg-white/80 rounded-lg shadow border border-gray-200 px-6 py-5 transition cursor-pointer hover:bg-indigo-50 focus:outline-none"
                  >
                    <span className="bg-indigo-100 text-indigo-600 rounded-full p-2">
                      <FiServer size={28} />
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg text-indigo-800">{service.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.keys(service.activePricings).length} active pricing{Object.keys(service.activePricings).length === 1 ? '' : 's'}
                        {Object.keys(service.archivedPricings).length > 0 && (
                          <span> &middot; {Object.keys(service.archivedPricings).length} archived</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded border text-sm font-medium bg-white shadow hover:bg-indigo-50 disabled:opacity-50"
                onClick={() => setFilters(f => ({ ...f, page: Math.max(1, currentPage - 1) }))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={`page-${i+1}`}
                  className={`px-3 py-1 rounded border text-sm font-medium ${currentPage === i + 1 ? 'bg-indigo-100 text-indigo-700 border-indigo-400' : 'bg-white hover:bg-indigo-50'}`}
                  onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded border text-sm font-medium bg-white shadow hover:bg-indigo-50 disabled:opacity-50"
                onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, currentPage + 1) }))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}