import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, FileText, Leaf, Zap, ArrowRight, X, BarChart2, MessageCircle } from 'lucide-react';
import { listCategoryResults } from '@/api/categoryApi';
import { listProposals } from '@/api/proposalApi';
import { formatCurrency, fromNow, slugToLabel, truncate } from '@/utils/formatters';

// ─── Architecture Documentation Data ──────────────────────────────────────────
const ARCH_DOCS = {
  '03': {
    title: 'Impact Reporting Generator',
    icon: BarChart2,
    color: '#0EA5E9',
    sections: [
      {
        heading: 'Overview',
        body: 'Aggregates product impact metrics across completed orders and generates AI-narrated sustainability reports. Numbers are always computed from the database — AI only writes the narrative.',
      },
      {
        heading: 'Data Model — ImpactReport',
        body: '{ orderId, period, totalPlasticSavedGrams,\n  totalCarbonAvoidedKg, productsBreakdown[],\n  generatedSummary, createdAt }',
      },
      {
        heading: 'Plastic Saved Calculation',
        body: 'product.impactMetrics.plasticSavedPerUnitGrams\n  × quantity / 1000 = kg saved\n\nStored on every Product document,\nsummed at order completion via post-save hook.',
      },
      {
        heading: 'Carbon Avoided Calculation',
        body: 'product.impactMetrics.carbonAvoidedPerUnitKg\n  × quantity = total CO₂e avoided\n\nBased on lifecycle assessment data per SKU.',
      },
      {
        heading: 'AI Narrative Strategy',
        body: 'Verified numbers → AI system prompt → 3-paragraph\nsustainability story. AI never computes — only narrates.',
      },
      {
        heading: 'Storage Strategy',
        body: '• Impact stored at order creation (event-driven)\n• Cumulative reports re-generated on demand, cached 24h\n• Each report stores period + full metric breakdown',
      },
    ],
  },
  '04': {
    title: 'WhatsApp Support Bot',
    icon: MessageCircle,
    color: '#22C55E',
    sections: [
      {
        heading: 'Overview',
        body: 'Customer support via WhatsApp Business API with AI chatbot, automatic escalation to human agents, and full conversation logging.',
      },
      {
        heading: 'Webhook Flow',
        body: 'WhatsApp API → POST /api/v1/webhooks/whatsapp\n→ webhookController.handleInbound()\n→ whatsappService.processMessage()\n→ [intent classify] → [order lookup / AI reply]\n→ whatsappService.sendReply()',
      },
      {
        heading: 'Intent Classification',
        body: 'AI classifies every message into one of:\nORDER_STATUS | PRODUCT_QUERY\nCOMPLAINT | ESCALATION | OTHER\n\nReturns: { intent, reply, shouldEscalate, reason }',
      },
      {
        heading: 'Order Status Retrieval',
        body: 'Order ID extracted via regex /ECO-\\d{6}/\nQueried from Orders collection and formatted\ninto a human-readable status string.',
      },
      {
        heading: 'Escalation Triggers',
        body: '1. AI detects anger / legal threat\n2. User says "human agent"\n3. Conversation > 5 turns unresolved\n\n→ Conversation flagged + human notified via Slack',
      },
      {
        heading: 'Conversation Logging',
        body: 'ConversationLog: { waId, direction,\n  message, intent, sessionId, escalated }\n\nLast 10 turns injected into every AI call.\nSessions expire after 24h inactivity.',
      },
    ],
  },
};

// ─── Architecture Modal ────────────────────────────────────────────────────────
function ArchModal({ moduleKey, onClose }) {
  const doc = ARCH_DOCS[moduleKey];
  if (!doc) return null;
  const Icon = doc.icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,13,7,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--r-xl)',
          width: '100%', maxWidth: 620,
          maxHeight: '88vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px 20px',
          background: 'linear-gradient(135deg, var(--forest-900), var(--forest-700))',
          color: 'var(--ivory-100)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{
                width:38, height:38, borderRadius:'var(--r-md)',
                background:`${doc.color}22`, border:`1px solid ${doc.color}55`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon size={19} color={doc.color} />
              </div>
              <span style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold-400)' }}>
                Module 0{moduleKey} — Architecture Design
              </span>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, lineHeight:1.2 }}>
              {doc.title}
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--ivory-400)', marginTop:5 }}>
              Architecture designed · Full implementation ready to build on top of Modules 1 & 2
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:'var(--r-md)', width:34, height:34,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--ivory-300)', flexShrink:0,
              transition:'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.16)'}
            onMouseLeave={(e) => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY:'auto', padding:'24px 28px 28px', display:'flex', flexDirection:'column', gap:16 }}>
          {doc.sections.map((s, i) => (
            <div key={s.heading}>
              <div style={{
                fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.12em', color: doc.color,
                marginBottom:8, display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ display:'inline-block', width:16, height:2, background:doc.color, borderRadius:2, flexShrink:0 }} />
                {s.heading}
              </div>
              <div style={{
                fontSize:'0.855rem', color:'var(--ivory-800)', lineHeight:1.85,
                whiteSpace:'pre-line',
                background:'var(--ivory-50)', borderRadius:'var(--r-md)',
                padding:'13px 16px', border:'1px solid var(--ivory-200)',
                fontFamily:"'Courier New', monospace",
              }}>
                {s.body}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div style={{
            padding:'16px 18px', marginTop:4,
            background:'var(--forest-50)', borderRadius:'var(--r-md)',
            border:'1px dashed var(--forest-200)',
            display:'flex', alignItems:'center', gap:14,
          }}>
            <Leaf size={20} color="var(--forest-500)" style={{ flexShrink:0 }} />
            <div>
              <div style={{ fontSize:'0.78rem', color:'var(--forest-700)', fontWeight:700, marginBottom:3 }}>Ready to implement?</div>
              <div style={{ fontSize:'0.78rem', color:'var(--forest-600)', lineHeight:1.6 }}>
                Follow the same pattern as Modules 1 & 2. Full docs in{' '}
                <code style={{ background:'var(--ivory-200)', padding:'1px 6px', borderRadius:4, fontSize:'0.8rem' }}>README.md</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentCats, setRecentCats] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openArch, setOpenArch] = useState(null); // '03' | '04' | null

  useEffect(() => {
    async function load() {
      try {
        const [catRes, propRes] = await Promise.all([
          listCategoryResults(1, 5),
          listProposals(1, 5),
        ]);
        setRecentCats(catRes.data?.results || []);
        setRecentProposals(propRes.data?.results || []);
        setStats({
          totalCategories: catRes.data?.total || 0,
          totalProposals: propRes.data?.total || 0,
        });
      } catch { /* silently handled */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="section-gap">
      {/* Architecture Modal */}
      {openArch && <ArchModal moduleKey={openArch} onClose={() => setOpenArch(null)} />}

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--forest-900) 0%, var(--forest-700) 60%, var(--forest-600) 100%)',
        borderRadius: 'var(--r-xl)',
        padding: '32px 36px',
        color: 'var(--ivory-100)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', right:-20, top:-20, width:200, height:200, borderRadius:'50%', background:'rgba(201,148,58,0.1)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:60, bottom:-40, width:140, height:140, borderRadius:'50%', background:'rgba(93,176,126,0.12)', pointerEvents:'none' }} />
        <div style={{ fontFamily:'var(--font-display)', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold-400)', marginBottom:8 }}>
          Sustainable B2B Commerce Intelligence
        </div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:600, lineHeight:1.2, marginBottom:12 }}>
          Good to see you back.<br />What would you like to build?
        </h2>
        <p style={{ fontSize:'0.9rem', color:'var(--ivory-400)', maxWidth:480, lineHeight:1.7, marginBottom:24 }}>
          Use AI to auto-categorise products with SEO tags, generate verified B2B proposals within budget, and track your sustainability impact in real time.
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link to="/categories/generate">
            <button className="btn btn-gold" style={{ gap:8 }}>
              <Tag size={15} /> Generate Category
            </button>
          </Link>
          <Link to="/proposals/generate">
            <button className="btn btn-outline" style={{ color:'var(--ivory-200)', borderColor:'rgba(255,255,255,0.25)', gap:8 }}>
              <FileText size={15} /> New B2B Proposal
            </button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid stagger">
        <div className="stat-card green animate-fade-in-up">
          <div className="stat-icon green"><Tag size={20} /></div>
          <div className="stat-label">Products Categorised</div>
          <div className="stat-value">{loading ? '—' : stats?.totalCategories ?? 0}</div>
          <div className="stat-sub">via AI Category Generator</div>
        </div>
        <div className="stat-card gold animate-fade-in-up">
          <div className="stat-icon gold"><FileText size={20} /></div>
          <div className="stat-label">Proposals Generated</div>
          <div className="stat-value">{loading ? '—' : stats?.totalProposals ?? 0}</div>
          <div className="stat-sub">budget-verified by backend</div>
        </div>
        <div className="stat-card teal animate-fade-in-up">
          <div className="stat-icon teal"><Leaf size={20} /></div>
          <div className="stat-label">Modules Active</div>
          <div className="stat-value">2</div>
          <div className="stat-sub">Category + Proposal</div>
        </div>
        <div className="stat-card amber animate-fade-in-up">
          <div className="stat-icon amber"><Zap size={20} /></div>
          <div className="stat-label">AI Retry Rate</div>
          <div className="stat-value">—</div>
          <div className="stat-sub">from AiLog collection</div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="dashboard-grid-2">
        {/* Recent Categorisations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Categorisations</div>
            <Link to="/categories/results">
              <button className="btn btn-ghost btn-sm" style={{ gap:5 }}>View all <ArrowRight size={13} /></button>
            </Link>
          </div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {loading ? (
              <div className="loading-overlay" style={{ padding:32 }}><div className="spinner" /></div>
            ) : recentCats.length === 0 ? (
              <div style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>
                No categorisations yet.{' '}
                <Link to="/categories/generate" style={{ color:'var(--forest-500)', fontWeight:600 }}>Generate one →</Link>
              </div>
            ) : (
              recentCats.map((r) => (
                <div key={r._id} className="recent-activity-item" style={{ padding:'10px 24px' }}>
                  <div className="activity-icon" style={{ background:'var(--forest-50)', color:'var(--forest-600)' }}><Tag size={15} /></div>
                  <div className="activity-content">
                    <div className="activity-title">{truncate(r.input.productName, 40)}</div>
                    <div className="activity-sub">{r.output.primaryCategory} → {r.output.subCategory}</div>
                  </div>
                  <div className="activity-time">{fromNow(r.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Proposals</div>
            <Link to="/proposals">
              <button className="btn btn-ghost btn-sm" style={{ gap:5 }}>View all <ArrowRight size={13} /></button>
            </Link>
          </div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {loading ? (
              <div className="loading-overlay" style={{ padding:32 }}><div className="spinner" /></div>
            ) : recentProposals.length === 0 ? (
              <div style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>
                No proposals yet.{' '}
                <Link to="/proposals/generate" style={{ color:'var(--gold-600)', fontWeight:600 }}>Create one →</Link>
              </div>
            ) : (
              recentProposals.map((p) => (
                <div key={p._id} className="recent-activity-item" style={{ padding:'10px 24px' }}>
                  <div className="activity-icon" style={{ background:'var(--gold-100)', color:'var(--gold-600)' }}><FileText size={15} /></div>
                  <div className="activity-content">
                    <div className="activity-title" style={{ fontFamily:'monospace', fontSize:'0.78rem' }}>{p.proposalCode}</div>
                    <div className="activity-sub">{slugToLabel(p.input.eventType)} · {formatCurrency(p.budgetSummary.totalAllocated, p.input.currency)}</div>
                  </div>
                  <div className="activity-time">{fromNow(p.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Module 03 & 04 — Architecture Cards (CLICKABLE) */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {[
          {
            num: '03', key: '03',
            title: 'Impact Reporting Generator',
            desc: 'Plastic saved, carbon avoided, and order-based sustainability impact — architecture designed, ready to implement.',
            color: '#0EA5E9',
            icon: BarChart2,
          },
          {
            num: '04', key: '04',
            title: 'WhatsApp Support Bot',
            desc: 'Webhook integration, order status retrieval, escalation to human agents, and conversation logging — designed for production.',
            color: '#22C55E',
            icon: MessageCircle,
          },
        ].map(({ num, key, title, desc, color, icon: Icon }) => (
          <div
            key={num}
            className="card"
            style={{ borderLeft:`3px solid ${color}`, cursor:'pointer', transition:'all 0.2s' }}
            onClick={() => setOpenArch(key)}
            onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
          >
            <div className="card-body">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)' }}>
                  Module {num}
                </div>
              </div>
              <div className="card-title" style={{ marginBottom:8 }}>{title}</div>
              <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:1.6, marginBottom:14 }}>{desc}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span className="badge badge-ivory">Architecture Ready</span>
                <span style={{ fontSize:'0.75rem', color, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                  View design <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
