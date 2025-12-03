import React from 'react';
import HomeBackButton from '../components/HomeBackButton';

const MyLibraryPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <header>
                    <HomeBackButton />
                </header>

                <main className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900">나의 서재</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Placeholder for library items */}
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48 flex items-center justify-center text-gray-400">
                                Book Item Placeholder
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyLibraryPage;
