
import React from 'react';

const AtomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v-.933c0-.996.806-1.8 1.8-1.8h2.4c.994 0 1.8.804 1.8 1.8v.933m-6.002-3.666c.33-.223.694-.415 1.08-.573m-1.08.573a7.5 7.5 0 00-5.408 5.066m5.408-5.066c.153-.02.308-.035.464-.044m4.274 0c.156.009.31.024.464.044m-4.274 0a7.5 7.5 0 014.274 0M4.53 12.029a7.5 7.5 0 011.08-.573m-1.08.573a7.5 7.5 0 00-1.058 3.655m1.058-3.655a7.525 7.525 0 01-1.08-.573M15 4.75v.933c0 .996-.806 1.8-1.8 1.8h-2.4c-.994 0-1.8-.804-1.8-1.8V4.75" />
    </svg>
);


interface HeaderProps {
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    return (
        <header className="bg-base-200/50 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-50 border-b border-base-300/50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <AtomIcon />
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Quantum Budget Optimizer</h1>
                </div>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-error rounded-md hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};