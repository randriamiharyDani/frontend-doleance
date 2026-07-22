import React from 'react';

function AgentPerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Performance des agents</h2>
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">Aucun agent assigné pour le moment</p>
      </div>
    );
  }

  const medals = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">Performance des agents</h2>
      <div className="space-y-2 sm:space-y-3">
        {data.map((agent, i) => {
          const taux = agent.doleances_traitees > 0
            ? Math.round((agent.doleances_resolues / agent.doleances_traitees) * 100)
            : 0;
          return (
            <div key={agent.id_utilisateur} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <span className={`text-sm font-bold w-5 text-center ${i < 3 ? medals[i] : 'text-gray-400'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{agent.prenom} {agent.nom}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${taux}%` }} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{taux}% résolues</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700">{agent.doleances_resolues}/{agent.doleances_traitees}</p>
                <p className="text-[10px] text-gray-400">traitées</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentPerformance;
