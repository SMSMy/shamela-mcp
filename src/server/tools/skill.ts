import { z } from "zod";

import { renderResponse, type RenderedResponse } from "../format.js";
import {
    buildSkillSectionText,
    SKILL_SECTION_NAMES,
    resolveSkillSection,
    type SkillDocs,
    type SkillSectionName,
} from "../skill.js";
import { messages } from "../i18n/index.js";
import { ResponseFormatInput } from "../schemas.js";

export const skillInputShape = {
    section: z
        .string()
        .default("الكل")
        .describe(
            "Which part of the researcher skill to return. Either language is accepted: 'الكل' / 'all' (default — the whole skill: its instructions, the search-decision rules, and the tools guide), 'المهارة' / 'skill' (the skill's own instructions only), 'القواعد' / 'rules' (the search decision rules only), or 'الأدوات' / 'tools' (the tools guide only). An unrecognized value falls back to the whole skill with a note.",
        ),
    ...ResponseFormatInput,
};
export const skillInput = z.object(skillInputShape).strict();

export interface SkillOutput {
    /** The section actually returned (falls back to «الكل» on unknown input). */
    section: SkillSectionName;
    available_sections: string[];
    /**
     * The skill markdown — model-facing instructions, present them faithfully
     * and follow them; do not summarize.
     */
    text: string;
    notes: string[];
}

/** What comes back when the host embedded no skill documents at all. */
export interface SkillUnavailable {
    isError: true;
    content: Array<{ type: "text"; text: string }>;
}

/**
 * shamela_skill — the embedded researcher skill as a model-callable tool. Pure
 * text (no backend): the host supplies the documents at registration, and a
 * host that supplied none gets the honest unavailable notice rather than a
 * failure to register.
 */
export function runSkill(
    args: z.infer<typeof skillInput>,
    docs: SkillDocs | undefined,
): RenderedResponse<SkillOutput> | SkillUnavailable {
    if (docs === undefined) {
        return {
            isError: true,
            content: [{ type: "text", text: messages().skillUnavailable }],
        };
    }
    const requested = args.section.trim();
    const notes: string[] = [];
    // Same alias discipline as the guide: the resolved name is checked against
    // the declared list because the alias table is a plain object.
    const resolved = resolveSkillSection(requested);
    let section: SkillSectionName = "الكل";
    if (resolved !== null && SKILL_SECTION_NAMES.includes(resolved)) {
        section = resolved;
    } else {
        notes.push(messages().skillUnknownSection(requested, [...SKILL_SECTION_NAMES]));
    }
    const out: SkillOutput = {
        section,
        available_sections: [...SKILL_SECTION_NAMES],
        text: buildSkillSectionText(docs, section),
        notes,
    };
    return renderResponse(out, args.response_format, (data) =>
        data.notes.length
            ? `${data.notes.map((n) => `> ${n}`).join("\n")}\n\n${data.text}`
            : data.text,
    );
}
