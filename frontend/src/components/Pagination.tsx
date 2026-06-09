interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1} label="←" />

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => onChange(p as number)}
            active={p === page}
            label={String(p)}
          />
        ),
      )}

      <PageBtn onClick={() => onChange(page + 1)} disabled={page === totalPages} label="→" />
    </div>
  );
}

function PageBtn({
  onClick,
  disabled,
  active,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-white border text-gray-600 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed'
      }`}
    >
      {label}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
