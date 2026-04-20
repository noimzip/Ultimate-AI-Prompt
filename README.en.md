# Ultimate AI Prompt (English)

This repository is a curated prompt collection for LLM workflows.  
Prompts are organized by language (`en/`, `ja/`) and by use case (`gem/`, `notebooklm/`).

## Structure

| Directory | Description |
| --- | --- |
| `en/gem` | High-intensity prompts for deep research, business analysis, and roleplay (English) |
| `en/notebooklm` | Learning-focused prompts for summarization, preparation, exam prediction, and note review (English) |
| `ja/gem` | Japanese counterparts of `en/gem` |
| `ja/notebooklm` | Japanese counterparts of `en/notebooklm` |

## Prompt Catalog (All 22 Files)

The table below is organized by topic pair: one English file + one Japanese file per row (11 topics = 22 files total).

| Topic | English file | Japanese file | Summary |
| --- | --- | --- | --- |
| Business analysis (VC/PO/Risk) | `en/gem/highest-business-analysis.md` | `ja/gem/highest-business-analysis.md` | Multi-perspective business evaluation using VC, product leader, and risk analyst roles through critique, debate, and integrated strategy. |
| Roleplay-focused | `en/gem/rule-bending-roleplay.md` | `ja/gem/rule-bending-roleplay.md` | Immersion-first, long-form roleplay prompt with strong stylistic constraints. |
| Highest-precision deep research | `en/gem/highest-precision-deep-research.md` | `ja/gem/highest-precision-deep-research.md` | Primary-source-first research prompt with recursive self-critique and verification loops. |
| Gemini ultra high-load thinking | `en/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | `ja/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | Research protocol emphasizing large context usage, iterative search, and strict evidence handling. |
| Claude persona prompt | `en/gem/gemlaude-sonnet-4.6.md` | `ja/gem/gemlaude-sonnet-4.6.md` | Identity and response-style rules for acting as Claude Sonnet 4.6. |
| Next-class preparation | `en/notebooklm/preparation.md` | `ja/notebooklm/preparation.md` | Predicts upcoming lecture topics from prior materials and builds a prep guide. |
| Dense summarization (CoD) | `en/notebooklm/summary.md` | `ja/notebooklm/summary.md` | Applies Chain of Density to maximize entity density while preserving summary length. |
| Notebook quality review | `en/notebooklm/notebook-review.md` | `ja/notebooklm/notebook-review.md` | Evaluates notes with Cornell-style rubrics and provides actionable improvements. |
| Exam question prediction | `en/notebooklm/predicting-exam-questions.md` | `ja/notebooklm/predicting-exam-questions.md` | Generates Bloom-taxonomy-based predicted questions, mock exams, and model answers. |
| Explain for elementary student (Feynman) | `en/notebooklm/elementary-school-student-can-understand.md` | `ja/notebooklm/elementary-school-student-can-understand.md` | Rewrites complex concepts into child-friendly explanations with concrete analogies. |
| Study priority planning | `en/notebooklm/determining-study-priorities.md` | `ja/notebooklm/determining-study-priorities.md` | Prioritizes study topics using importance, difficulty, and exam-probability scoring. |

## How to Use

1. Open the prompt file that matches your objective.  
2. Paste it as a system instruction / primary prompt in your target model.  
3. Add your specific theme and input materials (notes, PDFs, assignments, etc.).  

## Cautions

- Some prompts explicitly push for **very large output** and include wording that attempts to weaken or bypass standard safety constraints. Use them in compliance with platform policy, law, and your internal governance.  
- A few files in `ja/notebooklm` use compressed line formatting, but they still map to the same core topics as their English counterparts.  
