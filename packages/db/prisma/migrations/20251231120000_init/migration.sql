create extension if not exists "pgcrypto";

create type "domain_status" as enum (
  'valid_configuration',
  'pending_verification',
  'invalid_configuration'
);

create type "deployment_status" as enum (
  'queued',
  'building',
  'successful',
  'failed'
);

create type "deployment_environment" as enum ('production', 'preview');

create type "activity_status" as enum (
  'queued',
  'building',
  'successful',
  'failed'
);

create type "member_role" as enum ('owner', 'admin', 'member');
create type "member_status" as enum ('active', 'invited', 'suspended');
create type "git_provider" as enum ('github');

create table "workspaces" (
  "id" uuid not null default gen_random_uuid(),
  "slug" text not null,
  "name" text not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "workspaces_pkey" primary key ("id")
);

create unique index "workspaces_slug_key" on "workspaces" ("slug");

create table "profiles" (
  "id" uuid not null,
  "email" text not null,
  "full_name" text,
  "avatar_url" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "profiles_pkey" primary key ("id")
);

create table "workspace_members" (
  "id" uuid not null default gen_random_uuid(),
  "workspace_id" uuid not null,
  "email" text not null,
  "role" "member_role" not null default 'member',
  "status" "member_status" not null default 'invited',
  "joined_at" timestamptz,
  constraint "workspace_members_pkey" primary key ("id")
);

create table "projects" (
  "id" uuid not null default gen_random_uuid(),
  "workspace_id" uuid not null,
  "slug" text not null,
  "name" text not null,
  "deployment_name" text not null,
  "description" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "projects_pkey" primary key ("id")
);

create unique index "projects_workspace_slug_key" on "projects" ("workspace_id", "slug");

create table "domains" (
  "id" uuid not null default gen_random_uuid(),
  "project_id" uuid not null,
  "hostname" text not null,
  "path_prefix" text,
  "status" "domain_status" not null default 'pending_verification',
  "created_at" timestamptz not null default now(),
  "verified_at" timestamptz,
  constraint "domains_pkey" primary key ("id")
);

create unique index "domains_hostname_key" on "domains" ("hostname");

create table "deployments" (
  "id" uuid not null default gen_random_uuid(),
  "project_id" uuid not null,
  "environment" "deployment_environment" not null default 'production',
  "status" "deployment_status" not null default 'queued',
  "branch" text not null,
  "commit_message" text,
  "changes" text,
  "preview_url" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "deployments_pkey" primary key ("id")
);

create table "activity" (
  "id" uuid not null default gen_random_uuid(),
  "project_id" uuid not null,
  "summary" text not null,
  "status" "activity_status" not null default 'queued',
  "changes" text,
  "actor_name" text not null,
  "actor_avatar_url" text,
  "occurred_at" timestamptz not null default now(),
  constraint "activity_pkey" primary key ("id")
);

create table "git_connections" (
  "id" uuid not null default gen_random_uuid(),
  "project_id" uuid not null,
  "provider" "git_provider" not null default 'github',
  "organization" text not null,
  "repository" text not null,
  "branch" text not null,
  "is_monorepo" boolean not null default false,
  "docs_path" text,
  "app_installed" boolean not null default false,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "git_connections_pkey" primary key ("id")
);

create table "api_keys" (
  "id" uuid not null default gen_random_uuid(),
  "workspace_id" uuid not null,
  "name" text not null,
  "prefix" text not null,
  "created_at" timestamptz not null default now(),
  "last_used_at" timestamptz,
  "revoked_at" timestamptz,
  constraint "api_keys_pkey" primary key ("id")
);

alter table "workspace_members"
  add constraint "workspace_members_workspace_id_fkey"
  foreign key ("workspace_id") references "workspaces" ("id") on delete cascade;

alter table "projects"
  add constraint "projects_workspace_id_fkey"
  foreign key ("workspace_id") references "workspaces" ("id") on delete cascade;

alter table "domains"
  add constraint "domains_project_id_fkey"
  foreign key ("project_id") references "projects" ("id") on delete cascade;

alter table "deployments"
  add constraint "deployments_project_id_fkey"
  foreign key ("project_id") references "projects" ("id") on delete cascade;

alter table "activity"
  add constraint "activity_project_id_fkey"
  foreign key ("project_id") references "projects" ("id") on delete cascade;

alter table "git_connections"
  add constraint "git_connections_project_id_fkey"
  foreign key ("project_id") references "projects" ("id") on delete cascade;

alter table "api_keys"
  add constraint "api_keys_workspace_id_fkey"
  foreign key ("workspace_id") references "workspaces" ("id") on delete cascade;
