import type { Member } from "@repo/contracts";
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
import { useMembers } from "./hooks/use-members";

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

export const MembersPanel = ({
  workspaceId,
  initialMembers,
}: {
  workspaceId: string;
  initialMembers: Member[];
}) => {
  const { members, form, onSubmit, error } = useMembers(
    workspaceId,
    initialMembers
  );
  const emailId = useId();
  const roleId = useId();

  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="font-semibold text-lg">Members</h2>
          <p className="text-muted-foreground text-sm">
            Manage access for your workspace.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <label className="flex-1" htmlFor={emailId}>
            <span className="sr-only">Email address</span>
            <Input
              id={emailId}
              placeholder="Invitee email"
              {...form.register("email")}
            />
          </label>
          <label className="w-full sm:w-40" htmlFor={roleId}>
            <span className="sr-only">Role</span>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              id={roleId}
              {...form.register("role")}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </label>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Invite member
          </Button>
        </form>
        {form.formState.errors.email?.message && (
          <p className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input className="max-w-sm" placeholder="Find a member" />
          <p className="text-muted-foreground text-xs">
            Active members in your org: {members.length}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="text-sm">{member.email}</TableCell>
                <TableCell>
                  {(() => {
                    const labelMap: Record<Member["status"], string> = {
                      active: "Active",
                      invited: "Invited",
                      suspended: "Suspended",
                    };
                    const label = labelMap[member.status];
                    return (
                      <Badge
                        className="rounded-full"
                        variant={
                          member.status === "active" ? "accent" : "outline"
                        }
                      >
                        {label}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(member.joinedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  —
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground text-sm"
                  colSpan={4}
                >
                  No members yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
