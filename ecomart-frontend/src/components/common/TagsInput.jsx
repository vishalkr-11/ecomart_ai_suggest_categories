import { useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function TagsInput({ value = [], onChange, placeholder = 'Type and press Enter…', max = 20 }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInputVal('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inputVal); }
    if (e.key === 'Backspace' && !inputVal && value.length) removeTag(value[value.length - 1]);
  };

  return (
    <div className="tags-input-container" onClick={() => inputRef.current?.focus()}>
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button className="tag-chip-remove" type="button" onClick={() => removeTag(tag)}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="tags-input"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => inputVal && addTag(inputVal)}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}
