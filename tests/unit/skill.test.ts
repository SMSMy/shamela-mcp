/**
 * The researcher skill's assembly and resolution logic, unit-tested without a
 * backend: the documents are plain text the host hands in, so everything the
 * tool decides — which section was asked for, what gets assembled, and what
 * happens when the host embedded nothing — is pure and testable here.
 */

import { describe, it, expect } from "vitest";

import {
    buildSkillSectionText,
    buildSkillText,
    resolveSkillSection,
    SKILL_SECTION_NAMES,
    type SkillDocs,
} from "../../src/server/skill.js";
import { runSkill } from "../../src/server/tools/skill.js";

const DOCS: SkillDocs = {
    skill: "# مهارة الباحث\n\nتعليمات المهارة نفسها.",
    decision: "# قواعد اتخاذ القرار في البحث\n\nالقاعدة الأولى.",
    tools: "# دليل الأدوات\n\nالأداة الأولى.",
};

describe("resolveSkillSection", () => {
    it("accepts the Arabic wire names", () => {
        expect(resolveSkillSection("الكل")).toBe("الكل");
        expect(resolveSkillSection("المهارة")).toBe("المهارة");
        expect(resolveSkillSection("القواعد")).toBe("القواعد");
        expect(resolveSkillSection("الأدوات")).toBe("الأدوات");
    });

    it("accepts the English aliases", () => {
        expect(resolveSkillSection("all")).toBe("الكل");
        expect(resolveSkillSection("full")).toBe("الكل");
        expect(resolveSkillSection("skill")).toBe("المهارة");
        expect(resolveSkillSection("rules")).toBe("القواعد");
        expect(resolveSkillSection("decision")).toBe("القواعد");
        expect(resolveSkillSection("tools")).toBe("الأدوات");
    });

    it("returns null for anything else, including inherited property names", () => {
        expect(resolveSkillSection("قسم غير موجود")).toBeNull();
        expect(resolveSkillSection("")).toBeNull();
        expect(resolveSkillSection("constructor")).toBeNull();
        expect(resolveSkillSection("toString")).toBeNull();
    });
});

describe("buildSkillText / buildSkillSectionText", () => {
    it("assembles the whole skill in document order", () => {
        const text = buildSkillText(DOCS);
        expect(text).toContain(DOCS.skill);
        expect(text).toContain(DOCS.decision);
        expect(text).toContain(DOCS.tools);
        expect(text.indexOf(DOCS.skill)).toBeLessThan(text.indexOf(DOCS.decision));
        expect(text.indexOf(DOCS.decision)).toBeLessThan(text.indexOf(DOCS.tools));
    });

    it("sections return only their own document", () => {
        expect(buildSkillSectionText(DOCS, "المهارة")).toBe(`${DOCS.skill}\n`);
        expect(buildSkillSectionText(DOCS, "القواعد")).toBe(`${DOCS.decision}\n`);
        expect(buildSkillSectionText(DOCS, "الأدوات")).toBe(`${DOCS.tools}\n`);
        expect(buildSkillSectionText(DOCS, "الكل")).toBe(buildSkillText(DOCS));
    });

    it("declares exactly the sections callers may ask for", () => {
        expect([...SKILL_SECTION_NAMES]).toEqual(["الكل", "المهارة", "القواعد", "الأدوات"]);
    });
});

describe("runSkill", () => {
    it("defaults to the whole skill", () => {
        const r = runSkill({ section: "الكل", response_format: "markdown" }, DOCS);
        expect("isError" in r).toBe(false);
        if ("isError" in r) return;
        expect(r.structuredContent?.section).toBe("الكل");
        expect(r.structuredContent?.notes).toEqual([]);
        expect(r.structuredContent?.text).toBe(buildSkillText(DOCS));
    });

    it("unknown section falls back to the whole skill with a note", () => {
        const r = runSkill({ section: "قسم غير موجود", response_format: "markdown" }, DOCS);
        if ("isError" in r) throw new Error("expected a rendered response");
        const sc = r.structuredContent as { section: string; text: string; notes: string[] };
        expect(sc.section).toBe("الكل");
        expect(sc.text).toBe(buildSkillText(DOCS));
        expect(sc.notes.length).toBeGreaterThanOrEqual(1);
        expect(sc.notes[0]).toContain("قسم غير موجود");
    });

    it("json format carries the same content through the structured channel", () => {
        const r = runSkill({ section: "القواعد", response_format: "json" }, DOCS);
        if ("isError" in r) throw new Error("expected a rendered response");
        expect(r.structuredContent?.text).toBe(`${DOCS.decision}\n`);
    });

    it("host embedded no documents: honest unavailable error, not invented text", () => {
        const r = runSkill({ section: "الكل", response_format: "markdown" }, undefined);
        expect("isError" in r).toBe(true);
        if (!("isError" in r)) return;
        expect(r.isError).toBe(true);
        const text = r.content[0]?.text ?? "";
        expect(text).toContain("shamela_guide");
        expect(text).not.toContain(DOCS.skill);
    });
});
