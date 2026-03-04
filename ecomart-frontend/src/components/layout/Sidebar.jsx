import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Tag, ListFilter,
  FileText, ClipboardList, Leaf
} from 'lucide-react';

const NAV = [
  { label: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'Module 1 — Categoriser', items: [
    { to: '/categories/generate',  label: 'Generate Category',  icon: Tag },
    { to: '/categories/results',   label: 'Category Results',   icon: ListFilter },
  ]},
  { label: 'Module 2 — Proposals', items: [
    { to: '/proposals/generate', label: 'Generate Proposal', icon: FileText },
    { to: '/proposals',          label: 'All Proposals',     icon: ClipboardList },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={20} color="white" strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">EcoMart</div>
          <div className="sidebar-logo-sub">AI Commerce</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">EcoMart AI · v1.0.0</div>
      </div>
    </aside>
  );
}
