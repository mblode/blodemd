interface TypeField {
  description?: string;
  type?: string;
  optional?: boolean;
  required?: boolean;
  default?: string;
}

export const TypeTable = ({ type }: { type: Record<string, TypeField> }) => {
  const entries = Object.entries(type ?? {}).map(([name, field]) => ({
    name,
    ...field,
  }));
  const hasDefault = entries.some((entry) => entry.default);

  return (
    <div className="type-table">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
            {hasDefault ? <th>Default</th> : null}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const required = entry.required ?? !entry.optional;
            return (
              <tr key={entry.name}>
                <td>
                  <code>{entry.name}</code>
                </td>
                <td>{entry.type ?? "—"}</td>
                <td>{entry.description ?? ""}</td>
                <td>{required ? "Yes" : "Optional"}</td>
                {hasDefault ? <td>{entry.default ?? "—"}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
