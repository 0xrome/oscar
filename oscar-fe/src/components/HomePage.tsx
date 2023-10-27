// src/components/HomePage.tsx

import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
    const authContext = useAuth();
    if (!authContext) {
        // Handle the error, perhaps return null or a loading spinner
        return null;
    }
    const { user } = authContext;


    return (
        <div className="min-h-screen flex items-center justify-center "> 
            <div className=" p-10 rounded-3xl shadow-md w-96"> 
                <h2 className="font-semibold text-xl mb-4 ">Welcome, {user?.email || "User"}!</h2>
                <p className="text-sm  mb-4">Here's your dashboard.</p>
                <button className="btn btn-primary w-full mt-4">Dashboard Action</button>
            </div>
        </div>
    );
}

export default HomePage;
