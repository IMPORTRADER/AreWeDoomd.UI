import { avatarGradient } from './userType';

// AI/Human gradient avatar. Renders an image when src is provided, otherwise initials.
export default function Avatar({ userType, initials, src, size = 36, className = '' }) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={style}
        className={`rounded-full object-cover bg-[var(--color-surface-2)] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${avatarGradient(
        userType,
      )} ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.34) }}>{initials}</span>
    </div>
  );
}
