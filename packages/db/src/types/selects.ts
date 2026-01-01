import type { Prisma } from "@prisma/client";

export const workspaceSelect = {
  id: true,
  slug: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.WorkspaceSelect;

export const projectSelect = {
  id: true,
  workspaceId: true,
  slug: true,
  name: true,
  deploymentName: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ProjectSelect;

export const domainSelect = {
  id: true,
  projectId: true,
  hostname: true,
  pathPrefix: true,
  status: true,
  createdAt: true,
  verifiedAt: true,
} as const satisfies Prisma.DomainSelect;

export const deploymentSelect = {
  id: true,
  projectId: true,
  environment: true,
  status: true,
  branch: true,
  commitMessage: true,
  changes: true,
  previewUrl: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.DeploymentSelect;

export const activitySelect = {
  id: true,
  projectId: true,
  summary: true,
  status: true,
  changes: true,
  actorName: true,
  actorAvatarUrl: true,
  occurredAt: true,
} as const satisfies Prisma.ActivitySelect;

export const gitConnectionSelect = {
  id: true,
  projectId: true,
  provider: true,
  organization: true,
  repository: true,
  branch: true,
  isMonorepo: true,
  docsPath: true,
  appInstalled: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.GitConnectionSelect;

export const apiKeySelect = {
  id: true,
  workspaceId: true,
  name: true,
  prefix: true,
  createdAt: true,
  lastUsedAt: true,
  revokedAt: true,
} as const satisfies Prisma.ApiKeySelect;

export const workspaceMemberSelect = {
  id: true,
  workspaceId: true,
  email: true,
  role: true,
  status: true,
  joinedAt: true,
} as const satisfies Prisma.WorkspaceMemberSelect;

export const profileSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ProfileSelect;
