import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Patient {
    uid: string;
    name: string;
    email: string;
}

const ClinicDashboard = () => {
    const { currentUser } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!currentUser?.token) {
                setError("Authentication token not found. Cannot fetch patients.");
                return;
            }
            try {
                const response = await axios.get(`${API_URL}`, {
                    headers: { Authorization: `Bearer ${currentUser.token}` }
                });
                setPatients(response.data);
                // Set the default selected patient if the list is not empty
                if (response.data.length > 0) {
                    setSelectedPatient(response.data[0].uid);
                }
            } catch (err) {
                console.error("Failed to fetch patients:", err);
                setError('Could not load the patient list. Please try again later.');
            }
        };

        if (currentUser) {
            fetchPatients();
        }
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPatient) {
            setError('Please select a patient and a file.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        const patientDetails = patients.find(p => p.uid === selectedPatient);
        if (!patientDetails) {
            setError("Could not find selected patient details.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('patientName', patientDetails.name);
        formData.append('patientEmail', patientDetails.email);
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${currentUser?.token}`
                },
            });
            setMessage('Case created and sent for analysis successfully!');
            setFile(null);
            
        } catch (err) {
            setError('Failed to create case. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-2xl p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-cyan-400">Upload New Angiography Case</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Select Patient</label>
                     <select 
                        value={selectedPatient} 
                        onChange={(e) => setSelectedPatient(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="" disabled>-- Select a Patient --</option>
                        {patients.map(p => (
                            <option key={p.uid} value={p.uid}>
                                {p.name} ({p.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">DICOM File</label>
                    <input type="file" onChange={handleFileChange} required className="w-full mt-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"/>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}

                <button type="submit" disabled={isLoading} className="w-full py-3 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:opacity-50 transition-colors">
                    {isLoading ? 'Submitting...' : 'Submit Case for Analysis'}
                </button>
            </form>
        </div>
    );
};

export default ClinicDashboard;

