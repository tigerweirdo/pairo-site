export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--seasonal-primary)/0.14)] px-6 py-7 text-xs text-muted-foreground sm:px-10">
      <p>pairo · made for two</p>
      <p>&copy; {year} · tigerweirdo</p>
    </footer>
  );
}
