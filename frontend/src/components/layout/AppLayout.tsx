import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Navbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
