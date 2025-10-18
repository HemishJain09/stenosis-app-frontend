import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // State for success message
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await axios.post('http://127.0.0.1:8000/register', {
                uid: user.uid,
                name: name,
                email: user.email,
                role: role
            });

            // Set success message and redirect after a short delay
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists. Please try logging in.');
            } else {
                setError('Failed to register. Please try again.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-cyan-400">Create an Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Form fields remain the same */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="patient">Patient</option>
                            <option value="clinic">Clinic Personnel</option>
                            <option value="junior_doctor">Junior Doctor</option>
                            <option value="senior_doctor">Senior Doctor</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                    
                    <button type="submit" className="w-full py-3 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors">Register</button>
                </form>
                 <p className="text-sm text-center text-gray-400">
                  Already have an account? <Link to="/login" className="font-medium text-cyan-400 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

