import React from 'react';

function InfoCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, error }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1 sm:mt-2">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-2.5 sm:p-3 rounded-xl flex-shrink-0 ml-2 border`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
        </div>
      </div>
      {error && <p className="text-xs text-amber-600 mt-2">Données partiellement chargées</p>}
    </div>
  );
}

export default InfoCard;
