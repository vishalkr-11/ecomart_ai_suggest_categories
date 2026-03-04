import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Users, Leaf, Clock, Cpu } from 'lucide-react';
import { useProposalDetail } from '@/hooks/useProposal';
import LineItemsTable from '@/components/proposal/LineItemsTable';
import BudgetGauge from '@/components/proposal/BudgetGauge';
import Badge from '@/components/common/Badge';
import ErrorAlert from '@/components/common/ErrorAlert';
import { formatDate, formatTokens, formatLatency, slugToLabel } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';

export default function ProposalDetail() {
  const { proposalCode } = useParams();
  const { proposal, loading, error, fetch } = useProposalDetail(proposalCode);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ height:'60vh' }}>
        <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
        <div className="loading-text">Loading proposal…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-gap">
        <Link to="/proposals"><button className="btn btn-outline btn-sm" style={{ gap:6 }}><ArrowLeft size={14} /> Back</button></Link>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!proposal) return null;

  const { input, lineItems, budgetSummary, impactPositioningSummary, aiMetadata, status, createdAt } = proposal;
  const statusClass = STATUS_COLORS[status] || 'badge-ivory';

  return (
    <div className="section-gap">
      {/* Back */}
      <Link to="/proposals">
        <button className="btn btn-ghost btn-sm" style={{ gap:6 }}>
          <ArrowLeft size={14} /> All Proposals
        </button>
      </Link>

      {/* Hero Banner */}
      <div style={{
        background:'linear-gradient(135deg, var(--forest-900) 0%, var(--forest-700) 100%)',
        borderRadius:'var(--r-xl)',
        padding:'32px 36px',
        color:'var(--ivory-100)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-20, top:-20, width:220, height:220, borderRadius:'50%', background:'rgba(201,148,58,0.1)' }} />
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--gold-300)', marginBottom:8, letterSpacing:'0.06em' }}>
              {proposalCode}
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:600, lineHeight:1.2, marginBottom:8 }}>
              {slugToLabel(input.eventType)}
            </h1>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginTop:12 }}>
              {[
                [Building2, slugToLabel(input.clientType)],
                [Users, `${input.headcount} attendees`],
                [Leaf, `${slugToLabel(input.sustainabilityPreferenceLevel)} sustainability`],
                [CalendarDays, formatDate(createdAt)],
              ].map(([Icon, val]) => (
                <div key={val} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--ivory-400)' }}>
                  <Icon size={14} />
                  {val}
                </div>
              ))}
            </div>
          </div>
          <Badge variant={statusClass.replace('badge-', '')} style={{ fontSize:'0.85rem', padding:'6px 14px' }}>
            {status}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:24, alignItems:'start' }}>
        {/* Left */}
        <div className="section-gap">
          {/* Line Items */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Product Mix — {lineItems.length} Items</div>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Prices from database</span>
            </div>
            <div className="card-body" style={{ padding:0, overflowX:'auto' }}>
              <LineItemsTable items={lineItems} currency={input.currency} />
            </div>
          </div>

          {/* Impact */}
          <div className="impact-box">
            <div className="impact-box-title">Sustainability Impact Narrative</div>
            <div className="impact-box-text">"{impactPositioningSummary}"</div>
          </div>
        </div>

        {/* Right */}
        <div className="section-gap">
          {/* Budget */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Budget Analysis</div>
            </div>
            <div className="card-body">
              <BudgetGauge summary={budgetSummary} />
            </div>
          </div>

          {/* Input Summary */}
          <div className="card">
            <div className="card-header"><div className="card-title">Client Brief</div></div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                ['Client Type', slugToLabel(input.clientType)],
                ['Event Type', slugToLabel(input.eventType)],
                ['Headcount', `${input.headcount} people`],
                ['Currency', input.currency],
                ['Sustainability', slugToLabel(input.sustainabilityPreferenceLevel)],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:10, borderBottom:'1px solid var(--ivory-200)' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600 }}>{label}</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:600 }}>{val}</span>
                </div>
              ))}
              {input.notes && (
                <div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>Notes</div>
                  <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{input.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Metadata */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Cpu size={15} /> AI Metadata
              </div>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['Model', aiMetadata?.model || '—'],
                ['Total Tokens', formatTokens(aiMetadata?.totalTokens)],
                ['Latency', formatLatency(aiMetadata?.latencyMs)],
                ['Retry Count', aiMetadata?.retryCount ?? 0],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize:'0.82rem', fontWeight:600, fontFamily:'monospace' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
