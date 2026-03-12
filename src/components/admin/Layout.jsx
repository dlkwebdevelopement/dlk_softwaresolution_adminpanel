// Layout.jsx
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 ml-[250px] mt-16 min-h-[calc(100vh-64px)] transition-all duration-300">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}