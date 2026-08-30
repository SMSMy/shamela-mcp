/**
 * The embedded researcher skill — the behavioral playbook this extension was
 * built to follow, served through the shamela_skill tool.
 *
 * Ordinary users install the .mcpb and never visit the repository, so the
 * extension carries its skill with it, exactly as it carries the user guide
 * (see guide.ts). The texts are NOT hardcoded here: the host supplies them at
 * registration (`ShamelaDeps.skillDocs`). The desktop entry point embeds them
 * at build time (see entry.ts); a host that ships none still registers the
 * tool, which then says so honestly instead of failing.
 *
 * Unlike the user-facing shamela_guide, this is instructions FOR the model —
 * when to narrow or widen, the zero-results protocol, and the citation-honesty
 * rules the server itself is built to enforce.
 */

/** The three documents the shamela-researcher skill is made of. */
export interface SkillDocs {
    /** skills/shamela-researcher/SKILL.md — the skill's own instructions. */
    skill: string;
    /** skills/shamela-researcher/references/search-decision.md — search decision rules. */
    decision: string;
    /** skills/shamela-researcher/references/tools-guide.md — the tools guide. */
    tools: string;
}

/**
 * The parts of the skill addressable through shamela_skill's `section` input.
 * The Arabic names are the wire values and stay the wire values — they are a
 * declared input, and renaming them would break every caller that learned them.
 * The English names are aliases onto the same parts.
 */
export const SKILL_SECTION_NAMES = ["الكل", "المهارة", "القواعد", "الأدوات"] as const;
export type SkillSectionName = (typeof SKILL_SECTION_NAMES)[number];

/** What a caller may type, in either language, for each part. */
// Prototype-free: a plain object answers to "constructor" and "toString" with
// things that are not sections, and resolveSkillSection would hand a caller a
// function where it promised a heading.
const SECTION_ALIASES: Record<string, SkillSectionName> = Object.assign(Object.create(null), {
    "الكل": "الكل",
    all: "الكل",
    full: "الكل",
    "المهارة": "المهارة",
    skill: "المهارة",
    "القواعد": "القواعد",
    rules: "القواعد",
    decision: "القواعد",
    "الأدوات": "الأدوات",
    tools: "الأدوات",
});

/** Resolve what the caller typed to a section, or null if it means nothing. */
export function resolveSkillSection(raw: string): SkillSectionName | null {
    return SECTION_ALIASES[raw.trim().toLowerCase()] ?? SECTION_ALIASES[raw.trim()] ?? null;
}

/** The whole skill: instructions, then the decision rules, then the tools guide. */
export function buildSkillText(docs: SkillDocs): string {
    return `${docs.skill}\n\n---\n\n${docs.decision}\n\n---\n\n${docs.tools}\n`;
}

/**
 * Build one part of the skill. «الكل» returns the whole thing; the others
 * return just their part.
 */
export function buildSkillSectionText(docs: SkillDocs, section: SkillSectionName): string {
    switch (section) {
        case "المهارة":
            return `${docs.skill}\n`;
        case "القواعد":
            return `${docs.decision}\n`;
        case "الأدوات":
            return `${docs.tools}\n`;
        case "الكل":
            return buildSkillText(docs);
    }
}
