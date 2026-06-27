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
          <span className="absolute left-4 flex items-center text-[var(--color-text-secondary)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={[
            'w-full h-[52px] bg-[var(--color-bg)] border rounded-[var(--radius-md)] focus:border-[2.5px]',
            'px-4 text-[16px] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-placeholder)]',
            'outline-none transition-[border-color,box-shadow,background-color] duration-150',
            icon        ? 'pl-[46px]' : '',
            isPassword  ? 'pr-11'     : '',
            error
              ? 'border-[var(--color-danger)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_color-mix(in_srgb,var(--color-danger)_45%,transparent)] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_3px_color-mix(in_srgb,var(--color-danger)_30%,transparent)]'
              : 'border-[#3b4a64] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04)] focus:border-[#0494E3] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_3px_color-mix(in_srgb,#0494E3_28%,transparent)]',
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
