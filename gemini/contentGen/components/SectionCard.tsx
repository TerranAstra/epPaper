
import React from 'react';

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 hover:border-purple-500 transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-6 text-slate-100 flex items-center">
        <span className="text-3xl mr-3">{icon}</span>
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
    