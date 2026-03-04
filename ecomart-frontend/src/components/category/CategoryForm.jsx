import { useState } from 'react';
import { Sparkles, Package, FileText, Users, FlaskConical } from 'lucide-react';
import Button from '../common/Button';
import TagsInput from '../common/TagsInput';
import ErrorAlert from '../common/ErrorAlert';

const INITIAL = {
  productName: '', productDescription: '', materials: [], targetAudience: '',
};

export default function CategoryForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.productName.trim())        e.productName = 'Product name is required';
    if (form.productDescription.trim().length < 10) e.productDescription = 'Description must be at least 10 characters';
    if (!form.materials.length)          e.materials = 'Add at least one material';
    if (!form.targetAudience.trim())     e.targetAudience = 'Target audience is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="section-gap" noValidate>
      <ErrorAlert message={error} />

      {/* Product Identity */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">1</span>
          <Package size={16} /> Product Identity
        </div>

        <div className="form-group">
          <label className="form-label">
            Product Name <span className="required">*</span>
          </label>
          <input
            className={`form-input ${errors.productName ? 'error' : ''}`}
            placeholder="e.g. Kraft Paper Carry Bags"
            value={form.productName}
            onChange={set('productName')}
          />
          {errors.productName && <span className="form-error">{errors.productName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Product Description <span className="required">*</span>
          </label>
          <textarea
            className={`form-textarea ${errors.productDescription ? 'error' : ''}`}
            placeholder="Describe the product in detail — what it does, how it's made, key features…"
            rows={4}
            value={form.productDescription}
            onChange={set('productDescription')}
          />
          {errors.productDescription && <span className="form-error">{errors.productDescription}</span>}
          <span className="form-hint">{form.productDescription.length} characters (min 10)</span>
        </div>
      </div>

      {/* Materials & Audience */}
      <div className="form-section">
        <div className="form-section-title">
          <span className="section-num">2</span>
          <FlaskConical size={16} /> Materials & Audience
        </div>

        <div className="form-group">
          <label className="form-label">
            Materials Used <span className="required">*</span>
          </label>
          <TagsInput
            value={form.materials}
            onChange={(v) => { setForm((f) => ({ ...f, materials: v })); setErrors((e) => ({ ...e, materials: null })); }}
            placeholder="Type a material and press Enter (e.g. recycled paper)"
          />
          {errors.materials && <span className="form-error">{errors.materials}</span>}
          <span className="form-hint">Press Enter or comma after each material</span>
        </div>

        <div className="form-group">
          <label className="form-label">
            Target Audience <span className="required">*</span>
          </label>
          <input
            className={`form-input ${errors.targetAudience ? 'error' : ''}`}
            placeholder="e.g. corporate gifting, restaurants, retail stores"
            value={form.targetAudience}
            onChange={set('targetAudience')}
          />
          {errors.targetAudience && <span className="form-error">{errors.targetAudience}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => { setForm(INITIAL); setErrors({}); }}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={!loading && <Sparkles size={16} />}
        >
          {loading ? 'Analysing Product…' : 'Generate Category & Tags'}
        </Button>
      </div>
    </form>
  );
}
