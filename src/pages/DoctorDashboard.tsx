import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Define the updated Case interface
interface Case {
    id: string;
    patientName: string;
    status: string;
    dicomFileUrl: string;
    createdAt: string; // <-- Changed to string to match backend's ISO date format
}

const DoctorDashboard = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewingCase, setReviewingCase] = useState<Case | null>(null);
    const [findings, setFindings] = useState('');
    
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchCases = async () => {
            if (!currentUser || !currentUser.token) return;

            try {
                const response = await axios.get('http://127.0.0.1:8000/cases', {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                setCases(response.data);
            } catch (err) {
                setError('Failed to fetch cases.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (currentUser?.token) {
            fetchCases();
        } else {
            setIsLoading(false);
        }
    }, [currentUser]);

    const handleReviewSubmit = async (decision: 'confirmed' | 'rejected') => {
        if (!reviewingCase || !currentUser?.token) return;
        
        try {
            await axios.put(`http://127.0.0.1:8000/cases/${reviewingCase.id}/review`, 
                { decision, findings },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
            setCases(cases.filter(c => c.id !== reviewingCase.id));
            setReviewingCase(null);
            setFindings('');
        } catch (err) {
            setError('Failed to submit review.');
        }
    };

    if (isLoading) return <p className="text-white">Loading assigned cases...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (reviewingCase) {
        return (
            <div className="w-full max-w-2xl p-8 space-y-4 bg-gray-800 rounded-lg">
                <h3 className="text-2xl text-cyan-400">Review Case: {reviewingCase.patientName}</h3>
                <p><a href={reviewingCase.dicomFileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">View DICOM File</a></p>
                <textarea 
                    value={findings} 
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Enter your findings here..."
                    className="w-full h-32 p-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
                />
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setReviewingCase(null)} className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700">Cancel</button>
                    <button onClick={() => handleReviewSubmit('rejected')} className="px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700">No Stenosis Found</button>
                    <button onClick={() => handleReviewSubmit('confirmed')} className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Confirm Stenosis</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400">Assigned Cases</h2>
            {cases.length === 0 ? (
                <p className="text-gray-400">No cases are currently assigned to you.</p>
            ) : (
                <div className="space-y-4">
                    {cases.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-md">
                            <div>
                                <p className="font-semibold text-white">{c.patientName}</p>
                                {/* Correctly parse the ISO date string */}
                                <p className="text-sm text-gray-400">Received: {new Date(c.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setReviewingCase(c)} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
                                Review Case
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;

