export default function Panel({ children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-xl border border-ink-line bg-ink-panel/70 shadow-panel backdrop-blur-[1px] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
