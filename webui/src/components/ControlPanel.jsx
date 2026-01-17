import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, X, Loader2, Play } from "lucide-react";

export default function ControlPanel({ onFileSelect, onPredict, predicting, file }) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Upload Area */}
            <div
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-out 
        ${dragActive ? 'border-accent1 bg-accent1/5 scale-[1.02]' : 'border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
            >
                <input ref={inputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/tiff" onChange={handleChange} />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-accent1 text-bg' : 'bg-white/5 text-neutral-400 group-hover:scale-110 group-hover:text-white'}`}>
                        <UploadCloud size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload TEM Micrograph</h3>
                    <p className="text-sm text-neutral-400 max-w-[200px]">
                        Drag & drop or click to browse. <br /> Supports PNG, TIFF, JPG.
                    </p>
                </div>
            </div>

            {/* Selected File & Controls */}
            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/10">
                            <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden flex-shrink-0">
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{file.name}</div>
                                <div className="text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
                                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Parameters (Mock) */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-300">Analysis Resolution</span>
                                    <span className="text-accent2">High</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-accent2"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-300">Smoothing Factor</span>
                                    <span className="text-accent1">0.8</span>
                                </div>
                                <input type="range" className="w-full accent-accent1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onPredict}
                            disabled={predicting}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                    ${predicting ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-gradient-to-r from-accent1 to-accent2 text-bg hover:shadow-accent1/20'}`}
                        >
                            {predicting ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play size={20} fill="currentColor" />
                                    Run Prediction
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
