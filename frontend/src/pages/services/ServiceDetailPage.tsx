import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getPricingsFromService } from "@/api/services/servicesApi";
import useAuth from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { FiZap, FiArchive } from "react-icons/fi";
import type { Pricing } from "@/types/Services";

export default function ServiceDetailPage() {
  const { name } = useParams<{ name: string }>();
  const { user } = useAuth();
  const [activePricings, setActivePricings] = useState<Pricing[]>([]);
  const [archivedPricings, setArchivedPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getPricingsFromService(user.apiKey, name!, "active"),
      getPricingsFromService(user.apiKey, name!, "archived"),
    ]).then(([active, archived]) => {
      if (mounted) {
        setActivePricings(active);
        setArchivedPricings(archived);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [name, user.apiKey]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-2 md:px-0">
      <h1 className="text-3xl font-bold text-indigo-800 mb-2">{name}</h1>
      <p className="text-gray-500 mb-6">All pricing versions for this service.</p>
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full border-4 border-indigo-300 border-t-indigo-600 w-12 h-12 mb-4"
            style={{ borderRightColor: "transparent" }}
          />
          <span className="text-indigo-600 font-medium mt-2">Loading pricings...</span>
        </div>
      ) : (
        <>
          <PricingSection
            title="Active pricings"
            pricings={activePricings}
            icon={<FiZap size={18} />}
            color="text-green-500"
          />
          <PricingSection
            title="Archived pricings"
            pricings={archivedPricings}
            icon={<FiArchive size={18} />}
            color="text-gray-400"
          />
        </>
      )}
    </div>
  );
}

function PricingSection({ title, pricings, icon, color }: { title: string; pricings: Pricing[]; icon: React.ReactNode; color: string }) {
  if (!pricings || pricings.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 mb-1 mt-2">
        <span className={color}>{icon}</span>
        {title}
      </div>
      <motion.ul layout className="space-y-2">
        {pricings.map(pricing => (
          <motion.li
            key={pricing.version}
            layout
            className="bg-white/80 rounded shadow border border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-center gap-2"
          >
            <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5 text-indigo-700">{pricing.version}</span>
            <span className="text-xs text-gray-500">{pricing.currency}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(pricing.createdAt).toLocaleDateString()}</span>
            {/* <a href={'#'} target="_blank" rel="noopener noreferrer" className="underline text-indigo-500 hover:text-indigo-700 text-xs ml-2">View YAML</a> */}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
