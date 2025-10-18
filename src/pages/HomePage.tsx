import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-bold text-cyan-400 mb-6">Welcome to CardioSense AI</h1>
      <p className="text-xl text-gray-300 mb-8">The future of stenosis detection and workflow management.</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
          Login
        </Link>
        <Link to="/register" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
          Register
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
