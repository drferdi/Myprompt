// Drferdi Transformer Engine — Research Templates
import type { TemplateDefinition } from '@/types'

export const researchTemplates: TemplateDefinition[] = [
  {
    slug: 'literature-review',
    name: 'Literature Review',
    description:
      'Conduct comprehensive literature reviews on specific topics with structured analysis',
    category: 'RESEARCH',
    template: {
      role: 'Research analyst synthesizing peer-reviewed literature',
      taskStructure: `
1. Define search scope: topic boundaries, date range, document types
2. Identify key themes and dimensions
3. Analyze sources by methodology, findings, credibility
4. Synthesize patterns and identify gaps
5. Evaluate competing perspectives
6. Draw evidence-based conclusions
      `,
      cotGuidance: `
Consider:
- What are the seminal works in this field?
- How do methodologies compare across sources?
- Are there disagreements or conflicting findings?
- What represents emerging consensus?
- What research gaps exist?
      `,
      constraints: [
        'Base analysis on peer-reviewed sources only (academic journals, reputable conferences)',
        'Cite publication dates and source credibility levels',
        'Distinguish between empirical findings and opinion-based claims',
        'Note any conflicts of interest in sourced research',
        'Organize by themes, not chronologically',
      ],
      formatSpec: `
# Literature Review: [Topic]

## Executive Summary
[2-3 paragraph synthesis of key findings]

## Methodology
- Search terms used
- Date range covered
- Document types included
- Selection criteria

## Key Themes
### Theme 1: [Title]
[Synthesized findings from 3+ sources]

### Theme 2: [Title]
[Synthesized findings from 3+ sources]

## Methodological Analysis
- Common approaches
- Strengths/limitations
- Data limitations

## Research Gaps
[Identified gaps in current knowledge]

## Conclusions
[Evidence-based synthesis and future directions]

## References
[Structured citation list]
      `,
      qualityChecklist: [
        'Minimum 10 credible sources cited',
        'Sources span at least 3 years of recent research',
        'Conflicts and competing findings explicitly noted',
        'Personal opinions clearly separated from evidence',
        'Citations include author, year, and source type',
        'Synthesis shows understanding of topic progression',
      ],
    },
    variables: [
      {
        name: 'topic',
        description: 'Specific research topic or question',
        required: true,
      },
      {
        name: 'dateRange',
        description: 'Time period for literature search (e.g., "2020-2025")',
        required: false,
        defaultValue: 'Last 5 years',
      },
      {
        name: 'focusAreas',
        description: 'Specific aspects or dimensions to emphasize',
        required: false,
      },
    ],
  },
  {
    slug: 'research-proposal',
    name: 'Research Proposal',
    description:
      'Develop structured research proposals with clear objectives, methods, and feasibility',
    category: 'RESEARCH',
    template: {
      role: 'Research designer creating a defensible proposal',
      taskStructure: `
1. Articulate research question and significance
2. Position within existing literature
3. Define clear, measurable objectives
4. Design methodology (approach, participants, instruments)
5. Plan analysis and evaluation
6. Address feasibility and limitations
7. Outline timeline and resources
      `,
      cotGuidance: `
Think through:
- Why does this research matter? (significance)
- What is NOT yet known? (gap justification)
- Is the research question answerable? (feasibility)
- Are methods appropriate for the question?
- What could go wrong? (limitations)
- Can this be completed with available resources?
      `,
      constraints: [
        'Research question must be specific and answerable',
        'Proposed methods must be ethical and feasible',
        'Literature justification must reference recent sources',
        'Objectives must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
        'Timeline must be realistic and itemized',
      ],
      formatSpec: `
# Research Proposal: [Title]

## 1. Background & Significance
### Research Gap
[What is unknown or unresolved?]

### Current State
[Existing research landscape]

### Why It Matters
[Practical and theoretical implications]

## 2. Research Question & Objectives
### Primary Question
[Clear, specific research question]

### Secondary Questions
[Related questions, if any]

### Objectives
1. [SMART objective]
2. [SMART objective]
3. [SMART objective]

## 3. Literature Review Summary
[Synthesis of existing research and positioning]

## 4. Methodology
### Research Design
[Type of study: experimental, observational, qualitative, mixed]

### Participants/Sample
- Selection criteria
- Sample size justification
- Recruitment strategy

### Data Collection
[Instruments, procedures, timeline]

### Analysis Plan
[Statistical or qualitative analysis approach]

## 5. Feasibility & Risk Mitigation
### Resources Required
[Budget, personnel, equipment]

### Timeline
[Itemized project schedule]

### Potential Limitations
[Known constraints and how they'll be addressed]

## 6. Expected Outcomes
[Anticipated findings and applications]

## References
      `,
      qualityChecklist: [
        'Research question is specific and unambiguous',
        'Gap in literature is clearly justified',
        'Objectives are SMART and measurable',
        'Methodology is appropriate and feasible',
        'Timeline is realistic and itemized',
        'Ethical considerations addressed',
        'Resources needed are clearly identified',
      ],
    },
    variables: [
      {
        name: 'researchTitle',
        description: 'Title of the proposed research',
        required: true,
      },
      {
        name: 'discipline',
        description: 'Academic or research discipline',
        required: true,
      },
      {
        name: 'timeframe',
        description: 'Expected duration of research (e.g., "12 months")',
        required: false,
        defaultValue: '24 months',
      },
    ],
  },
  {
    slug: 'survey-design',
    name: 'Survey/Questionnaire Design',
    description:
      'Create valid, reliable survey instruments with proper question construction and validation',
    category: 'RESEARCH',
    template: {
      role: 'Survey methodologist designing reliable measurement instruments',
      taskStructure: `
1. Define constructs to be measured
2. Determine appropriate response formats
3. Draft questions ensuring clarity and avoid bias
4. Organize survey flow logically
5. Plan validation strategies
6. Create administration protocols
7. Plan analysis approach
      `,
      cotGuidance: `
Consider:
- What exactly are we measuring? (define constructs)
- Is each question clear to the target audience?
- Could questions be interpreted differently? (ambiguity check)
- Do questions have implicit assumptions?
- Is response format appropriate for question type?
- Could question order bias responses? (ordering effects)
- How will we validate the instrument?
      `,
      constraints: [
        'Each question must measure one construct only',
        'Questions must be clear and jargon-free for target audience',
        'Avoid leading questions, double-barreled questions, negative questions',
        'Response options must be mutually exclusive and exhaustive',
        'Include both positively and negatively worded items to detect acquiescence bias',
        'Specify informed consent and data protection procedures',
      ],
      formatSpec: `
# Survey Design: [Title]

## 1. Survey Purpose & Constructs
### Overall Objective
[What are we measuring?]

### Constructs to Measure
1. [Construct name] - Definition and operationalization
2. [Construct name] - Definition and operationalization

## 2. Target Population
- Inclusion criteria
- Exclusion criteria
- Expected sample size
- Sampling method

## 3. Survey Instrument
### Demographics
[Basic demographic questions]

### Section 1: [Construct Name]
Q1. [Question text]
Response format: [Scale/options]
Validation: [How validates construct]

Q2. [Question text]
Response format: [Scale/options]
Validation: [How validates construct]

[Continue for all questions]

## 4. Response Format Justification
[Explain chosen scales: Likert, ordinal, open-ended, etc.]

## 5. Question Quality Checklist
- [ ] Each question is clear and unambiguous
- [ ] No compound questions
- [ ] Avoiding loaded language
- [ ] Age-appropriate and accessible language
- [ ] Appropriate for target population literacy
- [ ] No negative phrasing except where intentional
- [ ] Response options are exhaustive and mutually exclusive

## 6. Administration Protocol
[How survey will be delivered and completed]

## 7. Data Analysis Plan
[How responses will be analyzed and validated]

## 8. Pilot Testing Plan
[How instrument will be tested before deployment]

## References
      `,
      qualityChecklist: [
        'Each question measures one construct',
        'Questions are clear, specific, and jargon-free',
        'No leading or biased language',
        'Response formats match question types',
        'Survey length appropriate (not excessive)',
        'Demographic questions minimize bias',
        'Pilot testing plan includes cognitive interviewing',
      ],
    },
    variables: [
      {
        name: 'surveyTopic',
        description: 'Topic or subject area of the survey',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Population being surveyed',
        required: true,
      },
      {
        name: 'responseFormat',
        description: 'Primary response type (Likert, open-ended, multiple choice, etc.)',
        required: false,
        defaultValue: '5-point Likert scale',
      },
    ],
  },
  {
    slug: 'hypothesis-testing',
    name: 'Hypothesis Formulation',
    description: 'Formulate testable, specific hypotheses grounded in theory and evidence',
    category: 'RESEARCH',
    template: {
      role: 'Researcher developing rigorous, testable hypotheses',
      taskStructure: `
1. Review theoretical framework
2. Identify relationships and mechanisms
3. Develop directional predictions
4. Specify null and alternative hypotheses
5. Define operationalization of variables
6. Plan statistical tests
7. Establish effect size expectations
      `,
      cotGuidance: `
Think through:
- What theory supports this prediction?
- What evidence suggests this relationship?
- Is the prediction directional or non-directional?
- Could alternative explanations account for results?
- What is the mechanism? (why, not just what)
- How will we measure each variable?
- What effect size is meaningful vs. trivial?
      `,
      constraints: [
        'Hypotheses must be testable and falsifiable',
        'Each hypothesis must be specific, not vague',
        'Must identify both null (H0) and alternative (H1) hypotheses',
        'Variables must be operationalized before testing',
        'Cannot test the same hypothesis multiple times on same dataset',
        'Must specify directionality (if theoretical basis supports it)',
      ],
      formatSpec: `
# Hypothesis Testing Framework: [Study Title]

## Theoretical Framework
[Underlying theory and mechanisms]

## Variable Definitions
### Independent Variable(s)
- Name: [Variable]
- Definition: [Conceptual]
- Operationalization: [How measured]
- Scale: [Type and values]

### Dependent Variable(s)
- Name: [Variable]
- Definition: [Conceptual]
- Operationalization: [How measured]
- Scale: [Type and values]

### Moderating/Mediating Variables
[If applicable]

## Hypotheses

### H1: [Primary Hypothesis]
- **H1**: [Directional prediction statement]
- **H0**: No relationship/difference exists
- **Rationale**: [Theory and evidence supporting]
- **Expected Effect Size**: [Small/medium/large with justification]
- **Statistical Test**: [t-test, ANOVA, correlation, etc.]
- **Alpha Level**: 0.05

### H2: [Secondary Hypothesis]
[Same structure as H1]

## Assumptions & Conditions
- Statistical assumptions for planned tests
- Conditions that must hold for valid interpretation
- Known limitations or boundary conditions

## Alternative Explanations
[What else could explain the predicted relationship?]

## Power Analysis
[Sample size needed to detect expected effect]

## References
      `,
      qualityChecklist: [
        'Each hypothesis is specific and testable',
        'Hypotheses are grounded in theory/evidence',
        'Both null and alternative hypotheses stated',
        'Variables are operationalized clearly',
        'Directionality justified by theory',
        'Expected effect sizes are reasonable',
        'Statistical tests are appropriate for hypotheses',
      ],
    },
    variables: [
      {
        name: 'studyTopic',
        description: 'Research topic or phenomenon',
        required: true,
      },
      {
        name: 'theoreticalFramework',
        description: 'Guiding theory or model',
        required: true,
      },
      {
        name: 'numberOfHypotheses',
        description: 'How many hypotheses to formulate',
        required: false,
        defaultValue: '2-3',
      },
    ],
  },
  {
    slug: 'case-study',
    name: 'Case Study Analysis',
    description: 'Develop in-depth case studies with rigorous data collection and analysis',
    category: 'RESEARCH',
    template: {
      role: 'Case study researcher providing in-depth contextual analysis',
      taskStructure: `
1. Select and justify the case(s)
2. Define case boundaries
3. Develop case study protocol
4. Conduct multiple data collection methods
5. Analyze within-case patterns
6. Compare across cases (if multiple)
7. Extract lessons and generalizable insights
      `,
      cotGuidance: `
Consider:
- Why is this case important or instructive?
- What are the case boundaries (time, space, people)?
- What multiple perspectives exist? (triangulation)
- What patterns emerge within the case?
- What is unique vs. generalizable?
- How do context and contingency matter?
- What is the story or narrative arc?
      `,
      constraints: [
        'Case selection must be justified (typical, extreme, critical, diverse, etc.)',
        'Use multiple data collection methods (triangulation)',
        'Define clear case boundaries',
        'Include perspectives from multiple stakeholders',
        'Distinguish between description, analysis, and interpretation',
        'Acknowledge researcher subjectivity and potential biases',
      ],
      formatSpec: `
# Case Study: [Case Name/Title]

## 1. Case Selection & Justification
### The Case
[What is being studied?]

### Why This Case?
[Theoretical, practical, or contextual justification]

### Case Boundaries
- Time period
- Geographic/organizational scope
- Key stakeholders

### Comparison Cases (if applicable)
[Other cases for comparison, with justification]

## 2. Theoretical Framework
[Concepts and theories guiding the analysis]

## 3. Data Collection Methods
### Primary Data Sources
1. [Method] - [participants/scope]
2. [Method] - [participants/scope]
3. [Method] - [participants/scope]

### Secondary Data Sources
[Documents, archival data, etc.]

### Data Collection Timeline
[When and how data was gathered]

## 4. Case Description
### Context
[Historical, organizational, social context]

### Key Events & Timeline
[Important developments or turning points]

### Main Actors & Stakeholders
[Who are the key people/groups?]

## 5. Within-Case Analysis
### Theme 1: [Analytic Theme]
[Evidence and interpretation]

### Theme 2: [Analytic Theme]
[Evidence and interpretation]

[Continue for all identified themes]

## 6. Cross-Case Analysis (if multiple cases)
[Comparisons, patterns, and contrasts]

## 7. Findings & Interpretations
### Key Findings
[What the case reveals]

### Insights for Theory
[How findings extend or challenge theory]

### Practical Implications
[Real-world applications]

## 8. Limitations & Reflexivity
[Constraints, researcher bias, positionality]

## 9. Conclusions
[Lessons and generalizable insights]

## References & Sources
      `,
      qualityChecklist: [
        'Case selection is clearly justified',
        'Multiple data sources provide triangulation',
        'Case boundaries are explicitly defined',
        'Multiple perspectives/stakeholders included',
        'Data analysis is systematic, not anecdotal',
        'Researcher reflexivity addressed',
        'Findings are grounded in evidence',
        'Generalizable insights extracted appropriately',
      ],
    },
    variables: [
      {
        name: 'caseSubject',
        description: 'What or who is the case study subject?',
        required: true,
      },
      {
        name: 'researchQuestion',
        description: 'What is the central research question?',
        required: true,
      },
      {
        name: 'caseCount',
        description: 'Number of cases (single or comparative)',
        required: false,
        defaultValue: 'Single',
      },
    ],
  },
  {
    slug: 'meta-analysis',
    name: 'Meta-Analysis Summary',
    description: 'Synthesize quantitative research findings through systematic meta-analysis',
    category: 'RESEARCH',
    template: {
      role: 'Meta-analyst synthesizing quantitative findings across studies',
      taskStructure: `
1. Define research question and inclusion criteria
2. Conduct systematic literature search
3. Screen and select studies for inclusion
4. Extract effect sizes and study characteristics
5. Assess study quality and publication bias
6. Calculate pooled effect sizes
7. Conduct subgroup and sensitivity analyses
8. Interpret heterogeneity
9. Draw evidence-based conclusions
      `,
      cotGuidance: `
Consider:
- Are studies comparable enough to combine?
- What is the direction and magnitude of effects?
- Why do effects vary across studies? (heterogeneity)
- Are there systematic biases in the literature?
- How strong is the overall evidence?
- What are the limits of generalizing findings?
- Are results clinically/practically significant?
      `,
      constraints: [
        'Search strategy must be exhaustive and reproducible',
        'Inclusion/exclusion criteria must be pre-specified',
        'Quality assessment tool must be validated',
        'Effect sizes must be standardized and comparable',
        'Publication bias must be assessed',
        'Heterogeneity must be explored and explained',
        'Results must be reported with confidence intervals',
      ],
      formatSpec: `
# Meta-Analysis: [Topic]

## 1. Objective & Research Question
[Specific, answerable research question]

## 2. Methods
### Inclusion Criteria
- Study design types
- Population characteristics
- Intervention/comparison specifications
- Outcome measures
- Time period covered

### Literature Search
- Databases searched
- Search terms and strategy
- Date range
- Number of studies identified and screened

### Study Selection
- Selection process and criteria
- Number of studies included in final analysis
- Reasons for exclusion

### Quality Assessment
[Tool used and scoring approach]

### Data Extraction
[Variables extracted from each study]

### Statistical Methods
- Effect size calculation
- Meta-analytic model (fixed vs. random)
- Heterogeneity assessment
- Subgroup analyses planned
- Sensitivity analyses planned

## 3. Results
### Study Characteristics
[Summary table of included studies]

### Quality Assessment Summary
[Range and distribution of quality scores]

### Primary Outcome Meta-Analysis
- **Overall Effect Size**: [95% CI]
- **I² Statistic**: [Heterogeneity measure]
- **p-value**: [Significance]
- **Interpretation**: [What this means]

### Subgroup Analyses
[Results by study characteristics, population, etc.]

### Sensitivity Analyses
[Results with quality studies only, different models, etc.]

### Publication Bias Assessment
[Funnel plot analysis, statistical tests]

## 4. Discussion
### Main Findings
[Summary of pooled effects and patterns]

### Heterogeneity Exploration
[Why do results vary across studies?]

### Quality of Evidence
[Strength of overall evidence]

### Limitations
[Publication bias, methodological issues]

### Clinical/Practical Significance
[Implications for practice or policy]

### Research Gaps
[What remains unknown]

## 5. Conclusions
[Evidence-based synthesis and future directions]

## References
[Complete list of included studies]
      `,
      qualityChecklist: [
        'Research question is specific and answerable',
        'Search strategy is systematic and reproducible',
        'Inclusion criteria are pre-specified and objective',
        'Quality assessment is standardized and reliable',
        'Effect sizes are standardized across studies',
        'Publication bias is assessed',
        'Heterogeneity is explored and explained',
        'Confidence intervals reported for all estimates',
        'Limitations explicitly acknowledged',
      ],
    },
    variables: [
      {
        name: 'researchTopic',
        description: 'Topic for meta-analysis',
        required: true,
      },
      {
        name: 'outcomeOfInterest',
        description: 'Primary outcome measure(s)',
        required: true,
      },
      {
        name: 'studyTypes',
        description: 'Types of studies to include',
        required: false,
        defaultValue: 'Randomized controlled trials',
      },
    ],
  },
  {
    slug: 'fact-check',
    name: 'Fact-Checking & Verification',
    description: 'Systematically verify claims with evidence-based fact-checking methodology',
    category: 'RESEARCH',
    template: {
      role: 'Fact-checker verifying claims against authoritative sources',
      taskStructure: `
1. Identify specific claims to verify
2. Determine factual vs. interpretive components
3. Search authoritative primary sources
4. Compare claim against evidence
5. Assess evidence quality and consistency
6. Note context and nuance
7. Rate confidence level in finding
8. Document sources and methodology
      `,
      cotGuidance: `
Consider:
- What is the specific factual claim?
- Is this a factual claim or an opinion?
- What are authoritative sources for this claim?
- How recent are the sources?
- Are sources primary, secondary, or tertiary?
- What is the full context of the claim?
- Are there legitimate disagreements?
- What is the confidence level in conclusion?
      `,
      constraints: [
        'Distinguish between factual claims and opinions/interpretations',
        'Use authoritative, credible sources (peer-reviewed, official, expert consensus)',
        'Note dates: when was claim made vs. when was evidence gathered?',
        'Check multiple independent sources for consistency',
        'Identify conflicting evidence, not just supporting evidence',
        'State confidence level explicitly',
        'Include full context - not just partial truth',
      ],
      formatSpec: `
# Fact-Check: [Claim or Topic]

## 1. Claim Identification
### Original Claim
[Exact quote and source of claim]

### Context
[Where was this claim made? When? By whom?]

### Claim Type
[ ] Factual (verifiable as true/false)
[ ] Mixed (contains both facts and interpretation)
[ ] Opinion/Interpretation

## 2. Key Components to Verify
[Break down multi-part claims]

### Component 1: [Specific factual claim]
- Claim type: [Factual/statistical/attributive/etc.]
- Interpretation: [What would verify this?]

### Component 2: [Specific factual claim]
- Claim type: [Factual/statistical/attributive/etc.]
- Interpretation: [What would verify this?]

## 3. Evidence Search
### Primary Sources
- [Source] → Finding: [Relevant evidence]
- [Source] → Finding: [Relevant evidence]

### Secondary Sources
- [Source] → Finding: [Relevant evidence]

### Expert/Official Sources
- [Source] → Finding: [Relevant evidence]

## 4. Verification Results
### Component 1: [Claim]
- **Finding**: [TRUE / PARTIALLY TRUE / FALSE / UNCLEAR]
- **Evidence**: [What the sources say]
- **Confidence Level**: [HIGH / MEDIUM / LOW]
- **Context**: [Full context affecting interpretation]

### Component 2: [Claim]
[Same structure]

## 5. Overall Assessment
- **Primary Claim**: [TRUE / PARTIALLY TRUE / FALSE / MISLEADING / UNCLEAR]
- **Overall Confidence**: [HIGH / MEDIUM / LOW]
- **Key Caveat**: [Important limitations or context]

## 6. Sources & Methodology
### Search Strategy
[How were sources found?]

### Source Credibility Assessment
[How authoritative are the sources?]

### Date Notes
[When was claim made? When was evidence gathered?]

## 7. Conclusion & Explanation
[Plain language summary of findings]

## References
[Full citations of all sources checked]
      `,
      qualityChecklist: [
        'Claim is clearly identified and quoted exactly',
        'Distinction made between factual claims and opinions',
        'Multiple authoritative sources consulted',
        'Primary sources prioritized when possible',
        'Conflicting evidence noted, not ignored',
        'Full context provided',
        'Confidence level explicitly stated',
        'Methodology transparent and reproducible',
        'Limitations acknowledged',
      ],
    },
    variables: [
      {
        name: 'claimOrTopic',
        description: 'The claim or topic to fact-check',
        required: true,
      },
      {
        name: 'sourceOfClaim',
        description: 'Where the claim originated',
        required: false,
      },
      {
        name: 'claimDate',
        description: 'When was the claim made?',
        required: false,
      },
    ],
  },
  {
    slug: 'interview-guide',
    name: 'Research Interview Design',
    description:
      'Design structured interview guides for qualitative research with rapport-building, core questions, and probes.',
    category: 'RESEARCH',
    template: {
      role: 'Qualitative Research Methodologist',
      taskStructure: `
1. Define research objectives and what you need to learn
2. Design opening rapport-building questions
3. Develop core interview questions organized by theme
4. Create follow-up probes for deeper exploration
5. Plan transition phrases between topics
6. Design closing questions and wrap-up protocol
7. Include ethical considerations and informed consent
      `.trim(),
      cotGuidance: `
Consider:
- What do I need to learn that I can't get from surveys?
- Are questions open-ended enough to elicit rich responses?
- What order minimizes bias and builds comfort?
- Where might participants give surface-level answers?
- How do I handle sensitive topics respectfully?
      `.trim(),
      constraints: [
        'All core questions must be open-ended',
        'Include 2-3 follow-up probes per core question',
        'Organize questions by theme, not difficulty',
        'Include estimated timing per section',
        'Avoid leading or loaded questions',
        'Include ethical safeguards and consent protocol',
      ],
      formatSpec:
        'Interview Guide with: Research Objectives, Participant Criteria, Consent Script, Warm-Up Questions, Core Question Blocks (by theme with probes), Transition Phrases, Closing Questions, Debrief Notes, Estimated Total Duration',
      qualityChecklist: [
        'Questions are open-ended and non-leading',
        'Follow-up probes dig deeper meaningfully',
        'Flow builds rapport before sensitive topics',
        'Timing is realistic for planned duration',
        'Ethical considerations are addressed',
        'Questions directly serve research objectives',
      ],
    },
    variables: [
      {
        name: 'researchObjective',
        description: 'Primary research question or objective',
        required: true,
      },
      { name: 'participantProfile', description: 'Who will be interviewed', required: true },
      {
        name: 'duration',
        description: 'Interview duration',
        required: false,
        defaultValue: '45-60 minutes',
      },
      {
        name: 'sensitiveTopics',
        description: 'Any sensitive areas to handle carefully',
        required: false,
      },
    ],
  },
  {
    slug: 'data-collection',
    name: 'Data Collection Methodology',
    description:
      'Design rigorous data collection plans with sampling strategies, instruments, and quality controls.',
    category: 'RESEARCH',
    template: {
      role: 'Research Methodologist and Data Scientist',
      taskStructure: `
1. Define research questions and required data
2. Select appropriate methodology (qualitative, quantitative, mixed)
3. Design sampling strategy and determine sample size
4. Develop data collection instruments
5. Plan data quality controls and validation
6. Address ethical and privacy considerations
7. Create data management and storage protocol
      `.trim(),
      cotGuidance: `
Consider:
- What data do I actually need to answer the research question?
- Is my sampling strategy representative and feasible?
- How do I minimize bias in data collection?
- What could go wrong and how do I mitigate it?
- Is my sample size sufficient for statistical power?
      `.trim(),
      constraints: [
        'Justify methodology choice with rationale',
        'Include sample size calculation or justification',
        'Address potential biases and mitigation strategies',
        'Include data quality validation procedures',
        'Specify data storage and privacy protocols',
        'Provide realistic timeline and resource estimates',
      ],
      formatSpec:
        'Data Collection Plan with: Research Questions, Methodology Justification, Sampling Strategy, Sample Size Rationale, Instruments/Tools, Collection Procedures, Quality Controls, Bias Mitigation, Ethics & Privacy, Data Management Plan, Timeline, Resource Requirements',
      qualityChecklist: [
        'Methodology is appropriate for research questions',
        'Sampling strategy is representative and justified',
        'Instruments are validated or pilot-tested',
        'Quality controls are specific and measurable',
        'Ethical considerations are thoroughly addressed',
        'Timeline is realistic and includes contingencies',
      ],
    },
    variables: [
      { name: 'researchQuestion', description: 'Primary research question(s)', required: true },
      { name: 'population', description: 'Target population for study', required: true },
      {
        name: 'methodology',
        description: 'Preferred methodology (quantitative, qualitative, mixed)',
        required: false,
        defaultValue: 'mixed methods',
      },
      { name: 'constraints', description: 'Budget, time, or access constraints', required: false },
    ],
  },
  {
    slug: 'policy-brief',
    name: 'Policy Research Brief',
    description:
      'Write concise policy briefs that summarize research, present evidence-based options, and recommend action.',
    category: 'RESEARCH',
    template: {
      role: 'Policy Analyst and Research Communicator',
      taskStructure: `
1. Define the policy issue and its urgency
2. Summarize the current situation and evidence
3. Analyze 2-3 policy options with pros/cons
4. Present the recommended approach with justification
5. Outline implementation considerations
6. Address political and practical feasibility
7. Provide a clear call to action
      `.trim(),
      cotGuidance: `
Consider:
- What does the decision-maker need to know RIGHT NOW?
- What evidence is most compelling for this audience?
- Are the policy options genuinely distinct?
- What are the political realities that affect feasibility?
- How do I make complex evidence accessible?
      `.trim(),
      constraints: [
        'Keep to 2-4 pages maximum',
        'Lead with the recommendation, not the background',
        'Support all claims with evidence and citations',
        'Present at least 2 genuine policy alternatives',
        'Address implementation feasibility honestly',
        'Write for decision-makers, not researchers',
      ],
      formatSpec:
        'Policy Brief with: Title, Executive Summary (1 paragraph), Issue Statement, Background & Evidence, Policy Options (2-3 with analysis), Recommended Option, Implementation Plan, Cost Estimate, Stakeholder Impact, References',
      qualityChecklist: [
        'Recommendation is clear and prominent',
        'Evidence is credible and properly cited',
        'Policy options are genuinely distinct',
        'Pros and cons are balanced and honest',
        'Implementation challenges are addressed',
        'Language is accessible to non-specialists',
      ],
    },
    variables: [
      { name: 'policyIssue', description: 'The policy issue or question', required: true },
      { name: 'audience', description: 'Decision-maker audience', required: true },
      { name: 'evidence', description: 'Key evidence or research to draw from', required: false },
      { name: 'jurisdiction', description: 'Geographic/institutional context', required: false },
    ],
  },
  {
    slug: 'technology-assessment',
    name: 'Technology Evaluation & Comparison',
    description:
      'Evaluate and compare technologies, tools, or platforms with structured criteria and evidence-based recommendations.',
    category: 'RESEARCH',
    template: {
      role: 'Technology Analyst and Solutions Architect',
      taskStructure: `
1. Define evaluation criteria and weighting
2. Research each technology candidate thoroughly
3. Assess against criteria with evidence
4. Compare capabilities, limitations, and trade-offs
5. Analyze total cost of ownership
6. Evaluate ecosystem, community, and longevity
7. Provide a clear recommendation with rationale
      `.trim(),
      cotGuidance: `
Consider:
- What are the must-have vs nice-to-have requirements?
- How mature is each technology?
- What is the real total cost (licensing, training, migration)?
- What does the community and ecosystem look like?
- What would migration or switching cost?
      `.trim(),
      constraints: [
        'Define evaluation criteria before assessing options',
        'Use consistent scoring across all candidates',
        'Include total cost of ownership, not just licensing',
        'Assess maturity, community, and long-term viability',
        'Include practical trade-offs, not just feature lists',
        'Test claims against real-world usage and benchmarks',
      ],
      formatSpec:
        'Technology Assessment with: Evaluation Context, Requirements Matrix (must-have/nice-to-have), Candidate Overview, Feature Comparison Table, Scoring Matrix (weighted), TCO Analysis, Risk Assessment per Option, Community & Ecosystem Analysis, Migration Considerations, Recommendation with Rationale',
      qualityChecklist: [
        'Evaluation criteria are defined and weighted',
        'All candidates are assessed against same criteria',
        'Scoring is justified with evidence',
        'TCO includes hidden costs (training, migration, support)',
        'Ecosystem and community health are evaluated',
        'Recommendation is clearly supported by the analysis',
      ],
    },
    variables: [
      { name: 'useCase', description: 'What the technology will be used for', required: true },
      {
        name: 'candidates',
        description: 'Technologies to compare (e.g., "React vs Vue vs Svelte")',
        required: true,
      },
      { name: 'requirements', description: 'Key requirements and constraints', required: true },
      { name: 'teamContext', description: 'Team size, expertise, existing stack', required: false },
    ],
  },
]
