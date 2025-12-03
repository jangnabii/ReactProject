import React from 'react';
import HomeBackButton from '../components/HomeBackButton';

const ChatPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white shadow-sm z-10">
                <div className="max-w-3xl mx-auto w-full">
                    <HomeBackButton />
                </div>
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full p-4 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Chat Messages Placeholder */}
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                            <p className="text-gray-800">안녕하세요! 무엇을 도와드릴까요?</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                            <p className="text-white">새로운 책을 추천받고 싶어요.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="메시지를 입력하세요..."
                            className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <span className="text-xl">↑</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
