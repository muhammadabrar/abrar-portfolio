import { site } from "@/content/site";

export function ExperienceSkills({
  className = "shell section",
}: {
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="grid gap-12 sm:grid-cols-2 sm:gap-10">
        <div>
          <h2 className="section-label">Experience</h2>
          <ul className="space-y-6">
            {site.experience.map((item) => (
              <li key={`${item.company}-${item.period}`}>
                <p className="font-semibold tracking-tight text-[color:var(--ink)]">
                  {item.company}
                </p>
                <p className="mt-1 text-[color:var(--muted)]">{item.role}</p>
                <p className="mt-0.5 text-sm text-[color:var(--muted)]">{item.period}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="section-label">Skills</h2>
          <ul className="space-y-2.5">
            {site.skills.map((skill) => (
              <li key={skill} className="text-[color:var(--muted)]">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
