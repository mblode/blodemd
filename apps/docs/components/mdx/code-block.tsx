"use client";

import clsx from "clsx";
import { isValidElement, type ReactNode, useMemo, useState } from "react";

const getCodeString = (node: ReactNode): string => {
  if (typeof node === "string") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(getCodeString).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getCodeString(node.props.children);
  }
  return "";
};

const getLanguage = (node: ReactNode): string | undefined => {
  if (isValidElement<{ className?: string; children?: ReactNode }>(node)) {
    const className = node.props.className;
    const match = /language-([\w-]+)/.exec(className ?? "");
    return match?.[1];
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = getLanguage(child);
      if (match) {
        return match;
      }
    }
  }
  return undefined;
};

export const CodeBlock = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => getCodeString(children), [children]);
  const language =
    getLanguage(children) ?? /language-([\w-]+)/.exec(className ?? "")?.[1];

  const handleCopy = async () => {
    if (!code) {
      return;
    }
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="code-block">
      <div className="code-block__meta">
        <span className="code-block__lang">{language ?? "text"}</span>
        <button
          className={clsx("code-block__copy", {
            "code-block__copy--active": copied,
          })}
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={clsx("code-block__pre", className)}>{children}</pre>
    </div>
  );
};
