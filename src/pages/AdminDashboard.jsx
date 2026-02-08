import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Database,
    Shield,
    Activity,
    AlertTriangle,
    Search,
    Trash2,
    BarChart3,
    FileText,
    TrendingUp,
    CheckCircle,
    Server,
    Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalScans: 0,
        fakeDetected: 0,
        systemHealth: 98.4,
        storageUsed: '42.8 GB'
    });
    const [usersList, setUsersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Load stats from localStorage
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');

        setUsersList(allUsers);
        setStats({
            totalUsers: allUsers.length,
            totalScans: 1284 + scanHistory.length, // Mix of demo stats + real history
            fakeDetected: 42 + scanHistory.filter(s => s.result === 'FAKE').length,
            systemHealth: 98.4,
            storageUsed: '42.8 GB'
        });
    }, []);

    const deleteUser = (email) => {
        if (email === user.email) return; // Can't delete self
        const updatedUsers = usersList.filter(u => u.email !== email);
        setUsersList(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setStats(prev => ({ ...prev, totalUsers: updatedUsers.length }));
    };

    const filteredUsers = usersList.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Enrolled Users', val: stats.totalUsers, icon: <Users />, color: 'blue' },
                                { label: 'Forensic Scans', val: stats.totalScans, icon: <Activity />, color: 'indigo' },
                                { label: 'Fake Detections', val: stats.fakeDetected, icon: <AlertTriangle />, color: 'red' },
                                { label: 'System Uptime', val: stats.systemHealth + '%', icon: <Server />, color: 'green' },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-xl"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 text-${s.color}-500 flex items-center justify-center mb-4`}>
                                        {s.icon}
                                    </div>
                                    <div className="text-3xl font-black text-gray-900 dark:text-white">{s.val}</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Middle Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold">Inference Server Load</h3>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 uppercase tracking-tighter">GPU-01: OPTIMAL</div>
                                    </div>
                                </div>
                                <div className="h-64 w-full flex items-end gap-2 px-2">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 20 }}
                                            animate={{ height: Math.random() * 80 + 20 + '%' }}
                                            transition={{ repeat: Infinity, duration: 2, repeatType: 'mirror', delay: i * 0.1 }}
                                            className="flex-1 bg-gradient-to-t from-blue-600/80 to-blue-400/80 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-[2.5rem] p-8 border border-gray-800 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Cpu size={120} />
                                </div>
                                <h3 className="text-xl font-bold mb-6">Hardware Status</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Tensor Cores', val: 84 },
                                        { label: 'Neural RAM', val: 12 },
                                        { label: 'Model Cache', val: 96 }
                                    ].map((h, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-gray-400 capitalize">{h.label}</span>
                                                <span>{h.val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: h.val + '%' }}
                                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                    Refresh Hardware
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Account Management</h3>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Total Active Members: {usersList.length}</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or identity..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                                        <th className="pb-4 pl-4">Identity</th>
                                        <th className="pb-4">Access Tier</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {filteredUsers.map((u, i) => (
                                        <motion.tr
                                            key={u.email}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="py-5 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                                                    {u.role || 'User'}
                                                </span>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">SYNCHED</span>
                                                </div>
                                            </td>
                                            <td className="py-5 text-right pr-4">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(u.email)}
                                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/20">
                                <Shield size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Command Center</h1>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Authorized Access Only // Forensic Controller v4.2</p>
                    </div>

                    <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg">
                        {[
                            { id: 'overview', label: 'Intelligence', icon: <TrendingUp size={16} /> },
                            { id: 'users', label: 'User Data', icon: <Users size={16} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tab.id
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;
