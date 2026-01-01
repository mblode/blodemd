import type {
  ActivityStatus,
  DeploymentStatus,
  DomainStatus,
} from "@prisma/client";
import type {
  ActivityStatus as ContractActivityStatus,
  DeploymentStatus as ContractDeploymentStatus,
  DomainStatus as ContractDomainStatus,
} from "@repo/contracts";

const domainStatusToContract: Record<DomainStatus, ContractDomainStatus> = {
  ValidConfiguration: "Valid Configuration",
  PendingVerification: "Pending Verification",
  InvalidConfiguration: "Invalid Configuration",
};

const domainStatusFromContract: Record<ContractDomainStatus, DomainStatus> = {
  "Valid Configuration": "ValidConfiguration",
  "Pending Verification": "PendingVerification",
  "Invalid Configuration": "InvalidConfiguration",
};

const deploymentStatusToContract: Record<
  DeploymentStatus,
  ContractDeploymentStatus
> = {
  Queued: "Queued",
  Building: "Building",
  Successful: "Successful",
  Failed: "Failed",
};

const deploymentStatusFromContract: Record<
  ContractDeploymentStatus,
  DeploymentStatus
> = {
  Queued: "Queued",
  Building: "Building",
  Successful: "Successful",
  Failed: "Failed",
};

const activityStatusToContract: Record<ActivityStatus, ContractActivityStatus> =
  {
    Queued: "Queued",
    Building: "Building",
    Successful: "Successful",
    Failed: "Failed",
  };

const activityStatusFromContract: Record<
  ContractActivityStatus,
  ActivityStatus
> = {
  Queued: "Queued",
  Building: "Building",
  Successful: "Successful",
  Failed: "Failed",
};

export const mapDomainStatusToContract = (
  status: DomainStatus
): ContractDomainStatus => domainStatusToContract[status];

export const mapDomainStatusFromContract = (
  status: ContractDomainStatus
): DomainStatus => domainStatusFromContract[status];

export const mapDeploymentStatusToContract = (
  status: DeploymentStatus
): ContractDeploymentStatus => deploymentStatusToContract[status];

export const mapDeploymentStatusFromContract = (
  status: ContractDeploymentStatus
): DeploymentStatus => deploymentStatusFromContract[status];

export const mapActivityStatusToContract = (
  status: ActivityStatus
): ContractActivityStatus => activityStatusToContract[status];

export const mapActivityStatusFromContract = (
  status: ContractActivityStatus
): ActivityStatus => activityStatusFromContract[status];
