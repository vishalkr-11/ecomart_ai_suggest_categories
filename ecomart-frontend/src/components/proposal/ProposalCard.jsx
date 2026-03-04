import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Wallet, Users } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, formatDateShort, fromNow } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { slugToLabel } from '@/utils/formatters';

export default function ProposalCard({ proposal }) {
  const { proposalCode, input, budgetSummary, status, createdAt, lineItems } = proposal;
  const statusClass = STATUS_COLORS[status] || 'badge-ivory';
  const pct = Math.round((budgetSummary.totalAllocated / budgetSummary.budgetLimit) * 100);

  return (
    <div className="card card-hover animate-fade-in-up">
      <div className="card-header">
        <div>
          <div style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--forest-500)', fontWeight:700, marginBottom:4 }}>
            {proposalCode}
          </div>
          <div className="card-title">{slugToLabel(input.eventType)}</div>
        </div>
        <Badge variant={statusClass.replace('badge-', '')}>{status}</Badge>
      </div>

      <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:3 }}>
              Client
            </div>
            <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{slugToLabel(input.clientType)}</div>
          </div>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:3 }}>
              Budget Used
            </div>
            <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--forest-600)' }}>
              {formatCurrency(budgetSummary.totalAllocated, input.currency)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:3 }}>
              Items
            </div>
            <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{lineItems?.length || 0} products</div>
          </div>
        </div>

        {/* Mini gauge */}
        <div>
          <div className="gauge-track" style={{ height:6 }}>
            <div className={`gauge-fill ${pct >= 100 ? 'danger' : pct >= 85 ? 'warn' : 'safe'}`} style={{ width:`${Math.min(pct,100)}%` }} />
          </div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4, display:'flex', justifyContent:'space-between' }}>
            <span>Budget: {formatCurrency(input.budgetLimit, input.currency)}</span>
            <span>{pct}% used</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:5 }}>
          <CalendarDays size={12} />
          {fromNow(createdAt)}
        </div>
        <Link to={`/proposals/${proposalCode}`}>
          <button className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:6 }}>
            View <ArrowUpRight size={13} />
          </button>
        </Link>
      </div>
    </div>
  );
}
