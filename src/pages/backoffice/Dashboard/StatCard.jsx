import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, color, change, changeType, subtitle, progress }) {
  return (
    <div
      className="group h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden block">
      <div className={`h-1 ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
            {subtitle && !change && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
            {change?.value && (
              <div className="flex items-center mt-1.5">
                {changeType === 'up' ? (
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-emerald-500 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3.5 w-3.5 text-rose-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {change.value} vs mois précédent
                </span>
              </div>
            )}
            {typeof progress === 'number' && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            )}
          </div>
          <div className={`${color} p-2.5 rounded-xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
