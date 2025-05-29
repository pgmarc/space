import { motion } from 'framer-motion';

interface LightBackgroundProps {
  children: React.ReactNode;
}

export default function LightBackground({ children }: LightBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      {/* Animated stars for a subtle, light space effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      >
        <svg width="100%" height="100%" className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1600}
              cy={Math.random() * 900}
              r={Math.random() * 1.1 + 0.2}
              fill="#b3bcf5"
              opacity={Math.random() * 0.3 + 0.1}
            />
          ))}
        </svg>
      </motion.div>
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}
