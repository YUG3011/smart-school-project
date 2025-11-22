import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex">
      
      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-50">
        <Topbar />

        <div className="p-6">
          {children}
        </div>
      </div>

    </div>
  );
}
