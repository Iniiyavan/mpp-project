import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraCapture = ({ onCapture, onClose }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => setImgSrc(null);

    const confirm = () => {
        onCapture(imgSrc);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden max-w-2xl w-full"
            >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Camera size={18} className="text-blue-500" />
                        Live Image Capture
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {imgSrc ? (
                        <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{ facingMode: "user" }}
                        />
                    )}
                </div>

                <div className="p-6 bg-gray-900 flex justify-center gap-4">
                    {!imgSrc ? (
                        <button
                            onClick={capture}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                        >
                            <Camera size={20} /> Capture Frame
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={retake}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                            >
                                <RotateCcw size={18} /> Retake
                            </button>
                            <button
                                onClick={confirm}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                            >
                                <Check size={18} /> Analyze This Frame
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CameraCapture;
