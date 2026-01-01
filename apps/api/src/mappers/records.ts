import type {
  Activity,
  ApiKey,
  Deployment,
  Domain,
  GitSettings,
  Member,
  Project,
  Workspace,
} from "@repo/contracts";
import type {
  ActivityRecord,
  ApiKeyRecord,
  DeploymentRecord,
  DomainRecord,
  GitConnectionRecord,
  ProjectRecord,
  WorkspaceMemberRecord,
  WorkspaceRecord,
} from "@repo/db";
import {
  mapActivityStatusToContract,
  mapDeploymentStatusToContract,
  mapDomainStatusToContract,
} from "@repo/db";

const toIso = (value: Date) => value.toISOString();

export const mapWorkspace = (record: WorkspaceRecord): Workspace => ({
  id: record.id,
  slug: record.slug,
  name: record.name,
  createdAt: toIso(record.createdAt),
  updatedAt: toIso(record.updatedAt),
});

export const mapProject = (record: ProjectRecord): Project => ({
  id: record.id,
  workspaceId: record.workspaceId,
  slug: record.slug,
  name: record.name,
  deploymentName: record.deploymentName,
  description: record.description ?? undefined,
  createdAt: toIso(record.createdAt),
  updatedAt: toIso(record.updatedAt),
});

export const mapDomain = (record: DomainRecord): Domain => ({
  id: record.id,
  projectId: record.projectId,
  hostname: record.hostname,
  pathPrefix: record.pathPrefix ?? undefined,
  status: mapDomainStatusToContract(record.status),
  createdAt: toIso(record.createdAt),
  verifiedAt: record.verifiedAt ? toIso(record.verifiedAt) : undefined,
});

export const mapDeployment = (record: DeploymentRecord): Deployment => ({
  id: record.id,
  projectId: record.projectId,
  environment: record.environment === "Preview" ? "preview" : "production",
  status: mapDeploymentStatusToContract(record.status),
  branch: record.branch,
  commitMessage: record.commitMessage ?? undefined,
  changes: record.changes ?? undefined,
  previewUrl: record.previewUrl ?? undefined,
  createdAt: toIso(record.createdAt),
  updatedAt: toIso(record.updatedAt),
});

export const mapActivity = (record: ActivityRecord): Activity => ({
  id: record.id,
  projectId: record.projectId,
  summary: record.summary,
  status: mapActivityStatusToContract(record.status),
  changes: record.changes ?? undefined,
  actorName: record.actorName,
  actorAvatarUrl: record.actorAvatarUrl ?? undefined,
  occurredAt: toIso(record.occurredAt),
});

export const mapGitSettings = (record: GitConnectionRecord): GitSettings => ({
  id: record.id,
  projectId: record.projectId,
  provider: "github",
  organization: record.organization,
  repository: record.repository,
  branch: record.branch,
  isMonorepo: record.isMonorepo,
  docsPath: record.docsPath ?? undefined,
  appInstalled: record.appInstalled,
  createdAt: toIso(record.createdAt),
  updatedAt: toIso(record.updatedAt),
});

export const mapApiKey = (record: ApiKeyRecord): ApiKey => ({
  id: record.id,
  workspaceId: record.workspaceId,
  name: record.name,
  prefix: record.prefix,
  createdAt: toIso(record.createdAt),
  lastUsedAt: record.lastUsedAt ? toIso(record.lastUsedAt) : undefined,
  revokedAt: record.revokedAt ? toIso(record.revokedAt) : undefined,
});

const memberRoleMap: Record<WorkspaceMemberRecord["role"], Member["role"]> = {
  Owner: "owner",
  Admin: "admin",
  Member: "member",
};

const memberStatusMap: Record<
  WorkspaceMemberRecord["status"],
  Member["status"]
> = {
  Active: "active",
  Invited: "invited",
  Suspended: "suspended",
};

export const mapWorkspaceMember = (record: WorkspaceMemberRecord): Member => ({
  id: record.id,
  workspaceId: record.workspaceId,
  email: record.email,
  role: memberRoleMap[record.role],
  status: memberStatusMap[record.status],
  joinedAt: record.joinedAt ? toIso(record.joinedAt) : undefined,
});
