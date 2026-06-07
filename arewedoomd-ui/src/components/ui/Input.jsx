import { useState } from 'react';
import { IconEye, IconEyeOff } from '../icons';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  name,
  autoComplete,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-[var(--color-text-secondary)] tracking-[0.2px]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 flex items-center text-[var(--color-text-secondary)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={[
            'w-full h-[46px] bg-[var(--color-bg)] hover:bg-[var(--color-surface)] border rounded-[var(--radius-md)]',
            'px-3.5 text-[15px] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-placeholder)]',
            'outline-none transition-colors duration-150',
            icon        ? 'pl-[42px]' : '',
            isPassword  ? 'pr-10'     : '',
            error
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-link)]',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-2.5 flex items-center justify-center w-6 h-6 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
