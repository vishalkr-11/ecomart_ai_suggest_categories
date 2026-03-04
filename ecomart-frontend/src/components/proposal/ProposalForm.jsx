import { useState } from 'react';
import { Sparkles, Building2, Wallet, CalendarDays, Leaf, Users, StickyNote } from 'lucide-react';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import { CLIENT_TYPES, EVENT_TYPES, SUSTAINABILITY_LEVELS } from '@/utils/constants';
import { slugToLabel } from '@/utils/formatters';

const INITIAL = {
  clientType: '', budgetLimit: '', currency: 'INR',
  eventType: '', sustainabilityPreferenceLevel: '', headcount: 1, notes: '',
};

export default function ProposalForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVal = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.clientType) e.clientType = 'Select a client type';
    if (!form.budgetLimit || Number(form.budgetLimit) <= 0) e.budgetLimit = 'Enter a valid budget';
    if (!form.eventType) e.eventType = 'Select an event type';
    if (!form.sustainabilityPreferenceLevel) e.sustainabilityPreferenceLevel = 'Select sustainability level';
    if (!form.headcount || Number(form.headcount) < 1) e.headcount = 'Headcount must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, budgetLimit: Number(form.budgetLimit), headcount: Number(form.headcount) });
  };

  return (
    <form onSubmit={handleSubmit} className="section-gap" noValidate>
      <ErrorAlert message={error} />

      {/* Client & Event */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">1</span>
          <Building2 size={16} /> Client & Event Details
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Client Type <span className="required">*</span></label>
            <select className={`form-select ${errors.clientType ? 'error' : ''}`} value={form.clientType} onChange={set('clientType')}>
              <option value="">Select client type…</option>
              {CLIENT_TYPES.map((c) => <option key={c} value={c}>{slugToLabel(c)}</option>)}
            </select>
            {errors.clientType && <span className="form-error">{errors.clientType}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Event Type <span className="required">*</span></label>
            <select className={`form-select ${errors.eventType ? 'error' : ''}`} value={form.eventType} onChange={set('eventType')}>
              <option value="">Select event type…</option>
              {EVENT_TYPES.map((e) => <option key={e} value={e}>{slugToLabel(e)}</option>)}
            </select>
            {errors.eventType && <span className="form-error">{errors.eventType}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Users size={13} style={{ display:'inline', marginRight:5 }} />
            Headcount
          </label>
          <input
            type="number" min="1" max="100000"
            className={`form-input ${errors.headcount ? 'error' : ''}`}
            placeholder="Number of people"
            value={form.headcount}
            onChange={set('headcount')}
          />
          {errors.headcount && <span className="form-error">{errors.headcount}</span>}
        </div>
      </div>

      {/* Budget */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">2</span>
          <Wallet size={16} /> Budget Allocation
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" value={form.currency} onChange={set('currency')}>
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Budget Limit <span className="required">*</span></label>
            <input
              type="number" min="1"
              className={`form-input ${errors.budgetLimit ? 'error' : ''}`}
              placeholder="e.g. 150000"
              value={form.budgetLimit}
              onChange={set('budgetLimit')}
            />
            {errors.budgetLimit
              ? <span className="form-error">{errors.budgetLimit}</span>
              : <span className="form-hint">Backend enforces this limit — AI cannot exceed it</span>}
          </div>
        </div>
      </div>

      {/* Sustainability */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">3</span>
          <Leaf size={16} /> Sustainability Preference
        </div>
        {errors.sustainabilityPreferenceLevel && (
          <span className="form-error">{errors.sustainabilityPreferenceLevel}</span>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {SUSTAINABILITY_LEVELS.map(({ value, label, desc, color }) => {
            const active = form.sustainabilityPreferenceLevel === value;
            return (
              <button
                key={value} type="button"
                onClick={() => setVal('sustainabilityPreferenceLevel', value)}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--r-md)',
                  border: `2px solid ${active ? color : 'var(--ivory-300)'}`,
                  background: active ? `${color}12` : 'var(--white)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--t-normal)',
                }}
              >
                <div style={{ width:10, height:10, borderRadius:'50%', background:color, marginBottom:8 }} />
                <div style={{ fontWeight:700, fontSize:'0.85rem', color: active ? color : 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:3, lineHeight:1.4 }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">4</span>
          <StickyNote size={16} /> Additional Notes
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="Any specific requirements, branding needs, preferred categories…"
            rows={3}
            value={form.notes}
            onChange={set('notes')}
          />
          <span className="form-hint">Optional — helps AI make better selections</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => { setForm(INITIAL); setErrors({}); }} disabled={loading}>
          Reset
        </Button>
        <Button type="submit" variant="gold" size="lg" loading={loading} icon={!loading && <Sparkles size={16} />}>
          {loading ? 'Generating Proposal…' : 'Generate B2B Proposal'}
        </Button>
      </div>
    </form>
  );
}
