/**
 * The researcher skill is instructions ABOUT the tool surface, so every tool
 * it names must exist. A renamed or withdrawn tool would otherwise leave the
 * skill pointing an agent at nothing — and the drift-guard that checks the
 * user guide does not read these files.
 *
 * The guard reads the registered set from the source (same technique as the
 * manifest audit) and every `shamela_*` token from the skill documents, so it
 * runs as a unit test: no install, no JVM, no backend.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");

/** Tool names the server registers, read from the source rather than run. */
function registeredToolNames(): Set<string> {
    const src = fs.readFileSync(path.join(REPO, "src", "server", "register.ts"), "utf8");
    return new Set(
        [...src.matchAll(/server\.registerTool\(\s*\n?\s*"(shamela_[a-z_]+)"/g)].map((m) => m[1]!),
    );
}

/** The three skill documents, concatenated. */
function skillText(): string {
    const dir = path.join(REPO, "skills", "shamela-researcher");
    return ["SKILL.md", "references/search-decision.md", "references/tools-guide.md"]
        .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
        .join("\n");
}

describe("the researcher skill names only tools that exist", () => {
    it("registers a real tool set to compare against", () => {
        // A broken read of register.ts would make this guard pass vacuously.
        expect(registeredToolNames().size).toBeGreaterThan(30);
    });

    it("every shamela_* token in the skill is a registered tool", () => {
        const registered = registeredToolNames();
        // Word-boundary on both sides: `shamela_skill` counts, while the
        // `mcp__shamela__shamela_*` prefix illustration in the docs does not.
        const mentioned = new Set([...skillText().matchAll(/\bshamela_([a-z][a-z_]*)/g)].map((m) => m[1]!));
        expect(mentioned.size).toBeGreaterThan(5);
        const missing = [...mentioned]
            .filter((name) => !registered.has(`shamela_${name}`))
            .sort();
        expect(missing, `the skill mentions tools that are not registered: ${missing.join(", ")}`).toEqual([]);
    });

    it("the skill mentions the new tool it was written for", () => {
        // Not a tautology: if the docs stopped teaching shamela_skill, the
        // skill would be teaching less than the tool surface offers.
        expect(skillText()).toMatch(/\bshamela_skill\b/);
    });
});
