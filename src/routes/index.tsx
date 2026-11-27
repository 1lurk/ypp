import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowUpRight, Code2, Download, Github, Palette, Puzzle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand, hero, features, faq } from "@/content/yap";
import { githubOptions, repository, windowsInstaller } from "@/lib/github";
import logo from "@/assets/yapplusplus-pixel-logo.png.asset.json";
import icon from "@/assets/yapplusplus-icon.png.asset.json";

const description = "Yap++ is an unofficial client for Yapin' with plugins and themes. Get the latest Windows installer and follow updates from GitHub.";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Yap++ — A little more Yapin'." },
    { name: "description", content: description },
    { property: "og:title", content: "Yap++ — A little more Yapin'." },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function Index() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const github = useQuery({ ...githubOptions, enabled: hydrated });
  const latest = github.data?.releases[0];
  const installer = windowsInstaller(latest);
  const downloadUrl = installer?.browser_download_url ?? `${repository}/releases/latest`;
  const commit = github.data?.commit;
  const icons = [Puzzle, Palette, Code2];

  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header wrap">
      <a href="#main" className="site-brand" aria-label="Yap++ home"><img src={icon.url} alt="" width="30" height="30" /><span>Yap<span className="brand-plus">++</span></span></a>
      <nav aria-label="Main navigation">
        <a href="#download">Download</a>
        <a href={`${repository}/tree/main/plugins`} target="_blank" rel="noreferrer">Plugins</a>
        <a href={`${repository}/tree/main/themes`} target="_blank" rel="noreferrer">Themes</a>
        <a href="#updates">Changelog</a>
        <a href={repository} target="_blank" rel="noreferrer" className="github-nav"><Github size={16} /><span>GitHub</span></a>
      </nav>
    </header>

    <main id="main" className="wrap">
      <section className="hero-section" aria-labelledby="hero-title" id="download">
        <h1 id="hero-title"><span className="sr-only">Yap++ for Yapin'</span><img src={logo.url} alt="" width="710" height="265" fetchPriority="high" /></h1>
        <p className="section-label hero-label">UNOFFICIAL CLIENT · A LITTLE MORE YAPIN'</p>
        <p className="hero-description">{hero.body}</p>
        <div className="hero-actions">
          <Button asChild className="download-button"><a href={downloadUrl}><Download size={17} />{installer ? "Download for Windows" : "Get Yap++"}</a></Button>
          <Button asChild variant="secondary"><a href={`${repository}/tree/main/plugins`} target="_blank" rel="noreferrer">Browse plugins</a></Button>
          <Button asChild variant="secondary"><a href={`${repository}/tree/main/themes`} target="_blank" rel="noreferrer">Browse themes</a></Button>
        </div>
        <p className="download-meta">{latest && installer ? `${latest.tag_name} · Windows installer · ${(installer.size / 1024 / 1024).toFixed(0)} MB` : "Downloads available from GitHub releases"}</p>
        <div className="hero-facts">
          <div><strong>{latest?.tag_name ?? "Latest"}</strong><span>stable release, straight from GitHub</span></div>
          <div><strong>Plugins + themes</strong><span>a familiar chat, with your own touches</span></div>
          <div><strong>Open source</strong><span>community-made and open to explore</span></div>
        </div>
      </section>

      <section id="extras" className="content-section">
        <p className="section-label">&lt;what it does&gt;</p>
        <h2>Your chat, a little more yours.</h2>
        <p className="section-intro">The Yapin' you know, with extras made by the community.</p>
        <div className="feature-grid">{features.map((feature, i) => {
          const Icon = icons[i] ?? Code2;
          return <article className="feature" key={feature.number}><Icon size={19} /><h3>{feature.title}</h3><p>{feature.body}</p></article>;
        })}</div>
      </section>

      <section className="content-section getting-started">
        <p className="section-label">&lt;getting started&gt;</p>
        <h2>A few steps to your next conversation.</h2>
        <ol><li><strong>Download</strong> the Windows installer from the latest stable <a href={latest?.html_url ?? `${repository}/releases`} target="_blank" rel="noreferrer">GitHub release</a>.</li><li><strong>Run the installer.</strong> Review the release information first: Yap++ is an unsigned community app, so Windows may show a security warning.</li><li><strong>Open Yap++.</strong> Get back to Yapin', and explore the available plugins and themes.</li></ol>
      </section>

      <section id="updates" className="content-section updates-section">
        <div className="section-heading"><div><p className="section-label">&lt;from github&gt;</p><h2>Latest releases</h2></div><Button variant="ghost" size="icon" aria-label="Refresh GitHub updates" title="Refresh GitHub updates" onClick={() => void github.refetch()} disabled={github.isFetching}><RefreshCw size={16} className={github.isFetching ? "animate-spin" : ""} /></Button></div>
        <p className="sync-status" role="status"><span className="status-dot" />{github.isError ? "Couldn't refresh GitHub. You can still browse releases directly." : github.data ? "Up to date with GitHub · checked every 5 minutes" : "Checking GitHub for the latest release…"}</p>
        {github.data?.releases.length ? <div className="release-list">{github.data.releases.slice(0, 3).map((release, index) => <a className="release-row" key={release.id} href={release.html_url} target="_blank" rel="noreferrer"><div className="release-version">{release.tag_name}{index === 0 && <span>Latest</span>}</div><div className="release-info"><h3>{release.name ?? release.tag_name}</h3><p>{release.body?.replace(/[#*_`]/g, "").slice(0, 200) || "See release details on GitHub."}</p></div><time dateTime={release.published_at}>{dateLabel(release.published_at)}</time><ArrowUpRight size={17} /></a>)}</div> : <a className="text-link" href={`${repository}/releases`} target="_blank" rel="noreferrer">{github.data ? "No stable releases yet — explore the project" : "Browse releases on GitHub"}<ArrowUpRight size={15} /></a>}
        {commit && <a className="commit-line" href={commit.html_url} target="_blank" rel="noreferrer"><Code2 size={15} /><span>Latest commit</span><code>{commit.sha.slice(0, 7)}</code><span className="commit-message">{commit.commit.message.split("\n")[0]}</span><ArrowUpRight size={13} /></a>}
        <a className="text-link all-releases" href={`${repository}/releases`} target="_blank" rel="noreferrer">All downloads & release notes <ArrowUpRight size={14} /></a>
      </section>

      <section className="content-section about-section"><h2>Community-made. Not official.</h2><p className="section-intro">{brand.blurb} Yap++ is not affiliated with Yapin'.</p><div className="faq-list">{faq.filter((_, i) => i > 1).map((item) => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></section>
    </main>
    <footer className="wrap site-footer"><span>Yap<span className="brand-plus">++</span> <span className="footer-note">for Yapin'. Made by the community.</span></span><a href={repository} target="_blank" rel="noreferrer"><Github size={14} /> View on GitHub <ArrowUpRight size={13} /></a></footer>
  </div>;
}
