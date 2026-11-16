// squareClassName zmienia kolor kwadratu
export function Logo({ squareClassName = "bg-primary" }) {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
      <span className={`size-3 rounded-[3px] ${squareClassName}`} />
      Szkolny Helpdesk
    </span>
  )
}
