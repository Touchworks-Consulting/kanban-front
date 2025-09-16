import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {children}
    </div>
  );
};

export default MainLayout;
