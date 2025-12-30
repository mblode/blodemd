import type { TocItem } from "@/lib/toc";

export const DocToc = ({ toc }: { toc: TocItem[] }) => {
  if (!toc.length) {
    return null;
  }

  return (
    <aside className="doc-toc">
      <div className="doc-toc__title">On this page</div>
      <ul>
        {toc.map((item) => (
          <li
            className={`doc-toc__item doc-toc__item--level-${item.level}`}
            key={item.id}
          >
            <a href={`#${item.id}`}>{item.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
