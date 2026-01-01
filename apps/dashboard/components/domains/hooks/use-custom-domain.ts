"use client";

import {
  createDomain,
  getDomainVerification,
  verifyDomain,
} from "@repo/api-client";
import type { DomainStatus } from "@repo/models";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { CustomDomainFormValues } from "../types";
import { customDomainSchema } from "../types";

const buildStatus = (
  status: DomainStatus["status"],
  records: DomainStatus["dnsRecords"]
) => ({
  status,
  dnsRecords: records,
});

export const useCustomDomain = (
  projectId: string,
  defaultDomainId?: string,
  defaultDomain?: string,
  status?: DomainStatus,
  pathPrefix?: string
) => {
  const [currentStatus, setCurrentStatus] = useState<DomainStatus | undefined>(
    status
  );
  const [error, setError] = useState<string | null>(null);
  const [domainId, setDomainId] = useState<string | null>(
    defaultDomainId ?? null
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<CustomDomainFormValues>({
    resolver: createZodResolver(customDomainSchema),
    defaultValues: { domain: defaultDomain ?? "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (defaultDomain) {
      form.setValue("domain", defaultDomain, { shouldValidate: true });
    }
  }, [defaultDomain, form.setValue]);

  useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    }
  }, [status]);

  useEffect(() => {
    if (!(defaultDomainId && defaultDomain) || status?.dnsRecords.length) {
      return;
    }

    getDomainVerification(projectId, defaultDomainId)
      .then((verification) => {
        setCurrentStatus(
          buildStatus(
            verification.verified
              ? "Valid Configuration"
              : "Pending Verification",
            verification.records
          )
        );
      })
      .catch(() => null);
  }, [defaultDomainId, defaultDomain, projectId, status?.dnsRecords.length]);

  const domain = form.watch("domain");

  const onSubmit = form.handleSubmit((values) => {
    const hostname = values.domain.trim();
    const normalizedPathPrefix = pathPrefix?.trim();
    const payload = {
      hostname,
      ...(normalizedPathPrefix ? { pathPrefix: normalizedPathPrefix } : {}),
    };
    setError(null);
    return createDomain(projectId, payload)
      .then((response) => {
        setDomainId(response.domain.id);
        setCurrentStatus(
          buildStatus(
            response.domain.status,
            response.verification?.records ?? []
          )
        );
      })
      .catch(() => {
        setError("Unable to add domain. Try again.");
      });
  });

  const onVerify = async () => {
    if (!domainId) {
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const verification = await verifyDomain(projectId, domainId);
      setCurrentStatus(
        buildStatus(
          verification.verified
            ? "Valid Configuration"
            : "Pending Verification",
          verification.records
        )
      );
    } catch {
      setError("Unable to verify domain. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    form,
    domain,
    currentStatus,
    onSubmit,
    onVerify,
    isVerifying,
    error,
  };
};
