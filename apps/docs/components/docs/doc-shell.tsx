import type { DocsConfig } from "@repo/models";
import Script from "next/script";
import type { ReactNode } from "react";
import { DocHeader } from "@/components/docs/doc-header";
import { DocSidebar } from "@/components/docs/doc-sidebar";
import { DocToc } from "@/components/docs/doc-toc";
import type { NavEntry } from "@/lib/navigation";
import { toDocHref } from "@/lib/routes";
import { themeStylesFromConfig } from "@/lib/theme";
import type { TocItem } from "@/lib/toc";

export const DocShell = ({
  config,
  nav,
  toc,
  content,
  currentPath,
  breadcrumbs,
  pageTitle,
  pageDescription,
  searchItems,
  anchors,
  basePath,
}: {
  config: DocsConfig;
  nav: NavEntry[];
  toc: TocItem[];
  content: ReactNode;
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  pageTitle: string;
  pageDescription?: string;
  searchItems: Array<{ title: string; path: string }>;
  anchors?: Array<{ label: string; href: string }>;
  basePath: string;
}) => {
  return (
    <div
      className={`docs-root theme-${config.theme ?? "mint"}`}
      data-has-dark-logo={config.logo?.dark ? "true" : "false"}
      style={themeStylesFromConfig(config)}
    >
      {config.scripts?.head?.map((script) => (
        <Script key={script} src={script} strategy="beforeInteractive" />
      ))}
      <DocHeader
        basePath={basePath}
        config={config}
        searchItems={searchItems}
      />
      <div className="docs-layout">
        <DocSidebar
          anchors={anchors}
          basePath={basePath}
          currentPath={currentPath}
          entries={nav}
        />
        <main className="doc-main">
          <div className="doc-content">
            {breadcrumbs.length ? (
              <nav className="doc-breadcrumbs">
                {breadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`}>
                    {crumb.path ? (
                      <a href={toDocHref(crumb.path, basePath)}>
                        {crumb.label}
                      </a>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 ? (
                      <span className="doc-breadcrumbs__sep">/</span>
                    ) : null}
                  </span>
                ))}
              </nav>
            ) : null}
            <h1>{pageTitle}</h1>
            {pageDescription ? (
              <p className="doc-description">{pageDescription}</p>
            ) : null}
            <div className="doc-body">{content}</div>
          </div>
        </main>
        {config.features?.rightToc === false ||
        config.features?.toc === false ? null : (
          <DocToc toc={toc} />
        )}
      </div>
      {config.scripts?.body?.map((script) => (
        <Script key={script} src={script} strategy="afterInteractive" />
      ))}
    </div>
  );
};
