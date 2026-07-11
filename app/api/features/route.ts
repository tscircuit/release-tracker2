type Stage = "source" | "core" | "eval" | "runframe" | "cli" | "released";

type GitHubItem = {
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  closed_at: string;
  user: { login: string } | null;
};

type SearchResponse = { items: GitHubItem[] };

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

type Payload = { features: Feature[]; updatedAt: string; refreshSeconds: number };

let cached: { expiresAt: number; payload: Payload } | undefined;

const CORE_SOURCES = new Set(["props", "checks", "circuit-json", "schematic-trace-solver", "matchpack", "copper-pour-solver", "tscircuit-autorouter"]);
const RUNFRAME_SOURCES = new Set(["3d-viewer", "pcb-viewer", "schematic-viewer", "circuit-json-to-gerber", "circuit-json-to-kicad"]);
const DIRECT_SURFACES = new Set(["tscircuit.com", "svg.tscircuit.com", "usercode.tscircuit.com", "circuitjson.com"]);

const repoName = (item: GitHubItem) => item.repository_url.split("/").pop() ?? "unknown";
const timestamp = (value?: string) => value ? new Date(value).getTime() : 0;

function newest(items: GitHubItem[], repo: string, titleIncludes: string) {
  return items
    .filter((item) => repoName(item) === repo && item.title.toLowerCase().includes(titleIncludes.toLowerCase()))
    .reduce((latest, item) => Math.max(latest, timestamp(item.closed_at)), 0);
}

function formatPacific(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(date);
  return `${day} · ${time} PT`;
}

function progressFromCore(mergedAt: number, boundaries: Record<string, number>): Stage {
  if (mergedAt > boundaries.eval) return "core";
  if (mergedAt > boundaries.runframe) return "eval";
  if (mergedAt > boundaries.cli) return "runframe";
  if (mergedAt > boundaries.tscircuit) return "cli";
  return "released";
}

function progressFromRunframe(mergedAt: number, boundaries: Record<string, number>): Stage {
  if (mergedAt > boundaries.cli) return "runframe";
  if (mergedAt > boundaries.tscircuit) return "cli";
  return "released";
}

function featureStage(item: GitHubItem, botItems: GitHubItem[], boundaries: Record<string, number>): Stage {
  const repo = repoName(item);
  const mergedAt = timestamp(item.closed_at);

  if (DIRECT_SURFACES.has(repo)) return "released";
  if (repo === "tscircuit") return "released";
  if (repo === "cli") return mergedAt > boundaries.tscircuit ? "cli" : "released";
  if (repo === "runframe") return progressFromRunframe(mergedAt, boundaries);
  if (repo === "eval") {
    if (mergedAt > boundaries.runframe) return "eval";
    return progressFromRunframe(mergedAt, boundaries);
  }
  if (repo === "core") return progressFromCore(mergedAt, boundaries);

  if (CORE_SOURCES.has(repo)) {
    const corePickup = newest(botItems, "core", repo);
    return !corePickup || mergedAt > corePickup ? "source" : progressFromCore(corePickup, boundaries);
  }

  if (RUNFRAME_SOURCES.has(repo)) {
    const runframePickup = newest(botItems, "runframe", repo);
    return !runframePickup || mergedAt > runframePickup ? "source" : progressFromRunframe(runframePickup, boundaries);
  }

  return "released";
}

function releaseLabel(repo: string, stage: Stage) {
  if (stage !== "released") return undefined;
  if (DIRECT_SURFACES.has(repo)) return repo;
  if (["core", "eval", "runframe", "cli", "tscircuit", ...CORE_SOURCES, ...RUNFRAME_SOURCES].includes(repo)) return "tscircuit release";
  return "package release";
}

async function githubSearch(query: string) {
  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "100");
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "tscircuit-release-tracker" },
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return (await response.json()) as SearchResponse;
}

async function buildPayload(): Promise<Payload> {
  const [featureSearch, botSearch] = await Promise.all([
    githubSearch("org:tscircuit is:pr is:merged -author:tscircuitbot"),
    githubSearch("org:tscircuit is:pr is:merged author:tscircuitbot"),
  ]);

  const botItems = botSearch.items;
  const boundaries = {
    eval: newest(botItems, "eval", "update packages"),
    runframe: newest(botItems, "runframe", "@tscircuit/eval"),
    cli: newest(botItems, "cli", "@tscircuit/runframe"),
    tscircuit: newest(botItems, "tscircuit", "@tscircuit/cli"),
  };

  const ignored = /^(chore|test\b|repro\b|fix type errors|sync bun|remove unused|update .*dependenc|bump )/i;
  const mapped = featureSearch.items
    .filter((item) => !ignored.test(item.title.trim()))
    .map((item): Feature => {
      const repo = repoName(item);
      const stage = featureStage(item, botItems, boundaries);
      return {
        title: item.title.trim(),
        repo,
        pr: item.number,
        url: item.html_url,
        author: item.user?.login ?? "unknown",
        merged: formatPacific(item.closed_at),
        stage,
        note: stage === "released" ? "Published by its package or propagated to a downstream release surface." : `Latest verified position: ${stage}.`,
        release: releaseLabel(repo, stage),
      };
    });

  const moving = mapped.filter((item) => item.stage !== "released");
  const released = mapped.filter((item) => item.stage === "released").slice(0, 40);
  return { features: [...moving, ...released], updatedAt: new Date().toISOString(), refreshSeconds: 300 };
}

export async function GET() {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return Response.json(cached.payload, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60" } });
  }

  try {
    const payload = await buildPayload();
    cached = { expiresAt: now + 300_000, payload };
    return Response.json(payload, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60" } });
  } catch (error) {
    if (cached) return Response.json(cached.payload);
    return Response.json({ error: error instanceof Error ? error.message : "Unable to refresh GitHub data" }, { status: 502 });
  }
}
