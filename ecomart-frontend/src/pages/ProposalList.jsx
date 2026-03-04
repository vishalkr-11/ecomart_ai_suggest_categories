import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { useProposalList } from '@/hooks/useProposal';
import ProposalCard from '@/components/proposal/ProposalCard';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';

export default function ProposalList() {
  const { data, loading, page, fetch } = useProposalList();

  useEffect(() => { fetch(1); }, [fetch]);

  const proposals = data?.results || [];

  return (
    <div className="section-gap">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, color:'var(--forest-900)' }}>
            All Proposals
          </h2>
          {data && <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginTop:2 }}>{data.total} proposal{data.total !== 1 ? 's' : ''} generated</p>}
        </div>
        <Link to="/proposals/generate">
          <button className="btn btn-gold btn-sm" style={{ gap:6 }}>
            <Plus size={14} /> New Proposal
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading proposals…</div></div>
      ) : proposals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FileText size={28} />}
            title="No proposals yet"
            text="Generate your first AI B2B proposal with budget verification."
            action={<Link to="/proposals/generate"><button className="btn btn-gold btn-sm">Generate Now</button></Link>}
          />
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
            {proposals.map((p) => <ProposalCard key={p._id} proposal={p} />)}
          </div>
          {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={fetch} />}
        </>
      )}
    </div>
  );
}
