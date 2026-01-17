import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Atom, Zap, TrendingUp, BookOpen, Beaker } from 'lucide-react';

// Fun facts about nanomaterials
const nanoFacts = [
    { icon: Atom, fact: "Gold nanoparticles can appear red, purple, or blue depending on their size due to surface plasmon resonance.", category: "Optics" },
    { icon: Zap, fact: "Nanoparticles have a surface area to volume ratio up to 1000x greater than bulk materials.", category: "Physics" },
    { icon: Sparkles, fact: "Silver nanoparticles have been used for antimicrobial purposes for over 100 years.", category: "History" },
    { icon: TrendingUp, fact: "The global nanomaterials market is expected to reach $16.8 billion by 2028.", category: "Industry" },
    { icon: BookOpen, fact: "Quantum dots can emit light of virtually any color and are used in advanced displays.", category: "Technology" },
    { icon: Beaker, fact: "Nanoparticles can cross the blood-brain barrier, enabling targeted drug delivery to the brain.", category: "Medicine" },
    { icon: Atom, fact: "Carbon nanotubes are 100x stronger than steel but 6x lighter.", category: "Materials" },
    { icon: Sparkles, fact: "The unique optical properties of nanoparticles were unknowingly used in medieval stained glass.", category: "History" },
];

// Did You Know component
export const DidYouKnow = () => {
    const [currentFactIndex, setCurrentFactIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFactIndex(prev => (prev + 1) % nanoFacts.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const currentFact = nanoFacts[currentFactIndex];
    const FactIcon = currentFact.icon;

    return (
        <div
            className="rounded-2xl p-5"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
            }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-[#7c5cff]" />
                <h4 className="text-xs font-semibold text-white tracking-widest uppercase">Did You Know?</h4>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentFactIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FactIcon size={12} className="text-[#00d4c0]" />
                        <span className="text-[10px] text-[#00d4c0] uppercase tracking-wider font-medium">{currentFact.category}</span>
                    </div>
                    <p className="text-sm text-[#c0d0d8] leading-relaxed">{currentFact.fact}</p>
                </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1 mt-4">
                {nanoFacts.map((_, i) => (
                    <div
                        key={i}
                        className="w-1 h-1 rounded-full transition-all duration-300"
                        style={{
                            background: i === currentFactIndex ? '#7c5cff' : 'rgba(255,255,255,0.1)',
                            transform: i === currentFactIndex ? 'scale(1.3)' : 'scale(1)',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// DNA Animation using CSS animations (won't stop on scroll)
export const DNAAnimation = () => (
    <div
        className="rounded-2xl h-96 relative overflow-hidden"
        style={{
            background: 'linear-gradient(180deg, rgba(15,20,25,0.4) 0%, rgba(7,9,11,0.6) 100%)',
            border: '1px solid rgba(255,255,255,0.03)',
        }}
    >
        <div className="absolute inset-0 flex items-center justify-center">
            {/* DNA Helix using CSS animations */}
            <div className="dna-container">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="dna-strand"
                        style={{
                            top: `${(i / 12) * 100}%`,
                            animationDelay: `${i * -0.15}s`,
                        }}
                    >
                        <div className="dna-node dna-node-left" />
                        <div className="dna-bridge" />
                        <div className="dna-node dna-node-right" />
                    </div>
                ))}
            </div>

            {/* Floating particles using CSS */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={`p-${i}`}
                    className="floating-particle"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                        background: i % 2 === 0 ? '#00d4c0' : '#7c5cff',
                        boxShadow: `0 0 8px ${i % 2 === 0 ? 'rgba(0,212,192,0.6)' : 'rgba(124,92,255,0.6)'}`,
                    }}
                />
            ))}
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="text-xs text-[#5a6570] uppercase tracking-widest">Molecular</div>
            <div className="text-sm text-[#98a6b0]">Visualization</div>
        </div>
    </div>
);

// Left sidebar with DNA animation
export const LeftSidebar = () => (
    <motion.div
        className="hidden xl:block w-64 shrink-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
    >
        <div className="sticky top-28">
            <DNAAnimation />
        </div>
    </motion.div>
);

// Right sidebar with Did You Know
export const RightSidebar = () => (
    <motion.div
        className="hidden xl:block w-64 shrink-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
    >
        <div className="sticky top-28">
            <DidYouKnow />
        </div>
    </motion.div>
);

export default function Sidebar({ position = 'left' }) {
    if (position === 'left') return <LeftSidebar />;
    return <RightSidebar />;
}
