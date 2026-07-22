import React, { createContext, useContext, useState, useCallback } from 'react';

const StatsContext = createContext();

export function StatsProvider({ children }) {
  const [statsVersion, setStatsVersion] = useState(0);

  const notifyStatsChange = useCallback(() => {
    setStatsVersion(prev => prev + 1);
  }, []);

  return (
    <StatsContext.Provider value={{ statsVersion, notifyStatsChange }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStatsRefresh() {
  const context = useContext(StatsContext);
  if (!context) throw new Error('useStatsRefresh must be used within StatsProvider');
  return context;
}
