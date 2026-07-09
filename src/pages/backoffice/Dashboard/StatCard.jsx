import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

function StatCard({ title, value, icon: Icon, color, change, changeType, link }) {
  return (
    <Link to={link} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{title}</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-1">{value}</p>
            {change && (
              <div className="flex items-center mt-1 sm:mt-2">
                {changeType === 'up' ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>{change}</span>
              </div>
            )}
          </div>
          <div className={`${color} p-2.5 sm:p-3 rounded-xl ml-2 flex-shrink-0 shadow-lg`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default StatCard;
