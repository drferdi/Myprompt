// Drferdi Transformer Engine V2 — Analysis Templates
import type { TemplateDefinition } from '@/types'

export const analysisTemplates: TemplateDefinition[] = [
  {
    slug: 'data-analysis',
    name: 'Data Analysis Report',
    description:
      'Comprehensive data analysis with statistical insights and actionable recommendations.',
    category: 'ANALYSIS',
    template: {
      role: 'Data Analyst',
      taskStructure: `
1. Data Overview: Summarize dataset characteristics (size, variables, time period)
2. Exploratory Analysis: Identify patterns, distributions, outliers
3. Statistical Summary: Key metrics (mean, median, std dev, correlations)
4. Visualization Recommendations: Suggest chart types and visual approaches
5. Key Findings: Highlight 3-5 most important insights
6. Recommendations: Actionable next steps based on analysis
      `.trim(),
      cotGuidance: `
Think through:
- What story does this data tell?
- Are there hidden patterns or correlations?
- What are the limitations and caveats?
- What follow-up analysis would be valuable?
- How would a business stakeholder interpret this?
      `.trim(),
      constraints: [
        'Use accessible language for non-technical audiences',
        'Include statistical confidence levels and caveats',
        'Avoid over-interpretation of correlations',
        'Reference data sources explicitly',
        'Highlight data quality issues if present',
      ],
      formatSpec: `
# Data Analysis Report

## Executive Summary
[2-3 sentences on key findings]

## Dataset Overview
- Size: [rows/records]
- Variables: [count and types]
- Time Period: [if applicable]
- Data Quality: [issues, missing values]

## Key Findings
1. [Finding with metric]
2. [Finding with metric]
3. [Finding with metric]

## Statistical Summary
[Table or structured list with key statistics]

## Visualization Recommendations
- [Chart type 1: Purpose and insight]
- [Chart type 2: Purpose and insight]

## Limitations & Caveats
- [Important caveat 1]
- [Important caveat 2]

## Recommendations
1. [Actionable step 1]
2. [Actionable step 2]
3. [Actionable step 3]
      `.trim(),
      qualityChecklist: [
        'All claims supported by specific data points',
        'Statistical measures include confidence intervals',
        'Limitations and biases clearly stated',
        'Recommendations directly tied to findings',
        'No jargon without explanation',
        'Visual recommendations are specific and justified',
      ],
    },
    variables: [
      {
        name: 'datasetDescription',
        description: 'What data are we analyzing? (source, type, context)',
        required: true,
      },
      {
        name: 'analysisObjective',
        description: 'What questions or hypotheses are we testing?',
        required: true,
      },
      {
        name: 'audienceLevel',
        description: 'Technical expertise of audience (executive/analyst/technical)',
        required: false,
        defaultValue: 'analyst',
      },
      {
        name: 'keyMetrics',
        description: 'Specific metrics or KPIs to focus on',
        required: false,
      },
    ],
  },
  {
    slug: 'competitive-analysis',
    name: 'Competitive Analysis',
    description:
      'Strategic competitive landscape assessment with differentiation and positioning insights.',
    category: 'ANALYSIS',
    template: {
      role: 'Market Strategist',
      taskStructure: `
1. Competitive Landscape: Map 3-5 key competitors
2. Feature Comparison: Create comparison matrix across features/capabilities
3. Strengths & Weaknesses: Analyze each competitor's positioning
4. Market Gaps: Identify underserved segments or needs
5. Differentiation: Outline unique value proposition vs competitors
6. Strategic Recommendations: Suggest market positioning and tactics
      `.trim(),
      cotGuidance: `
Consider:
- Who are the *actual* direct competitors vs adjacent players?
- What are hidden strengths and weaknesses?
- Which customer segments do competitors serve best?
- Where is the market moving?
- What is defensible vs easily replicated?
- What would a competitor do in response to your strategy?
      `.trim(),
      constraints: [
        'Base analysis on publicly available information only',
        'Avoid unsubstantiated claims about competitors',
        'Distinguish between features and benefits',
        'Consider pricing, go-to-market, and ecosystem strategy',
        'Identify both direct and indirect competitors',
      ],
      formatSpec: `
# Competitive Analysis

## Executive Summary
[Key competitive insights and strategic implications]

## Competitive Landscape
[Overview of 3-5 key competitors with brief positioning]

## Feature Comparison Matrix
| Feature | Competitor A | Competitor B | Us |
|---------|-------------|-------------|-----|
| [Feature 1] | ✓ | ✓ | ✓ |
| [Feature 2] | ✓ | ✗ | ✓ |

## Competitor Profiles
### Competitor A
- **Strengths:** [Key strengths]
- **Weaknesses:** [Key gaps]
- **Target Market:** [Primary customers]
- **Positioning:** [Market positioning]

### [Repeat for each competitor]

## Market Gaps & Opportunities
1. [Underserved segment or need]
2. [Feature gap competitors are missing]
3. [Service/experience improvement opportunity]

## Our Differentiation
- **Unique Value Proposition:** [Clear, concise differentiation]
- **Defensible Advantages:** [Hard-to-replicate strengths]
- **Target Advantage:** [Where we win most]

## Strategic Recommendations
1. [Positioning recommendation]
2. [Feature/product recommendation]
3. [Go-to-market recommendation]
      `.trim(),
      qualityChecklist: [
        'Analysis covers both direct and indirect competitors',
        'Feature comparison is objective and verifiable',
        'Opportunities are specific and actionable',
        'Differentiation is realistic and defensible',
        'Recommendations consider competitive responses',
        'Market sizing context is provided where relevant',
      ],
    },
    variables: [
      {
        name: 'industry',
        description: 'What industry or market are we analyzing?',
        required: true,
      },
      {
        name: 'ourProduct',
        description: 'Brief description of our product/service',
        required: true,
      },
      {
        name: 'competitors',
        description: 'Specific competitors to analyze (names or list)',
        required: false,
      },
      {
        name: 'geographicScope',
        description: 'Geographic markets to consider (local/regional/global)',
        required: false,
        defaultValue: 'global',
      },
    ],
  },
  {
    slug: 'swot-analysis',
    name: 'SWOT Analysis',
    description:
      'Strategic SWOT assessment identifying internal strengths/weaknesses and external opportunities/threats.',
    category: 'ANALYSIS',
    template: {
      role: 'Strategic Analyst',
      taskStructure: `
1. Strengths: Internal capabilities and competitive advantages
2. Weaknesses: Internal limitations and areas for improvement
3. Opportunities: External trends and potential growth areas
4. Threats: External risks and market challenges
5. Strategic Implications: What does this SWOT suggest?
6. Action Items: Specific initiatives leveraging strengths and addressing gaps
      `.trim(),
      cotGuidance: `
Remember:
- Strengths/Weaknesses are INTERNAL (within your control)
- Opportunities/Threats are EXTERNAL (market conditions)
- Be honest about weaknesses; they're not failures
- Opportunities should be realistic, not wishful
- Consider both obvious and non-obvious factors
- Think about how competitors would rate your strengths
      `.trim(),
      constraints: [
        'Distinguish internal factors (SW) from external (OT)',
        'Avoid generic or obvious statements',
        'Be specific and evidence-based',
        'Consider time horizons (short-term vs long-term)',
        'Acknowledge competitive perspective',
      ],
      formatSpec: `
# SWOT Analysis

## Strengths
### Internal Capabilities
1. [Specific strength with brief justification]
2. [Specific strength with brief justification]
3. [Specific strength with brief justification]

### Competitive Advantages
1. [Advantage we have that competitors lack]
2. [Another defensible advantage]

## Weaknesses
### Internal Limitations
1. [Specific weakness with context]
2. [Specific weakness with context]
3. [Specific weakness with context]

### Resource Gaps
1. [Gap or constraint]
2. [Gap or constraint]

## Opportunities
### Market Trends
1. [Trend we can leverage]
2. [Emerging need we can serve]

### Strategic Opportunities
1. [Specific growth opportunity]
2. [Partnership or expansion opportunity]
3. [Market segment or geography to enter]

## Threats
### Market Risks
1. [External threat with potential impact]
2. [Competitive threat]
3. [Regulatory or economic risk]

### Emerging Challenges
1. [Technology disruption risk]
2. [Market shift risk]

## Strategic Implications
[Summary of what the SWOT means strategically - 3-4 key insights]

## Recommended Actions
1. [Leverage strength S1 for opportunity O1]
2. [Mitigate weakness W1]
3. [Prepare for threat T1]
4. [Build new capability to capture O2]
      `.trim(),
      qualityChecklist: [
        'Strengths and weaknesses are genuinely internal',
        'Opportunities and threats are genuinely external',
        'Each item is specific and evidence-based',
        'Strategic implications connect SWOT to action',
        'Action items are realistic and prioritized',
        'Analysis is honest about weaknesses',
      ],
    },
    variables: [
      {
        name: 'subject',
        description: 'What are we doing SWOT analysis on? (company, product, initiative)',
        required: true,
      },
      {
        name: 'timeframe',
        description: 'Analysis timeframe (next 1 year, 3 years, 5 years)',
        required: false,
        defaultValue: '1-3 years',
      },
      {
        name: 'context',
        description: 'Brief context or recent changes to consider',
        required: false,
      },
    ],
  },
  {
    slug: 'trend-analysis',
    name: 'Trend Analysis & Forecasting',
    description: 'Identify trends, project future trajectories, and assess strategic implications.',
    category: 'ANALYSIS',
    template: {
      role: 'Trend Analyst',
      taskStructure: `
1. Historical Context: Review past data and trends (3-5 years if available)
2. Current Trajectory: Identify growth/decline rates and inflection points
3. Drivers: Understand *why* the trend is happening
4. Extrapolation: Project forward 1, 3, and 5 years
5. Scenarios: Best-case, base-case, worst-case projections
6. Implications: What does this mean for strategy/operations?
      `.trim(),
      cotGuidance: `
Think critically:
- Is this a temporary fluctuation or a genuine trend shift?
- What external factors are driving this trend?
- Are there leading indicators we should watch?
- What could reverse or accelerate this trend?
- How certain are we about the extrapolation?
- What would surprise us most?
      `.trim(),
      constraints: [
        'Distinguish trends from noise/cyclical variation',
        'Clearly state assumptions for projections',
        'Provide confidence ranges, not point estimates',
        'Consider discontinuities and black swans',
        'Identify key leading indicators',
        'Avoid over-extrapolation beyond data support',
      ],
      formatSpec: `
# Trend Analysis & Forecasting

## Executive Summary
[Key trend, trajectory, and strategic implications in 2-3 sentences]

## Historical Data & Patterns
[Review of past 3-5 years with any relevant metrics/growth rates]

| Period | Metric | Value | Change |
|--------|--------|-------|--------|
| [Year 1] | [Metric] | [Value] | — |
| [Year 2] | [Metric] | [Value] | [+X%] |

## Trend Drivers
1. [Primary driver with explanation]
2. [Secondary driver]
3. [Tertiary factor]

## Current Trajectory
- **Growth/Change Rate:** [X% annually or trend description]
- **Recent Inflection Points:** [Any accelerations or reversals]
- **Momentum Assessment:** [Accelerating/stable/decelerating]

## Forward Projections

### Base Case (Most Likely)
[Assumptions and projection for 1-year, 3-year, 5-year horizons]

### Upside Scenario (Best Case)
[Scenario and drivers if trend accelerates]

### Downside Scenario (Worst Case)
[Scenario and triggers if trend reverses]

## Confidence & Uncertainty
- **Data Quality:** [Assessment of input data reliability]
- **Confidence Range:** [e.g., 60-80% confidence in base case]
- **Key Uncertainties:** [Major unknowns affecting projection]

## Key Indicators to Watch
1. [Metric or signal to monitor]
2. [Leading indicator of trend shift]
3. [Warning sign of reversal]

## Strategic Implications & Recommendations
1. [Implication for strategy/business]
2. [Recommended actions or preparations]
3. [Resource or investment implications]
      `.trim(),
      qualityChecklist: [
        'Historical data and sources are clearly stated',
        'Trend drivers are identified and explained',
        'Projections include explicit assumptions',
        'Confidence ranges are realistic and stated',
        'Scenarios cover meaningful variance',
        'Key indicators for monitoring are specific',
        'Implications are strategic, not just descriptive',
      ],
    },
    variables: [
      {
        name: 'trendArea',
        description: 'What trend are we analyzing? (market, technology, behavior, etc)',
        required: true,
      },
      {
        name: 'historicalData',
        description: 'Any specific data points or metrics to analyze',
        required: false,
      },
      {
        name: 'timeHorizon',
        description: 'How far forward to project (1/3/5 years)',
        required: false,
        defaultValue: '3 years',
      },
      {
        name: 'context',
        description: 'Relevant context or constraints on the analysis',
        required: false,
      },
    ],
  },
  {
    slug: 'root-cause',
    name: 'Root Cause Analysis',
    description: 'Systematic investigation to identify underlying causes of problems.',
    category: 'ANALYSIS',
    template: {
      role: 'Systems Analyst',
      taskStructure: `
1. Problem Definition: State the problem clearly and specifically
2. Symptom vs. Root: Distinguish surface symptoms from underlying causes
3. Why Analysis: Ask "why" 4-5 times to dig deeper
4. Contributing Factors: Map all factors (human, process, system, environment)
5. Root Cause: Identify the fundamental underlying cause(s)
6. Validation: How would we confirm this is the real root cause?
7. Solutions: Recommend changes to address root cause, not symptoms
      `.trim(),
      cotGuidance: `
Approach systematically:
- What is the actual problem, not the symptom?
- Are there multiple root causes?
- What assumptions are we making?
- What would someone see if they observed the system?
- What changed right before the problem appeared?
- How would we prevent this from happening again?
- What's the simplest explanation?
      `.trim(),
      constraints: [
        'Distinguish root causes from symptoms',
        'Go beyond blame; focus on systems and processes',
        'Consider multiple contributing factors',
        'Be specific; avoid vague generalizations',
        'Validate assumptions with evidence',
        'Recommend preventive, not just corrective, actions',
      ],
      formatSpec: `
# Root Cause Analysis

## Problem Statement
[Clear, specific description of the problem - not symptoms]

## Impact
- **Scope:** [Who/what is affected]
- **Severity:** [Business impact]
- **Timeline:** [When did it start, duration]

## Symptoms vs. Root Cause
**Observed Symptoms:**
1. [Symptom 1]
2. [Symptom 2]

**What These Symptoms Tell Us:**
[Initial observations about underlying issues]

## Why Analysis (5 Whys)
1. Why did [symptom] occur? → [Initial answer]
2. Why did [previous answer]? → [Deeper answer]
3. Why did [previous answer]? → [Even deeper]
4. Why did [previous answer]? → [Getting to root]
5. Why did [previous answer]? → [Root cause candidate]

## Contributing Factors
### Human Factors
- [Specific human-related contributing factor]
- [Training or communication gap]

### Process Factors
- [Specific process weakness]
- [Missing step or unclear procedure]

### System/Technical Factors
- [Technical limitation or failure mode]
- [Design flaw]

### Environmental Factors
- [External pressure or condition]
- [Market or resource constraint]

## Root Cause(s)
**Primary Root Cause:** [Clear statement of fundamental underlying cause]

**Secondary Factors:** [Any other contributing root causes]

## Evidence & Validation
[How we know this is the root cause, what evidence supports it]

## How to Prevent Recurrence
1. **Process Changes:** [Specific process improvement]
2. **System Changes:** [Technical or structural fix]
3. **Monitoring:** [How we'll detect if this happens again]
4. **Training/Communication:** [If human factors involved]

## Immediate Actions vs. Long-Term Fixes
- **Short-term (Symptom relief):** [Quick fixes while implementing long-term solution]
- **Long-term (Root cause fix):** [Permanent solutions addressing root cause]
      `.trim(),
      qualityChecklist: [
        'Problem clearly distinguished from symptoms',
        'Root cause goes beyond blaming individuals',
        'Why analysis digs at least 3-4 levels deep',
        'Multiple contributing factors are identified',
        'Root cause is validated with evidence',
        'Preventive solutions address underlying cause',
        'Recommendations are actionable and specific',
      ],
    },
    variables: [
      {
        name: 'problemStatement',
        description: 'What problem are we investigating?',
        required: true,
      },
      {
        name: 'context',
        description: 'Background and circumstances around the problem',
        required: true,
      },
      {
        name: 'observedSymptoms',
        description: 'What symptoms or issues are being observed?',
        required: false,
      },
      {
        name: 'timeline',
        description: 'When did the problem start and what changed?',
        required: false,
      },
    ],
  },
  {
    slug: 'financial-analysis',
    name: 'Financial Analysis',
    description:
      'Comprehensive financial assessment including metrics, trends, and strategic recommendations.',
    category: 'ANALYSIS',
    template: {
      role: 'Financial Analyst',
      taskStructure: `
1. Financial Overview: Key revenue, profit, and cash metrics
2. Profitability Analysis: Margins, operating efficiency, ROI
3. Liquidity & Solvency: Cash flow, debt, working capital
4. Trend Analysis: Year-over-year and period-over-period changes
5. Ratio Analysis: Key financial ratios and benchmarks
6. Variance Analysis: Actual vs. budget/plan/forecast
7. Recommendations: Actions to improve financial performance
      `.trim(),
      cotGuidance: `
Consider:
- What story do the numbers tell?
- Are margins healthy compared to industry?
- Where is cash flowing and why?
- What trends concern me most?
- What levers have the biggest impact on profit?
- How does this compare to competitors and industry benchmarks?
- What would a CFO prioritize?
      `.trim(),
      constraints: [
        'Use consistent periods for comparison (YoY, QoQ)',
        'Distinguish between one-time vs. recurring items',
        'Include industry context and benchmarks where relevant',
        'Explain variances and anomalies',
        'Consider both absolute and ratio metrics',
        'Address working capital and cash flow separately from profit',
      ],
      formatSpec: `
# Financial Analysis

## Executive Summary
[Key financial position and 2-3 critical insights]

## Financial Overview
| Metric | Current | Prior | Change |
|--------|---------|-------|--------|
| Revenue | [Amount] | [Amount] | [+X%] |
| Gross Profit | [Amount] | [Amount] | [+X%] |
| Operating Income | [Amount] | [Amount] | [+X%] |
| Net Income | [Amount] | [Amount] | [+X%] |

## Profitability Analysis
- **Gross Margin:** [X%] (Prior: [X%])
- **Operating Margin:** [X%] (Prior: [X%])
- **Net Margin:** [X%] (Prior: [X%])
- **Return on Assets (ROA):** [X%]
- **Return on Equity (ROE):** [X%]

[Interpretation and variance explanation]

## Cash Flow Analysis
- **Operating Cash Flow:** [Amount] ([+X%] YoY)
- **Free Cash Flow:** [Amount] ([+X%] YoY)
- **Cash Position:** [Amount]
- **Cash Burn/Generation Rate:** [Amount per period]

[Assessment of liquidity and sustainability]

## Debt & Solvency
- **Total Debt:** [Amount]
- **Debt-to-Equity Ratio:** [X]
- **Debt Service Coverage:** [X]
- **Credit Risk Assessment:** [Assessment]

## Key Financial Ratios
| Ratio | Current | Prior | Industry Benchmark |
|-------|---------|-------|-------------------|
| Current Ratio | [X] | [X] | [X] |
| Quick Ratio | [X] | [X] | [X] |
| Asset Turnover | [X] | [X] | [X] |

## Trend Analysis (Last 3 Years)
[Summary of major trends in revenue growth, profitability, cash flow]

## Variance Analysis (vs. Plan/Budget)
[Any significant variances between actual and planned/budgeted performance]

## Strengths & Concerns
**Financial Strengths:**
1. [Strength with metric]
2. [Strength with metric]

**Areas of Concern:**
1. [Issue with metric and impact]
2. [Issue with metric and impact]

## Recommendations
1. [Strategic recommendation for profitability/growth]
2. [Operational recommendation for efficiency]
3. [Financial recommendation for cash/capital structure]
4. [Metric to improve or watch closely]
      `.trim(),
      qualityChecklist: [
        'All key financial metrics are included',
        'Comparisons use consistent periods',
        'Ratios are calculated correctly',
        'Variances are explained with context',
        'Trends are identified with supporting data',
        'Recommendations are specific and actionable',
        'Industry or benchmark context is provided',
      ],
    },
    variables: [
      {
        name: 'financialStatements',
        description: 'Include income statement, balance sheet, cash flow data',
        required: true,
      },
      {
        name: 'period',
        description: 'Analysis period (quarterly, annual, etc)',
        required: false,
        defaultValue: 'annual',
      },
      {
        name: 'comparativeData',
        description: 'Prior period data for comparison and trends',
        required: false,
      },
      {
        name: 'industry',
        description: 'Industry for benchmarking context',
        required: false,
      },
    ],
  },
  {
    slug: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Systematic identification and evaluation of risks with mitigation strategies.',
    category: 'ANALYSIS',
    template: {
      role: 'Risk Manager',
      taskStructure: `
1. Risk Identification: Identify potential risks across categories
2. Risk Characterization: Describe each risk (cause, impact, trigger)
3. Risk Assessment: Evaluate likelihood and severity
4. Risk Prioritization: Rank by criticality
5. Mitigation Strategies: Develop controls and responses
6. Monitoring: Identify metrics and early warning indicators
7. Escalation: Define trigger points for escalation
      `.trim(),
      cotGuidance: `
Think about:
- What could go wrong? (Be creative, not just obvious risks)
- What's the likelihood? (Rare/unlikely/possible/likely/almost certain)
- What's the impact if it happens? (Negligible/minor/moderate/major/catastrophic)
- What would we see early?
- What can we do to prevent it?
- What's our backup plan if it happens?
- Which risks keep executives awake at night?
      `.trim(),
      constraints: [
        'Categorize risks systematically (operational, financial, strategic, compliance, etc)',
        'Be specific about causes and impacts',
        'Use consistent likelihood and impact scales',
        'Distinguish risks we can control from external risks',
        'Include both obvious and non-obvious risks',
        'Provide realistic mitigation strategies',
      ],
      formatSpec: `
# Risk Assessment

## Executive Summary
[Top 3-5 critical risks and overall risk posture]

## Risk Assessment Methodology
- **Likelihood Scale:** Rare (1) | Unlikely (2) | Possible (3) | Likely (4) | Almost Certain (5)
- **Impact Scale:** Negligible (1) | Minor (2) | Moderate (3) | Major (4) | Catastrophic (5)
- **Risk Score:** Likelihood × Impact (scale 1-25)

## Identified Risks

### High Priority Risks (Score 15+)

**Risk #1: [Risk Title]**
- **Category:** [Operational/Financial/Strategic/Compliance/Reputational]
- **Description:** [Specific risk description]
- **Likelihood:** [Level with justification]
- **Impact:** [Severity with business consequence]
- **Risk Score:** [Score]
- **Trigger/Early Warning:** [What would indicate this risk is materializing]
- **Mitigation Strategy:** [Control or preventive action]
- **Residual Risk:** [Risk level after mitigation]
- **Owner:** [Responsible party]

[Repeat for each high priority risk]

### Medium Priority Risks (Score 8-14)

**Risk #[N]: [Risk Title]**
- **Category:** [Category]
- **Likelihood/Impact:** [Brief assessment]
- **Risk Score:** [Score]
- **Key Mitigation:** [Primary control]
- **Owner:** [Responsible party]

[Repeat for each medium priority risk]

### Low Priority Risks (Score <8)
[List or summary of lower-priority risks with brief descriptions]

## Risk Monitoring
| Risk | Leading Indicator | Monitoring Frequency | Escalation Threshold |
|------|-------------------|---------------------|---------------------|
| [Risk #1] | [Metric/signal] | [Weekly/Monthly] | [Trigger point] |

## Risk Response Strategy
1. **Prevent:** [Controls to prevent highest-priority risks]
2. **Detect:** [Monitoring and early warning systems]
3. **Respond:** [Action plan if risk event occurs]
4. **Recover:** [Business continuity and recovery actions]

## Overall Risk Position
[Assessment of total risk exposure and confidence in mitigation]
      `.trim(),
      qualityChecklist: [
        'Risks cover multiple categories (not just one type)',
        'Each risk has specific, realistic triggers',
        'Likelihood and impact assessments are justified',
        'Mitigation strategies are actionable and owned',
        'Early warning indicators are specific and measurable',
        'High-priority risks have clear escalation paths',
        'Risk assessment is current and considering recent changes',
      ],
    },
    variables: [
      {
        name: 'context',
        description: 'What initiative, project, or business area are we assessing risks for?',
        required: true,
      },
      {
        name: 'scope',
        description: 'Risk assessment scope (operational, financial, strategic, compliance, all)',
        required: false,
        defaultValue: 'all',
      },
      {
        name: 'timeHorizon',
        description: 'Risk assessment timeframe (next quarter, year, 3 years)',
        required: false,
        defaultValue: 'next 12 months',
      },
      {
        name: 'constraints',
        description: 'Any specific risk categories or concerns to focus on',
        required: false,
      },
    ],
  },
  {
    slug: 'user-research',
    name: 'UX/User Research Analysis',
    description:
      'Analyze user research data to extract actionable insights, identify patterns, and inform product decisions.',
    category: 'ANALYSIS',
    template: {
      role: 'UX Research Analyst',
      taskStructure: `
1. Research Overview: Methodology, sample size, objectives
2. User Segments: Identify distinct user groups and behaviors
3. Key Findings: Extract themes from qualitative and quantitative data
4. Pain Points: Prioritize user frustrations by frequency and severity
5. Opportunities: Map unmet needs to potential solutions
6. Recommendations: Actionable product/design recommendations
      `.trim(),
      cotGuidance: `
Consider:
- What patterns repeat across users?
- What surprised us vs confirmed assumptions?
- Which pain points are most impactful on retention?
- What are users trying to accomplish (jobs-to-be-done)?
- Where do user mental models differ from our design?
      `.trim(),
      constraints: [
        'Separate observations from interpretations',
        'Include direct user quotes as evidence',
        'Prioritize findings by impact and frequency',
        'Distinguish between stated preferences and observed behavior',
        'Include sample size and methodology context',
        'Recommendations must be specific and actionable',
      ],
      formatSpec:
        'Research Report with: Executive Summary, Methodology, User Segments, Key Findings (with evidence), Pain Point Matrix (frequency × severity), Opportunity Map, Prioritized Recommendations, Raw Data Summary',
      qualityChecklist: [
        'Findings are supported by evidence from multiple users',
        'Pain points are prioritized by impact and frequency',
        'User quotes are included to illustrate key points',
        'Recommendations are tied to specific findings',
        'Methodology limitations are acknowledged',
        'Insights distinguish between what users say vs what they do',
      ],
    },
    variables: [
      {
        name: 'researchData',
        description: 'User research data (interviews, surveys, usability tests)',
        required: true,
      },
      {
        name: 'researchGoal',
        description: 'Primary research question or objective',
        required: true,
      },
      { name: 'userSegments', description: 'Known user segments or personas', required: false },
      { name: 'productContext', description: 'Product/feature being researched', required: false },
    ],
  },
  {
    slug: 'market-sizing',
    name: 'TAM/SAM/SOM Market Sizing',
    description:
      'Estimate total addressable market, serviceable addressable market, and serviceable obtainable market with data-driven methodology.',
    category: 'ANALYSIS',
    template: {
      role: 'Market Research Analyst and Strategy Consultant',
      taskStructure: `
1. Market Definition: Define the market boundaries clearly
2. TAM Calculation: Total addressable market using top-down and bottom-up approaches
3. SAM Calculation: Serviceable addressable market based on segmentation
4. SOM Calculation: Realistic obtainable market based on competitive position
5. Growth Projections: Market growth rate and trajectory
6. Assumptions & Risks: Document all assumptions and risk factors
      `.trim(),
      cotGuidance: `
Consider:
- What is the broadest possible market definition?
- Which segments can we actually serve with our product?
- What is a realistic capture rate given competition?
- Are we using both top-down and bottom-up validation?
- What macro trends affect market size?
      `.trim(),
      constraints: [
        'Use both top-down and bottom-up approaches',
        'Clearly state all assumptions with sources',
        'Distinguish between TAM, SAM, and SOM with clear logic',
        'Include growth rate estimates with basis',
        'Consider geographic and segment limitations',
        'Validate with at least 2 data sources',
      ],
      formatSpec:
        'Market Sizing Report with: Market Definition, TAM (top-down + bottom-up), SAM (segmentation logic), SOM (capture rate rationale), Growth Projections, Competitive Landscape Summary, Assumptions Table, Data Sources',
      qualityChecklist: [
        'TAM, SAM, SOM are clearly distinguished',
        'Both top-down and bottom-up approaches are used',
        'All assumptions are explicitly stated',
        'Data sources are cited and credible',
        'Growth projections have clear basis',
        'Competitive context informs SOM estimate',
      ],
    },
    variables: [
      {
        name: 'market',
        description:
          'Market or industry to size (e.g., "AI-powered healthcare tools in Indonesia")',
        required: true,
      },
      { name: 'product', description: 'Product or service being assessed', required: true },
      {
        name: 'geography',
        description: 'Geographic scope (global, regional, country)',
        required: false,
        defaultValue: 'global',
      },
      {
        name: 'timeHorizon',
        description: 'Projection period (e.g., 2026-2030)',
        required: false,
        defaultValue: '5 years',
      },
    ],
  },
  {
    slug: 'sentiment-analysis',
    name: 'Brand/Product Sentiment Analysis',
    description:
      'Analyze customer sentiment across channels to understand brand perception, identify trends, and inform strategy.',
    category: 'ANALYSIS',
    template: {
      role: 'Brand Intelligence Analyst',
      taskStructure: `
1. Data Collection Summary: Sources, volume, and time period
2. Overall Sentiment Score: Aggregate positive/neutral/negative breakdown
3. Theme Extraction: Key topics and their sentiment
4. Trend Analysis: Sentiment changes over time
5. Channel Comparison: Sentiment differences across platforms
6. Competitive Comparison: How sentiment compares to competitors
7. Recommendations: Actions to improve or maintain sentiment
      `.trim(),
      cotGuidance: `
Consider:
- What topics drive the strongest positive/negative reactions?
- Are there emerging issues before they become crises?
- How does sentiment differ by customer segment?
- What competitor moves are affecting our perception?
- Which channels are most influential?
      `.trim(),
      constraints: [
        'Include sample size and data source for credibility',
        'Separate factual complaints from emotional reactions',
        'Identify sentiment drivers, not just scores',
        'Compare against historical baseline',
        'Note any data collection biases or limitations',
        'Prioritize actionable insights over comprehensive data dumps',
      ],
      formatSpec:
        'Sentiment Report with: Executive Summary, Overall Score, Sentiment Breakdown by Theme, Trend Charts, Channel Analysis, Top Positive/Negative Drivers, Competitive Comparison, Alert Items, Recommended Actions',
      qualityChecklist: [
        'Sentiment scores are supported by data volume',
        'Key themes are identified with examples',
        'Trends show direction and rate of change',
        'Competitive context is included',
        'Recommendations are tied to specific sentiment drivers',
        'Data limitations are acknowledged',
      ],
    },
    variables: [
      { name: 'brand', description: 'Brand or product to analyze', required: true },
      {
        name: 'dataSources',
        description: 'Data sources (social media, reviews, surveys, support tickets)',
        required: true,
      },
      {
        name: 'timePeriod',
        description: 'Analysis time period',
        required: false,
        defaultValue: 'last 90 days',
      },
      { name: 'competitors', description: 'Competitor brands for comparison', required: false },
    ],
  },
  {
    slug: 'impact-assessment',
    name: 'Project/Change Impact Assessment',
    description:
      'Evaluate the potential impact of a proposed project or change across organizational dimensions.',
    category: 'ANALYSIS',
    template: {
      role: 'Change Management Analyst and Impact Assessor',
      taskStructure: `
1. Change Description: What is being proposed and why
2. Stakeholder Impact: Who is affected and how
3. Operational Impact: Process and workflow changes
4. Financial Impact: Costs, savings, ROI projection
5. Risk Impact: New risks introduced or mitigated
6. Timeline Impact: Schedule effects on other initiatives
7. Mitigation Plan: How to minimize negative impacts
      `.trim(),
      cotGuidance: `
Consider:
- Who will be most affected by this change?
- What processes will break or need modification?
- What is the true total cost (including hidden costs)?
- What are second and third-order effects?
- How does this interact with other ongoing changes?
      `.trim(),
      constraints: [
        'Assess impact across all key dimensions (people, process, technology, finance)',
        'Include both positive and negative impacts',
        'Quantify impacts where possible',
        'Consider second-order effects and dependencies',
        'Include stakeholder change readiness assessment',
        'Provide clear go/no-go recommendation with rationale',
      ],
      formatSpec:
        'Impact Assessment with: Change Summary, Stakeholder Impact Matrix, Operational Impact Analysis, Financial Impact (costs/benefits/ROI), Risk Assessment, Timeline Effects, Dependency Map, Mitigation Strategies, Go/No-Go Recommendation',
      qualityChecklist: [
        'All affected stakeholder groups are identified',
        'Impacts are quantified where possible',
        'Both positive and negative impacts are covered',
        'Second-order effects are considered',
        'Mitigation strategies are specific and feasible',
        'Recommendation is clearly supported by analysis',
      ],
    },
    variables: [
      {
        name: 'proposedChange',
        description: 'Description of the proposed change or project',
        required: true,
      },
      {
        name: 'scope',
        description: 'Scope of assessment (department, organization, ecosystem)',
        required: true,
      },
      { name: 'timeline', description: 'Expected implementation timeline', required: false },
      {
        name: 'constraints',
        description: 'Budget, resource, or timeline constraints',
        required: false,
      },
    ],
  },
]
