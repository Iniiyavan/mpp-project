import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected', 'connecting', 'disconnected'

    useEffect(() => {
        // Simulate active connectivity heartbeat
        const interval = setInterval(() => {
            setConnectionStatus(prev => prev === 'connected' ? 'connecting' : 'connected');
            setTimeout(() => setConnectionStatus('connected'), 1000);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check if user is logged in on mount
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const signup = (name, email, password) => {
        // Simulated signup
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login after signup
        return login(email, password);
    };

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const authUser = { name: user.name, email: user.email };
        setUser(authUser);
        localStorage.setItem('user', JSON.stringify(authUser));
        return authUser;
    };

    const updateProfile = (newData) => {
        // Update current session
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update permanent storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...newData };
            localStorage.setItem('users', JSON.stringify(users));
        }
    };

    const updatePassword = (newPassword) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, updatePassword, loading, connectionStatus }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
