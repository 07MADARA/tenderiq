import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import EvaluationWorkbench from './pages/EvaluationWorkbench';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex text-gray-200">
    <aside className="w-64 border-r border-border/50 bg-background flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <Shield className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold tracking-wider neon-text">TenderIQ</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
          <FileText className="w-5 h-5" />
          Tenders
        </Link>
      </nav>
      <div className="p-6 border-t border-border/50 text-xs text-gray-500">
        Procurement Officer Portal
      </div>
    </aside>
    <main className="flex-1 overflow-x-hidden p-8 bg-[#040B16] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenders/:id/workbench" element={<EvaluationWorkbench />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
