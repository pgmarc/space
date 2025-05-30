import React from "react";
import { motion } from "framer-motion";

export default function ServicesLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="rounded-full border-4 border-indigo-300 border-t-indigo-600 w-12 h-12 mb-4"
        style={{ borderRightColor: "transparent" }}
      />
      <span className="text-indigo-600 font-medium mt-2">Loading services...</span>
    </div>
  );
}
