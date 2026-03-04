import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import CategoryForm from '@/components/category/CategoryForm';
import CategoryResultCard from '@/components/category/CategoryResultCard';
import AiLoader from '@/components/common/AiLoader';
import { useCategoryGenerator } from '@/hooks/useCategory';

const AI_STEPS = [
  'Analysing product description…',
  'Matching to predefined categories…',
  'Generating SEO tags…',
  'Identifying sustainability filters…',
  'Validating AI response schema…',
];

export default function CategoryGenerator() {
  const { generate, loading, result, error } = useCategoryGenerator();
  const [step, setStep] = useState(0);

  const handleSubmit = async (payload) => {
    setStep(0);
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, AI_STEPS.length - 1)), 1200);
    await generate(payload);
    clearInterval(interval);
    setStep(AI_STEPS.length);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'start' }}>
      {/* Left — Form */}
      <div className="section-gap">
        <div className="alert alert-info">
          <Info size={15} style={{ flexShrink:0, marginTop:2 }} />
          <span>AI will only assign categories from the predefined list. Any hallucinated category is caught by schema validation and triggers a retry automatically.</span>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Sparkles size={17} style={{ color:'var(--forest-500)' }} />
              Product Input
            </div>
          </div>
          <div className="card-body">
            <CategoryForm onSubmit={handleSubmit} loading={loading} error={error} />
          </div>
        </div>
      </div>

      {/* Right — Result */}
      <div className="section-gap" style={{ position:'sticky', top:'calc(var(--header-h) + 24px)' }}>
        {loading ? (
          <div className="card">
            <AiLoader steps={AI_STEPS} activeStep={step} title="Categorising product…" />
          </div>
        ) : result ? (
          <CategoryResultCard result={result} />
        ) : (
          <div className="card" style={{ border:'2px dashed var(--ivory-300)' }}>
            <div className="empty-state">
              <div className="empty-state-icon" style={{ width:80, height:80 }}>
                <Sparkles size={32} />
              </div>
              <div className="empty-state-title">Result will appear here</div>
              <p className="empty-state-text">
                Fill in the product details and click Generate. The AI will return a fully structured classification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
