import type {
  Activity,
  ApiKey,
  ApiKeyCreateInput,
  BootstrapRequest,
  BootstrapResponse,
  Deployment,
  Domain,
  DomainCreateInput,
  DomainCreateResponse,
  DomainVerification,
  GitSettings,
  GitSettingsUpdateInput,
  InviteMemberInput,
  Member,
  Project,
  ProjectUpdateInput,
  Tenant,
  TenantResolution,
  Workspace,
  WorkspaceCreateInput,
} from "@repo/contracts";
import {
  ActivitySchema,
  ApiKeyCreateSchema,
  ApiKeySchema,
  BootstrapRequestSchema,
  BootstrapResponseSchema,
  DeploymentSchema,
  DomainCreateResponseSchema,
  DomainCreateSchema,
  DomainSchema,
  DomainVerificationSchema,
  GitSettingsSchema,
  GitSettingsUpdateSchema,
  InviteMemberSchema,
  MemberSchema,
  ProjectSchema,
  ProjectUpdateSchema,
  TenantResolutionSchema,
  TenantSchema,
  WorkspaceCreateSchema,
  WorkspaceSchema,
} from "@repo/contracts";
import { z } from "zod";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
};

const request = async <T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  options: RequestOptions = {}
): Promise<z.infer<T>> => {
  const url = new URL(path, API_BASE);
  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError("Request failed", response.status, data);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError("Invalid response payload", 500, parsed.error.flatten());
  }

  return parsed.data;
};

export const listWorkspaces = async (): Promise<Workspace[]> => {
  return request("/workspaces", z.array(WorkspaceSchema));
};

export const listTenants = async (): Promise<Tenant[]> => {
  return request("/tenants", z.array(TenantSchema));
};

export const getTenant = async (slug: string): Promise<Tenant> => {
  return request(`/tenants/${slug}`, TenantSchema);
};

export const resolveTenant = async (
  host: string,
  path: string
): Promise<TenantResolution> => {
  const params = new URLSearchParams({ host, path });
  return request(
    `/tenants/resolve?${params.toString()}`,
    TenantResolutionSchema
  );
};

export const bootstrapUser = async (
  input: BootstrapRequest
): Promise<BootstrapResponse> => {
  const parsed = BootstrapRequestSchema.parse(input);
  return request("/bootstrap", BootstrapResponseSchema, {
    method: "POST",
    body: parsed,
  });
};

export const createWorkspace = async (
  input: WorkspaceCreateInput
): Promise<Workspace> => {
  const parsed = WorkspaceCreateSchema.parse(input);
  return request("/workspaces", WorkspaceSchema, {
    method: "POST",
    body: parsed,
  });
};

export const getWorkspaceBySlug = async (slug: string): Promise<Workspace> => {
  return request(`/workspaces/slug/${slug}`, WorkspaceSchema);
};

export const listProjects = async (workspaceId: string): Promise<Project[]> => {
  return request(`/workspaces/${workspaceId}/projects`, z.array(ProjectSchema));
};

export const getProject = async (projectId: string): Promise<Project> => {
  return request(`/projects/${projectId}`, ProjectSchema);
};

export const updateProject = async (
  projectId: string,
  input: ProjectUpdateInput
): Promise<Project> => {
  const parsed = ProjectUpdateSchema.parse(input);
  return request(`/projects/${projectId}`, ProjectSchema, {
    method: "PATCH",
    body: parsed,
  });
};

export const listDomains = async (projectId: string): Promise<Domain[]> => {
  return request(`/projects/${projectId}/domains`, z.array(DomainSchema));
};

export const createDomain = async (
  projectId: string,
  input: Omit<DomainCreateInput, "projectId">
): Promise<DomainCreateResponse> => {
  const parsed = DomainCreateSchema.omit({ projectId: true }).parse(input);
  return request(`/projects/${projectId}/domains`, DomainCreateResponseSchema, {
    method: "POST",
    body: parsed,
  });
};

export const getDomainVerification = async (
  projectId: string,
  domainId: string
): Promise<DomainVerification> => {
  return request(
    `/projects/${projectId}/domains/${domainId}/verification`,
    DomainVerificationSchema
  );
};

export const verifyDomain = async (
  projectId: string,
  domainId: string
): Promise<DomainVerification> => {
  return request(
    `/projects/${projectId}/domains/${domainId}/verify`,
    DomainVerificationSchema,
    { method: "POST" }
  );
};

export const listDeployments = async (
  projectId: string
): Promise<Deployment[]> => {
  return request(
    `/projects/${projectId}/deployments`,
    z.array(DeploymentSchema)
  );
};

export const getGitSettings = async (
  projectId: string
): Promise<GitSettings> => {
  return request(`/projects/${projectId}/git`, GitSettingsSchema);
};

export const updateGitSettings = async (
  projectId: string,
  input: GitSettingsUpdateInput
): Promise<GitSettings> => {
  const parsed = GitSettingsUpdateSchema.parse(input);
  return request(`/projects/${projectId}/git`, GitSettingsSchema, {
    method: "PATCH",
    body: parsed,
  });
};

export const listActivity = async (projectId: string): Promise<Activity[]> => {
  return request(`/projects/${projectId}/activity`, z.array(ActivitySchema));
};

export const listMembers = async (workspaceId: string): Promise<Member[]> => {
  return request(`/workspaces/${workspaceId}/members`, z.array(MemberSchema));
};

export const inviteMember = async (
  workspaceId: string,
  input: InviteMemberInput
): Promise<Member> => {
  const parsed = InviteMemberSchema.parse(input);
  return request(`/workspaces/${workspaceId}/members`, MemberSchema, {
    method: "POST",
    body: parsed,
  });
};

export const listApiKeys = async (workspaceId: string): Promise<ApiKey[]> => {
  return request(`/workspaces/${workspaceId}/api-keys`, z.array(ApiKeySchema));
};

export const createApiKey = async (
  workspaceId: string,
  input: Omit<ApiKeyCreateInput, "workspaceId">
): Promise<ApiKey> => {
  const parsed = ApiKeyCreateSchema.omit({ workspaceId: true }).parse(input);
  return request(`/workspaces/${workspaceId}/api-keys`, ApiKeySchema, {
    method: "POST",
    body: parsed,
  });
};
