import { useState } from 'react';
import { Info, FileText } from 'lucide-react';
import ProposalForm from '@/components/proposal/ProposalForm';
import LineItemsTable from '@/components/proposal/LineItemsTable';
import BudgetGauge from '@/components/proposal/BudgetGauge';
import AiLoader from '@/components/common/AiLoader';
import Badge from '@/components/common/Badge';
import { useProposalGenerator } from '@/hooks/useProposal';
import { formatCurrency, formatLatency, formatTokens, slugToLabel } from '@/utils/formatters';

const AI_STEPS = [
  'Fetching eligible product catalogue…',
  'Building AI prompt with real SKUs…',
  'AI selecting product mix…',
  'Resolving prices from database…',
  'Verifying budget allocation…',
  'Saving proposal with traceability…',
];

export default function ProposalGenerator() {
  const { generate, loading, result, error } = useProposalGenerator();
  const [step, setStep] = useState(0);

  const handleSubmit = async (payload) => {
    setStep(0);
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, AI_STEPS.length - 1)), 1400);
    await generate(payload);
    clearInterval(interval);
    setStep(AI_STEPS.length);
  };

  return (
    <div className="section-gap">
      <div className="alert alert-info">
        <Info size={15} style={{ flexShrink:0, marginTop:2 }} />
        <span>
<strong>Budget Guaranteed:</strong> Every proposal is verified against real product pricing — your total will always stay within the limit you set. No surprises.        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:28, alignItems:'start' }}>
        {/* Left — Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <FileText size={17} style={{ color:'var(--gold-500)' }} />
              Client Brief
            </div>
          </div>
          <div className="card-body">
            <ProposalForm onSubmit={handleSubmit} loading={loading} error={error} />
          </div>
        </div>

        {/* Right — Result */}
        <div className="section-gap" style={{ position:'sticky', top:'calc(var(--header-h) + 24px)' }}>
          {loading ? (
            <div className="card">
              <AiLoader steps={AI_STEPS} activeStep={step} title="Generating proposal…" />
            </div>
          ) : result ? (
            <ProposalResult result={result} />
          ) : (
            <div className="card" style={{ border:'2px dashed var(--ivory-300)' }}>
              <div className="empty-state">
                <div className="empty-state-icon" style={{ width:80, height:80 }}>
                  <FileText size={32} />
                </div>
                <div className="empty-state-title">Proposal will appear here</div>
                <p className="empty-state-text">
                  Complete the client brief and click Generate. Budget is verified by the backend using live product pricing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProposalResult({ result }) {
  const { proposalCode, input, lineItems, budgetSummary, impactPositioningSummary, aiMetadata } = result;

  return (
    <div className="result-card">
      {/* Banner */}
      <div className="result-banner">
        <div>
          <div style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'var(--gold-300)', marginBottom:6, letterSpacing:'0.05em' }}>
            {proposalCode}
          </div>
          <div className="result-banner-title">{slugToLabel(input.eventType)}</div>
          <div className="result-banner-sub">{slugToLabel(input.clientType)} · {input.headcount} people · {slugToLabel(input.sustainabilityPreferenceLevel)} sustainability</div>
        </div>
        <Badge variant="success">Validated</Badge>
      </div>

      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'24px' }}>
        {/* Budget Gauge */}
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:12 }}>
            Budget Allocation (Backend Verified)
          </div>
          <BudgetGauge summary={budgetSummary} />
        </div>

        <div style={{ height:1, background:'var(--ivory-200)' }} />

        {/* Line Items */}
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:12 }}>
            Product Mix ({lineItems.length} items)
          </div>
          <LineItemsTable items={lineItems} currency={input.currency} />
        </div>

        <div style={{ height:1, background:'var(--ivory-200)' }} />

        {/* Impact Positioning */}
        <div className="impact-box">
          <div className="impact-box-title">Sustainability Impact Narrative</div>
          <div className="impact-box-text">"{impactPositioningSummary}"</div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer" style={{ gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:16 }}>
          {[
            ['Model', aiMetadata?.model || '—'],
            ['Tokens', formatTokens(aiMetadata?.totalTokens)],
            ['Latency', formatLatency(aiMetadata?.latencyMs)],
          ].map(([label, val]) => (
            <div key={label} style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
              <span style={{ fontWeight:600 }}>{label}: </span>{val}
            </div>
          ))}
          {aiMetadata?.retryCount > 0 && <Badge variant="gold">{aiMetadata.retryCount} retries</Badge>}
        </div>
      </div>
    </div>
  );
}
