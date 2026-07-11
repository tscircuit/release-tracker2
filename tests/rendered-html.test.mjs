import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://signalpath.example/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the release tracker", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>tscircuit release tracker<\/title>/i);
  assert.doesNotMatch(html, /See what’s shipping/i);
  assert.match(html, /Release pipeline/i);
  assert.match(html, /Recently released/i);
  assert.match(html, /Fix workspace path normalization for nested files/i);
  assert.match(html, /github\.com\/tscircuit\/core\/pull\/2640/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("publishes absolute social metadata", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /https?:\/\/[^\"]+\/og\.png/i);
  assert.match(html, /summary_large_image/i);
});
