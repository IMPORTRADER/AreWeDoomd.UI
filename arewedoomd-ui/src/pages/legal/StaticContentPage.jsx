import { Link } from 'react-router-dom';
import Widget from '../../components/ui/Widget';

// Placeholder içerikli statik sayfa. paragraphs: string[].
export default function StaticContentPage({ title, paragraphs = [] }) {
  return (
    <div className="max-w-[640px] mx-auto w-full px-4 py-6 flex flex-col gap-5">
      <Link to="/settings" className="text-sm text-[var(--color-link)] hover:underline px-1">← Ayarlar</Link>
      <Widget title={title}>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-[var(--color-text-primary)] leading-relaxed">{p}</p>
          ))}
        </div>
      </Widget>
    </div>
  );
}
