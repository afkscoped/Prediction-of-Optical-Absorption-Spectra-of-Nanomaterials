import { motion } from "framer-motion";
import React from "react";

// Animated particles for simulation preview
const Particle = ({ delay, x, y, size }) => (
    <motion.div
        className="absolute rounded-full"
        style={{
            width: size,
            height: size,
            left: `${x}%`,
            top: `${y}%`,
            background: 'radial-gradient(circle, rgba(0,212,192,0.8) 0%, rgba(124,92,255,0.4) 70%, transparent 100%)',
            boxShadow: '0 0 8px rgba(0,212,192,0.5)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1.2, 0.8],
            x: [0, 10, -5, 0],
            y: [0, -8, 5, 0],
        }}
        transition={{
            duration: 4,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// Animated spectrum line for preview
const SpectrumLine = () => (
    <svg className="w-full h-16 mt-4" viewBox="0 0 200 40" preserveAspectRatio="none">
        <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4c0" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#00d4c0" stopOpacity="1" />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.2" />
            </linearGradient>
        </defs>
        <motion.path
            d="M 0 35 Q 30 35, 50 30 Q 70 25, 90 15 Q 100 5, 110 15 Q 130 25, 150 30 Q 170 35, 200 35"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        />
        <motion.path
            d="M 0 35 Q 30 35, 50 30 Q 70 25, 90 15 Q 100 5, 110 15 Q 130 25, 150 30 Q 170 35, 200 35 L 200 40 L 0 40 Z"
            fill="url(#lineGrad)"
            fillOpacity="0.1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
        />
    </svg>
);

export default function Hero({ onAnalyze, onBrowseDataset }) {
    const particles = [
        { x: 25, y: 30, size: 12, delay: 0 },
        { x: 45, y: 45, size: 18, delay: 0.5 },
        { x: 60, y: 25, size: 10, delay: 1 },
        { x: 35, y: 55, size: 14, delay: 1.5 },
        { x: 70, y: 50, size: 8, delay: 2 },
        { x: 50, y: 35, size: 20, delay: 0.8 },
        { x: 30, y: 40, size: 6, delay: 2.2 },
        { x: 65, y: 60, size: 10, delay: 1.2 },
    ];

    return (
        <section className="px-8 py-20 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center min-h-[85vh]">
            <div className="lg:col-span-7">
                <motion.div
                    className="inline-block mb-6 text-sm font-semibold px-4 py-2 rounded-full border border-[rgba(0,212,192,0.3)] text-[#00d4c0] tracking-wider"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    NANO-OPTICS AI V2.0
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight"
                >
                    <span className="text-white">Predict nanoparticle</span>
                    <br />
                    <span
                        className="inline-block mt-2"
                        style={{
                            background: 'linear-gradient(90deg, #00d4c0 0%, #7c5cff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        optical spectra
                    </span>
                    <span className="text-white"> instantly.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 text-xl text-[#98a6b0] max-w-xl leading-relaxed"
                >
                    Upload TEM micrographs and get high-fidelity absorption spectra with physics-informed confidence and explainability.
                </motion.p>

                <motion.div
                    className="mt-10 flex items-center gap-4 flex-wrap"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,212,192,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAnalyze}
                        className="rounded-xl px-8 py-4 font-semibold text-lg shadow-lg transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)',
                            color: '#000',
                        }}
                    >
                        Analyze image →
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBrowseDataset}
                        className="rounded-xl px-6 py-4 border border-[rgba(255,255,255,0.1)] text-[#e6f0f3] font-medium text-lg transition-all"
                    >
                        Browse dataset
                    </motion.button>
                </motion.div>
            </div>

            {/* Simulation Preview Card */}
            <motion.div
                className="lg:col-span-5"
                initial={{ opacity: 0, scale: 0.95, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
                <div
                    className="relative rounded-3xl p-[2px] overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,212,192,0.5) 0%, rgba(124,92,255,0.5) 100%)',
                    }}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 blur-xl opacity-30"
                        style={{
                            background: 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)',
                        }}
                    />

                    <div
                        className="relative rounded-3xl p-6"
                        style={{
                            background: 'linear-gradient(180deg, rgba(7,9,11,0.95) 0%, rgba(15,20,25,0.98) 100%)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Particle simulation area */}
                        <div
                            className="relative h-52 rounded-2xl overflow-hidden"
                            style={{
                                background: 'radial-gradient(ellipse at center, rgba(0,212,192,0.05) 0%, transparent 70%)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Animated particles */}
                            {particles.map((p, i) => (
                                <Particle key={i} {...p} />
                            ))}

                            {/* Center label */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                >
                                    <div className="text-sm text-[#98a6b0] uppercase tracking-widest mb-1">Live Simulation</div>
                                    <div className="text-base text-white/70">Au Nanoparticles</div>
                                </motion.div>
                            </div>

                            {/* Scan line animation - using CSS animation for smooth scroll */}
                            <div className="absolute left-0 right-0 h-[1px] scan-line"
                                style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,192,0.6) 50%, transparent 100%)',
                                    boxShadow: '0 0 10px rgba(0,212,192,0.5)',
                                }}
                            />
                        </div>

                        {/* Spectrum preview */}
                        <SpectrumLine />

                        {/* Info bar */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full pulse-dot"
                                    style={{ background: 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)' }}
                                />
                                <span className="text-base text-[#e6f0f3]">Au nanoparticles</span>
                                <span className="text-sm px-2 py-0.5 rounded-full bg-[rgba(0,212,192,0.1)] text-[#00d4c0] border border-[rgba(0,212,192,0.2)]">40nm avg</span>
                            </div>
                            <div className="text-base">
                                <span className="text-[#98a6b0]">Peak:</span>
                                <span className="ml-2 font-mono font-bold text-[#7c5cff]">534 nm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
