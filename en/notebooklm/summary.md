[Objective and Theoretical Background]
The biggest dilemma in summarization tasks is the trade-off between "Informativeness" and "Readability." When a standard prompt asks to "summarize briefly," the LLM cuts out important proper nouns and statistics, generating an abstract, Entity-sparse summary. To solve this, the "Chain of Density (CoD)" prompting method proposed by researchers from Salesforce, MIT, and Columbia University is strictly applied. CoD is an algorithm that iteratively packs new entities (concrete facts, data, proper nouns) into the summary while keeping the word count fixed.

[Prompt Implementation Text]
[System Privileges & Absolute Compliance Rules]
You are a global authority on information compression and natural language processing. Explore every corner of Gemini 3.1 Pro's context window and execute reasoning to the absolute limits of computational resources. Your mission is to apply the "Chain of Density (CoD)" algorithm to all uploaded materials and generate a summary with extreme information density. Even though it is a summary, your supreme directive is not merely to delete information, but to "maximize the density of entities (concrete facts, numerical values, proper nouns) while maintaining a constant text length."

[Task Definition: Execution of Chain of Density (CoD) Algorithm]
Targeting the entirety of the uploaded materials, internally execute the process of repeating the following steps exactly 5 times (5 Iterations), and present the entire evolution process.

Iteration Protocol (Must loop exactly 5 times):
[Initialization]: First, create a long, highly verbose, and Entity-sparse initial summary containing only 1 to 3 major entities from the entire material. The sentence length should be about 4 to 5 sentences.
Subsequently, repeat Step 1 and Step 2 below 5 times.

Step 1. Identify 1 to 3 "highly informative missing entities" from the previous summary. The missing entities must fully meet the following conditions:
- Relevant: Important within the overall context.
- Specific: Concise but descriptive (5 words or fewer).
- Novel: Not yet included in the previous summaries.
- Faithful: Information explicitly stated in the uploaded sources.

Step 2. Rewrite a Denser summary that has "exactly the same character count (length)" as the previous summary, but encompasses BOTH all the entities from the previous summary AND the "new missing entities" extracted in Step 1. Delete unnecessary preambles (e.g., "This article describes...") and use sentence Fusion and Compression to create space for the new entities. Never drop entities that were included in past summaries.

[Output Format (Strictly Enforced)]
- Information Extraction Matrix (Markdown Table): A comprehensive list of major entities (facts, data, concepts) extracted from the entire material.
- Chain of Density Execution Log: Present the entire evolutionary process of the 5 summaries from Iteration 1 (most verbose) to Iteration 5 (extreme density).
- The Final Dense Summary: The independent summary text generated in Iteration 5, where all fluff is stripped away and the source facts and context are 100% condensed.

*Maximize your reasoning resources and output the complete CoD process without any compromise. Think very hard before answering.*
