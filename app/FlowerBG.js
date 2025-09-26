import { motion } from 'framer-motion';

export default function FlowerBG({ className = '' }) {
  return (
    <motion.svg
      className={className}
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}
    >
      {/* Example flower pattern, you can replace with your own SVG paths for more accuracy */}
      <g stroke="#FFD700" strokeWidth="2" opacity="0.25">
        {[...Array(16)].map((_, i) => (
          <path
            key={i}
            d="M300 100 Q320 200 300 300 Q280 200 300 100 Z"
            transform={`rotate(${i * 22.5} 300 300)`}
            fill="none"
          />
        ))}
      </g>
      {/* Highlighted petal */}
      <path
        d="M300 100 Q320 200 300 300 Q280 200 300 100 Z"
        fill="#FFD700"
        opacity="0.5"
        transform="rotate(45 300 300)"
      />
    </motion.svg>
  );
}
