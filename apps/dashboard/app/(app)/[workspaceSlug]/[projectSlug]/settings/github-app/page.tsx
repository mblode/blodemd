import { SettingsPlaceholder } from "@/components/project-settings/settings-placeholder";

export default function GitHubAppSettingsPage() {
  return (
    <SettingsPlaceholder
      actionLabel="Configure GitHub app"
      description="Install the GitHub app to enable automatic updates, previews, and private repository access."
      title="GitHub app"
    />
  );
}
