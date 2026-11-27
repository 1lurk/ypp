import { describe, expect, it, vi, afterEach } from "vitest";
import { githubOptions, stableReleases, windowsInstaller, repository, type Release } from "./github";

const release = (tag: string, date: string, extra: Partial<Release> = {}): Release => ({
  id: 1, tag_name: tag, name: tag, body: "", html_url: `${repository}/releases/tag/${tag}`,
  published_at: date, draft: false, prerelease: false, assets: [], ...extra,
});
afterEach(() => vi.unstubAllGlobals());
describe("Yap++ GitHub updates", () => {
  it("uses the user-specified public repository", () => {
    expect(repository).toBe("https://github.com/salami-reborn/yapplusplus");
  });
  it("selects the newest stable release, not a draft or prerelease", () => {
    const releases = [release("old", "2026-11-01"), release("preview", "2026-11-25", { prerelease: true }), release("U005", "2026-11-20"), release("draft", "2026-11-26", { draft: true })];
    expect(stableReleases(releases).map((r) => r.tag_name)).toEqual(["U005", "old"]);
  });
  it("links the Windows installer from the selected release", () => {
    const url = `${repository}/releases/download/U005/Yap%2B%2B.Setup.1.0.0.exe`;
    const latest = release("U005", "2026-11-20", { assets: [{ name: "source.zip", size: 2, browser_download_url: "https://example.com/source.zip" }, { name: "Yap++.Setup.1.0.0.exe", size: 122983655, browser_download_url: url }] });
    expect(windowsInstaller(latest)?.browser_download_url).toBe(url);
    expect(windowsInstaller(release("new", "2026-11-26"))).toBeUndefined();
  });
  it("refreshes both releases and commits from GitHub", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [release("U005", "2026-11-20")] }).mockResolvedValueOnce({ ok: true, json: async () => [{ sha: "abc1234" }] });
    vi.stubGlobal("fetch", fetcher);
    const { QueryClient } = await import("@tanstack/react-query");
    const client = new QueryClient();
    const result = await client.fetchQuery(githubOptions);
    expect(fetcher.mock.calls[0]?.[0]).toBe("https://api.github.com/repos/salami-reborn/yapplusplus/releases?per_page=20");
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://api.github.com/repos/salami-reborn/yapplusplus/commits?per_page=1");
    expect(result.releases[0]?.tag_name).toBe("U005");
    expect(result.commit?.sha).toBe("abc1234");
    client.clear();
  });
});