import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Github, Sparkles, X, Home, Database, Cpu, BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";

// Documentation page with actual content
const DocsPage = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const docSections = [
        {
            title: 'Getting Started',
            content: 'Welcome to NanoOptics AI! This guide will help you get started with predicting optical absorption spectra from TEM micrographs.',
            steps: [
                'Upload a high-quality TEM image of your nanoparticles',
                'Click "Run Prediction" to analyze the image',
                'View the predicted absorption spectrum and key metrics',
                'Export or save your results for further analysis'
            ]
        },
        {
            title: 'Preparing TEM Images',
            content: 'For best results, your TEM images should meet the following criteria:',
            steps: [
                'Resolution: Minimum 512x512 pixels recommended',
                'Format: PNG or TIFF for lossless quality',
                'Contrast: High contrast between particles and background',
                'Separation: Particles should be clearly distinguishable',
                'Scale: Include scale bar or known magnification'
            ]
        },
        {
            title: 'Understanding Predictions',
            content: 'The prediction model outputs several key metrics:',
            steps: [
                'Peak λ: The wavelength of maximum absorption',
                'FWHM: Full Width at Half Maximum - indicates spectral broadening',
                'Confidence: Model certainty based on input quality',
                'Spectrum: Full absorption curve from 400-900nm'
            ]
        },
        {
            title: 'API Reference',
            content: 'NanoOptics provides a REST API for programmatic access:',
            steps: [
                'POST /predict - Upload image and get prediction',
                'GET /health - Check API status',
                'Response includes: wavelengths, spectrum, peak, fwhm, features'
            ]
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={onClose}
                />

                <motion.div
                    className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15,20,25,0.98) 0%, rgba(7,9,11,1) 100%)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 30px 100px rgba(0,0,0,0.7)',
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 0.84, 0.44, 1] }}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between sticky top-0 bg-[rgba(7,9,11,0.95)] backdrop-blur-xl z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[rgba(0,212,192,0.1)]">
                                <BookOpen size={20} className="text-[#00d4c0]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Documentation</h2>
                                <p className="text-xs text-[#98a6b0]">Learn how to use NanoOptics effectively</p>
                            </div>
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

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)]">
                        <div className="space-y-8">
                            {docSections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="rounded-2xl p-6"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-[rgba(0,212,192,0.1)] text-[#00d4c0] text-xs flex items-center justify-center font-bold">
                                            {index + 1}
                                        </span>
                                        {section.title}
                                    </h3>
                                    <p className="text-sm text-[#98a6b0] mb-4">{section.content}</p>
                                    <ul className="space-y-2">
                                        {section.steps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-[#c0d0d8]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4c0] mt-1.5 shrink-0" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Navigation panel content
const NavPanel = ({ activePanel, onClose, onOpenDocs }) => {
    const panels = {
        dashboard: {
            title: 'Dashboard',
            icon: Home,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-[#98a6b0]">Quick overview of your recent analyses.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Total Analyses', value: '847', color: '#00d4c0' },
                            { label: 'This Week', value: '23', color: '#7c5cff' },
                            { label: 'Avg Accuracy', value: '94.2%', color: '#00d4c0' },
                            { label: 'Saved Results', value: '156', color: '#7c5cff' },
                        ].map(stat => (
                            <motion.div
                                key={stat.label}
                                className="p-3 rounded-xl"
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                }}
                                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.04)' }}
                            >
                                <div className="text-xs text-[#98a6b0]">{stat.label}</div>
                                <div className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )
        },
        models: {
            title: 'Models',
            icon: Cpu,
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-[#98a6b0]">Active prediction model configuration.</p>
                    <div
                        className="p-4 rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,212,192,0.05), rgba(124,92,255,0.05))',
                            border: '1px solid rgba(0,212,192,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-[#00d4c0]"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-sm font-medium text-[#00d4c0]">Active</span>
                        </div>
                        <div className="text-lg font-bold text-white">SpectrumMLP v2.0</div>
                        <div className="text-sm text-[#98a6b0] mt-1">4 inputs → 251 wavelengths</div>
                        <div className="text-xs text-[#5a6570] mt-2">Updated Jan 2026</div>
                    </div>
                </div>
            )
        }
    };

    const panel = panels[activePanel];
    if (!panel) return null;
    const PanelIcon = panel.icon;

    return (
        <motion.div
            className="absolute top-full left-0 right-0 mt-2 mx-8 rounded-2xl overflow-hidden z-50"
            style={{
                background: 'rgba(7,9,11,0.98)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[rgba(0,212,192,0.1)]">
                            <PanelIcon size={18} className="text-[#00d4c0]" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{panel.title}</h3>
                    </div>
                    <motion.button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[#98a6b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        whileHover={{ scale: 1.1 }}
                    >
                        <X size={16} />
                    </motion.button>
                </div>
                {panel.content}
            </div>
        </motion.div>
    );
};

export default function Navbar({ onBrowseDataset }) {
    const [activePanel, setActivePanel] = useState(null);
    const [showDocs, setShowDocs] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'datasets', label: 'Datasets', icon: Database },
        { id: 'models', label: 'Models', icon: Cpu },
        { id: 'docs', label: 'Docs', icon: BookOpen },
    ];

    const handleNavClick = (id) => {
        if (id === 'datasets' && onBrowseDataset) {
            onBrowseDataset();
            setActivePanel(null);
        } else if (id === 'docs') {
            setShowDocs(true);
            setActivePanel(null);
        } else {
            setActivePanel(activePanel === id ? null : id);
        }
    };

    return (
        <>
            <motion.nav
                className="fixed top-0 left-0 right-0 z-40"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 0.84, 0.44, 1] }}
                style={{
                    background: 'rgba(7,9,11,0.9)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between relative">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActivePanel(null)}
                    >
                        <motion.div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-black"
                            style={{
                                background: 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)',
                                boxShadow: '0 4px 15px rgba(0,212,192,0.25)',
                            }}
                            whileHover={{ boxShadow: '0 4px 25px rgba(0,212,192,0.4)' }}
                        >
                            <Ghost size={18} />
                        </motion.div>
                        <div>
                            <span className="font-bold text-lg text-white tracking-tight">Nano</span>
                            <span className="font-bold text-lg text-[#98a6b0]">Optics</span>
                        </div>
                    </motion.div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item, i) => {
                            const Icon = item.icon;
                            const isActive = activePanel === item.id || (item.id === 'docs' && showDocs);
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`relative flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-xl transition-all ${isActive ? 'text-white bg-[rgba(255,255,255,0.06)]' : 'text-[#98a6b0] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                                        }`}
                                    whileHover={{ y: -1 }}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                                >
                                    <Icon size={15} />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#00d4c0] border border-[rgba(0,212,192,0.2)] hover:bg-[rgba(0,212,192,0.05)] transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Sparkles size={14} />
                            What's new
                        </motion.button>

                        <motion.button
                            className="p-2 rounded-xl text-[#98a6b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Github size={18} />
                        </motion.button>

                        <motion.div
                            className="w-9 h-9 rounded-full p-[1.5px] cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="w-full h-full rounded-full bg-[#07090b] flex items-center justify-center text-xs font-bold text-white">
                                JD
                            </div>
                        </motion.div>
                    </div>

                    {/* Dropdown Panel */}
                    <AnimatePresence>
                        {activePanel && (
                            <NavPanel activePanel={activePanel} onClose={() => setActivePanel(null)} />
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>

            {/* Docs Modal */}
            <DocsPage isOpen={showDocs} onClose={() => setShowDocs(false)} />
        </>
    );
}
