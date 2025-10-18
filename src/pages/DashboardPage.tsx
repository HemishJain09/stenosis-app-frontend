import { useAuth } from '../context/AuthContext'; // <-- Import useAuth
import { useNavigate } from 'react-router-dom';
import ClinicDashboard from './ClinicDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const DashboardPage = () => {
    const { currentUser, logout } = useAuth(); // <-- Use the useAuth hook
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const renderDashboard = () => {
        // Add a check for when currentUser is still loading
        if (!currentUser) {
            return <p className="text-white">Loading dashboard...</p>;
        }

        switch (currentUser.role) {
            case 'clinic':
                return <ClinicDashboard />;
            case 'junior_doctor':
            case 'senior_doctor':
                return <DoctorDashboard />;
            case 'patient':
                return <PatientDashboard />;
            default:
                // This case handles users who are logged in but have no role assigned
                return <p className="text-yellow-400">Your role is not configured. Please contact support.</p>;
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 bg-gray-900">
             <div className="w-full max-w-4xl lg:max-w-6xl">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400">Welcome, {currentUser?.name || currentUser?.email}!</p>
                        <p className="text-gray-400">Your Role: <span className="font-semibold text-cyan-400">{currentUser?.role}</span></p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
                
                <div className="w-full flex justify-center">
                    {renderDashboard()}
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;

