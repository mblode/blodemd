"use client";

import type { ApiKey } from "@repo/contracts";
import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiKeys } from "./hooks/use-api-keys";

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export const ApiKeysPanel = ({
  workspaceId,
  initialKeys,
}: {
  workspaceId: string;
  initialKeys: ApiKey[];
}) => {
  const { keys, lastCreated, error, form, onSubmit } = useApiKeys(
    workspaceId,
    initialKeys
  );
  const nameId = useId();

  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="font-semibold text-lg">API keys</h2>
          <p className="text-muted-foreground text-sm">
            Generate keys to access the neue API.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <label className="flex-1" htmlFor={nameId}>
            <span className="sr-only">Key name</span>
            <Input
              id={nameId}
              placeholder="Key name"
              {...form.register("name")}
            />
          </label>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Create key
          </Button>
        </form>
        {form.formState.errors.name?.message && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {lastCreated ? (
          <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
            <p className="font-semibold">New key created</p>
            <p className="text-muted-foreground text-xs">
              Prefix: <span className="font-mono">{lastCreated.prefix}</span>
            </p>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="text-sm">{key.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {key.prefix}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(key.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(key.lastUsedAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    className="rounded-full"
                    variant={key.revokedAt ? "outline" : "accent"}
                  >
                    {key.revokedAt ? "Revoked" : "Active"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {keys.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground text-sm"
                  colSpan={5}
                >
                  No API keys yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
