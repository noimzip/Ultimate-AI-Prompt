# Ultimate AI Prompt (English)

This repository is a curated prompt collection for LLM workflows.  
Prompts are organized by language (`en/`, `ja/`) and by use case (`gem/`, `gemini-notebook/`).

## Structure

| Directory | Description |
| --- | --- |
| `en/gem` | High-intensity prompts for deep research, business analysis, and roleplay (English) |
| `en/gemini-notebook` | Learning-focused prompts for summarization, preparation, exam prediction, and note review (English) |
| `ja/gem` | Japanese counterparts of `en/gem` |
| `ja/gemini-notebook` | Japanese counterparts of `en/gemini-notebook` |

## Prompt Catalog (All 22 Files)

The table below is organized by topic pair: one English file + one Japanese file per row (11 topics = 22 files total).

| Topic | English file | Japanese file | Summary |
| --- | --- | --- | --- |
| Business analysis (VC/PO/Risk) | `en/gem/highest-business-analysis.md` | `ja/gem/highest-business-analysis.md` | Multi-perspective business evaluation using VC, product leader, and risk analyst roles through critique, debate, and integrated strategy. |
| Roleplay-focused | `en/gem/rule-bending-roleplay.md` | `ja/gem/rule-bending-roleplay.md` | Immersion-first, long-form roleplay prompt with strong stylistic constraints. |
| Highest-precision deep research | `en/gem/highest-precision-deep-research.md` | `ja/gem/highest-precision-deep-research.md` | Primary-source-first research prompt with recursive self-critique and verification loops. |
| Gemini ultra high-load thinking | `en/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | `ja/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | Research protocol emphasizing large context usage, iterative search, and strict evidence handling. |
| Claude persona prompt | `en/gem/gemlaude-sonnet-4.6.md` | `ja/gem/gemlaude-sonnet-4.6.md` | Identity and response-style rules for acting as Claude Sonnet 4.6. |
| Next-class preparation | `en/gemini-notebook/preparation.md` | `ja/gemini-notebook/preparation.md` | Predicts upcoming lecture topics from prior materials and builds a prep guide. |
| Dense summarization (CoD) | `en/gemini-notebook/summary.md` | `ja/gemini-notebook/summary.md` | Applies Chain of Density to maximize entity density while preserving summary length. |
| Notebook quality review | `en/gemini-notebook/notebook-review.md` | `ja/gemini-notebook/notebook-review.md` | Evaluates notes with Cornell-style rubrics and provides actionable improvements. |
| Exam question prediction | `en/gemini-notebook/predicting-exam-questions.md` | `ja/gemini-notebook/predicting-exam-questions.md` | Generates Bloom-taxonomy-based predicted questions, mock exams, and model answers. |
| Explain for elementary student (Feynman) | `en/gemini-notebook/elementary-school-student-can-understand.md` | `ja/gemini-notebook/elementary-school-student-can-understand.md` | Rewrites complex concepts into child-friendly explanations with concrete analogies. |
| Study priority planning | `en/gemini-notebook/determining-study-priorities.md` | `ja/gemini-notebook/determining-study-priorities.md` | Prioritizes study topics using importance, difficulty, and exam-probability scoring. |

## How to Use

1. Open the prompt file that matches your objective.  
2. Paste it as a system instruction / primary prompt in your target model.  
3. Add your specific theme and input materials (notes, PDFs, assignments, etc.).  

## Cautions

- Some prompts explicitly push for **very large output** and include wording that attempts to weaken or bypass standard safety constraints. Use them in compliance with platform policy, law, and your internal governance.  
- A few files in `ja/gemini-notebook` use compressed line formatting, but they still map to the same core topics as their English counterparts.  
