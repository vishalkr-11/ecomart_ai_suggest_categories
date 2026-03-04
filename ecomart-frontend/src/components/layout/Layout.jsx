import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/':                      ['Dashboard', 'Overview'],
  '/categories/generate':   ['Category Generator', 'Module 1'],
  '/categories/results':    ['Category Results',   'Module 1'],
  '/proposals/generate':    ['Proposal Generator', 'Module 2'],
  '/proposals':             ['All Proposals',      'Module 2'],
};

export default function Layout() {
  const { pathname } = useLocation();
  const [title, crumb] = PAGE_TITLES[pathname] || [
    pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'EcoMart',
    '',
  ];

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        {/* Page Header */}
        <header className="page-header">
          <div className="page-header-left">
            <h1 className="page-header-title" style={{ textTransform: 'capitalize' }}>{title}</h1>
            {crumb && <span className="page-header-crumb">{crumb}</span>}
          </div>
          <div className="page-header-right">
            <span className="header-status-dot" />
            <span className="header-status-text">API Connected</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-body">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '12px',
            border: '1px solid #EDE9E2',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#2A7048', secondary: 'white' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />
    </div>
  );
}
