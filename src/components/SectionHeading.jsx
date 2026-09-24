export default function SectionHeading({ eyebrow, title, blurb, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-widish text-gold/80 font-semibold mb-1.5">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-2xl md:text-3xl text-parchment leading-tight">{title}</h2>
        {blurb && <p className="text-parchment-dim text-sm mt-2 max-w-2xl leading-relaxed">{blurb}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
