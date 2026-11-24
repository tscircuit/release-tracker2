import assert from "node:assert/strict";
import test from "node:test";
import { titleMentionsPackage } from "../app/api/features/package-title.ts";

test("matches exact package names without accepting longer prefixed names", () => {
  assert.equal(
    titleMentionsPackage("chore: update packages circuit-json-to-kicad", "circuit-json"),
    false,
  );
  assert.equal(
    titleMentionsPackage("chore: update packages @tscircuit/circuit-json-to-kicad", "circuit-json"),
    false,
  );
  assert.equal(
    titleMentionsPackage("chore: update packages @tscircuit/circuit-json,circuit-json-to-kicad", "circuit-json"),
    true,
  );
  assert.equal(
    titleMentionsPackage("chore: update packages circuit-json", "circuit-json"),
    true,
  );
});
