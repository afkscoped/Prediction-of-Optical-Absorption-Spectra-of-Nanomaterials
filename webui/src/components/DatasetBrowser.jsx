import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Sample dataset with TEM images info (only 6 items, no bottom buttons)
const sampleDataset = [
    { id: 1, name: 'Au_40nm_sample1.tif', material: 'Gold', size: '40 nm', peak: '532 nm', thumbnail: '🔬' },
    { id: 2, name: 'Au_60nm_sample2.tif', material: 'Gold', size: '60 nm', peak: '548 nm', thumbnail: '🔬' },
    { id: 3, name: 'Ag_30nm_sample1.tif', material: 'Silver', size: '30 nm', peak: '410 nm', thumbnail: '🔬' },
    { id: 4, name: 'Au_20nm_sample3.tif', material: 'Gold', size: '20 nm', peak: '518 nm', thumbnail: '🔬' },
    { id: 5, name: 'Ag_50nm_sample2.tif', material: 'Silver', size: '50 nm', peak: '435 nm', thumbnail: '🔬' },
    { id: 6, name: 'Au_80nm_sample4.tif', material: 'Gold', size: '80 nm', peak: '565 nm', thumbnail: '🔬' },
];

export default function DatasetBrowser({ isOpen, onClose, onSelectFile }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-3xl overflow-hidden rounded-3xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15,20,25,0.98) 0%, rgba(7,9,11,1) 100%)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 30px 100px rgba(0,0,0,0.7)',
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.16, 0.84, 0.44, 1] }}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Sample Dataset</h2>
                            <p className="text-sm text-[#98a6b0] mt-1">Select a TEM micrograph to analyze</p>
                        </div>
                        <motion.button
                            onClick={onClose}
                            className="p-2.5 rounded-xl text-[#98a6b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Dataset Grid */}
                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-4">
                            {sampleDataset.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="rounded-2xl p-4 cursor-pointer group relative overflow-hidden"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06, ease: [0.16, 0.84, 0.44, 1] }}
                                    whileHover={{
                                        scale: 1.02,
                                        y: -4,
                                        boxShadow: '0 20px 40px rgba(0,212,192,0.1)',
                                    }}
                                    onClick={() => onSelectFile(item)}
                                >
                                    {/* Hover glow */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(0,212,192,0.05), rgba(124,92,255,0.05))',
                                            border: '1px solid rgba(0,212,192,0.15)',
                                            borderRadius: '16px',
                                        }}
                                    />

                                    {/* Thumbnail */}
                                    <div
                                        className="relative h-24 rounded-xl mb-3 flex items-center justify-center text-3xl"
                                        style={{
                                            background: 'radial-gradient(ellipse at center, rgba(0,212,192,0.08) 0%, rgba(7,9,11,0.8) 100%)',
                                            border: '1px solid rgba(255,255,255,0.03)',
                                        }}
                                    >
                                        <motion.span
                                            className="group-hover:scale-110 transition-transform duration-300"
                                        >
                                            {item.thumbnail}
                                        </motion.span>
                                    </div>

                                    {/* Info */}
                                    <h4 className="relative font-medium text-white text-sm truncate">{item.name}</h4>
                                    <div className="relative mt-2 flex items-center gap-2">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                            style={{
                                                background: item.material === 'Gold' ? 'rgba(255,200,0,0.12)' : 'rgba(192,192,192,0.12)',
                                                color: item.material === 'Gold' ? '#ffd700' : '#c0c0c0',
                                                border: `1px solid ${item.material === 'Gold' ? 'rgba(255,200,0,0.25)' : 'rgba(192,192,192,0.25)'}`,
                                            }}
                                        >
                                            {item.material}
                                        </span>
                                        <span className="text-xs text-[#98a6b0]">{item.size}</span>
                                    </div>
                                    <div className="relative mt-2 text-xs font-medium text-[#00d4c0]">Peak: {item.peak}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Subtle footer */}
                    <div className="px-8 py-4 border-t border-[rgba(255,255,255,0.03)] text-center">
                        <p className="text-xs text-[#5a6570]">Click any sample to load it into the analyzer</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
