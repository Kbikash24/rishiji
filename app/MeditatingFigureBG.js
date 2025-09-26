import { motion } from 'framer-motion';

export default function MeditatingFigureBG({ className = '' }) {
  return (
    <motion.svg
      className={className}
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ y: 0, opacity: 0.18 }}
      animate={{ y: [0, 10, 0], opacity: [0.18, 0.28, 0.18] }}
      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: '50%', top: '70%', transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}
    >
      {/* Simple meditating figure - stylized, minimal */}
      <ellipse cx="90" cy="150" rx="32" ry="10" fill="#FFD700" opacity="0.12" />
      <circle cx="90" cy="60" r="18" stroke="#FFD700" strokeWidth="3" fill="white" opacity="0.7" />
      <path d="M90 78 Q80 100 60 120 Q80 110 90 120 Q100 110 120 120 Q100 100 90 78 Z" stroke="#FFD700" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M90 78 Q90 100 90 120" stroke="#FFD700" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M90 90 Q80 105 70 120" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M90 90 Q100 105 110 120" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.5" />
    </motion.svg>
  );
}
