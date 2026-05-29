import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sidebar - Fixed */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Page Content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;