import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Case {
    id: string;
    patientName: string;
    status: string;
    createdAt: { _seconds: number };
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
                const response = await axios.get(`${API_URL}/my-cases`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });

                if (Array.isArray(response.data)) {
                    setCases(response.data);
                } else {
                    console.error("API did not return an array for my-cases:", response.data);
                    setError('Received invalid data for case history.');
                }

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
    
    const generatePDFReport = (c: Case) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("CardioSenseAI - Case Report", 10, 20);
        doc.setFontSize(12);
        doc.text(`Case ID: ${c.id}`, 10, 30);
        doc.text(`Patient Name: ${c.patientName}`, 10, 40);
        doc.text(`Date: ${new Date(c.createdAt._seconds * 1000).toLocaleDateString()}`, 10, 50);
        
        doc.setLineWidth(0.5);
        doc.line(10, 55, 200, 55);

        doc.setFontSize(16);
        doc.text("Final Result", 10, 65);
        doc.setFontSize(12);
        doc.text(getStatusText(c.status), 10, 75);

        if (c.findings) {
            doc.setFontSize(16);
            doc.text("Doctor's Findings", 10, 90);
            doc.setFontSize(12);
            doc.text(c.findings, 10, 100, { maxWidth: 180 });
        }

        doc.save(`case-report-${c.id}.pdf`);
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
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-white">Case from {new Date(c.createdAt._seconds * 1000).toLocaleDateString()}</p>
                                    <p className="text-sm text-cyan-400">{getStatusText(c.status)}</p>
                                </div>
                                {(c.status === 'closed_no_stenosis' || c.status === 'closed_stenosis_confirmed') && (
                                     <button onClick={() => generatePDFReport(c)} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
                                        Download Report
                                    </button>
                                )}
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

