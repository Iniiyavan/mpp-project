import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Terminal, Lock, ChevronRight, AlertCircle, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminAuth = () => {
    const [id, setId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [error, setError] = useState('');
    const [isBooting, setIsBooting] = useState(true);
    const [logs, setLogs] = useState([]);
    const { login } = useAuth();
    const navigate = useNavigate();

    const bootSequences = [
        "INITIALIZING SECURE PROTOCOL...",
        "ESTABLISHING ENCRYPTED TUNNEL...",
        "SCANNING BIOMETRIC SIGNATURES...",
        "ACCESSING CORE NEURAL ENGINE...",
        "READY FOR AUTHORIZATION."
    ];

    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            if (current < bootSequences.length) {
                setLogs(prev => [...prev, bootSequences[current]]);
                current++;
            } else {
                setIsBooting(false);
                clearInterval(interval);
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const user = await login(id, passphrase);
            if (user.role !== 'admin') {
                setError('UNAUTHORIZED IDENTITY DETECTED. ACCESS DENIED.');
                return;
            }

            // Success animation
            setLogs(prev => [...prev, "AUTHENTICATION SUCCESSFUL.", "GRANTING ACCESS TO COMMAND CENTER..."]);
            setTimeout(() => navigate('/admin'), 1500);
        } catch (err) {
            setError('INVALID CREDENTIALS. SECURITY LOGGED.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4 overflow-hidden relative">
            {/* Matrix-like background effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />
                <motion.div
                    animate={{ y: ['0%', '100%'] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent h-1/2 w-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Decorative Frame */}
                <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur shadow-[0_0_20px_rgba(34,197,94,0.3)]" />

                <div className="relative bg-gray-950 border-2 border-green-500/50 rounded-lg p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 border-b border-green-500/30 pb-4">
                        <Terminal className="text-green-500" size={24} />
                        <h1 className="text-xl font-black tracking-[0.2em] uppercase">Admin Portal</h1>
                        <div className="ml-auto flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Console Logs */}
                    <div className="mb-8 space-y-1 h-32 overflow-hidden text-[10px] opacity-70">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span>[{new Date().toLocaleTimeString()}]</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>

                    {isBooting ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-full bg-green-950/30 h-1 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    animate={{ width: ['0%', '100%'] }}
                                    transition={{ duration: 3 }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest animate-pulse">Scanning Neural Paths...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-green-500/70 mb-2">Identity ID</label>
                                <div className="relative">
                                    <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" size={16} />
                                    <input
                                        type="text"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="w-full bg-black border border-green-500/30 rounded p-3 pl-10 focus:outline-none focus:border-green-500 text-green-400 placeholder-green-900 transition-all font-mono"
                                        placeholder="admin@rebel.ai"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.3em] font-black text-green-500/70 mb-2">Secure Passphrase</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" size={16} />
                                    <input
                                        type="password"
                                        value={passphrase}
                                        onChange={(e) => setPassphrase(e.target.value)}
                                        className="w-full bg-black border border-green-500/30 rounded p-3 pl-10 focus:outline-none focus:border-green-500 text-green-400 placeholder-green-900 transition-all font-mono"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-500/50 text-red-500 text-[10px] rounded"
                                    >
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="w-full py-4 bg-green-500/10 border border-green-500 text-green-500 font-black text-xs uppercase tracking-[0.4em] hover:bg-green-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] active:scale-[0.98]"
                            >
                                Authorize
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-green-500/20 flex justify-between items-center text-[8px] text-green-900 uppercase tracking-widest">
                        <span>Terminal_v4.2</span>
                        <div className="flex items-center gap-1">
                            <Cpu size={10} />
                            <span>System Healthy</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Scanning line animation */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-[1px] bg-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.5)] z-20 pointer-events-none"
            />
        </div>
    );
};

export default AdminAuth;
