// src/components/layout/AppLayout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState } from "react";

export default function AppLayout({ children }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const toggleSidebarMobile = () => setMobileSidebar(!mobileSidebar);

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden">
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
          <div
            className="w-full h-full"
            onClick={() => setMobileSidebar(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebarMobile={toggleSidebarMobile} />
        <div className="p-6 bg-gray-50 min-h-screen">{children}</div>
      </div>
    </div>
  );
}
