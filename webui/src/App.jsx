import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UploadDropzone from './components/UploadDropzone';
import ImageViewer from './components/ImageViewer';
import PredictionCard from './components/PredictionCard';
import DatasetBrowser from './components/DatasetBrowser';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Zap } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showDatasetBrowser, setShowDatasetBrowser] = useState(false);
  const [selectedModel, setSelectedModel] = useState("final_demo_model");

  const scrollToWorkspace = () => {
    const el = document.getElementById('workspace');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setShowResults(false);
    setPrediction(null);
  };

  const handleDatasetSelect = (item) => {
    const mockFile = new File([], item.name, { type: 'image/tiff' });
    mockFile.datasetItem = item;
    setFile(mockFile);
    setShowDatasetBrowser(false);
    scrollToWorkspace();
  };

  // Generate a realistic simulated spectrum based on dataset metadata
  const generateSimulatedPrediction = (datasetItem) => {
    const peakNm = parseFloat(datasetItem.peak);
    const sizeNm = parseFloat(datasetItem.size);

    const wavelengths = [];
    const spectrum = [];

    for (let w = 400; w <= 900; w += 2) {
      wavelengths.push(w);
      const gamma = 20 + sizeNm * 0.5;
      const amplitude = 0.8 + (Math.random() * 0.1);
      const lorentzian = amplitude * (gamma * gamma) / ((w - peakNm) * (w - peakNm) + gamma * gamma);
      const noise = (Math.random() - 0.5) * 0.002;
      spectrum.push(Math.max(0, lorentzian + noise + 0.001));
    }

    const fwhm = 2 * (20 + sizeNm * 0.5);

    // Dynamic confidence based on particle size and material
    const baseConfidence = 75 + Math.random() * 10;
    const sizeBonus = Math.min(sizeNm / 5, 10);
    const materialBonus = datasetItem.material === 'Gold' ? 3 : 0;
    const confidence = Math.min(98, Math.round(baseConfidence + sizeBonus + materialBonus));

    return {
      wavelengths,
      spectrum,
      peak: peakNm,
      fwhm: Math.round(fwhm * 10) / 10,
      confidence,
      features: { size: `${sizeNm} nm`, material: datasetItem.material }
    };
  };

  useEffect(() => {
    if (file && !file.datasetItem && showResults) {
      handlePredict();
    }
  }, [selectedModel]);

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);

    try {
      let data;

      if (file.datasetItem) {
        // Sample dataset - generate simulated prediction
        await new Promise(resolve => setTimeout(resolve, 1200));
        data = generateSimulatedPrediction(file.datasetItem);
      } else {
        // Real file - call API
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`http://localhost:8000/predict?model=${selectedModel}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Prediction failed");
        }

        data = await response.json();
      }

      const chartData = data.wavelengths.map((w, i) => ({ w, a: data.spectrum[i] }));
      setPrediction({ ...data, data: chartData });

      setTimeout(() => {
        setShowResults(true);
        setLoading(false);
      }, 500);

    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,192,0.04) 0%, transparent 60%), #07090b',
        color: '#e6f0f3',
      }}
    >
      <Navbar onBrowseDataset={() => setShowDatasetBrowser(true)} />

      <main className="pt-16">
        <Hero
          onAnalyze={scrollToWorkspace}
          onBrowseDataset={() => setShowDatasetBrowser(true)}
        />

        {/* Workspace with Sidebars */}
        <div id="workspace" className="max-w-[1600px] mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Section header */}
            <div className="mb-10 text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{
                  background: 'rgba(124,92,255,0.08)',
                  border: '1px solid rgba(124,92,255,0.15)',
                  color: '#7c5cff',
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Zap size={12} />
                Analysis Workspace
              </motion.div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Upload & Analyze</h2>
              <p className="text-sm text-[#98a6b0] mt-1.5">Drop your TEM micrograph to begin spectrum prediction</p>
            </div>

            {/* Main layout with sidebars */}
            <div className="flex gap-6 items-start">
              {/* Left Sidebar - DNA Animation */}
              <Sidebar position="left" />

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Image Viewer */}
                  <div className="lg:col-span-8">
                    <ImageViewer imageSrc={file && !file.datasetItem ? URL.createObjectURL(file) : null} />
                  </div>

                  {/* Controls */}
                  <div className="lg:col-span-4 space-y-5">
                    {/* Upload Panel */}
                    <motion.div
                      className="rounded-2xl p-5"
                      style={{
                        background: 'linear-gradient(180deg, rgba(15,20,25,0.5) 0%, rgba(7,9,11,0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-base font-semibold text-white mb-4">Input Micrograph</h3>
                      <UploadDropzone onFile={handleFileSelect} file={file} />

                      {file && (
                        <motion.button
                          onClick={handlePredict}
                          disabled={loading}
                          className="w-full mt-5 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00d4c0 0%, #7c5cff 100%)',
                            color: loading ? '#98a6b0' : '#000',
                            boxShadow: loading ? 'none' : '0 4px 20px rgba(0,212,192,0.25)',
                          }}
                          whileHover={!loading ? { scale: 1.02, boxShadow: '0 6px 30px rgba(0,212,192,0.35)' } : {}}
                          whileTap={!loading ? { scale: 0.98 } : {}}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Play size={18} fill="currentColor" />
                              Run Prediction
                            </>
                          )}
                        </motion.button>
                      )}
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.03)',
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="text-xs font-semibold text-white mb-2.5 uppercase tracking-wider">Quick Tips</h4>
                      <ul className="space-y-2 text-xs text-[#98a6b0]">
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#00d4c0] mt-1.5 shrink-0" />
                          Use high-contrast TEM images
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#00d4c0] mt-1.5 shrink-0" />
                          Ensure particles are clearly separated
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#00d4c0] mt-1.5 shrink-0" />
                          PNG or TIFF recommended
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                  {showResults && prediction && (
                    <motion.div
                      className="mt-12"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, ease: [0.16, 0.84, 0.44, 1] }}
                    >
                      <PredictionCard
                        data={prediction.data}
                        peak={prediction.peak}
                        fwhm={prediction.fwhm}
                        confidence={prediction.confidence || 87}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Sidebar - Did You Know */}
              <Sidebar position="right" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Dataset Browser Modal */}
      <DatasetBrowser
        isOpen={showDatasetBrowser}
        onClose={() => setShowDatasetBrowser(false)}
        onSelectFile={handleDatasetSelect}
      />

      {/* Footer */}
      <footer
        className="py-8 text-center text-xs"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.03)',
          color: '#5a6570',
        }}
      >
        <p>© 2026 NanoOptics AI — Built with ❤️ for science</p>
      </footer>
    </div>
  );
}

export default App;
