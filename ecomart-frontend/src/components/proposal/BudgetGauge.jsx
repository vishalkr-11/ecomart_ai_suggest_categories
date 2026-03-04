import { pct, formatCurrency } from '@/utils/formatters';

export default function BudgetGauge({ summary }) {
  const { budgetLimit, totalAllocated, remainingBudget, currency, isWithinBudget } = summary;
  const used = pct(totalAllocated, budgetLimit);
  const fillClass = used >= 100 ? 'danger' : used >= 85 ? 'warn' : 'safe';

  return (
    <div className="budget-gauge">
      <div className="budget-summary-grid" style={{ marginBottom: 16 }}>
        <div className="budget-stat">
          <div className="budget-stat-label">Budget Limit</div>
          <div className="budget-stat-value">{formatCurrency(budgetLimit, currency)}</div>
        </div>
        <div className="budget-stat">
          <div className="budget-stat-label">Allocated</div>
          <div className={`budget-stat-value ${isWithinBudget ? 'good' : 'bad'}`}>
            {formatCurrency(totalAllocated, currency)}
          </div>
        </div>
        <div className="budget-stat">
          <div className="budget-stat-label">Remaining</div>
          <div className={`budget-stat-value ${remainingBudget >= 0 ? 'good' : 'bad'}`}>
            {formatCurrency(Math.abs(remainingBudget), currency)}
          </div>
        </div>
      </div>

      <div className="gauge-track">
        <div className={`gauge-fill ${fillClass}`} style={{ width: `${used}%` }} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:'0.72rem', color:'var(--text-muted)' }}>
        <span>0%</span>
        <span style={{ fontWeight:600, color: fillClass === 'safe' ? 'var(--forest-600)' : fillClass === 'warn' ? '#D97706' : 'var(--red-500)' }}>
          {used}% used
        </span>
        <span>100%</span>
      </div>

      {!isWithinBudget && (
        <div className="alert alert-error" style={{ marginTop:12 }}>
          ⚠️ Allocation exceeded budget. This should not happen — contact support.
        </div>
      )}
    </div>
  );
}
