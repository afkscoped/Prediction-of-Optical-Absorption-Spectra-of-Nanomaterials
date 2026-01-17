import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CountUp from "react-countup";

const MetricCard = ({ label, value, unit, delay, color = "#00d4c0" }) => (
    <motion.div
        className="p-5 rounded-2xl text-center"
        style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.03)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.04)' }}
    >
        <div className="text-sm tracking-widest text-[#98a6b0] uppercase mb-2">{label}</div>
        <div className="text-4xl font-bold font-mono" style={{ color }}>
            <CountUp end={value || 0} duration={1.8} decimals={1} />
            <span className="text-base ml-1 font-normal text-[#5a6570]">{unit}</span>
        </div>
    </motion.div>
);

export default function PredictionCard({ data, peak, fwhm, confidence = 87 }) {
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 800);
        return () => clearTimeout(timer);
    }, []);

    // Calculate proper Y-axis domain based on data
    const getYDomain = () => {
        if (!data || data.length === 0) return [0, 1];
        const values = data.map(d => d.a);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;
        return [Math.max(0, min - padding), max + padding];
    };

    const yDomain = getYDomain();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 0.84, 0.44, 1] }}
            className="rounded-3xl overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(15,20,25,0.8) 0%, rgba(7,9,11,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.03)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
        >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.03)] flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-3xl font-bold text-white tracking-tight">Predicted Spectrum</h3>
                    <p className="text-base text-[#98a6b0] mt-1">Full absorption extraction from TEM analysis</p>
                </motion.div>

                <motion.div
                    className="flex items-center gap-3 px-4 py-2 rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,212,192,0.1), rgba(124,92,255,0.1))',
                        border: '1px solid rgba(0,212,192,0.15)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-[#00d4c0]"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-base text-[#98a6b0]">Confidence</span>
                    <span className="font-bold text-lg text-[#00d4c0]">{confidence}%</span>
                </motion.div>
            </div>

            {/* Chart */}
            <div className="px-8 py-6">
                <motion.div
                    className="h-80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="spectrumGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00d4c0" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#00d4c0" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="#00d4c0" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#00d4c0" />
                                    <stop offset="100%" stopColor="#7c5cff" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.03)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="w"
                                tick={{ fill: '#98a6b0', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                tickLine={false}
                                tickFormatter={(v) => `${v}`}
                                label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5, fill: '#98a6b0', fontSize: 12 }}
                            />
                            <YAxis
                                domain={yDomain}
                                tick={{ fill: '#98a6b0', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                tickLine={false}
                                tickFormatter={(v) => v.toFixed(4)}
                                label={{ value: 'Extinction (a.u.)', angle: -90, position: 'insideLeft', fill: '#98a6b0', fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(7,9,11,0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    fontSize: '14px',
                                }}
                                itemStyle={{ color: '#00d4c0' }}
                                labelStyle={{ color: '#98a6b0', marginBottom: '4px' }}
                                formatter={(value) => [value.toFixed(6), 'Absorbance']}
                                labelFormatter={(label) => `Wavelength: ${label} nm`}
                            />
                            <Area
                                type="monotone"
                                dataKey="a"
                                stroke="url(#lineGrad)"
                                strokeWidth={2.5}
                                fill="url(#spectrumGrad)"
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Metrics */}
            <div className="px-8 pb-8">
                <div className="grid grid-cols-3 gap-4">
                    <MetricCard label="Peak λ" value={peak} unit="nm" delay={0.5} color="#00d4c0" />
                    <MetricCard label="FWHM" value={fwhm} unit="nm" delay={0.6} color="#7c5cff" />
                    <MetricCard label="Max Intensity" value={0.84} unit="a.u." delay={0.7} color="#e6f0f3" />
                </div>
            </div>
        </motion.div>
    );
}
