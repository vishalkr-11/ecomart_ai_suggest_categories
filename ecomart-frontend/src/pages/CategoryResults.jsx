import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Clock } from 'lucide-react';
import { useCategoryList } from '@/hooks/useCategory';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import { fromNow, formatTokens } from '@/utils/formatters';

export default function CategoryResults() {
  const { data, loading, page, fetch } = useCategoryList();

  useEffect(() => { fetch(1); }, [fetch]);

  const results = data?.results || [];

  return (
    <div className="section-gap">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, color:'var(--forest-900)' }}>
            Category Results
          </h2>
          {data && <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginTop:2 }}>{data.total} product{data.total !== 1 ? 's' : ''} categorised total</p>}
        </div>
        <Link to="/categories/generate">
          <button className="btn btn-primary btn-sm" style={{ gap:6 }}>
            <Plus size={14} /> New Generation
          </button>
        </Link>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><div className="loading-text">Loading results…</div></div>
      ) : results.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Tag size={28} />}
            title="No results yet"
            text="Generate your first AI product categorisation to see results here."
            action={<Link to="/categories/generate"><button className="btn btn-primary btn-sm">Generate Now</button></Link>}
          />
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {results.map((r) => (
              <div key={r._id} className="card card-hover animate-fade-in-up">
                <div style={{ padding:'18px 24px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  {/* Category badge */}
                  <div style={{ flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, color:'var(--forest-900)' }}>
                      {r.output?.primaryCategory}
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>
                      → {r.output?.subCategory}
                    </div>
                  </div>

                  <div style={{ width:1, height:40, background:'var(--ivory-200)', flexShrink:0 }} />

                  {/* Product name */}
                  <div style={{ flex:1, minWidth:160 }}>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:3 }}>Product</div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.input?.productName}</div>
                  </div>

                  {/* Filters */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5, flex:2 }}>
                    {(r.output?.sustainabilityFilters || []).slice(0, 4).map((f) => (
                      <span key={f} className="filter-pill"><span className="pill-dot" />{f}</span>
                    ))}
                    {r.output?.sustainabilityFilters?.length > 4 && (
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', alignSelf:'center' }}>
                        +{r.output.sustainabilityFilters.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--text-muted)', justifyContent:'flex-end', marginBottom:4 }}>
                      <Clock size={11} /> {fromNow(r.createdAt)}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                      {r.output?.seoTags?.length || 0} tags · {formatTokens(r.aiMetadata?.totalTokens)} tokens
                    </div>
                    {r.aiMetadata?.retryCount > 0 && (
                      <Badge variant="gold" style={{ marginTop:4 }}>{r.aiMetadata.retryCount} retries</Badge>
                    )}
                  </div>
                </div>

                {/* SEO Tags strip */}
                <div style={{ padding:'10px 24px 14px', borderTop:'1px solid var(--ivory-200)', display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(r.output?.seoTags || []).map((tag) => (
                    <span key={tag} className="seo-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={fetch} />}
        </>
      )}
    </div>
  );
}
