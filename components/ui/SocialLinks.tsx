import { Github, Linkedin, Mail } from "lucide-react";
import { siteConfig } from "@/data/site";

const socialLinks = [
  {
    label: "Email",
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: siteConfig.links.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    label: "GitHub",
    href: siteConfig.links.github,
    icon: Github,
    external: true,
  },
];

type SocialLinksProps = {
  className?: string;
};

export default function SocialLinks({ className = "" }: SocialLinksProps) {
  return (
    <nav aria-label="Social links" className={className}>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {socialLinks.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-accent"
                data-cursor="interactive"
              >
                <Icon
                  className="h-4 w-4 transition-colors duration-300 group-hover:text-accent"
                  aria-hidden="true"
                />
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
