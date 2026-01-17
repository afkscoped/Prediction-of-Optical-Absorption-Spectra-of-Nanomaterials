import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";

export default function UploadDropzone({ onFile, file }) {
    const ref = useRef();
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFile(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => ref.current?.click()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative cursor-pointer group"
                    >
                        {/* Animated border */}
                        <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{
                                background: dragging
                                    ? 'linear-gradient(135deg, rgba(0,212,192,0.2), rgba(124,92,255,0.2))'
                                    : 'transparent',
                                border: dragging
                                    ? '2px solid rgba(0,212,192,0.4)'
                                    : '2px dashed rgba(255,255,255,0.08)',
                            }}
                            animate={{
                                boxShadow: dragging
                                    ? 'inset 0 0 30px rgba(0,212,192,0.08)'
                                    : 'inset 0 0 0 rgba(0,212,192,0)',
                            }}
                            transition={{ duration: 0.25 }}
                        />

                        <div className="relative px-6 py-8 rounded-xl flex flex-col items-center justify-center text-center">
                            <motion.div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                style={{
                                    background: dragging
                                        ? 'linear-gradient(135deg, rgba(0,212,192,0.15), rgba(124,92,255,0.15))'
                                        : 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                }}
                                animate={dragging ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                transition={{ duration: 0.6, repeat: dragging ? Infinity : 0 }}
                            >
                                <Upload
                                    size={20}
                                    className={`transition-colors duration-200 ${dragging ? 'text-[#00d4c0]' : 'text-[#98a6b0]'}`}
                                />
                            </motion.div>

                            <h4 className="font-medium text-white text-sm mb-1">
                                {dragging ? 'Drop to upload' : 'Upload TEM Micrograph'}
                            </h4>
                            <p className="text-xs text-[#98a6b0]">
                                Drag & drop or <span className="text-[#00d4c0]">browse</span>
                            </p>
                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#5a6570]">
                                <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">PNG</span>
                                <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">TIFF</span>
                                <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">JPG</span>
                            </div>

                            <input
                                ref={ref}
                                type="file"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl p-3.5"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-14 h-14 rounded-lg overflow-hidden shrink-0"
                                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{file.name}</p>
                                <p className="text-xs text-[#98a6b0] mt-0.5">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c0]" />
                                    <span className="text-[10px] text-[#00d4c0] font-medium">Ready to analyze</span>
                                </div>
                            </div>
                            <motion.button
                                onClick={(e) => { e.stopPropagation(); onFile(null); }}
                                className="p-2 rounded-lg text-[#98a6b0] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
