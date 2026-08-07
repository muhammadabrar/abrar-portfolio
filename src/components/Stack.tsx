import { site } from "@/content/site";
import { StackIcon } from "@/components/StackIcons";

export function Stack({
  className = "shell section pt-0",
  title = "My stack",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <section className={className}>
      <h2 className="section-label">{title}</h2>
      <ul className="flex flex-wrap gap-3">
        {site.stack.map((item) => (
          <li key={item.name} className="tip">
            <div className="stack-chip" tabIndex={0} aria-label={item.name}>
              <span className="stack-icon-wrap">
                <StackIcon name={item.icon} />
              </span>
            </div>
            <span className="tip-bubble" role="tooltip">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
