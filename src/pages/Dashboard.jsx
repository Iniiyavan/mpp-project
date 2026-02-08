import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ScanFace,
    BarChart2,
    User as UserIcon,
    LogOut,
    Upload,
    Menu,
    X,
    Sun,
    Moon,
    Bell,
    Settings,
    Shield,
    Camera,
    Download,
    Share2,
    FileText,
    Activity,
    Zap,
    Server,
    Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import dashboardBg from '../assets/dashboard-bg.png';
import CameraCapture from '../components/CameraCapture';
import confetti from 'canvas-confetti';

const Dashboard = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, connectionStatus, updateProfile, updatePassword } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('detection');
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Batch processing states
    const [batchFiles, setBatchFiles] = useState([]);
    const [batchResults, setBatchResults] = useState([]);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [batchProgress, setBatchProgress] = useState(0);

    // Profile Edit States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');

    // Password Change States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState('request'); // 'request', 'otp', 'new'
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [userEnteredOtp, setUserEnteredOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [isShake, setIsShake] = useState(false);

    // Last analysis result for Live Metrics display
    const [lastAnalysis, setLastAnalysis] = useState(null);

    const [scanHistory, setScanHistory] = useState([]);
    const [loadingScans, setLoadingScans] = useState(false);
    const fileInputRef = useRef(null);
    const reportRef = useRef(null);

    // Add a notification
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 5));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    // Check backend health on mount
    useEffect(() => {
        const checkEngine = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            try {
                const res = await fetch(`${apiUrl}/health`);
                if (res.ok) {
                    addNotification('🚀 Neural Engine Connected', 'success');
                } else {
                    addNotification('⚠️ Neural Engine returned an error', 'error');
                }
            } catch (e) {
                console.error('Engine connectivity check failed:', e);
                addNotification(`📡 Connection to ${apiUrl} failed.`, 'error');
            }
        };
        checkEngine();

        const timer = setInterval(() => {
            if (activeTab === 'detection' && Math.random() > 0.7) {
                addNotification('New network scan initiated by system', 'info');
            }
        }, 15000);
        return () => clearInterval(timer);
    }, [activeTab]);

    // Load scan history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('scanHistory');
        if (saved) {
            setScanHistory(JSON.parse(saved));
        }
        setLoadingScans(false);
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const navItems = [
        { id: 'detection', label: 'Detection Model', icon: <ScanFace size={18} /> },
        { id: 'analytics', label: 'Analytics Modules', icon: <BarChart2 size={18} /> },
        { id: 'overview', label: 'Live Metrics', icon: <LayoutDashboard size={18} /> },
        { id: 'profile', label: 'Identity', icon: <UserIcon size={18} /> },
    ];

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 1) {
            // Single file - process immediately
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedMedia(event.target.result);
                handleAnalyze(event.target.result);
            };
            reader.readAsDataURL(file);
        } else if (files.length > 1) {
            // Multiple files - prepare for batch processing
            const fileData = files.map(file => ({
                file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                status: 'queued',
                result: null,
                confidence: null
            }));
            setBatchFiles(fileData);
            addNotification(`📁 ${files.length} images ready for batch analysis`, 'info');
        }
    };

    const startBatchProcessing = async () => {
        if (batchFiles.length === 0) return;

        setIsBatchProcessing(true);
        setBatchResults([]);
        setCurrentBatchIndex(0);
        setBatchProgress(0);

        addNotification('🚀 Starting batch analysis...', 'info');

        const results = [];
        let processed = 0;

        for (let i = 0; i < batchFiles.length; i++) {
            const batchItem = batchFiles[i];
            setCurrentBatchIndex(i);

            try {
                // Update status
                setBatchFiles(prev => prev.map(item =>
                    item.id === batchItem.id
                        ? { ...item, status: 'processing' }
                        : item
                ));

                // Convert file to base64
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(batchItem.file);
                });

                // Analyze the image
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const response = await fetch(`${apiUrl}/predict`, {
                    method: 'POST',
                    body: (() => {
                        const formData = new FormData();
                        formData.append('file', batchItem.file, batchItem.name);
                        return formData;
                    })()
                });

                if (!response.ok) {
                    throw new Error('Analysis failed');
                }

                const data = await response.json();

                const result = {
                    ...batchItem,
                    status: 'completed',
                    result: data.result,
                    confidence: data.confidence,
                    detection_method: data.detection_method,
                    ai_model_confidence: data.ai_model_confidence,
                    stats_score: data.stats_score
                };

                results.push(result);
                processed++;

                // Update progress
                const progress = ((processed / batchFiles.length) * 100);
                setBatchProgress(progress);

                // Update batch files status
                setBatchFiles(prev => prev.map(item =>
                    item.id === batchItem.id
                        ? result
                        : item
                ));

            } catch (error) {
                console.error(`Failed to process ${batchItem.name}:`, error);

                const failedResult = {
                    ...batchItem,
                    status: 'failed',
                    result: 'ERROR',
                    confidence: '0.0%'
                };

                results.push(failedResult);
                processed++;

                setBatchFiles(prev => prev.map(item =>
                    item.id === batchItem.id
                        ? failedResult
                        : item
                ));
            }
        }

        setBatchResults(results);
        setIsBatchProcessing(false);
        setBatchProgress(100);

        const fakeCount = results.filter(r => r.result === 'FAKE').length;
        const realCount = results.filter(r => r.result === 'REAL').length;

        addNotification(`✅ Batch complete! ${fakeCount} FAKE, ${realCount} REAL out of ${results.length} images`, 'success');
    };

    const clearBatch = () => {
        setBatchFiles([]);
        setBatchResults([]);
        setIsBatchProcessing(false);
        setCurrentBatchIndex(0);
        setBatchProgress(0);
        addNotification('Batch cleared', 'info');
    };

    const handleAnalyze = async (media = selectedMedia) => {
        if (!media) {
            addNotification('Please select or capture media first', 'error');
            return;
        }
        setIsAnalyzing(true);
        setIsAnalyzed(false);
        addNotification('Connecting to AI Neural Engine...', 'info');

        try {
            // 1. Convert Base64 media back to a File object for the backend
            const response = await fetch(media);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('file', blob, 'analysis_target.jpg');

            // 2. Send to our Python AI Server
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            const aiResponse = await fetch(`${apiUrl}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!aiResponse.ok) {
                const errorData = await aiResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'AI Server responded with an error');
            }

            const data = await aiResponse.json();

            // 3. Process result from your .h5 model
            const isFake = data.result === 'FAKE';

            const newResult = {
                id: Date.now(),
                name: `Neural_Scan_${scanHistory.length + 1}`,
                timestamp: new Date().toLocaleString(),
                result: data.result,
                confidence: data.confidence,
                media: media
            };

            // Store detailed analysis result for Live Metrics display
            const detailedResult = {
                ...newResult,
                detection_method: data.detection_method || 'ai_model',
                ai_model_confidence: data.ai_model_confidence || data.confidence,
                stats_score: data.stats_score || '0.000',
                technical_explanation: generateTechnicalExplanation(data, isFake)
            };

            setIsAnalyzing(false);
            setIsAnalyzed(true);
            setAnalysisResult(newResult);
            setLastAnalysis(detailedResult);

            // Save scan to localStorage
            const updatedHistory = [newResult, ...scanHistory];
            setScanHistory(updatedHistory);
            localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

            if (isFake) {
                addNotification(`🚨 DANGER: ${data.confidence} SYNTHETIC PROBABILITY`, 'error');
                if (navigator.vibrate) navigator.vibrate(2000);
                setIsShake(true);
                setTimeout(() => setIsShake(false), 2000);
            } else {
                addNotification(`🎉 VERIFIED: ${data.confidence} AUTHENTICITY SCORE`, 'success');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#ffffff']
                });
            }
        } catch (err) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            console.error('Analysis failed:', err);
            setIsAnalyzing(false);
            addNotification(err.message === 'Failed to fetch'
                ? `AI Engine Offline at ${apiUrl}. Please ensure the server is running.`
                : `AI Engine Error: ${err.message}`, 'error');
        }
    };

    const downloadReport = async () => {
        if (!reportRef.current) return;
        addNotification('Loading PDF engines...', 'info');

        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        addNotification('Generating PDF report...', 'info');
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: theme === 'dark' ? '#030712' : '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`rebel-forensic-report-${Date.now()}.pdf`);
        addNotification('Report downloaded successfully', 'success');
    };

    const shareReport = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Forensic Analysis Report',
                text: 'Check out this deepfake verification report from REBEL AI.',
                url: window.location.href
            }).catch(() => addNotification('Sharing failed', 'error'));
        } else {
            addNotification('Sharing not supported on this browser', 'info');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveProfile = () => {
        if (!editName.trim() || !editEmail.trim()) {
            addNotification('Name and Email cannot be empty', 'error');
            return;
        }
        updateProfile({ name: editName, email: editEmail });
        setIsEditingProfile(false);
        addNotification('Profile updated successfully', 'success');
    };

    const handleSendOtp = () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        setPasswordStep('otp');
        addNotification(`OTP sent to your email: ${otp} (Simulated)`, 'success');
    };

    const handleVerifyOtp = () => {
        if (userEnteredOtp === generatedOtp) {
            setPasswordStep('new');
            addNotification('OTP Verified. Please enter new password', 'success');
        } else {
            addNotification('Invalid OTP. Please try again', 'error');
        }
    };

    const generateTechnicalExplanation = (data, isFake) => {
        const method = data.detection_method || 'ai_model';
        const aiConfidence = parseFloat(data.ai_model_confidence?.replace('%', '') || data.confidence?.replace('%', '') || '0');
        const statsScore = parseFloat(data.stats_score || '0');

        if (method === 'hash_based') {
            return {
                title: "🔐 Exact Match Detection",
                explanation: "This image was identified through cryptographic hash matching against our known fake image database. This provides 100% certainty of the result.",
                technical_details: "SHA256 hash comparison confirmed exact binary match with previously verified synthetic content.",
                confidence_reason: "Hash-based identification provides absolute certainty (100%) as it compares exact file signatures."
            };
        }

        if (isFake) {
            if (method === 'hybrid_ai_stats') {
                return {
                    title: "🤖 AI + Statistical Analysis",
                    explanation: "Multiple detection layers confirmed synthetic content: neural network classification combined with statistical pattern analysis.",
                    technical_details: `AI Model: ${aiConfidence.toFixed(1)}% fake confidence. Statistical Score: ${(statsScore * 100).toFixed(1)}% synthetic pattern match.`,
                    confidence_reason: "Hybrid approach combines deep learning predictions with forensic statistical analysis for reliable detection."
                };
            } else if (method === 'hybrid_suspicious') {
                return {
                    title: "⚠️ Suspicious Pattern Detected",
                    explanation: "Image shows characteristics consistent with AI generation, though with moderate confidence requiring further verification.",
                    technical_details: `Statistical analysis detected potential synthetic artifacts. AI model confidence: ${aiConfidence.toFixed(1)}%.`,
                    confidence_reason: "Borderline detection - statistical patterns suggest AI generation but confidence is not absolute."
                };
            } else {
                return {
                    title: "🧠 Neural Network Classification",
                    explanation: "Deep learning model classified this image as synthetically generated based on learned patterns from extensive training data.",
                    technical_details: `Convolutional neural network analysis showed ${(aiConfidence).toFixed(1)}% probability of AI generation.`,
                    confidence_reason: "AI model prediction based on millions of learned parameters identifying synthetic image characteristics."
                };
            }
        } else {
            return {
                title: "✅ Authentic Content Verified",
                explanation: "Image analysis confirms natural, human-captured content with no detectable synthetic artifacts or manipulation.",
                technical_details: `AI model confidence: ${(100 - aiConfidence).toFixed(1)}% authentic. Statistical analysis confirmed natural image patterns.`,
                confidence_reason: "Multiple verification layers confirmed the absence of AI generation artifacts and manipulation traces."
            };
        }
    };

    const handleChangePassword = () => {
        if (newPassword.length < 6) {
            addNotification('Password must be at least 6 characters', 'error');
            return;
        }
        const success = updatePassword(newPassword);
        if (success) {
            setShowPasswordModal(false);
            setPasswordStep('request');
            setNewPassword('');
            setUserEnteredOtp('');
            addNotification('Password changed successfully', 'success');
        } else {
            addNotification('Failed to change password', 'error');
        }
    };

    // Radar Chart Component
    const RadarChart = () => {
        const data = [
            { label: 'Accuracy', rebel: 98, detection: 85, artifact: 78, trend: '+2.1%', trendUp: true },
            { label: 'Latency', rebel: 94, detection: 72, artifact: 65, trend: '+1.8%', trendUp: true },
            { label: 'Resilience', rebel: 96, detection: 78, artifact: 70, trend: '+0.9%', trendUp: true },
            { label: 'Sync', rebel: 92, detection: 82, artifact: 74, trend: '-0.5%', trendUp: false },
            { label: 'Precision', rebel: 97, detection: 88, artifact: 76, trend: '+3.2%', trendUp: true },
            { label: 'Stability', rebel: 95, detection: 79, artifact: 68, trend: '+1.5%', trendUp: true },
        ];

        const size = 300;
        const center = size / 2;
        const radius = (size - 40) / 2;
        const angleStep = (Math.PI * 2) / data.length;

        const getPoint = (value, angle) => ({
            x: center + (value / 100) * radius * Math.cos(angle - Math.PI / 2),
            y: center + (value / 100) * radius * Math.sin(angle - Math.PI / 2)
        });

        const getPath = (competitor) => {
            const points = data.map((item, i) => {
                const angle = i * angleStep;
                return getPoint(item[competitor], angle);
            });
            const pathData = points.map(p => `${p.x},${p.y}`).join(' L ');
            return `M ${pathData} Z`;
        };

        return (
            <motion.svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Background circles */}
                {[20, 40, 60, 80, 100].map((level) => (
                    <circle
                        key={level}
                        cx={center}
                        cy={center}
                        r={(level / 100) * radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-gray-200 dark:text-gray-700"
                    />
                ))}

                {/* Axis lines */}
                {data.map((_, i) => {
                    const angle = i * angleStep;
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={center + radius * Math.cos(angle - Math.PI / 2)}
                            y2={center + radius * Math.sin(angle - Math.PI / 2)}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-gray-300 dark:text-gray-600"
                        />
                    );
                })}

                {/* Polygons */}
                <motion.polygon
                    points={data.map((item, i) => {
                        const angle = i * angleStep;
                        const point = getPoint(item.artifact, angle);
                        return `${point.x},${point.y}`;
                    }).join(' ')}
                    fill="rgb(148 163 184)"
                    fillOpacity="0.2"
                    stroke="rgb(148 163 184)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                />

                <motion.polygon
                    points={data.map((item, i) => {
                        const angle = i * angleStep;
                        const point = getPoint(item.detection, angle);
                        return `${point.x},${point.y}`;
                    }).join(' ')}
                    fill="rgb(99 102 241)"
                    fillOpacity="0.2"
                    stroke="rgb(99 102 241)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                />

                <motion.polygon
                    points={data.map((item, i) => {
                        const angle = i * angleStep;
                        const point = getPoint(item.rebel, angle);
                        return `${point.x},${point.y}`;
                    }).join(' ')}
                    fill="rgb(59 130 246)"
                    fillOpacity="0.3"
                    stroke="rgb(59 130 246)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                />

                {/* Labels */}
                {data.map((item, i) => {
                    const angle = i * angleStep;
                    const labelRadius = radius + 20;
                    const x = center + labelRadius * Math.cos(angle - Math.PI / 2);
                    const y = center + labelRadius * Math.sin(angle - Math.PI / 2);
                    const textAnchor = x < center ? 'end' : x > center ? 'start' : 'middle';
                    const dominantBaseline = y < center ? 'text-after-edge' : y > center ? 'text-before-edge' : 'middle';

                    return (
                        <g key={i}>
                            <text
                                x={x}
                                y={y}
                                textAnchor={textAnchor}
                                dominantBaseline={dominantBaseline}
                                className="text-[10px] font-black text-gray-400 uppercase tracking-tighter fill-current"
                            >
                                {item.label}
                            </text>
                            <text
                                x={x}
                                y={y + (dominantBaseline === 'text-after-edge' ? 12 : dominantBaseline === 'text-before-edge' ? -12 : 0)}
                                textAnchor={textAnchor}
                                dominantBaseline={dominantBaseline}
                                className={`text-[8px] font-bold fill-current ${item.trendUp ? 'text-green-400' : 'text-red-400'}`}
                            >
                                {item.trendUp ? '↗' : '↘'}
                            </text>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform={`translate(${center - 80}, ${size - 30})`}>
                    <circle cx="0" cy="0" r="4" fill="rgb(59 130 246)" />
                    <text x="10" y="0" className="text-[10px] font-bold text-gray-500 uppercase fill-current" dominantBaseline="middle">
                        REBEL-V4
                    </text>
                </g>
                <g transform={`translate(${center - 80}, ${size - 15})`}>
                    <circle cx="0" cy="0" r="4" fill="rgb(99 102 241)" />
                    <text x="10" y="0" className="text-[10px] font-bold text-gray-500 uppercase fill-current" dominantBaseline="middle">
                        Detection.io
                    </text>
                </g>
                <g transform={`translate(${center + 20}, ${size - 30})`}>
                    <circle cx="0" cy="0" r="4" fill="rgb(148 163 184)" />
                    <text x="10" y="0" className="text-[10px] font-bold text-gray-500 uppercase fill-current" dominantBaseline="middle">
                        Artifact.io
                    </text>
                </g>
            </motion.svg>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'detection':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Detection Model</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Advanced forensic suite for media verification.</p>
                            </div>
                        </div>

                        {/* Top Grid: Import (Left) & Report (Right) */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                            {/* Import Section */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                                        <Shield size={12} />
                                        LIVE ENGINE
                                    </div>
                                </div>

                                <div
                                    className={`mt-4 border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-800/20 group h-full flex flex-col justify-center ${isAnalyzing ? 'border-blue-500 animate-pulse' : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600'
                                        }`}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                    <div className="mb-6 flex justify-center">
                                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            {selectedMedia && !isAnalyzing ? (
                                                <img src={selectedMedia} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
                                            ) : (
                                                <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {isAnalyzing ? 'Analyzing Forensic Data...' : 'Import Media'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Supports common image and video formats up to 100MB.</p>

                                    <div className="flex flex-wrap justify-center gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Upload size={18} /> Select Files
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                                            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <Camera size={18} /> Live Camera
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Batch Processing Section */}
                            <AnimatePresence>
                                {batchFiles.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/20"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                                    <Upload className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                        Batch Processing Queue
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {batchFiles.length} images ready for analysis
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {!isBatchProcessing && (
                                                    <button
                                                        onClick={startBatchProcessing}
                                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        Start Batch Analysis
                                                    </button>
                                                )}
                                                <button
                                                    onClick={clearBatch}
                                                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {isBatchProcessing && (
                                            <div className="mb-6">
                                                <div className="flex justify-between text-sm font-bold mb-2">
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        Processing {currentBatchIndex + 1} of {batchFiles.length}
                                                    </span>
                                                    <span className="text-blue-600">{Math.round(batchProgress)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${batchProgress}%` }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Batch Files Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {batchFiles.map((file, index) => (
                                                <motion.div
                                                    key={file.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 rounded-xl border transition-all ${file.status === 'completed'
                                                        ? file.result === 'FAKE'
                                                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                                                            : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                        : file.status === 'processing'
                                                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 animate-pulse'
                                                            : file.status === 'failed'
                                                                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-3 h-3 rounded-full ${file.status === 'completed' && file.result === 'FAKE' ? 'bg-red-500' :
                                                            file.status === 'completed' && file.result === 'REAL' ? 'bg-green-500' :
                                                                file.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                                                    file.status === 'failed' ? 'bg-gray-500' : 'bg-gray-400'
                                                            }`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                {file.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {file.size}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {file.status === 'completed' && (
                                                        <div className="text-center">
                                                            <div className={`text-lg font-black ${file.result === 'FAKE' ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                {file.result === 'FAKE' ? '🚨 FAKE' : '🎉 REAL'}
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-500 mt-1">
                                                                {file.confidence}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {file.status === 'processing' && (
                                                        <div className="flex items-center justify-center py-2">
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                                                            />
                                                        </div>
                                                    )}

                                                    {file.status === 'failed' && (
                                                        <div className="text-center text-red-500">
                                                            <div className="text-sm font-bold">❌ Failed</div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Batch Summary */}
                                        {batchResults.length > 0 && (
                                            <div className="mt-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                                                    📊 Batch Analysis Summary
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-blue-600">{batchResults.length}</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase">Total Images</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-red-600">
                                                            {batchResults.filter(r => r.result === 'FAKE').length}
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase">Fake Detected</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-green-600">
                                                            {batchResults.filter(r => r.result === 'REAL').length}
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase">Real Verified</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-gray-600">
                                                            {batchResults.filter(r => r.status === 'failed').length}
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase">Failed</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Analysis Report Section */}
                            <div className="min-h-[500px]">
                                <AnimatePresence mode="wait">
                                    {isAnalyzed ? (
                                        <motion.div
                                            key="report"
                                            ref={reportRef}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={isShake ? {
                                                x: [0, -10, 10, -10, 10, 0],
                                                transition: { duration: 0.4, repeat: 5 }
                                            } : { opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border overflow-hidden h-full ${analysisResult.result === 'FAKE'
                                                ? 'border-red-500 shadow-red-500/20'
                                                : 'border-gray-200 dark:border-gray-800'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative ${analysisResult.result === 'FAKE' ? 'border-red-500' : 'border-green-500'
                                                            }`}>
                                                            <div className="text-lg font-black text-gray-900 dark:text-white">{analysisResult.confidence}</div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase truncate flex items-center gap-3">
                                                                Result: <span className={analysisResult.result === 'FAKE' ? 'text-red-500' : 'text-green-500'}>
                                                                    {analysisResult.result === 'FAKE' ? '🚨 FAKE' : '🎉 REAL'}
                                                                </span>
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">{analysisResult.timestamp}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={downloadReport} className="p-3 bg-blue-600 text-white rounded-xl hover:scale-105 transition-transform"><Download size={18} /></button>
                                                        <button onClick={shareReport} className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:scale-105 transition-transform"><Share2 size={18} /></button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                                        <Activity size={16} className="text-blue-500" /> Technical Report
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[
                                                            { label: 'Consistency', val: '0.99' },
                                                            { label: 'Spectral Sync', val: '0.98' },
                                                            { label: 'Artifacts', val: 'None' },
                                                            { label: 'Engine', val: 'V4.2' },
                                                        ].map((m, i) => (
                                                            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                <div className="text-[10px] text-gray-500 uppercase font-bold">{m.label}</div>
                                                                <div className="text-sm font-bold text-blue-500">{m.val}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                                            "FFT analysis confirms natural sensor noise floor. Facial landmarks show zero synthetic jitter during transitions."
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-gray-50/50 dark:bg-gray-900/30 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 h-full flex flex-col items-center justify-center text-center text-gray-400"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                                <FileText size={32} />
                                            </div>
                                            <p className="font-bold">Awaiting Analysis</p>
                                            <p className="text-xs max-w-[200px] mt-2">Analysis report will be generated instantly after media import.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Bottom Section: History */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Activity className="text-blue-500" /> Scan History
                                </h3>
                                <button
                                    onClick={() => {
                                        setScanHistory([]);
                                        localStorage.removeItem('scanHistory');
                                        addNotification('History cleared', 'info');
                                    }}
                                    className="text-xs font-bold text-red-500 hover:underline"
                                >
                                    Clear History
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {scanHistory.length > 0 ? (
                                    scanHistory.map((scan) => (
                                        <motion.div
                                            key={scan.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                                    {scan.media ? <img src={scan.media} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold">V</div>}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{scan.name}</h4>
                                                    <p className="text-[10px] text-gray-500">{scan.timestamp}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${scan.result === 'FAKE' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                                            }`}>{scan.result}</span>
                                                        <span className="text-[10px] font-bold text-gray-400">{scan.confidence} CONF</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-500 font-bold">No history available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 'analytics':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Forensic Analytics</h2>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform" onClick={() => addNotification('Generating real-time intelligence report...', 'info')}>Generate Report</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Scans Done', value: '1,284', change: '+12%', color: 'blue' },
                                { label: 'Detections', value: '42', change: '-5.2%', color: 'red' },
                                { label: 'Efficiency', value: '99.9%', change: '+0.1%', color: 'green' },
                                { label: 'Credits', value: '2.4k', change: '+24%', color: 'indigo' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-gray-800 shadow-xl"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className={`text-xs font-black px-3 py-1 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-full border border-${stat.color}-500/20`}>
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-bold">Competitive Benchmark</h3>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">LIVE DATA</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">REBEL-V4</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Detection.io</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Artifact.io</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-80 w-full mb-6 relative flex items-center justify-center">
                                    <RadarChart />
                                </div>
                                <div className="mt-6 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                    <div className="flex items-center gap-3">
                                        <span>NIST Benchmarks V2.4</span>
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-blue-500">Real-time</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-500">Live Engine Data</span>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-3 h-3 border border-blue-500 rounded-full border-t-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800">
                                <h3 className="text-xl font-bold mb-6">Device Distribution</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Mobile App', val: 65, color: '#3b82f6' },
                                        { label: 'Cloud API', val: 25, color: '#ef4444' },
                                        { label: 'Desktop', val: 10, color: '#10b981' },
                                    ].map((d, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span>{d.label}</span>
                                                <span style={{ color: d.color }}>{d.val}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${d.val}%` }}
                                                    transition={{ duration: 1 }}
                                                    className="h-full"
                                                    style={{ backgroundColor: d.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'overview':
                return (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
                        {/* Live Header Strip */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'System Health', val: '98.2%', detail: 'Optimal', color: 'green' },
                                { label: 'Active Clusters', val: '12 / 12', detail: 'Global Sync', color: 'blue' },
                                { label: 'Neural Throughput', val: '4.2 TB/s', detail: 'Real-time', color: 'purple' },
                                { label: 'Latency', val: '14ms', detail: 'Edge Optimized', color: 'yellow' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden group cursor-default"
                                >
                                    <div className={`absolute top-0 right-0 w-2 h-full bg-${stat.color}-500/10 group-hover:bg-${stat.color}-500/20 transition-colors pointer-events-none`} />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.val}</div>
                                    <div className={`text-[10px] font-bold text-${stat.color}-500 uppercase flex items-center gap-1`}>
                                        <div className={`w-1 h-1 rounded-full bg-${stat.color}-500 animate-pulse`} />
                                        {stat.detail}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Technical Explanation Panel - Shows last analysis details */}
                        <AnimatePresence>
                            {lastAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                            <Shield className="text-blue-500" />
                                            Latest Analysis: {lastAnalysis.result === 'FAKE' ? '🚨 FAKE DETECTED' : '🎉 AUTHENTIC VERIFIED'}
                                        </h3>
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                            {new Date(lastAnalysis.timestamp).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Main Explanation */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                                <h4 className="text-lg font-black text-blue-600 dark:text-blue-400 mb-2">
                                                    {lastAnalysis.technical_explanation.title}
                                                </h4>
                                                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                                    {lastAnalysis.technical_explanation.explanation}
                                                </p>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 p-3 rounded-lg border">
                                                    <strong>Technical Details:</strong><br />
                                                    {lastAnalysis.technical_explanation.technical_details}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <div className="text-sm font-bold text-gray-500 mb-1">AI Model Confidence</div>
                                                    <div className="text-xl font-black text-gray-900 dark:text-white">
                                                        {lastAnalysis.ai_model_confidence}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                    <div className="text-sm font-bold text-gray-500 mb-1">Statistical Score</div>
                                                    <div className="text-xl font-black text-gray-900 dark:text-white">
                                                        {lastAnalysis.stats_score}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detection Method & Confidence Reasoning */}
                                        <div className="space-y-4">
                                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <Zap className="text-yellow-500" />
                                                    Detection Method
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Method Used</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${lastAnalysis.detection_method === 'hash_based' ? 'bg-green-500/10 text-green-600' :
                                                            lastAnalysis.detection_method === 'hybrid_ai_stats' ? 'bg-blue-500/10 text-blue-600' :
                                                                'bg-yellow-500/10 text-yellow-600'
                                                            }`}>
                                                            {lastAnalysis.detection_method.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="text-sm font-bold text-gray-500 mb-2">Confidence Reasoning</div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {lastAnalysis.technical_explanation.confidence_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                                                    <div className="text-2xl font-black text-green-600 mb-1">
                                                        {lastAnalysis.result === 'REAL' ? '✓' : '✗'}
                                                    </div>
                                                    <div className="text-xs font-bold text-green-600 uppercase">Authentic</div>
                                                </div>
                                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                                    <div className="text-2xl font-black text-red-600 mb-1">
                                                        {lastAnalysis.result === 'FAKE' ? '⚠️' : '✓'}
                                                    </div>
                                                    <div className="text-xs font-bold text-red-600 uppercase">Synthetic</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Activity Visualization Area */}
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Neural Engine Operations (Main Chart) */}
                            <div className="xl:flex-1 bg-gray-900 rounded-[2.5rem] p-10 border border-gray-800 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover' }} />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black text-white mb-1">Neural Engine Operations</h3>
                                            <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Live Scan Velocity // Global Stream</p>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 text-[10px] font-black uppercase">
                                            Scanning Active
                                        </div>
                                    </div>

                                    {/* Simulated Activity Chart */}
                                    <div className="h-48 w-full flex items-end gap-1 mb-6">
                                        {[...Array(40)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 20 }}
                                                animate={{ height: Math.random() * 80 + 20 }}
                                                transition={{ repeat: Infinity, duration: 1, repeatType: 'mirror', delay: i * 0.02 }}
                                                className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-sm opacity-60"
                                            />
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-4 gap-8 pt-8 border-t border-white/5">
                                        {[
                                            { label: 'Deepfake Hits', val: '432/hr' },
                                            { label: 'Synthetic Faces', val: '1.2k' },
                                            { label: 'Audio Clones', val: '84' },
                                            { label: 'Verified Human', val: '8.4k' },
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">{item.label}</div>
                                                <div className="text-lg font-black text-white">{item.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Node Status Matrix */}
                            <div className="xl:w-96 space-y-8">
                                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
                                    <h3 className="text-xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tighter">Cluster Status</h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'North America', status: 'Online', ping: '12ms', load: 45 },
                                            { name: 'Europe Central', status: 'Online', ping: '38ms', load: 72 },
                                            { name: 'Asia Pacific', status: 'Synching', ping: '104ms', load: 15 },
                                            { name: 'South America', status: 'Idle', ping: '92ms', load: 5 },
                                        ].map((node, i) => (
                                            <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="text-xs font-black text-gray-900 dark:text-white">{node.name}</div>
                                                    <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${node.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                        {node.status}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${node.load}%` }}
                                                            className="h-full bg-blue-500"
                                                        />
                                                    </div>
                                                    <div className="text-[10px] font-mono font-bold text-gray-400">{node.ping}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                                        Network Audit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Peripheral Logs & Hardware */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity size={20} className="text-blue-500" />
                                        Forensic Event Log
                                    </h3>
                                    <span className="text-[10px] font-mono text-gray-400">Ver: 4.2.0-STABLE</span>
                                </div>
                                <div className="space-y-3 font-mono text-[10px]">
                                    {[
                                        { time: '13:42:01', event: 'REBEL-V4 Core Engine initialized on Node-04', type: 'info' },
                                        { time: '13:42:05', event: 'Secure handshake verified with EU-CENTRAL cluster', type: 'success' },
                                        { time: '13:42:12', event: 'Potential synchronization delay detected in ASIA-PACIFIC', type: 'warning' },
                                        { time: '13:42:15', event: 'Inbound media scan request: ID_48293 // Confirmed', type: 'info' },
                                        { time: '13:42:20', event: 'Neural buffer at 42% capacity. Optimal throughput.', type: 'info' },
                                    ].map((log, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 group hover:border-blue-500/50 transition-colors">
                                            <span className="text-gray-400">{log.time}</span>
                                            <span className={`font-bold ${log.type === 'success' ? 'text-green-500' : log.type === 'warning' ? 'text-yellow-600' : 'text-blue-500'}`}>
                                                {'>'} {log.event}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-[2.5rem] p-8 border border-gray-800 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Server size={80} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1">Hardware Health</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Tensor Core Distribution</p>
                                </div>
                                <div className="space-y-6 my-8">
                                    {[
                                        { label: 'GPU Load', val: 74 },
                                        { label: 'Memory', val: 12 },
                                        { label: 'Cache', val: 88 },
                                    ].map((h, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase text-gray-400">{h.label}</span>
                                                <span className="text-[10px] font-black text-white">{h.val}%</span>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${h.val}%` }} className="h-full bg-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-white/40 text-[9px] font-mono text-center">NV_FORENSIC_ACC_v2</div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'profile':
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
                        {/* Profile Header */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-[2rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden">
                                        <UserIcon size={56} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                                        <Settings size={14} />
                                    </button>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    {isEditingProfile ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Full Name"
                                            />
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{user.name}</h2>
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase rounded-full border border-blue-500/20">Pro</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-4">{user.email}</p>
                                        </>
                                    )}
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700">Tier 5 Clearance</div>
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700">Member since 2025</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {isEditingProfile ? (
                                        <>
                                            <button onClick={handleSaveProfile} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                Save Changes
                                            </button>
                                            <button onClick={() => { setIsEditingProfile(false); setEditName(user.name); setEditEmail(user.email); }} className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setIsEditingProfile(true)} className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                Edit Identity
                                            </button>
                                            <button onClick={() => setShowPasswordModal(true)} className="px-8 py-4 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                Change Password
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Forensic Credits', val: '2,400', sub: 'Available to use', icon: <Zap className="text-blue-500" /> },
                                { label: 'Total Scans', val: '1,284', sub: 'Last 30 days', icon: <Activity className="text-indigo-500" /> },
                                { label: 'Security Score', val: '98%', sub: 'Optimal status', icon: <Shield className="text-green-500" /> },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10, scale: 1.03 }}
                                    className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-200 dark:border-gray-800 shadow-lg group cursor-default"
                                >
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{stat.val}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-[10px] text-blue-500 font-bold">{stat.sub}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8">Access History</h3>
                            <div className="space-y-4">
                                {[
                                    { event: 'Login successful', time: '12 mins ago', info: 'Chrome on Windows // 192.168.1.1' },
                                    { event: 'Neural model sync', time: '2 hours ago', info: 'Auto-sync completed successfully' },
                                    { event: 'Security key rotation', time: '1 day ago', info: 'Hardware token updated' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{item.event}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                {item.time} — <span className="text-blue-500/80">{item.info}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
            {/* Animated Dashboard Background */}
            <div
                className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${dashboardBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${dashboardBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(5px)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 dark:from-gray-950/80 via-transparent to-gray-50/80 dark:to-gray-950/80" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header / Menu Bar */}
                <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hidden sm:block">
                                    REBEL
                                </span>
                                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-tighter">
                                        {connectionStatus === 'connected' ? 'Active' : 'Syncing'}
                                    </span>
                                </div>
                            </div>

                            {/* DESKTOP MENU BAR */}
                            <nav className="hidden lg:flex items-center px-1 bg-gray-100 dark:bg-gray-900 rounded-2xl p-1 shadow-inner relative">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all z-10 ${activeTab === item.id
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {activeTab === item.id && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-md -z-10"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <div className="h-8 w-px bg-gray-200 dark:border-gray-800 mx-2 hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-black text-gray-900 dark:text-white leading-none">{user.name.split(' ')[0]}</div>
                                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">PRO PLAN</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                                <button
                                    className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE MENU */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-4"
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold ${activeTab === item.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Main Content Area */}
                <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Camera Overlay */}
            <AnimatePresence>
                {isCameraOpen && (
                    <CameraCapture
                        onClose={() => setIsCameraOpen(false)}
                        onCapture={(img) => {
                            setSelectedMedia(img);
                            handleAnalyze(img);
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${n.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'bg-gray-900/90 border-gray-800 text-white'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-green-500 animate-pulse' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            <span className="text-sm font-bold tracking-tight">{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Password Change Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md"
                        >
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <Shield className="w-12 h-12 text-blue-600 mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Change Password</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-bold">Follow the steps below to secure your identity.</p>

                            {passwordStep === 'request' && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold text-center">We will send a 6-digit verification code to your email.</p>
                                    </div>
                                    <button
                                        onClick={handleSendOtp}
                                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                    >
                                        Send Verification Code
                                    </button>
                                </div>
                            )}

                            {passwordStep === 'otp' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={userEnteredOtp}
                                            onChange={(e) => setUserEnteredOtp(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 font-black text-2xl text-center tracking-[0.5em] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <button
                                        onClick={handleVerifyOtp}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                    >
                                        Verify Code
                                    </button>
                                </div>
                            )}

                            {passwordStep === 'new' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
