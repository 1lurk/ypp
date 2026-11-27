import { queryOptions } from "@tanstack/react-query";

export const repository = "https://github.com/salami-reborn/yapplusplus";
const api = "https://api.github.com/repos/salami-reborn/yapplusplus";

export interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}
export interface Release {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: ReleaseAsset[];
}
export interface Commit {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
}

export function stableReleases(releases: Release[]) {
  return releases.filter((release) => !release.draft && !release.prerelease)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

export function windowsInstaller(release: Release | undefined) {
  return release?.assets.find((asset) => /\.exe$/i.test(asset.name) && asset.browser_download_url.startsWith(`${repository}/releases/download/`));
}

async function readGithub<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${api}/${path}`, { signal, headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error("GitHub is temporarily unavailable.");
  return response.json() as Promise<T>;
}

// Public, browser-only reads need neither credentials nor a server proxy.
export const githubOptions = queryOptions({
  queryKey: ["yapplusplus", "github"],
  queryFn: async ({ signal }) => {
    const [releases, commits] = await Promise.all([
      readGithub<Release[]>("releases?per_page=20", signal),
      readGithub<Commit[]>("commits?per_page=1", signal),
    ]);
    return { releases: stableReleases(releases), commit: commits[0] };
  },
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
  retry: 1,
});