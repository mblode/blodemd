"use client";

import type { DomainStatus } from "@repo/models";
import { useId } from "react";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DnsTable } from "./dns-table";
import { useCustomDomain } from "./hooks/use-custom-domain";

export const CustomDomain = ({
  projectId,
  pathPrefix,
  defaultDomainId,
  defaultDomain,
  status,
}: {
  projectId: string;
  pathPrefix?: string;
  defaultDomainId?: string;
  defaultDomain?: string;
  status?: DomainStatus;
}) => {
  const {
    form,
    domain,
    currentStatus,
    onSubmit,
    onVerify,
    isVerifying,
    error,
  } = useCustomDomain(
    projectId,
    defaultDomainId,
    defaultDomain,
    status,
    pathPrefix
  );
  const domainId = useId();

  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="font-semibold text-lg">Custom domain</h2>
          <p className="text-muted-foreground text-sm">
            Add a verified domain to point at your docs deployment.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <label className="flex-1" htmlFor={domainId}>
            <span className="sr-only">Domain</span>
            <Input
              id={domainId}
              placeholder="docs.example.com"
              {...form.register("domain")}
            />
          </label>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Add domain
          </Button>
        </form>
        {form.formState.errors.domain?.message && (
          <p className="text-destructive text-sm">
            {form.formState.errors.domain?.message}
          </p>
        )}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {currentStatus ? (
          <Card className="border-border/60 bg-background/60">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{domain}</p>
                  <p className="text-muted-foreground text-xs">
                    {currentStatus.status}
                  </p>
                </div>
                <StatusPill status={currentStatus.status} />
              </div>
              <DnsTable records={currentStatus.dnsRecords} />
              {currentStatus.status !== "Valid Configuration" ? (
                <Button
                  disabled={isVerifying}
                  onClick={onVerify}
                  type="button"
                  variant="secondary"
                >
                  {isVerifying ? "Checking..." : "Check verification"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
};
