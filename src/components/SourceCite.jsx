import { TIER_LABEL } from '../lib/format'

/**
 * Renders a small row of source-id tags (e.g. S02, S12) that link out to the
 * underlying source when a URL is known. sourceMap: Map<source_id, source>.
 */
export default function SourceCite({ ids = [], sourceMap, compact = false }) {
  const list = Array.isArray(ids) ? ids : []
  if (!list.length) return null
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${compact ? '' : 'mt-1'}`}>
      {!compact && <span className="text-[10px] uppercase tracking-widish text-parchment-faint mr-0.5">Sources</span>}
      {list.map((id) => {
        const s = sourceMap?.get(id)
        const hasUrl = s?.url && s.url !== 'N/A'
        const title = s ? `${s.title} — ${s.author} (${TIER_LABEL[s.tier] || s.tier})` : id
        const Tag = hasUrl ? 'a' : 'span'
        return (
          <Tag
            key={id}
            href={hasUrl ? s.url : undefined}
            target={hasUrl ? '_blank' : undefined}
            rel={hasUrl ? 'noreferrer' : undefined}
            title={title}
            className={`text-[10.5px] font-medium tracking-wide px-1.5 py-0.5 rounded border border-gold/30 text-gold/90 bg-gold/5 ${
              hasUrl ? 'hover:bg-gold/15 hover:text-gold cursor-pointer' : 'cursor-default'
            }`}
          >
            {id}
          </Tag>
        )
      })}
    </span>
  )
}
