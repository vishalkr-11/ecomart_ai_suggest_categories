import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CategoryGenerator from './pages/CategoryGenerator';
import CategoryResults from './pages/CategoryResults';
import ProposalGenerator from './pages/ProposalGenerator';
import ProposalList from './pages/ProposalList';
import ProposalDetail from './pages/ProposalDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories">
            <Route path="generate" element={<CategoryGenerator />} />
            <Route path="results"  element={<CategoryResults />} />
          </Route>
          <Route path="proposals">
            <Route index          element={<ProposalList />} />
            <Route path="generate" element={<ProposalGenerator />} />
            <Route path=":proposalCode" element={<ProposalDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
