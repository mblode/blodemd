import { cacheLife } from "next/cache";

/**
 * Live proof for the landing page. Each helper fails closed: any network
 * error, non-2xx status or unexpected payload returns `null`, and the proof
 * strip hides that entry. Never substitute a hard-coded number.
 */

const REVALIDATE_SECONDS = 86_400;
const TIMEOUT_MS = 5000;

export const GITHUB_REPO = "mblode/edda";
export const NPM_PACKAGE = "edda-docs";

const readCount = async (
  url: string,
  field: string,
  headers: Record<string, string> = {}
): Promise<number | null> => {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", ...headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) {
      return null;
    }
    const value = (data as Record<string, unknown>)[field];
    return typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : null;
  } catch {
    return null;
  }
};

export const getGithubStars = async (): Promise<number | null> => {
  "use cache";
  cacheLife({ expire: REVALIDATE_SECONDS * 7, revalidate: REVALIDATE_SECONDS });
  return await readCount(
    `https://api.github.com/repos/${GITHUB_REPO}`,
    "stargazers_count",
    { "x-github-api-version": "2022-11-28" }
  );
};

/** Downloads of the published CLI over the last seven days. */
export const getNpmWeeklyDownloads = async (): Promise<number | null> => {
  "use cache";
  cacheLife({ expire: REVALIDATE_SECONDS * 7, revalidate: REVALIDATE_SECONDS });
  return await readCount(
    `https://api.npmjs.org/downloads/point/last-week/${NPM_PACKAGE}`,
    "downloads"
  );
};
