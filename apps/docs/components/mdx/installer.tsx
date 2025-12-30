export const Installer = ({
  path,
  command,
}: {
  path: string;
  command?: string;
}) => {
  const resolvedCommand =
    command ?? `npx @vercel/platform-elements@latest ${path}`;
  return (
    <div className="mdx-installer">
      <div className="mdx-installer__label">Install</div>
      <pre className="mdx-installer__code">
        <code>{resolvedCommand}</code>
      </pre>
    </div>
  );
};
