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

const shipped = (title: string, repo: string, pr: number, author: string, merged: string, release: string): Feature => ({
  title,
  repo,
  pr,
  url: `https://github.com/tscircuit/${repo}/pull/${pr}`,
  author,
  merged,
  stage: "released",
  note: "Published by its package or propagated to a downstream release surface.",
  release,
});

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
  shipped("Fix mirrored custom pad polygons on rotated footprints", "kicad-to-circuit-json", 167, "ShiboSoftwareDev", "Jul 11 · 3:18 PM PT", "package release"),
  shipped("Fix browser 3D PNG rendering by removing Node-only PoppyGL exports", "poppygl", 32, "rushabhcodes", "Jul 11 · 2:59 PM PT", "poppygl v0.0.25"),
  shipped("Use browser-safe PoppyGL rendering for STEP PNG snapshots", "circuit-json-to-step", 119, "rushabhcodes", "Jul 11 · 1:26 PM PT", "package release"),
  shipped("Use sharp-free Manifold 2D package", "copper-pour-solver", 59, "seveibar", "Jul 11 · 1:26 PM PT", "solver v0.0.37"),
  shipped("Fix KiCad connectivity conversion and validation", "kicad-to-circuit-json", 163, "ShiboSoftwareDev", "Jul 10 · 2:19 PM PT", "package release"),
  shipped("Support net on gr_arc PCB graphics", "kicadts", 58, "mohan-bee", "Jul 11 · 4:30 AM PT", "package release"),
  shipped("Add a solver to merge global and component topologies in Pipeline 7", "tscircuit-autorouter", 1592, "ShiboSoftwareDev", "Jul 11 · 10:30 AM PT", "autorouter v0.0.655+"),
  shipped("Add differentialPairs and DifferentialPair interface", "tscircuit-autorouter", 1583, "seveibar", "Jul 10 · 12:17 PM PT", "autorouter release"),
  shipped("Support standalone simulation graph SVG URLs", "svg.tscircuit.com", 1763, "ShiboSoftwareDev", "Jul 10 · 7:44 PM PT", "svg.tscircuit.com"),
  shipped("Support default autorouter", "core", 2635, "seveibar", "Jul 10 · 11:26 AM PT", "tscircuit v0.1.1639+"),
  shipped("Add MOSFET connections support", "props", 720, "seveibar", "Jul 11 · 9:55 AM PT", "props release"),
  shipped("Fix workspace path normalization for nested files", "monaco-code-editor", 28, "rushabhcodes", "Jul 9 · 7:58 PM PT", "editor release"),
  shipped("Fix package exports for component-library consumption", "monaco-code-editor", 23, "rushabhcodes", "Jul 9 · 5:55 PM PT", "editor release"),
  shipped("Fix invisible hover and selected states in file sidebar", "monaco-code-editor", 24, "mohan-bee", "Jul 9 · 5:24 PM PT", "editor release"),
  shipped("Fix browser CDN fallback for GLTF loading", "circuit-json-to-3d-png", 13, "rushabhcodes", "Jul 9 · 10:57 PM PT", "package release"),
  shipped("Fix RP2350 footprint conversion from KiCad", "kicad-to-circuit-json", 162, "seveibar", "Jul 9 · 9:52 PM PT", "package release"),
  shipped("Mirror bottom-layer PCB silkscreen text", "circuit-json-to-kicad", 373, "techmannih", "Jul 9 · 8:36 PM PT", "tscircuit v0.1.1640"),
  shipped("Give each pushed trace its own corridor near shared net labels", "schematic-trace-solver", 649, "abdalraof-albarbar", "Jul 9 · 1:24 PM PT", "solver release"),
  shipped("Snap power and ground labels to a pin-aligned corner", "schematic-trace-solver", 654, "MustafaMulla29", "Jul 10 · 3:51 AM PT", "solver release"),
  shipped("Add ratsnest-free solver visualizations for bug snapshots", "schematic-trace-solver", 646, "AnasSarkiz", "Jul 10 · 5:17 AM PT", "solver release"),
  shipped("Lay out decoupling capacitor groups as rail rows", "matchpack", 155, "MustafaMulla29", "Jul 10 · 10:02 AM PT", "matchpack release"),
  shipped("Add autorouter debug messages", "cli", 3606, "seveibar", "Jul 9 · 5:24 PM PT", "CLI v0.1.1639+"),
  shipped("Externalize check-shorts from the CLI bundle", "cli", 3616, "Abse2001", "Jul 10 · 6:18 AM PT", "CLI v0.1.1642"),
  shipped("Add a name to autorouting phases", "props", 719, "seveibar", "Jul 9 · 11:03 PM PT", "props release"),
  shipped("Allow SymbolProp to accept circuit-json element arrays", "props", 718, "techmannih", "Jul 9 · 8:15 PM PT", "props release"),
  shipped("Support legacy KiCad 5 standalone footprints", "kicad-to-circuit-json", 160, "techmannih", "Jul 9 · 8:24 AM PT", "package release"),
  shipped("Subtract edge cutouts from board outlines", "circuit-json-to-kicad", 365, "mohan-bee", "Jul 9 · 1:29 AM PT", "package release"),
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
        <a className="brand" href="#top" aria-label="tscircuit release tracker home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>tscircuit release tracker</span>
        </a>
        <div className="header-meta">
          <span className="live-dot" />
          Snapshot · Jul 11, 2026 · 4:05 PM PT
        </div>
      </header>

      <section className="hero" id="top">
        <div className="intro-strip">
          <div className="eyebrow">feature delivery status</div>
          <p>Feature PRs mapped across the automated package pipeline—from first merge to a release users can install.</p>
          <a href="https://docs.tscircuit.com/contributing/package-dependencies-and-auto-updates" target="_blank" rel="noreferrer">How the pipeline works ↗</a>
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
          <div className="release-table" role="list">
            {released.map((feature, index) => (
              <a className="release-row" href={feature.url} target="_blank" rel="noreferrer" key={`${feature.repo}-${feature.pr}`} role="listitem">
                <span className="release-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="release-repo">{feature.repo}</span>
                <strong>{feature.title}</strong>
                <span className="release-pr">#{feature.pr}</span>
                <span className="release-author">@{feature.author}</span>
                <span className="release-tag">{feature.release}</span>
                <span className="release-arrow">↗</span>
              </a>
            ))}
            {released.length === 0 && <div className="empty dark">No released features match this search.</div>}
          </div>
        </section>
      )}

      <footer>
        <div><span className="brand-mark small"><i /><i /><i /></span><strong>tscircuit release tracker</strong></div>
        <p>Release position is inferred from merged feature PRs and automated dependency-update PRs. Source snapshot: GitHub, Jul 11, 2026.</p>
        <a href="https://github.com/tscircuit" target="_blank" rel="noreferrer">tscircuit on GitHub ↗</a>
      </footer>
    </main>
  );
}
