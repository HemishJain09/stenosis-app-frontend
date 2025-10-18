import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define the updated Case interface
interface Case {
    id: string;
    patientName: string;
    status: string;
    createdAt: string; // <-- Changed to string to match backend's ISO date format
    findings?: string;
}

const PatientDashboard = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchCases = async () => {
            if (!currentUser?.token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://127.0.0.1:8000/my-cases', {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                setCases(response.data);
            } catch (err) {
                setError('Failed to fetch your case history.');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (currentUser) {
            fetchCases();
        } else {
            setIsLoading(false);
        }

    }, [currentUser]);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending_junior_review':
            case 'pending_senior_review':
                return 'Under Review';
            case 'closed_stenosis_confirmed':
                return 'Completed: Stenosis Confirmed. You will be contacted for an appointment.';
            case 'closed_no_stenosis':
                return 'Completed: No Stenosis Found.';
            default:
                return 'Unknown';
        }
    };

    if (isLoading) return <p className="text-white">Loading your case history...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400">My Case History</h2>
            {cases.length === 0 ? (
                <p className="text-gray-400">You have no case history.</p>
            ) : (
                <div className="space-y-4">
                    {cases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-700 rounded-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    {/* Correctly parse the ISO date string */}
                                    <p className="font-semibold text-white">Case from {new Date(c.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-cyan-400">{getStatusText(c.status)}</p>
                                </div>
                            </div>
                            {c.findings && (
                                <div className="p-3 mt-3 text-sm text-gray-300 bg-gray-900 border-l-2 border-cyan-500">
                                    <p className="font-semibold">Doctor's Findings:</p>
                                    <p>{c.findings}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;

