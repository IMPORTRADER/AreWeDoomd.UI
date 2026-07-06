import { useState } from 'react';
import { IconEye, IconEyeOff } from '../icons';
import './Input.css';

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
  onVisibilityChange,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword && showPassword ? 'text' : type;

  const filled  = value != null && String(value).length > 0;
  const floated = focused || filled;

  // Icon-aligned label: when floated, settle the label above the icon column
  // (x = 14) instead of the text column (x = --start). 14 - 44 = -30px.
  const floatX = icon ? '-30px' : '0px';

  const className = [
    'awd-field',
    icon     ? 'has-icon'  : '',
    focused  ? 'is-focus'  : '',
    floated  ? 'float'     : '',
    error    ? 'error'     : '',
    disabled ? 'disabled'  : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} style={{ '--float-x': floatX }}>
      {/* fixed-height box: anchors icon / label / underline to the 52px input so
          showing the error message below can't push them down */}
      <div className="awd-control">
        {icon && <span className="awd-icon">{icon}</span>}

        <input
          type={inputType}
          name={name}
          placeholder={placeholder ?? ' '}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {label && <span className="awd-label">{label}</span>}

        <span className="awd-gline" />

        {isPassword && (
          <button
            type="button"
            className="awd-eye"
            onClick={() => setShowPassword((v) => {
              const next = !v;
              onVisibilityChange?.(next);
              return next;
            })}
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>

      {error && <p className="awd-err">{error}</p>}
    </div>
  );
}
