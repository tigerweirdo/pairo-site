/**
 * Shared bottom wash for Final CTA + footer — one continuous fade, no hard edge.
 */
export function PageEnd({ children }) {
  return (
    <div className="relative mt-auto overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 ease-in-out"
        style={{
          transition: 'background var(--color-transition)',
          background: [
            'radial-gradient(ellipse 140% 90% at 50% 100%, hsl(var(--seasonal-primary) / 0.16), transparent 68%)',
            'linear-gradient(to bottom, transparent 0%, hsl(var(--seasonal-primary) / 0.05) 100%)',
          ].join(', '),
        }}
      />
      {children}
    </div>
  );
}
