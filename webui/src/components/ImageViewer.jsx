import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageViewer({ imageSrc, overlays = {} }) {
    const [mode, setMode] = useState("original");
    const [zoom, setZoom] = useState(1);

    const modes = [
        { id: "original", label: "Original" },
        { id: "segmentation", label: "Segmentation" },
        { id: "gradcam", label: "Grad-CAM" },
    ];

    return (
        <motion.div
            className="rounded-2xl h-[520px] flex flex-col overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(15,20,25,0.5) 0%, rgba(7,9,11,0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 0.84, 0.44, 1] }}
        >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.03)] flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-white text-sm">Image Viewer</h3>
                    <p className="text-[10px] text-[#5a6570] mt-0.5">Interactive analysis canvas</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#98a6b0]">
                    <motion.button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                        className="w-6 h-6 rounded-lg hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        −
                    </motion.button>
                    <span className="w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                    <motion.button
                        onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                        className="w-6 h-6 rounded-lg hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        +
                    </motion.button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {imageSrc ? (
                        <motion.div
                            key="image"
                            className="absolute inset-0 flex items-center justify-center p-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="relative"
                                animate={{ scale: zoom }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <img
                                    src={imageSrc}
                                    alt="TEM Micrograph"
                                    className="max-h-[360px] max-w-full rounded-xl object-contain"
                                    style={{
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                                    }}
                                />

                                {/* Overlays */}
                                <AnimatePresence>
                                    {mode === 'segmentation' && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.5 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                background: 'radial-gradient(circle at 30% 40%, rgba(0,212,192,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,212,192,0.4) 0%, transparent 40%)',
                                                mixBlendMode: 'screen',
                                            }}
                                        />
                                    )}
                                    {mode === 'gradcam' && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            style={{
                                                background: 'radial-gradient(ellipse at 50% 50%, rgba(255,80,80,0.5) 0%, rgba(255,180,0,0.3) 35%, rgba(0,80,200,0.2) 65%, transparent 85%)',
                                                mixBlendMode: 'overlay',
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="absolute inset-0 flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,212,192,0.08) 0%, rgba(124,92,255,0.08) 100%)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                }}
                                animate={{
                                    scale: [1, 1.03, 1],
                                    rotate: [0, 1, -1, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <span className="text-3xl opacity-40">🔬</span>
                            </motion.div>
                            <p className="text-[#98a6b0] text-sm">No image loaded</p>
                            <p className="text-[#5a6570] text-xs mt-1">Upload a TEM micrograph to begin</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mode toggles */}
            <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.02)]">
                    {modes.map((m) => (
                        <motion.button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className="relative px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                            style={{
                                color: mode === m.id ? '#fff' : '#98a6b0',
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {mode === m.id && (
                                <motion.div
                                    className="absolute inset-0 rounded-lg"
                                    layoutId="activeMode"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0,212,192,0.15), rgba(124,92,255,0.15))',
                                        border: '1px solid rgba(0,212,192,0.2)',
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{m.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
