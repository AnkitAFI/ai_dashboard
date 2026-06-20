// "use client";

// import { Users, ArrowRight, LucideIcon } from "lucide-react";

// interface ExpertButtonProps {
//   /** Button label. Default: "Talk to our experts" */
//   label?: string;
//   /** URL the button navigates to. Default: "#" */
//   href?: string;
//   /** Open in new tab. Default: false */
//   newTab?: boolean;
//   /** Override the left icon */
//   icon?: LucideIcon;
//   /** Extra Tailwind classes */
//   className?: string;
//   onClick?: () => void;
// }

// /**
//  * ExpertButton — CTA button to contact/talk to experts.
//  *
//  * @example
//  * <ExpertButton />
//  *
//  * @example
//  * <ExpertButton label="Book a demo" href="/contact" newTab />
//  */
// export function ExpertButton({
//   label = "Talk to our experts",
//   href = "#",
//   newTab = false,
//   icon: Icon = Users,
//   className = "",
//   onClick,
// }: ExpertButtonProps) {
//   return (
//     <a
//       href={href}
//       target={newTab ? "_blank" : undefined}
//       rel={newTab ? "noopener noreferrer" : undefined}
//       onClick={onClick}
//       className={[
//         "inline-flex items-center gap-3 px-5 py-3 rounded-xl",
//         "bg-white/15 hover:bg-white/25 border border-white/25 hover:border-white/40",
//         "text-white text-sm font-semibold",
//         "transition-all duration-200 cursor-pointer select-none",
//         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
//         className,
//       ].join(" ")}
//     >
//       <Icon className="w-4 h-4 shrink-0" />
//       <span>{label}</span>
//       <ArrowRight className="w-4 h-4 shrink-0 opacity-70" />
//     </a>
//   );
// }

// export default ExpertButton;

"use client";

import { Users, ArrowRight, LucideIcon } from "lucide-react";

interface ExpertButtonProps {
  /** Button label. Default: "Talk to our experts" */
  label?: string;
  /** Support email address. Default: "insydz@support.com" */
  email?: string;
  /** Pre-filled email subject line */
  subject?: string;
  /** Pre-filled email body */
  body?: string;
  /** Override the left icon */
  icon?: LucideIcon;
  /** Extra Tailwind classes */
  className?: string;
  onClick?: () => void;
}

/**
 * ExpertButton — opens the user's email client with a pre-filled support email.
 *
 * @example
 * // Default — opens mailto:insydz@support.com
 * <ExpertButton />
 *
 * @example
 * // Custom email, subject and body
 * <ExpertButton
 *   email="insydz@support.com"
 *   subject="I need help with pricing"
 *   body="Hi Insydz team, I have a question about..."
 * />
 */
export function ExpertButton({
  label = "Talk to our experts",
  email = "insydz@support.com",
  subject = "Support Request – Insydz",
  body = "Hi Insydz team,%0A%0AI have a question about...",
  icon: Icon = Users,
  className = "",
  onClick,
}: ExpertButtonProps) {
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;

  return (
    <a
      href={mailtoHref}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-3 px-5 py-3 rounded-xl",
        "bg-white/15 hover:bg-white/25 border border-white/25 hover:border-white/40",
        "text-white text-sm font-semibold",
        "transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        className,
      ].join(" ")}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 shrink-0 opacity-70" />
    </a>
  );
}

export default ExpertButton;
