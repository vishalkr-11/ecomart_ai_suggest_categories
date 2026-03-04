import { formatCurrency } from '@/utils/formatters';

export default function LineItemsTable({ items, currency = 'INR' }) {
  const total = items.reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th style={{ textAlign:'right' }}>Qty</th>
            <th style={{ textAlign:'right' }}>Unit Price</th>
            <th style={{ textAlign:'right' }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{item.productName}</div>
                {item.sustainabilityHighlight && (
                  <div style={{ fontSize:'0.75rem', color:'var(--forest-600)', marginTop:2 }}>
                    🌱 {item.sustainabilityHighlight}
                  </div>
                )}
              </td>
              <td className="td-mono">{item.sku}</td>
              <td>
                <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{item.category}</span>
              </td>
              <td style={{ textAlign:'right', fontWeight:600 }}>{item.quantity.toLocaleString()}</td>
              <td style={{ textAlign:'right' }}>{formatCurrency(item.unitPrice, currency)}</td>
              <td style={{ textAlign:'right', fontWeight:700, color:'var(--forest-700)' }}>
                {formatCurrency(item.lineTotal, currency)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background:'var(--forest-50)' }}>
            <td colSpan={5} style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--forest-900)' }}>
              Total (Backend Verified)
            </td>
            <td style={{ textAlign:'right', fontWeight:800, fontSize:'1rem', color:'var(--forest-800)', fontFamily:'var(--font-display)' }}>
              {formatCurrency(total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
