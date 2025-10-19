import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

// --- NEW: Static credentials for quick login ---
const credentials = {
    clinic: { email: 'rahul.jain.090705@gmail.com', pass: 'Hemish@09' },
    junior_doctor: { email: 'rydamjain01@gmail.com', pass: 'Rydam@09' },
    senior_doctor: { email: '23ucc548@lnmiit.ac.in', pass: 'Hemish@09' },
    patient: { email: 'hemishjain07@gmail.com', pass: 'Hemish@09' },
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    const handleLogin = () => {
        setError('');
        setIsLoading(true);

        signInWithEmailAndPassword(auth, email, password)
            .catch((err) => {
                setError("Failed to log in. Please check your credentials.");
                console.error("Login Error:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // --- NEW: Handler for quick login buttons ---
    const handleQuickLogin = (role: keyof typeof credentials) => {
        setEmail(credentials[role].email);
        setPassword(credentials[role].pass);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">Login</h2>
                
                {/* --- NEW: Quick Login Buttons --- */}
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => handleQuickLogin('clinic')} className="py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Clinic</button>
                    <button type="button" onClick={() => handleQuickLogin('junior_doctor')} className="py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Junior Doc</button>
                    <button type="button" onClick={() => handleQuickLogin('senior_doctor')} className="py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Senior Doc</button>
                    <button type="button" onClick={() => handleQuickLogin('patient')} className="py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Patient</button>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink px-4 text-xs text-gray-400 uppercase">Or Manually</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full py-3 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-cyan-400 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

