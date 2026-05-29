import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ResponsiveLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Classes conditionnelles selon la page
  const isBackoffice = location.pathname.startsWith('/backoffice');
  const containerClass = isBackoffice ? 'max-w-full' : 'container-custom';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={containerClass}>
        {/* Indicateur de taille d'écran pour le debug (optionnel) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 bg-black text-white text-xs px-2 py-1 rounded opacity-50">
            {isMobile ? '📱 Mobile' : isTablet ? '📟 Tablet' : '💻 Desktop'} | {windowWidth}px
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default ResponsiveLayout;