type SectionHeadingProps = {
  title: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({
  title,
  href,
  linkLabel = "Ver tudo",
}: SectionHeadingProps) {
  return (
    <div className="mb-10 flex items-end justify-between border-b border-black/10 pb-5">
      <h2 className="font-serif text-3xl font-normal tracking-wide md:text-4xl">
        {title}
      </h2>

      {href && (
        <a
          href={href}
          className="text-[9px] uppercase tracking-[0.3em] text-black/55 transition-colors hover:text-black"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
}