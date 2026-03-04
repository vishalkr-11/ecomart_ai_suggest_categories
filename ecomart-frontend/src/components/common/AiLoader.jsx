export default function AiLoader({ steps = [], activeStep = 0, title = 'AI is thinking…' }) {
  return (
    <div className="ai-loading animate-fade-in">
      <div className="ai-orb" />
      <div className="ai-loading-title">{title}</div>
      {steps.length > 0 && (
        <div className="ai-loading-steps">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`ai-step ${i < activeStep ? 'done' : ''} ${i === activeStep ? 'active' : ''}`}
            >
              <span className="ai-step-dot" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
