/**
 * Shared fade-in animation styles used across solution pages.
 * Import and render this component once per page instead of duplicating the <style> block.
 */
export default function FadeInStyles() {
  return (
    <style>{`
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fade-in 1s ease-out;
      }
      .delay-1000 {
        animation-delay: 1s;
      }
    `}</style>
  );
}
