import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Search, Scan, Radio, ArrowRight, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const features = [
        {
            icon: <Search className="w-8 h-8 text-blue-500" />,
            title: 'Advanced Detection',
            description: 'State-of-the-art AI algorithms analyze every pixel to spot inconsistencies invisible to the naked eye.',
        },
        {
            icon: <Zap className="w-8 h-8 text-indigo-500" />,
            title: 'Real-time Analysis',
            description: 'Get instant results. Upload your video or image and receive a detailed report in seconds.',
        },
        {
            icon: <Shield className="w-8 h-8 text-green-500" />,
            title: 'Enterprise Security',
            description: 'Bank-grade encryption and security protocols ensure your data remains private and protected.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen filter opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen filter opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen filter opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side: Text Content */}
                        <div className="text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-black tracking-widest mb-6 border border-blue-100 dark:border-blue-800 uppercase"
                            >
                                <Shield className="w-4 h-4" />
                                Deep Fake Detection
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight"
                            >
                                Truth in the Age of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                    Artificial Intelligence
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="max-w-xl text-lg text-gray-300 mb-10"
                            >
                                The most advanced deepfake detection platform. Protect your reputation and verify authenticity with 99.9% accuracy.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link
                                    to={user ? "/dashboard" : "/signup"}
                                    className="group relative px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center gap-2 overflow-hidden animate-shimmer"
                                >
                                    <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="group px-8 py-4 rounded-full bg-white dark:bg-gray-800/10 text-gray-700 dark:text-gray-200 font-bold text-lg border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all flex items-center gap-2 backdrop-blur-sm">
                                    <Info className="w-5 h-5 text-blue-500" />
                                    <span>Learn More</span>
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Side: Detection Animation */}
                        <div className="relative flex justify-center lg:justify-end">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -15, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    opacity: { duration: 1 },
                                    scale: { duration: 1 }
                                }}
                                className="relative w-72 h-72 md:w-96 md:h-96"
                            >
                                {/* Background Hexagon/Circuit pattern can be added here */}
                                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-3xl backdrop-blur-3xl border border-blue-500/20 dark:border-blue-400/20 rotate-6 skew-x-3"></div>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {/* Scanner Frame */}
                                        <div className="absolute inset-4 border-2 border-blue-500/30 dark:border-blue-400/30 rounded-2xl overflow-hidden bg-gray-900/40">
                                            {/* Grid background */}
                                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

                                            {/* Person Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Scan className="w-32 h-32 text-blue-500/50" />
                                            </div>

                                            {/* Scanning Line Animation */}
                                            <motion.div
                                                animate={{
                                                    top: ['0%', '98%', '0%'],
                                                    opacity: [0, 1, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                                            />

                                            {/* Status Indicators */}
                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                                                <motion.div
                                                    animate={{ opacity: [1, 0.4, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Radio className="w-3 h-3" />
                                                    Analyzing...
                                                </motion.div>
                                                <div>4K Forensics</div>
                                            </div>
                                        </div>

                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl translate-x-1 translate-y-1"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -translate-x-1 translate-y-1"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl translate-x-1 -translate-y-1"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -translate-x-1 -translate-y-1"></div>
                                    </div>
                                </div>

                                {/* Floating Data Points */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl"
                                >
                                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">AUTHENTICITY</div>
                                    <div className="text-xl font-bold text-green-500">99.9%</div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-4 -left-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl"
                                >
                                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">ANOMALIES</div>
                                    <div className="text-xl font-bold text-red-500">None</div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose REBEL?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover-glow transition-all duration-500 perspective-1000"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                                    className="mb-6 inline-block p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm group-hover:shadow-blue-500/20 transition-all"
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Forensic Feed Animation Section */}
            <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Real-Time <span className="text-red-500 animate-pulse">Fake</span> Analysis</h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Our neural networks work 24/7 to identify synthesized patterns, frequency anomalies, and facial inconsistencies across global media streams.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { label: 'Neural Texture Mapping', status: 'Active' },
                                    { label: 'Frequency Domain Analysis', status: 'Active' },
                                    { label: 'Biometric Consistency Check', status: 'Active' },
                                ].map((item, i) => (
                                    <motion.div
                                        whileHover={{ x: 10 }}
                                        key={i}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-default"
                                    >
                                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-shimmer" />
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                                        <span className="ml-auto text-blue-500 font-mono text-xs font-black tracking-tighter uppercase">{item.status}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-gray-950 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 relative perspective-1000"
                        >
                            {/* Scanning Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                                </div>
                                <div className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-[0.2em]">UNIT_042 // GLOBAL_SURVEILLANCE</div>
                            </div>

                            {/* Feed Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 group cursor-pointer transition-all duration-500 hover:border-blue-500/50 hover:scale-[1.05] hover:z-20">
                                        {/* Grid background */}
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>

                                        {/* Scanning Overlay */}
                                        <motion.div
                                            animate={{
                                                left: ['-10%', '110%'],
                                                opacity: [0, 1, 0]
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                delay: item * 0.4,
                                                ease: "linear"
                                            }}
                                            className="absolute top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10"
                                        />

                                        {/* Result Label - More dynamic hover */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-blue-600/10 transition-colors">
                                            {item % 2 === 0 ? (
                                                <div className="transform transition-all duration-300 group-hover:scale-110">
                                                    <div className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-500 text-[10px] font-black rounded backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                                        FAKE DETECTED
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="transform transition-all duration-300 group-hover:scale-110">
                                                    <div className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-500 text-[10px] font-black rounded backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                                        VERIFIED REAL
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Overlay Text */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-gray-950 to-transparent">
                                            <div className="text-[8px] font-mono text-blue-400 font-bold">CONFIDENCE: {98 + item}%</div>
                                        </div>

                                        <div className="absolute top-2 right-2 text-[8px] font-mono text-gray-600">ID: RF_{item}00</div>
                                    </div>
                                ))}
                            </div>

                            {/* Alert Log */}
                            <div className="mt-6 bg-black/40 rounded-xl p-4 border border-gray-800 font-mono text-[9px]">
                                <div className="flex items-center justify-between text-gray-500 mb-2 border-b border-gray-800 pb-1">
                                    <span>SYSTEM_LOG_2025</span>
                                    <span>STATUS: ANALYSING</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-blue-500 flex justify-between">
                                        <span>&gt; SCANNING_MEDIA_HASH_2911</span>
                                        <span className="text-green-500">[PASS]</span>
                                    </div>
                                    <div className="text-red-500 flex justify-between animate-pulse">
                                        <span>&gt; DETECTED_SYNTHETIC_ARTIFACTS</span>
                                        <span className="text-red-500">[ALERT]</span>
                                    </div>
                                    <div className="text-gray-400 flex justify-between">
                                        <span>&gt; BIOMETRIC_RECONSTRUCTION...</span>
                                        <span className="text-gray-500">88%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feedback Section */}
            <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Have questions about our deepfake detection technology? We'd love to hear your feedback and help you secure your digital content.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Tell us about your experience, questions, or feedback..."
                                    required
                                ></textarea>
                            </div>
                            <div className="text-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Send Message
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                <p>Prefer to reach out directly? Contact us at <a href="mailto:iniyavanoff@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">iniyavanoff@gmail.com</a></p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
