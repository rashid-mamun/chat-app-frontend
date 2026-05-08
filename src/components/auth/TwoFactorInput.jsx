import { useState, useRef, useEffect } from 'react';
import Button from '../shared/Button';
import './TwoFactorInput.css';

export default function TwoFactorInput({ onSubmit, loading, onCancel }) {
  const [code, setCode] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newCode = [...code];
    // Allow pasting
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || '';
      }
      setCode(newCode);
      
      // Focus last filled or the last input
      const focusIndex = Math.min(pastedCode.length, 5);
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move to next input if value is entered
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onSubmit(fullCode);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-scale-in">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-primary">Two-Factor Auth</h2>
        <p className="text-muted mt-2">Enter the 6-digit code from your authenticator app.</p>
      </div>

      <div className="otp-container">
        {code.map((data, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={6} // Allow pasting full length
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          fullWidth 
          loading={loading}
          disabled={code.join('').length !== 6}
        >
          Verify
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
