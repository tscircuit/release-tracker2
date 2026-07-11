"use client";

import { useMemo, useState } from "react";

type Stage = "source" | "core" | "eval" | "runframe" | "cli" | "released";

type Feature = {
  title: string;
  repo: string;
  pr: number;
  url: string;
  author: string;
  merged: string;
  stage: Stage;
  note: string;
  release?: string;
};

const stages: { id: Stage; short: string; label: string }[] = [
  { id: "source", short: "01", label: "Upstream" },
  { id: "core", short: "02", label: "Core" },
  { id: "eval", short: "03", label: "Eval" },
  { id: "runframe", short: "04", label: "Runframe" },
  { id: "cli", short: "05", label: "CLI" },
  { id: "released", short: "06", label: "Released" },
];

const features: Feature[] = [
  {
    title: "Add crystal maxTraceLength prop",
    repo: "props",
    pr: 722,
    url: "https://github.com/tscircuit/props/pull/722",
    author: "seveibar",
    merged: "Jul 11 · 3:53 PM PT",
    stage: "source",
    note: "Merged upstream; waiting for a core dependency update.",
  },
  {
    title: "Warn when chips use reserved refdes prefixes",
    repo: "core",
    pr: 2640,
    url: "https://github.com/tscircuit/core/pull/2640",
    author: "seveibar",
    merged: "Jul 11 · 3:49 PM PT",
    stage: "core",
    note: "Published from core; the latest eval update attempts closed before merging.",
  },
  {
    title: "Update copper pour solver to 0.0.37",
    repo: "core",
    pr: 2639,
    url: "https://github.com/tscircuit/core/pull/2639",
    author: "seveibar",
    merged: "Jul 11 · 3:34 PM PT",
    stage: "core",
    note: "At core; awaiting a successful eval propagation run.",
  },
  {
    title: "Add PCB trace-too-long warning",
    repo: "circuit-json",
    pr: 642,
    url: "https://github.com/tscircuit/circuit-json/pull/642",
    author: "seveibar",
    merged: "Jul 11 · 3:31 PM PT",
    stage: "source",
    note: "Schema support landed; consumer packages still need to pick it up.",
  },
  {
    title: "Support custom schematic symbols circuit-json",
    repo: "core",
    pr: 2629,
    url: "https://github.com/tscircuit/core/pull/2629",
    author: "techmannih",
    merged: "Jul 10 · 8:51 PM PT",
    stage: "released",
    note: "Propagated core → eval → runframe → CLI → tscircuit.",
    release: "tscircuit v0.1.1641",
  },
  {
    title: "Add option to ignore existing top-level PCB route state during autorouting",
    repo: "core",
    pr: 2632,
    url: "https://github.com/tscircuit/core/pull/2632",
    author: "AnasSarkiz",
    merged: "Jul 10 · 6:15 AM PT",
    stage: "released",
    note: "Reached web and CLI release surfaces through the automated chain.",
    release: "tscircuit v0.1.1642",
  },
  {
    title: "Preserve PCB text size and emit explicit text thickness",
    repo: "circuit-json-to-kicad",
    pr: 375,
    url: "https://github.com/tscircuit/circuit-json-to-kicad/pull/375",
    author: "techmannih",
    merged: "Jul 10 · 7:24 PM PT",
    stage: "released",
    note: "Propagated through runframe, CLI, and the top-level package.",
    release: "tscircuit v0.1.1640",
  },
  {
    title: "Add Routing Artifact Images for visual autorouting debug",
    repo: "cli",
    pr: 3612,
    url: "https://github.com/tscircuit/cli/pull/3612",
    author: "seveibar",
    merged: "Jul 9 · 11:30 PM PT",
    stage: "released",
    note: "Shipped directly through the CLI → tscircuit release leg.",
    release: "CLI v0.1.1639+",
  },
  {
    title: "Fix overlapping PCB cutouts by subtracting solid cutouts",
    repo: "circuit-json-to-gerber",
    pr: 123,
    url: "https://github.com/tscircuit/circuit-json-to-gerber/pull/123",
    author: "mohan-bee",
    merged: "Jul 10 · 11:30 AM PT",
    stage: "released",
    note: "Picked up by runframe and released downstream to CLI and tscircuit.",
    release: "tscircuit v0.1.1639",
  },
  {
    title: "Fix 3D package previews with native PNG rendering",
    repo: "tscircuit.com",
    pr: 3882,
    url: "https://github.com/tscircuit/tscircuit.com/pull/3882",
    author: "rushabhcodes",
    merged: "Jul 10 · 12:36 PM PT",
    stage: "released",
    note: "Merged on the web release surface; available without another package hop.",
    release: "tscircuit.com",
  },
];

const stageIndex = (stage: Stage) => stages.findIndex((item) => item.id === stage);

function FeatureCard({ feature, compact = false }: { feature: Feature; compact?: boolean }) {
  return (
    <article className={`feature-card ${compact ? "compact" : ""}`}>
      <div className="card-topline">
        <span className="repo">{feature.repo}</span>
        <a href={feature.url} target="_blank" rel="noreferrer" className="pr-link" aria-label={`Open ${feature.repo} pull request ${feature.pr}`}>
          PR #{feature.pr} ↗
        </a>
      </div>
      <h3>{feature.title}</h3>
      {!compact && <p className="note">{feature.note}</p>}
      <div className="meta">
        <span>@{feature.author}</span>
        <span>{feature.release ?? feature.merged}</span>
      </div>
    </article>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "moving" | "released">("all");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return features.filter((feature) => {
      const matchesQuery = !normalized || `${feature.title} ${feature.repo} ${feature.pr} ${feature.author}`.toLowerCase().includes(normalized);
      const matchesFilter = filter === "all" || (filter === "released" ? feature.stage === "released" : feature.stage !== "released");
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const moving = visible.filter((feature) => feature.stage !== "released");
  const released = visible.filter((feature) => feature.stage === "released");

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Signalpath home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>signalpath</span>
        </a>
        <div className="header-meta">
          <span className="live-dot" />
          Snapshot · Jul 11, 2026 · 4:05 PM PT
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">tscircuit release intelligence</div>
        <div className="hero-grid">
          <h1>See what’s shipping.<br /><em>And what’s stuck.</em></h1>
          <div className="hero-copy">
            <p>Feature PRs, translated into a live-looking view of the automated package pipeline—from first merge to a release users can install.</p>
            <a href="https://docs.tscircuit.com/contributing/package-dependencies-and-auto-updates" target="_blank" rel="noreferrer">How the pipeline works ↗</a>
          </div>
        </div>
        <div className="stats" aria-label="Release statistics">
          <div><strong>{features.filter((item) => item.stage !== "released").length}</strong><span>moving downstream</span></div>
          <div><strong>{features.filter((item) => item.stage === "released").length}</strong><span>recently released</span></div>
          <div><strong>6</strong><span>release stages</span></div>
          <div><strong>CI</strong><span>gates every handoff</span></div>
        </div>
      </section>

      <section className="controls" aria-label="Feature filters">
        <div className="segmented">
          {(["all", "moving", "released"] as const).map((value) => (
            <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
              {value === "all" ? "All features" : value === "moving" ? "In pipeline" : "Released"}
            </button>
          ))}
        </div>
        <label className="search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PR, repo, author…" aria-label="Search features" />
        </label>
      </section>

      {filter !== "released" && (
        <section className="pipeline-section">
          <div className="section-heading">
            <div><span className="kicker">Release pipeline</span><h2>In motion</h2></div>
            <p>Cards sit at the furthest verified package hop. A failed CI check pauses propagation at that boundary.</p>
          </div>

          <div className="pipeline-map" aria-label="Package release pipeline">
            {stages.map((stage, index) => (
              <div className={`stage-node ${stage.id === "released" ? "released-node" : ""}`} key={stage.id}>
                <span>{stage.short}</span>
                <strong>{stage.label}</strong>
                {index < stages.length - 1 && <i aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className="moving-list">
            {moving.map((feature) => (
              <div className="moving-row" key={`${feature.repo}-${feature.pr}`}>
                <div className="progress-rail" aria-label={`${feature.stage} stage`}>
                  {stages.map((stage, index) => (
                    <span key={stage.id} className={index <= stageIndex(feature.stage) ? "passed" : ""} />
                  ))}
                </div>
                <FeatureCard feature={feature} />
                <div className="stage-status">
                  <span>Current stage</span>
                  <strong>{stages[stageIndex(feature.stage)].label}</strong>
                  <small>{feature.merged}</small>
                </div>
              </div>
            ))}
            {moving.length === 0 && <div className="empty">No in-flight features match this search.</div>}
          </div>
        </section>
      )}

      {filter !== "moving" && (
        <section className="released-section">
          <div className="section-heading inverse">
            <div><span className="kicker">Now available</span><h2>Recently released</h2></div>
            <p>Feature work that completed the dependency chain or landed directly on a release surface.</p>
          </div>
          <div className="release-grid">
            {released.map((feature, index) => (
              <div className="release-item" key={`${feature.repo}-${feature.pr}`}>
                <span className="release-number">{String(index + 1).padStart(2, "0")}</span>
                <FeatureCard feature={feature} compact />
              </div>
            ))}
            {released.length === 0 && <div className="empty dark">No released features match this search.</div>}
          </div>
        </section>
      )}

      <footer>
        <div><span className="brand-mark small"><i /><i /><i /></span><strong>signalpath</strong></div>
        <p>Release position is inferred from merged feature PRs and automated dependency-update PRs. Source snapshot: GitHub, Jul 11, 2026.</p>
        <a href="https://github.com/tscircuit" target="_blank" rel="noreferrer">tscircuit on GitHub ↗</a>
      </footer>
    </main>
  );
}
