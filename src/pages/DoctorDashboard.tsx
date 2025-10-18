import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

interface Case {
    id: string;
    patientName: string;
    status: string;
    modelReport?: string;
    createdAt: { _seconds: number };
}

const DoctorDashboard = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [findings, setFindings] = useState('');
    const [decision, setDecision] = useState('');

    useEffect(() => {
        const fetchCases = async () => {
            if (!currentUser?.token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_URL}/cases`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                
                if (Array.isArray(response.data)) {
                    setCases(response.data);
                } else {
                    console.error("API did not return an array for cases:", response.data);
                    setError('Received invalid data for case list.');
                }

            } catch (err) {
                setError('Failed to fetch assigned cases.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCases();
    }, [currentUser]); // <-- FIX: Removed 'cases' from the dependency array

    const handleReviewSubmit = async () => {
        if (!selectedCase || !decision) {
            alert("Please select a decision.");
            return;
        };
        try {
            await axios.put(`${API_URL}/cases/${selectedCase.id}/review`, {
                decision: decision,
                findings: findings
            }, {
                headers: { Authorization: `Bearer ${currentUser?.token}` }
            });

            // After submission, manually filter the case out of the local state
            // to provide immediate UI feedback without a full refetch.
            setCases(prevCases => prevCases.filter(c => c.id !== selectedCase.id));
            
            setSelectedCase(null);
            setFindings('');
            setDecision('');
        } catch (err) {
            alert('Failed to submit review.');
            console.error(err);
        }
    };
    
    if (isLoading) return <p className="text-white">Loading assigned cases...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400">Assigned Cases</h2>
            {cases.length === 0 ? (
                <p className="text-gray-400">There are no cases in your queue.</p>
            ) : (
                <div className="space-y-4">
                    {cases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-700 rounded-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-white">{c.patientName}</p>
                                    <p className="text-sm text-gray-400">Case from {new Date(c.createdAt._seconds * 1000).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => setSelectedCase(c)} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
                                    Review Case
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCase && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-xl">
                        <h3 className="text-2xl font-bold text-white">Review Case: {selectedCase.patientName}</h3>
                        <div className="p-3 mt-4 text-sm text-gray-300 bg-gray-900 border-l-2 border-cyan-500">
                            <p className="font-semibold">AI Model Report:</p>
                            <p>{selectedCase.modelReport || "No AI report available."}</p>
                        </div>
                        
                        <textarea
                            value={findings}
                            onChange={(e) => setFindings(e.target.value)}
                            placeholder="Enter your findings..."
                            className="w-full h-32 px-3 py-2 mt-4 text-white bg-gray-700 border border-gray-600 rounded-md"
                        />

                        <div className="mt-4 space-y-2">
                            <label className="flex items-center">
                                <input type="radio" value="confirmed" checked={decision === 'confirmed'} onChange={() => setDecision('confirmed')} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600"/>
                                <span className="ml-2 text-gray-300">Confirm Stenosis</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" value="rejected" checked={decision === 'rejected'} onChange={() => setDecision('rejected')} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600"/>
                                <span className="ml-2 text-gray-300">No Stenosis Found</span>
                            </label>
                        </div>
                        
                        <div className="flex justify-end mt-6 space-x-4">
                            <button onClick={() => setSelectedCase(null)} className="px-4 py-2 font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                            <button onClick={handleReviewSubmit} className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;

