import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeBackButton = (): React.ReactElement => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/home')}
      className="inline-flex items-center gap-2 bg-white border rounded-xl px-3 py-1.5 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition text-sm"
    >
      <span>←</span>
      <span>홈으로 돌아가기</span>
    </button>
  );
};

export default HomeBackButton;
