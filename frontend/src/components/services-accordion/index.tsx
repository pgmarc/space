import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Service, Pricing } from "@/types/Services";
import { FiChevronDown, FiChevronUp, FiArchive, FiZap } from "react-icons/fi";

interface Props {
  service: Service;
}

function PricingList({ title, pricings, icon, color }: { title: string; pricings: Record<string, Pricing>; icon: React.ReactNode; color: string }) {
  if (!pricings || Object.keys(pricings).length === 0) return null;
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 mb-1 mt-2">
        <span className={color}>{icon}</span>
        {title}
      </div>
      <ul className="pl-2">
        {Object.entries(pricings).map(([version, entry]) => (
          <li key={version} className="py-1 flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-700 transition">
            <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5">{version}</span>
            <a href={entry.version} target="_blank" rel="noopener noreferrer" className="underline text-indigo-500 hover:text-indigo-700">View YAML</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServiceAccordion({ service }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={false}
      className="bg-white/80 rounded-lg shadow border border-gray-200 mb-3 overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none hover:bg-indigo-50 transition"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg text-indigo-700">{service.name}</span>
          <span className="text-xs text-gray-400">{Object.keys(service.activePricings).length} active, {Object.keys(service.archivedPricings).length} archived</span>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          {open ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-4"
          >
            <PricingList
              title="Active pricings"
              pricings={service.activePricings}
              icon={<FiZap size={16} />}
              color="text-green-500"
            />
            <PricingList
              title="Archived pricings"
              pricings={service.archivedPricings}
              icon={<FiArchive size={16} />}
              color="text-gray-400"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
