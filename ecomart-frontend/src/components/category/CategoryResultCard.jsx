import { CheckCircle2, Tag, Layers, Cpu, Clock } from 'lucide-react';
import { formatDate, formatTokens, formatLatency } from '@/utils/formatters';
import Badge from '../common/Badge';

export default function CategoryResultCard({ result }) {
  if (!result) return null;
  const { input, output, aiMetadata, createdAt } = result;

  return (
    <div className="result-card animate-scale-in">
      {/* Banner */}
      <div className="result-banner">
        <div>
          <div className="result-banner-title">
            <CheckCircle2 size={18} style={{ display:'inline', marginRight:8, color:'#8ECBA6' }} />
            {output.primaryCategory}
          </div>
          <div className="result-banner-sub">→ {output.subCategory}</div>
          {output.confidenceNote && (
            <div className="result-banner-sub" style={{ marginTop: 6, fontStyle:'italic', opacity:0.8 }}>
              💬 {output.confidenceNote}
            </div>
          )}
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:'0.72rem', color:'var(--ivory-400)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Input Product</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--ivory-100)', marginTop:4 }}>{input.productName}</div>
        </div>
      </div>

      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'24px' }}>
        {/* Sustainability Filters */}
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'10px', display:'flex', alignItems:'center', gap:6 }}>
            <Layers size={13} /> Sustainability Filters
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {output.sustainabilityFilters.map((f) => (
              <span key={f} className="filter-pill">
                <span className="pill-dot" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--ivory-200)' }} />

        {/* SEO Tags */}
        <div>
          <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'10px', display:'flex', alignItems:'center', gap:6 }}>
            <Tag size={13} /> SEO Tags
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {output.seoTags.map((tag) => (
              <span key={tag} className="seo-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--ivory-200)' }} />

        {/* Input summary */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div>
            <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:6 }}>Materials Used</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {input.materials.map((m) => (
                <Badge key={m} variant="ivory">{m}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:6 }}>Target Audience</div>
            <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)' }}>{input.targetAudience}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer" style={{ gap:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'var(--text-muted)' }}>
            <Cpu size={13} />
            <span>{aiMetadata?.model || '—'}</span>
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
            {formatTokens(aiMetadata?.totalTokens)} tokens
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
            {formatLatency(aiMetadata?.latencyMs)}
          </div>
          {aiMetadata?.retryCount > 0 && (
            <Badge variant="gold">{aiMetadata.retryCount} retries</Badge>
          )}
        </div>
        {createdAt && (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--text-muted)' }}>
            <Clock size={12} />
            {formatDate(createdAt)}
          </div>
        )}
      </div>
    </div>
  );
}
