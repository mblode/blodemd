import { randomUUID } from "node:crypto";

import type * as RepoDb from "@repo/db";

type DbModule = typeof RepoDb;

interface ProjectFixture {
  projectId: string;
  workspaceId: string;
}

export const createProjectFixture = async (
  dbModule: DbModule,
  input: {
    description?: string;
    slug: string;
  }
): Promise<ProjectFixture> => {
  const workspaceSlug = `workspace-${randomUUID().slice(0, 8)}`;
  const workspaceResult = await dbModule.pool.query<{ id: string }>(
    `insert into "workspaces" ("slug", "name") values ($1, $2) returning "id"`,
    [workspaceSlug, workspaceSlug]
  );
  const [workspace] = workspaceResult.rows;
  if (!workspace) {
    throw new Error("Failed to create test workspace.");
  }

  const projectResult = await dbModule.pool.query<{ id: string }>(
    `
      insert into "projects" (
        "workspace_id",
        "deployment_name",
        "description",
        "name",
        "slug"
      )
      values ($1, $2, $3, $4, $5)
      returning "id"
    `,
    [
      workspace.id,
      input.slug,
      input.description ?? null,
      input.slug,
      input.slug,
    ]
  );
  const [project] = projectResult.rows;
  if (!project) {
    throw new Error("Failed to create test project.");
  }

  return {
    projectId: project.id,
    workspaceId: workspace.id,
  };
};

export const cleanupProjectFixture = async (
  dbModule: DbModule,
  fixture: ProjectFixture
) => {
  await new dbModule.ProjectDao().delete(fixture.projectId);
  await dbModule.pool.query(`delete from "workspaces" where "id" = $1`, [
    fixture.workspaceId,
  ]);
};
