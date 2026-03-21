import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/admin/AppRoutes";
import Sidebar from "./components/admin/Sidebar";
import Navbar from "./components/admin/Navbar"; 
import { NotificationProvider } from "./context/NotificationContext";

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {!isLoginPage && <Sidebar />}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${!isLoginPage ? 'ml-[250px]' : ''}`}>
        {!isLoginPage && <Navbar />}
        <main className="flex-1 pt-24 px-6 pb-6 overflow-x-hidden">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Layout />
      </NotificationProvider>
    </BrowserRouter>
  );
}
