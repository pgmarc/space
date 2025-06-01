import type { Pricing } from "@/types/Services";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiArchive } from "react-icons/fi";

interface DragDropPricingsProps {
  activePricings: Pricing[];
  archivedPricings: Pricing[];
  onMove: (pricing: Pricing, to: "active" | "archived", toIndex?: number) => void;
}

export default function DragDropPricings({ activePricings, archivedPricings, onMove }: DragDropPricingsProps) {
  const [dragged, setDragged] = useState<null | { pricing: Pricing; from: "active" | "archived" }>(null);
  const [dropTarget, setDropTarget] = useState<null | { to: "active" | "archived"; index: number }>(null);

  function handleDragStart(e: React.DragEvent, pricing: Pricing, from: "active" | "archived") {
    setDragged({ pricing, from });
    e.dataTransfer.effectAllowed = "move";
    // Para Firefox
    e.dataTransfer.setData("text/plain", pricing.version);
  }
  function handleDragEnd() {
    setDragged(null);
    setDropTarget(null);
  }
  function handleDragOver(e: React.DragEvent, to: "active" | "archived", index: number) {
    e.preventDefault();
    setDropTarget({ to, index });
  }
  function handleDrop(e: React.DragEvent, to: "active" | "archived", index: number) {
    e.preventDefault();
    if (dragged && (dragged.from !== to || dragged.pricing.version !== (to === "active" ? activePricings[index]?.version : archivedPricings[index]?.version))) {
      onMove(dragged.pricing, to, index);
    }
    setDragged(null);
    setDropTarget(null);
  }
  function handleListDrop(e: React.DragEvent, to: "active" | "archived") {
    e.preventDefault();
    if (dragged) {
      onMove(dragged.pricing, to, undefined);
    }
    setDragged(null);
    setDropTarget(null);
  }

  function renderList(pricings: Pricing[], type: "active" | "archived") {
    return (
      <motion.ul
        layout
        className={`space-y-2 min-h-[60px] ${type === "active" ? "bg-green-50/30 border-green-100" : "bg-gray-50/50 border-gray-200"} rounded-lg p-2 border relative`}
        onDragOver={e => {
          e.preventDefault();
          // Calcular la posición exacta del hueco
          const bounding = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const offsetY = e.clientY - bounding.top;
          let index = pricings.length;
          let accHeight = 0;
          for (let i = 0; i < pricings.length; i++) {
            const el = document.getElementById(`${type}-pricing-${pricings[i].version}`);
            if (el) {
              const elHeight = el.offsetHeight + 8; // 8px de gap
              if (offsetY < accHeight + elHeight / 2) {
                index = i;
                break;
              }
              accHeight += elHeight;
            }
          }
          setDropTarget({ to: type, index });
        }}
        onDrop={e => handleListDrop(e, type)}
      >
        {pricings.map((pricing, i) => (
          <div key={pricing.version} className="relative">
            {/* Hueco animado */}
            <AnimatePresence>
              {dropTarget && dropTarget.to === type && dropTarget.index === i && (
                <motion.div
                  layoutId={`drop-gap-${type}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 56, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded border-2 border-dashed border-indigo-400 bg-indigo-100/40 my-1"
                />
              )}
            </AnimatePresence>
            <li
              id={`${type}-pricing-${pricing.version}`}
              draggable
              onDragStart={e => handleDragStart(e, pricing, type)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, type, i)}
              onDrop={e => handleDrop(e, type, i)}
              className={`bg-white/80 rounded shadow border border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 cursor-move hover:bg-${type === "active" ? "green-50" : "gray-100"} transition ${dragged && dragged.pricing.version === pricing.version ? "opacity-40" : ""}`}
              style={{ zIndex: dragged && dragged.pricing.version === pricing.version ? 50 : 1 }}
            >
              <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5 text-indigo-700">{pricing.version}</span>
              <span className="text-xs text-gray-500">{pricing.currency}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(pricing.createdAt).toLocaleDateString()}</span>
            </li>
          </div>
        ))}
        {/* Hueco al final de la lista */}
        <AnimatePresence>
          {dropTarget && dropTarget.to === type && dropTarget.index === pricings.length && (
            <motion.div
              layoutId={`drop-gap-${type}-end`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 56, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded border-2 border-dashed border-indigo-400 bg-indigo-100/40 my-1"
            />
          )}
        </AnimatePresence>
      </motion.ul>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 mb-1 mt-2">
          <span className="text-green-500"><FiZap size={18} /></span> Active pricings
        </div>
        {renderList(activePricings, "active")}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 mb-1 mt-2">
          <span className="text-gray-400"><FiArchive size={18} /></span> Archived pricings
        </div>
        {renderList(archivedPricings, "archived")}
      </div>
      {/* Drag preview: la tarjeta real sigue el cursor */}
      <AnimatePresence>
        {dragged && (
          <motion.div
            layoutId="dragged-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed pointer-events-none z-50"
            style={{ left: 0, top: 0, transform: `translate(-9999px, -9999px)` }}
          >
            {/* No se puede seguir el cursor nativamente con HTML5 DnD, pero se puede simular con libs externas si se desea */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
