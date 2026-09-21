// Drferdi Transformer Engine — Business Templates
import type { TemplateDefinition } from '@/types'

export const businessTemplates: TemplateDefinition[] = [
  {
    slug: 'business-plan',
    name: 'Business Plan',
    description:
      'Create comprehensive business plans with market analysis, financials, and operational strategies',
    category: 'BUSINESS',
    template: {
      role: 'Business strategist developing executable business plans',
      taskStructure: `
1. Define business concept and value proposition
2. Analyze market opportunity and competitive landscape
3. Identify target customer segments
4. Develop revenue and go-to-market strategy
5. Plan operations and resource requirements
6. Project financial performance
7. Identify risks and mitigation strategies
8. Establish milestones and success metrics
      `,
      cotGuidance: `
Think through:
- What problem does the business solve? (value prop)
- Who specifically are the customers? (segmentation)
- What is the total addressable market (TAM)?
- Who are direct and indirect competitors?
- How does this differentiate from alternatives?
- What is the unit economics? (is it sustainable?)
- What are the key assumptions? (which are risky?)
- What capital and resources are needed?
- What are realistic financial projections?
      `,
      constraints: [
        'Market analysis must be grounded in data, not speculation',
        'Revenue projections must reference comparable businesses or stated assumptions',
        'Financial statements must be internally consistent',
        'Acknowledge assumptions and risks explicitly',
        'Go-to-market strategy must be specific and phased',
        'Management team capabilities must be realistic',
        'Use standard sections (do not invent custom structures)',
      ],
      formatSpec: `
# Business Plan: [Company Name]

## Executive Summary
[1-2 page overview covering: business concept, market opportunity, competitive advantage, financial summary, funding ask]

## Company Description
### Mission & Vision
[Clear articulation of purpose and long-term direction]

### Company Structure
[Legal structure, location, organizational model]

### Ownership
[Founders and equity structure]

## Market Analysis
### Industry Overview
- Market size (TAM)
- Market growth rate
- Industry trends

### Target Market Segments
1. [Segment name]
   - Size and characteristics
   - Needs and pain points
   - Purchasing behavior

2. [Segment name]
   [Same structure]

### Competitive Landscape
- Direct competitors (who solves the same problem)
- Indirect competitors (alternative solutions)
- Competitive comparison matrix

### Competitive Advantage
[Differentiation: technology, cost, service, brand, network effects, etc.]

## Product/Service Description
### Features & Benefits
[What does the product/service do?]

### Development Stage
[Pre-launch, MVP, beta, mature, etc.]

### Intellectual Property
[Patents, trademarks, proprietary processes]

## Marketing & Sales Strategy
### Go-to-Market Strategy
[Phased approach to market entry and customer acquisition]

### Marketing Plan
- Brand positioning
- Marketing channels
- Customer acquisition strategy
- Cost per acquisition projections

### Sales Strategy
- Sales model (direct, indirect, hybrid)
- Sales team structure
- Sales process and timeline
- Revenue projections

## Operations Plan
### Key Operations
[Core business processes]

### Facilities & Equipment
[Space, infrastructure, technology requirements]

### Staffing Plan
[Organizational structure and hiring plan]

### Supply Chain
[Key suppliers and dependencies]

### Technology & Systems
[Core technologies and platforms]

## Management & Organization
### Management Team
- [Key team member] - Role, experience, responsibilities
- [Key team member] - Role, experience, responsibilities

### Board & Advisors
[If applicable]

### Compensation Structure
[How founders and staff are compensated]

## Financial Projections
### Key Assumptions
[List all material assumptions underlying projections]

### Income Statement Projections (3-5 years)
[Revenue, cost of goods sold, operating expenses, EBITDA, net income]

### Cash Flow Projections (3-5 years)
[Operating, investing, and financing cash flows]

### Balance Sheet Projections (3-5 years)
[Assets, liabilities, equity]

### Unit Economics
[Revenue per customer, customer acquisition cost, lifetime value, gross margin]

### Break-even Analysis
[When does the company become profitable?]

## Funding Request
### Amount Requested
[Total capital needed]

### Use of Funds
[Allocation across categories: product development, marketing, operations, working capital, etc.]

### Funding Timeline
[When funds are needed]

## Risk Analysis
### Key Risks
1. [Risk] - Likelihood: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [How will this be addressed?]

2. [Risk] - Likelihood: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [How will this be addressed?]

[Continue for 5-10 key risks]

## Metrics & Milestones
### Key Performance Indicators (KPIs)
[How will success be measured?]

### Timeline & Milestones
[Major business development milestones for next 12-24 months]

## Exit Strategy
[If applicable: acquisition targets, IPO potential, or long-term hold]

## Appendices
[Supporting materials: market research, detailed financials, resumes, product demos, letters of intent, etc.]
      `,
      qualityChecklist: [
        'Business model is clearly defined and realistic',
        'Market analysis is grounded in data, not assumptions',
        'Competitive advantage is specific and defensible',
        'Financial projections are internally consistent',
        'Key assumptions are explicitly stated',
        'Risks are identified and mitigation strategies provided',
        'Go-to-market strategy is phased and specific',
        'Management team has relevant experience',
        'Funding request is justified by use of funds',
      ],
    },
    variables: [
      {
        name: 'companyName',
        description: 'Name of the company or business',
        required: true,
      },
      {
        name: 'industry',
        description: 'Industry or sector',
        required: true,
      },
      {
        name: 'fundingStage',
        description: 'Stage of funding (pre-seed, seed, Series A, etc.)',
        required: false,
        defaultValue: 'Seed stage',
      },
    ],
  },
  {
    slug: 'pitch-deck',
    name: 'Pitch Deck Content',
    description:
      'Develop compelling pitch deck narratives with clear messaging and visual structure',
    category: 'BUSINESS',
    template: {
      role: 'Pitch strategist crafting persuasive investor presentations',
      taskStructure: `
1. Define compelling problem statement
2. Articulate unique solution and differentiation
3. Establish market opportunity and traction
4. Present revenue model and unit economics
5. Build credibility through team and advisors
6. Outline use of capital
7. Project financial returns
8. Create memorable closing and call-to-action
      `,
      cotGuidance: `
Think through:
- What is the one-sentence hook? (grab attention immediately)
- Why should I care? (emotional + rational appeal)
- Why now? (market timing and urgency)
- Why this team? (credibility and execution capability)
- What is the defensible moat? (why can't competitors copy?)
- What is the revenue model? (is it scalable?)
- What traction demonstrates product-market fit?
- What is the ask and use of funds? (be specific)
- What is the return potential? (upside for investors)
      `,
      constraints: [
        'Each slide must have a clear, single message',
        'Problem must be real and relatable (demonstrate with customer quotes or data)',
        'Solution must be differentiated (explain why incumbents cannot copy)',
        'Traction must be specific and quantified (not vanity metrics)',
        'Financial projections must be achievable, not hockey-stick fantasy',
        'Team credentials must be relevant to the problem being solved',
        'Avoid jargon - assume educated non-expert audience',
        'Design should be professional and consistent (note visual guidelines)',
      ],
      formatSpec: `
# Pitch Deck: [Company Name]

## Slide 1: Title Slide
- Company name and tagline
- Key visual (logo or hero image)
- Presenter name and role
- Date

## Slide 2: The Problem
- Problem statement (1-2 sentences)
- Problem size (affected population or pain point cost)
- Why existing solutions are inadequate
- Customer quote or pain point illustration
- Visual: customer problem illustration

## Slide 3: The Solution
- Solution overview (1-2 sentences)
- Key features that solve the problem
- How it differs from alternatives
- Why this is the right time/approach
- Visual: product screenshot or demo flow

## Slide 4: Market Opportunity
- Total Addressable Market (TAM)
- Serviceable Addressable Market (SAM)
- Serviceable Obtainable Market (SOM)
- Market growth rate and trends
- Visual: market size visualization

## Slide 5: Business Model
- Revenue model (subscription, transactional, licensing, etc.)
- Unit economics (CAC, LTV, gross margin)
- Pricing strategy
- Visual: simple business model diagram

## Slide 6: Traction & Validation
- Customer metrics (users, customers, retention)
- Product metrics (engagement, NPS, usage)
- Revenue/MRR if applicable
- Partnerships or pilot wins
- Visual: hockey-stick growth chart with actual data

## Slide 7: Competitive Landscape
- Direct competitors and their strengths/weaknesses
- Indirect competitors and alternative solutions
- Competitive positioning matrix
- Key differentiators
- Visual: competitive comparison or positioning map

## Slide 8: Go-to-Market Strategy
- Customer acquisition channels
- Go-to-market timeline (phased approach)
- Early wins and customer acquisition cost
- Path to scale
- Visual: GTM timeline or funnel

## Slide 9: Management Team
- Founder/CEO: name, background, relevant experience
- Co-founder/CTO: name, background, relevant experience
- Key team member(s): name, role, background
- Why this team can execute
- Visual: team photos with bios

## Slide 10: Financial Projections
- Revenue projections (3-5 year)
- Gross margin trajectory
- Path to profitability
- Key assumptions
- Visual: revenue and profitability charts

## Slide 11: Use of Funds
- Funding round size and type
- Allocation of capital (product development, sales & marketing, operations, runway)
- What milestones will be achieved
- Visual: pie chart or breakdown

## Slide 12: Vision & Closing
- Long-term vision (3-5 year goal)
- Why this matters (impact potential)
- Call-to-action (what you're asking for)
- Contact information
- Visual: inspiring image or company values

## Appendix Slides (as needed)
- Deeper financial models
- Customer testimonials
- Product roadmap
- Technical architecture
- Market research data
      `,
      qualityChecklist: [
        'Problem is real, relatable, and quantified',
        'Solution is clearly differentiated from alternatives',
        'Traction demonstrates product-market fit',
        'Market opportunity is specific (TAM, SAM, SOM)',
        'Revenue model is scalable and realistic',
        'Financial projections are achievable with stated assumptions',
        'Team has relevant domain expertise',
        'Use of capital is specific and justified',
        'Each slide has one clear message',
        'Visuals support narrative (not distract)',
      ],
    },
    variables: [
      {
        name: 'companyName',
        description: 'Company or product name',
        required: true,
      },
      {
        name: 'fundingRound',
        description: 'Type of funding being raised',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who is the primary audience (VCs, angels, corporates, etc.)',
        required: false,
        defaultValue: 'Venture capitalists',
      },
    ],
  },
  {
    slug: 'project-proposal',
    name: 'Project Proposal',
    description:
      'Develop structured project proposals with clear objectives, deliverables, and resource plans',
    category: 'BUSINESS',
    template: {
      role: 'Project manager creating implementable project proposals',
      taskStructure: `
1. Define project objectives and success criteria
2. Identify scope and deliverables
3. Analyze stakeholders and requirements
4. Develop phased implementation plan
5. Estimate resource requirements (people, budget, time)
6. Identify risks and mitigation strategies
7. Create communication and governance plan
8. Define metrics and success measures
      `,
      cotGuidance: `
Think through:
- What is the business case? (why this project matters)
- What specifically are we trying to achieve? (SMART goals)
- What is in scope vs. out of scope?
- Who needs to be involved/informed? (stakeholder mapping)
- What are the hard constraints? (timeline, budget, resources)
- What could prevent success? (risks and dependencies)
- How will we know if we succeeded? (clear metrics)
- What happens after project completion? (sustainment)
      `,
      constraints: [
        'Objectives must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
        'Scope must be clearly bounded (what is in vs. out)',
        'Timeline must be realistic with dependencies identified',
        'Budget must be itemized and justified',
        'Resource requirements must account for team capacity',
        'Risks must be identified with probability and impact',
        'Success metrics must be objective and measurable',
      ],
      formatSpec: `
# Project Proposal: [Project Name]

## Executive Summary
[1-page overview of: business case, objectives, timeline, budget, expected benefits]

## Business Case
### Strategic Alignment
[How does this project align with company strategy and goals?]

### Business Problem/Opportunity
[What is the underlying need or opportunity?]

### Expected Benefits
- [Benefit] - Quantified impact
- [Benefit] - Quantified impact
- [Benefit] - Quantified impact

## Project Objectives
### Primary Objective
[SMART objective statement]

### Secondary Objectives
1. [SMART objective]
2. [SMART objective]

### Success Criteria
[How will we know the project succeeded?]

## Scope Definition
### In Scope
[Deliverables and activities included]

### Out of Scope
[What is explicitly NOT included]

### Assumptions
[Key assumptions underlying the scope]

## Stakeholder Analysis
### Key Stakeholders
| Stakeholder | Role | Interests | Influence |
|---|---|---|---|
| [Name/Group] | [Role] | [What they care about] | [High/Med/Low] |

### Communication Plan
[How will stakeholders be kept informed?]

## Project Deliverables
### Phase 1: [Phase Name]
- Deliverable 1.1: [Description]
- Deliverable 1.2: [Description]
- Timeline: [Start-End dates]

### Phase 2: [Phase Name]
- Deliverable 2.1: [Description]
- Deliverable 2.2: [Description]
- Timeline: [Start-End dates]

[Continue for all phases]

## Resource Plan
### Team Structure
- Project Manager: [Name] - [Allocation %]
- Team Member 1: [Name] - [Role] - [Allocation %]
- Team Member 2: [Name] - [Role] - [Allocation %]

### External Resources
[Contractors, vendors, consultants needed]

### Skill Requirements
[Any specialized skills needed that may require recruitment]

## Budget & Financial Plan
### Total Budget: [Amount]

### Budget Breakdown
| Category | Amount | Justification |
|---|---|---|
| Personnel | $ | [FTE costs for X months] |
| Technology/Tools | $ | [Specific tools needed] |
| Contractors/Vendors | $ | [External resources] |
| Other | $ | [Travel, training, etc.] |

### ROI/Cost-Benefit Analysis
[Expected financial impact vs. cost]

## Timeline & Milestones
### Project Timeline: [Start Date] - [End Date]

### Key Milestones
| Milestone | Deliverable(s) | Date | Owner |
|---|---|---|---|
| [Milestone] | [Deliverables] | [Date] | [Person] |

### Critical Dependencies
[What external factors or prior completions are needed?]

## Risk Management
### Key Risks
1. [Risk] - Probability: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [How will this be managed?]

2. [Risk] - Probability: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [How will this be managed?]

[Continue for 5-8 key risks]

## Governance & Decision-Making
### Steering Committee
[Who provides oversight and approves major decisions?]

### Escalation Path
[Who decides on risk mitigation and scope changes?]

### Approval Authority
[Who has final approval on scope, timeline, budget changes?]

## Metrics & Success Measures
### Project Health Metrics
[Schedule adherence, budget variance, quality metrics]

### Business Outcome Metrics
[How will success be measured?]

### Monitoring & Reporting
[How often will progress be reported?]

## Implementation Considerations
### Training & Adoption
[How will users/stakeholders be prepared?]

### Change Management
[How will organizational changes be managed?]

### Lessons Learned Process
[How will learnings be captured?]

## Appendices
[Detailed schedules, financial models, technical specifications, organizational charts]
      `,
      qualityChecklist: [
        'Objectives are SMART and aligned with strategy',
        'Scope is clearly defined with in/out boundaries',
        'Timeline is realistic with identified dependencies',
        'Budget is itemized and justified',
        'Resource requirements are realistic given team capacity',
        'Risks are identified with mitigation strategies',
        'Success metrics are objective and measurable',
        'Stakeholder communication plan is included',
        'Governance structure is clearly defined',
      ],
    },
    variables: [
      {
        name: 'projectName',
        description: 'Name of the project',
        required: true,
      },
      {
        name: 'projectType',
        description: 'Type of project (product, infrastructure, process improvement, etc.)',
        required: true,
      },
      {
        name: 'estimatedDuration',
        description: 'Expected project duration (e.g., "6 months")',
        required: false,
        defaultValue: '3-6 months',
      },
    ],
  },
  {
    slug: 'okr-planning',
    name: 'OKR/Goal Setting',
    description: 'Develop Objectives & Key Results aligned with organizational strategy',
    category: 'BUSINESS',
    template: {
      role: 'OKR strategist creating aligned, measurable goal frameworks',
      taskStructure: `
1. Define organizational strategic priorities
2. Cascade goals from company to team level
3. Create ambitious yet achievable objectives
4. Establish measurable key results
5. Identify initiatives and resource requirements
6. Align team and individual goals
7. Build accountability and tracking mechanisms
8. Plan regular review cadence
      `,
      cotGuidance: `
Think through:
- What are the top 3-5 strategic priorities? (not more)
- Is this objective inspiring and meaningful?
- Are the key results measurable and ambitious? (70% confident)
- Do these KRs actually measure progress on the objective?
- Is this achievable with current resources? (or what's needed?)
- How do individual OKRs ladder up to company OKRs?
- Who is accountable for each KR?
- What are leading vs. lagging indicators?
- How will progress be tracked and communicated?
      `,
      constraints: [
        '3-5 objectives per level (not more)',
        'Key Results must be quantifiable and measurable',
        'Objectives should be ambitious (aim for 70% confidence)',
        'Must have clear ownership and accountability',
        'Should not include task-level details (those are initiatives)',
        'Key Results should measure outcomes, not activities',
        'OKRs should be reviewed at least quarterly',
        'Public and transparent (visibility across organization)',
      ],
      formatSpec: `
# OKRs: [Organization/Team] — [Time Period]

## Strategic Context
### Organization Priorities
[High-level strategic direction for this period]

### Market Conditions
[External context informing goal-setting]

### Prior Period Review
[What we learned from last cycle that informs current OKRs]

## Company-Level OKRs

### Objective 1: [Inspiring, outcome-focused statement]
[Why does this matter?]

#### Key Result 1.1: [Measurable outcome]
- Current baseline: [Starting point]
- Target: [End-of-period goal]
- Owner: [Person responsible]
- Confidence: [70-80%]
- Key Initiatives:
  - [Initiative 1]
  - [Initiative 2]

#### Key Result 1.2: [Measurable outcome]
[Same structure as KR 1.1]

#### Key Result 1.3: [Measurable outcome]
[Same structure as KR 1.1]

### Objective 2: [Inspiring, outcome-focused statement]
[Structure with 2-3 Key Results as above]

### Objective 3: [Inspiring, outcome-focused statement]
[Structure with 2-3 Key Results as above]

[Limit to 3-5 company objectives]

## Department/Team-Level OKRs

### [Department Name] OKRs

#### Objective 1: [Outcome-focused statement]
[How does this ladder to company OKRs?]

##### Key Result 1.1: [Measurable outcome]
- Baseline: [Starting point]
- Target: [End-of-period goal]
- Owner: [Person responsible]
- Confidence: [70-80%]

##### Key Result 1.2: [Measurable outcome]
[Same structure]

##### Key Result 1.3: [Measurable outcome]
[Same structure]

#### Objective 2: [Outcome-focused statement]
[Structure as above]

[Continue for all departments/teams]

## Individual Contributor OKRs (if applicable)

### [Team Member Name]

#### Objective 1: [Outcome-focused statement]
[How does this support team OKRs?]

##### Key Result 1.1: [Measurable outcome]
- Target: [End-of-period goal]

##### Key Result 1.2: [Measurable outcome]
- Target: [End-of-period goal]

[Continue for all individual contributors]

## Cross-Functional Initiatives
[OKRs that require collaboration across multiple teams]

| Initiative | Owning Teams | Expected Impact | Timeline |
|---|---|---|---|
| [Initiative] | [Teams] | [Outcome] | [Timeline] |

## Resource Allocation
### Budget & Headcount
[How are resources allocated to support OKRs?]

### Skill & Capability Gaps
[What new skills are needed to achieve OKRs?]

## Risk & Dependency Management
### Key Dependencies
[What must be true for OKRs to succeed?]

### Risk Factors
[What could prevent achieving OKRs and mitigation plans?]

## Tracking & Review Cadence
### Check-in Schedule
[When will progress be reviewed?]

### Success Definition
[What constitutes successful OKR completion?]

### Scoring Rubric
- 1.0: Achieved all key results
- 0.7-0.9: Achieved most key results
- 0.4-0.6: Achieved some key results
- Below 0.4: Limited progress

### Review Process
[How will OKRs be reviewed and updated?]

## Appendices
[Detailed metrics dashboards, historical context, stretch goals, supporting data]
      `,
      qualityChecklist: [
        '3-5 objectives per level (not excessive)',
        'Key Results are measurable and specific',
        'Objectives are ambitious (70% confidence to achieve)',
        'Goals cascade from company to team to individual level',
        'Clear ownership and accountability',
        'Key Results measure outcomes, not activities',
        'Resource requirements identified',
        'Review cadence specified (quarterly minimum)',
        'Alignment to strategy explicit',
      ],
    },
    variables: [
      {
        name: 'organizationOrTeam',
        description: 'Organization or team name',
        required: true,
      },
      {
        name: 'timePeriod',
        description: 'Time period for OKRs (e.g., "Q2 2026", "FY2026")',
        required: true,
      },
      {
        name: 'numberOfObjectives',
        description: 'Target number of objectives (typically 3-5)',
        required: false,
        defaultValue: '3-5',
      },
    ],
  },
  {
    slug: 'meeting-agenda',
    name: 'Meeting Agenda',
    description: 'Create structured, time-boxed meeting agendas with clear objectives and outcomes',
    category: 'BUSINESS',
    template: {
      role: 'Meeting facilitator designing productive, outcome-focused discussions',
      taskStructure: `
1. Define meeting purpose and desired outcome
2. Identify required participants
3. Determine appropriate format and duration
4. Structure agenda items by type and priority
5. Time-box each agenda item
6. Assign discussion leaders
7. Prepare pre-reads or materials
8. Define decision-making process
9. Plan follow-up actions and accountability
      `,
      cotGuidance: `
Think through:
- Why is this meeting necessary? (what's the business case?)
- What is the specific desired outcome?
- Who must be present vs. who is optional?
- What is the appropriate duration? (typically shorter is better)
- What items need discussion vs. information-sharing?
- What preparation do attendees need?
- How will decisions be made? (consensus, RACI, etc.)
- What actions need to be assigned and tracked?
- What follow-up is needed after the meeting?
      `,
      constraints: [
        'Meeting should have a clear purpose and desired outcome',
        'Limit to essential participants only',
        'Time-boxes should be realistic (allocate 80% of time to critical items)',
        'Pre-reads should be provided for information-heavy topics',
        'Decision-making process must be clear',
        'Action items must have owner and due date',
        'Agenda should be shared before the meeting',
        'Total duration should be appropriate (not excessive)',
      ],
      formatSpec: `
# Meeting Agenda: [Meeting Title]

## Meeting Details
- **Date:** [Date]
- **Time:** [Start time] - [End time] ([Total duration])
- **Location/Format:** [In-person/Virtual/Hybrid with location]
- **Attendees:** [Required and optional participants]
- **Facilitator:** [Person responsible]

## Meeting Purpose
[Clear statement of why the meeting is happening]

## Desired Outcome
[Specific results or decisions expected from the meeting]

## Pre-Reads
[Materials attendees should review before the meeting]
- [Document 1 with link and estimated read time]
- [Document 2 with link and estimated read time]

## Agenda Items

### Item 1: [Topic] — [Time: X minutes]
- **Purpose:** [Why we're discussing this]
- **Type:** [ ] Information sharing [ ] Discussion [ ] Decision
- **Leader:** [Person facilitating this topic]
- **Key Points to Cover:**
  - [Point 1]
  - [Point 2]
  - [Point 3]
- **Expected Outcome:** [What should result from this discussion]
- **Background:** [Context for discussion]

### Item 2: [Topic] — [Time: X minutes]
[Same structure as Item 1]

### Item 3: [Topic] — [Time: X minutes]
[Same structure as Item 1]

[Continue for all agenda items]

### Final Item: [Topic] — [Time: X minutes]
[Same structure]

## Decision-Making Process
[How will decisions be made? Consensus, vote, RACI, facilitator decides, etc.]

## Parking Lot
[Topics that come up but aren't on agenda - to be scheduled separately]

## Action Items
[To be filled in during the meeting]

| Action Item | Owner | Due Date | Notes |
|---|---|---|---|
| [Action] | [Person] | [Date] | [Context] |

## Notes & Decisions
[Space for key decisions and takeaways]

## Next Steps
[What happens after this meeting?]

## Schedule Next Meeting
[When will we meet again, if applicable?]

## Appendices
[Supporting materials, detailed data, optional reading]
      `,
      qualityChecklist: [
        'Meeting has clear purpose and desired outcome',
        'Only essential participants included',
        'Agenda items time-boxed realistically',
        'Pre-reads provided for information-heavy topics',
        'Discussion leaders assigned for each item',
        'Decision-making process clearly defined',
        'Action items will have owner and due date',
        'Meeting duration is appropriate (not excessive)',
        'Agenda shared with attendees before meeting',
      ],
    },
    variables: [
      {
        name: 'meetingTitle',
        description: 'Title or purpose of the meeting',
        required: true,
      },
      {
        name: 'meetingType',
        description: 'Type of meeting (status update, planning, decision, etc.)',
        required: true,
      },
      {
        name: 'duration',
        description: 'Expected meeting duration (in minutes)',
        required: false,
        defaultValue: '60 minutes',
      },
    ],
  },
  {
    slug: 'process-doc',
    name: 'Process Documentation',
    description: 'Create clear, step-by-step process documentation for repeatability and training',
    category: 'BUSINESS',
    template: {
      role: 'Process documentarian creating clear, usable procedures',
      taskStructure: `
1. Define process scope and purpose
2. Map process flow from start to finish
3. Identify steps, decision points, and roles
4. Document each step with specificity
5. Include example scenarios
6. Create visual flow diagram
7. Identify quality checkpoints
8. Plan training and adoption
      `,
      cotGuidance: `
Think through:
- Who performs this process and why?
- What are the key decision points? (where things diverge)
- What can go wrong at each step? (quality controls)
- What tools or systems are used?
- What are the common mistakes or variations?
- Who needs to approve or verify work?
- What timeframe should this take?
- How will this be taught to new people?
      `,
      constraints: [
        'Steps should be specific and actionable (not vague)',
        'Each step should have one action (not compound steps)',
        'Include decision points and conditional logic',
        'Specify tools, systems, or templates used',
        'Document timeframe expectations for each step',
        'Include quality checks or verification steps',
        'Identify responsible parties and stakeholders',
        'Provide examples and common variations',
      ],
      formatSpec: `
# Process Documentation: [Process Name]

## Process Overview
### Purpose
[Why does this process exist? What business need does it serve?]

### Scope
[What is included in this process? What is out of scope?]

### Process Owner
[Who is responsible for maintaining and improving this process?]

### Last Updated
[Date and version number]

## Key Stakeholders
[Who performs, supports, or is affected by this process?]

| Role | Responsibilities | Department |
|---|---|---|
| [Role] | [What they do] | [Dept] |

## Process Flow
### High-Level Steps
1. [Step 1 - start state]
2. [Step 2]
3. [Step 3]
4. [Step N - end state]

[Visual flowchart showing process flow with decision points]

## Detailed Steps

### Step 1: [Step Title]
- **Purpose:** [Why is this step necessary?]
- **Responsible Party:** [Who does this?]
- **Tools/Systems:** [What tools are used?]
- **Expected Duration:** [How long should this take?]

**Procedure:**
1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]

**Example:** [Concrete example of this step]

**Quality Check:** [How do we verify this step was done correctly?]

**Common Mistakes:** [What often goes wrong here?]

### Step 2: [Step Title]
[Same structure as Step 1]

[Continue for all steps]

### Step N: [Final Step Title]
[Same structure]

## Decision Points

### Decision Point 1: [Decision being made]
- **If [Condition A]** → Go to Step X
- **If [Condition B]** → Go to Step Y
- **If [Condition C]** → Go to Step Z

### Decision Point 2: [Decision being made]
[Same structure]

[Continue for all decision points]

## Inputs Required
[What information or materials are needed to start this process?]

| Input | Source | Format |
|---|---|---|
| [Input] | [Where it comes from] | [Data format] |

## Outputs Generated
[What results or deliverables does this process produce?]

| Output | Recipient | Use |
|---|---|---|
| [Output] | [Who receives it] | [How it's used] |

## Dependencies
[What other processes or systems must be in place for this to work?]

## Timeline & Capacity
- **Average Duration:** [Total time from start to finish]
- **Peak Frequency:** [How often is this done?]
- **Capacity Planning:** [Staffing and resources needed]

## Quality Standards
### Success Criteria
[How do we know this process executed successfully?]

- Criterion 1: [Measurable success indicator]
- Criterion 2: [Measurable success indicator]
- Criterion 3: [Measurable success indicator]

### Quality Checks
[Checkpoints where work is verified]

| Checkpoint | When | Who Checks | What's Verified |
|---|---|---|---|
| [Check 1] | [Timing] | [Role] | [What's verified] |

## Risk & Mitigation
### Common Issues
1. [Issue] - How to prevent: [Mitigation]
2. [Issue] - How to prevent: [Mitigation]
3. [Issue] - How to prevent: [Mitigation]

### Escalation
[When and how are issues escalated?]

## Tools & Resources
### Required Systems
[Software, platforms, or tools needed to execute process]

### Templates & Checklists
[Links to or examples of templates used]

### Contact Information
[Who to contact for help or questions]

## Training & Adoption
### Learning Objectives
[What should new staff understand about this process?]

### Training Method
[How is this process taught to new staff?]

### Training Timeline
[How long to train and reach proficiency?]

## Metrics & Improvement
### Process Metrics
[How is process health measured?]

| Metric | Target | Current |
|---|---|---|
| [Metric] | [Goal] | [Performance] |

### Continuous Improvement
[How is this process improved over time?]

### History of Changes
[What has changed and when?]

## Appendices
[Detailed flowcharts, templates, checklists, system screenshots, training videos]
      `,
      qualityChecklist: [
        'Purpose and scope clearly defined',
        'Steps are specific and actionable',
        'Each step has one action (not compound)',
        'Decision points and conditional logic included',
        'Tools and systems specified for each step',
        'Responsible parties identified',
        'Quality checks and verification steps included',
        'Concrete examples provided',
        'Common mistakes documented',
        'Metrics for success clearly stated',
      ],
    },
    variables: [
      {
        name: 'processName',
        description: 'Name of the process being documented',
        required: true,
      },
      {
        name: 'department',
        description: 'Department or team owning this process',
        required: true,
      },
      {
        name: 'estimatedSteps',
        description: 'Estimated number of steps (for scoping)',
        required: false,
        defaultValue: '5-10 steps',
      },
    ],
  },
  {
    slug: 'stakeholder-report',
    name: 'Stakeholder Report',
    description:
      'Create executive-level stakeholder reports with business impact and strategic insights',
    category: 'BUSINESS',
    template: {
      role: 'Executive communicator translating results into stakeholder value',
      taskStructure: `
1. Identify stakeholder priorities and concerns
2. Summarize period performance against targets
3. Highlight strategic wins and outcomes
4. Analyze key metrics and trends
5. Surface risks and mitigation actions
6. Provide forward-looking insights
7. Align to stakeholder incentives and goals
8. Frame recommendations and next steps
      `,
      cotGuidance: `
Think through:
- What does this stakeholder care about? (financial return, impact, strategy alignment)
- Are we hitting our targets? (be honest about shortfalls)
- What changed? (from plan or expectations)
- What is the story? (how do results connect to strategy?)
- What should they decide or approve?
- What risks are emerging?
- What is the ask from them?
- How confident are we in our direction?
      `,
      constraints: [
        'Lead with executive summary (1-2 pages)',
        'Use actual metrics and data (not qualitative claims)',
        'Be honest about shortfalls and challenges',
        'Connect results to strategic objectives',
        'Provide context for metric interpretation',
        'Quantify impact in business terms (financial, customer, market)',
        'Identify trends, not just point-in-time snapshots',
        'Include clear recommendations or requests',
      ],
      formatSpec: `
# Stakeholder Report: [Organization/Project] — [Period]

## Executive Summary
[1-2 page overview covering key results, challenges, wins, and recommendations]

### Key Takeaways
- [Takeaway 1 with metric]
- [Takeaway 2 with metric]
- [Takeaway 3 with insight]

### Period Performance
- **Against Plan:** [% of targets hit]
- **Key Achievement:** [Most significant result]
- **Key Challenge:** [Most significant challenge]
- **Outlook:** [Forward confidence level]

## Performance Highlights
### Goal 1: [Objective]
- **Target:** [Planned outcome]
- **Actual:** [Achieved outcome]
- **Variance:** [Difference and explanation]
- **Impact:** [Business value or significance]

### Goal 2: [Objective]
[Same structure as Goal 1]

### Goal 3: [Objective]
[Same structure as Goal 1]

[Cover all material objectives]

## Key Metrics & Trends
### Financial Metrics
| Metric | Previous Period | Current Period | Target | Variance | Trend |
|---|---|---|---|---|---|
| [Metric] | [Value] | [Value] | [Target] | [+/-] | [Up/Down/Stable] |

### Operational Metrics
| Metric | Previous Period | Current Period | Target | Variance | Trend |
|---|---|---|---|---|---|
| [Metric] | [Value] | [Value] | [Target] | [+/-] | [Up/Down/Stable] |

### Strategic Metrics
| Metric | Previous Period | Current Period | Target | Variance | Trend |
|---|---|---|---|---|---|
| [Metric] | [Value] | [Value] | [Target] | [+/-] | [Up/Down/Stable] |

## Detailed Analysis
### What Worked Well
[Successes and wins during the period]

### Challenges & Obstacles
[Shortfalls, delays, or unexpected challenges]

### Root Cause Analysis
[Why did key changes occur?]

## Strategic Alignment
### Connection to Objectives
[How do results ladder up to company strategy?]

### Competitive Position
[How do we stand relative to competitors or benchmarks?]

### Market Dynamics
[External factors affecting performance]

## Risk Assessment
### Key Risks Identified
1. [Risk] - Probability: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [What's being done]

2. [Risk] - Probability: [HIGH/MEDIUM/LOW] - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [What's being done]

### Risk Status
[Overall risk posture assessment]

## Forward Outlook
### Next Period Focus
[Priorities and objectives for next period]

### Confidence & Capability
[Are we positioned to succeed?]

### Resource Needs
[Any additional support or approval needed?]

## Recommendations & Requests
### Recommended Actions
[What should stakeholders do or approve?]

### Resources or Approvals Needed
[What is being asked of stakeholders?]

### Decision Points
[What decisions are required from stakeholders?]

## Appendices
[Detailed charts, financial models, supporting data, customer examples]
      `,
      qualityChecklist: [
        'Executive summary conveys key message clearly',
        'Uses actual data and metrics (not qualitative claims)',
        'Performance vs. targets clearly stated',
        'Honest about shortfalls and challenges',
        'Connects results to strategy and objectives',
        'Trends identified and explained',
        'Risks assessed with clear mitigation plans',
        'Recommendations are specific and actionable',
        'Asks are clear and justified',
        'Appropriate for executive audience (concise, visuals)',
      ],
    },
    variables: [
      {
        name: 'organizationOrProject',
        description: 'Organization or project being reported on',
        required: true,
      },
      {
        name: 'reportingPeriod',
        description: 'Time period for the report (Q1 2026, FY2025, etc.)',
        required: true,
      },
      {
        name: 'primaryStakeholders',
        description: 'Main audience (Board, Investors, Executives, etc.)',
        required: false,
        defaultValue: 'Executive stakeholders',
      },
    ],
  },
  {
    slug: 'swot-strategy',
    name: 'Strategic SWOT Planning',
    description:
      'Develop strategic plans based on SWOT analysis with actionable strategies for each quadrant.',
    category: 'BUSINESS',
    template: {
      role: 'Strategic Planning Consultant',
      taskStructure: `
1. Identify internal strengths with evidence
2. Identify internal weaknesses honestly
3. Map external opportunities with market context
4. Assess external threats and their likelihood
5. Develop SO strategies (use strengths to capture opportunities)
6. Develop WO strategies (overcome weaknesses via opportunities)
7. Develop ST strategies (use strengths to counter threats)
8. Develop WT strategies (minimize weaknesses and avoid threats)
9. Prioritize top 3-5 strategic initiatives
      `.trim(),
      cotGuidance: `
Consider:
- What are we genuinely better at than competitors?
- What weaknesses are we avoiding confronting?
- Which opportunities have the highest ROI potential?
- What threats could be existential vs manageable?
- How do internal factors interact with external ones?
      `.trim(),
      constraints: [
        'Be honest about weaknesses — avoid spinning them as strengths',
        'Back each SWOT item with specific evidence or data',
        'Strategies must be actionable, not generic platitudes',
        'Prioritize strategies by impact and feasibility',
        'Consider competitive dynamics in all quadrants',
        'Limit to 5-7 items per SWOT quadrant for focus',
      ],
      formatSpec:
        'SWOT Strategy with: Context, SWOT Matrix (4 quadrants), SO/WO/ST/WT Strategies, Priority Matrix, Top 5 Strategic Initiatives with Owners, Implementation Timeline, Success Metrics',
      qualityChecklist: [
        'Each SWOT item is specific and evidence-based',
        'Strategies directly address SWOT intersections',
        'Priorities are ranked by impact and feasibility',
        'Action items have clear owners and timelines',
        'Weaknesses are honest, not sugar-coated',
        'Strategies are differentiated, not generic',
      ],
    },
    variables: [
      {
        name: 'organization',
        description: 'Company or business unit being analyzed',
        required: true,
      },
      {
        name: 'objective',
        description: 'Strategic objective or decision to inform',
        required: true,
      },
      { name: 'industry', description: 'Industry context', required: false },
      {
        name: 'timeframe',
        description: 'Strategic planning horizon',
        required: false,
        defaultValue: '1-3 years',
      },
    ],
  },
  {
    slug: 'change-management',
    name: 'Change Management Plan',
    description:
      'Plan organizational change initiatives with stakeholder engagement, communication, and adoption strategies.',
    category: 'BUSINESS',
    template: {
      role: 'Change Management Consultant and Organizational Psychologist',
      taskStructure: `
1. Define the change and its business rationale
2. Assess change readiness and organizational capacity
3. Identify stakeholders and their concerns
4. Design communication plan (what, when, to whom)
5. Plan training and capability building
6. Define success metrics and milestones
7. Create resistance management strategy
8. Establish feedback loops and adjustment mechanisms
      `.trim(),
      cotGuidance: `
Consider:
- Why will people resist this change?
- Who are the champions and who are the blockers?
- What has worked/failed in past change initiatives?
- How do we build momentum early?
- What support do people need to succeed?
      `.trim(),
      constraints: [
        'Address emotional and practical concerns separately',
        'Include specific stakeholder engagement tactics',
        'Plan for resistance — it is inevitable, not optional',
        'Provide timeline with realistic milestones',
        'Include feedback mechanisms for course correction',
        'Define clear success metrics beyond adoption rates',
      ],
      formatSpec:
        'Change Management Plan with: Change Overview, Business Case, Readiness Assessment, Stakeholder Map, Communication Plan, Training Plan, Resistance Management Strategy, Timeline & Milestones, Success Metrics, Risk Mitigation, Feedback & Adjustment Protocol',
      qualityChecklist: [
        'Business case for change is compelling',
        'All stakeholder groups are identified and addressed',
        'Communication plan is specific (what, when, who, how)',
        'Resistance strategies are proactive, not reactive',
        'Training plan matches capability gaps',
        'Milestones are measurable and realistic',
      ],
    },
    variables: [
      { name: 'changeDescription', description: 'What is changing and why', required: true },
      {
        name: 'scope',
        description: 'Scope of change (team, department, organization)',
        required: true,
      },
      { name: 'timeline', description: 'Expected implementation timeline', required: true },
      { name: 'knownResistance', description: 'Any known resistance or concerns', required: false },
    ],
  },
  {
    slug: 'vendor-evaluation',
    name: 'Vendor/Supplier Evaluation',
    description:
      'Evaluate and compare vendors or suppliers with structured criteria, scoring, and recommendation.',
    category: 'BUSINESS',
    template: {
      role: 'Procurement Specialist and Vendor Management Expert',
      taskStructure: `
1. Define evaluation criteria and weighting
2. Assess each vendor against criteria
3. Compare pricing and total cost of ownership
4. Evaluate reliability, support, and reputation
5. Assess contract terms and flexibility
6. Check references and track record
7. Provide scored recommendation
      `.trim(),
      cotGuidance: `
Consider:
- What criteria matter most for this specific need?
- What is the total cost including hidden costs?
- How reliable is each vendor's track record?
- What happens if we need to switch vendors later?
- What do existing customers say about them?
      `.trim(),
      constraints: [
        'Use consistent weighted scoring across all vendors',
        'Include total cost of ownership, not just quoted price',
        'Verify claims with references or case studies',
        'Assess vendor stability and longevity risk',
        'Include contract flexibility and exit terms',
        'Consider implementation and migration costs',
      ],
      formatSpec:
        'Vendor Evaluation with: Requirements Summary, Evaluation Criteria (weighted), Vendor Profiles, Comparison Matrix, Pricing Analysis, Reference Check Summary, Risk Assessment per Vendor, Scored Ranking, Recommendation with Rationale',
      qualityChecklist: [
        'Criteria are weighted by business importance',
        'All vendors assessed against same criteria',
        'TCO includes implementation and ongoing costs',
        'References are checked and summarized',
        'Risks per vendor are identified',
        'Recommendation is clearly supported by scores',
      ],
    },
    variables: [
      { name: 'requirement', description: 'What you need from a vendor', required: true },
      { name: 'vendors', description: 'Vendors being evaluated', required: true },
      { name: 'budget', description: 'Budget range', required: false },
      { name: 'timeline', description: 'Decision timeline', required: false },
    ],
  },
  {
    slug: 'sop-creation',
    name: 'Standard Operating Procedure',
    description:
      'Create clear, actionable SOPs that ensure consistent execution of business processes.',
    category: 'BUSINESS',
    template: {
      role: 'Process Engineer and Operations Specialist',
      taskStructure: `
1. Define the process scope and purpose
2. Identify roles and responsibilities
3. Document step-by-step procedures
4. Include decision points and branching logic
5. Define quality checkpoints and standards
6. Create troubleshooting guide for common issues
7. Establish review and update schedule
      `.trim(),
      cotGuidance: `
Consider:
- Could a new employee follow this without additional guidance?
- Where do mistakes most commonly happen?
- What decision points require judgment?
- How do we verify each step was done correctly?
- What are the consequences of skipping a step?
      `.trim(),
      constraints: [
        'Write at a level a new team member can follow',
        'Include visual aids or flowcharts where helpful',
        'Number all steps sequentially',
        'Include safety or compliance requirements',
        'Specify tools, materials, or systems needed',
        'Define what "done correctly" looks like at each step',
      ],
      formatSpec:
        'SOP Document with: Title, Purpose, Scope, Roles & Responsibilities, Prerequisites, Step-by-Step Procedure (numbered), Decision Points, Quality Checkpoints, Troubleshooting Guide, Related Documents, Version History, Review Schedule',
      qualityChecklist: [
        'Steps are clear enough for a new employee',
        'All decision points are documented',
        'Quality standards are specific and measurable',
        'Troubleshooting covers common issues',
        'Roles and responsibilities are clear',
        'Review schedule ensures document stays current',
      ],
    },
    variables: [
      { name: 'processName', description: 'Name of the process', required: true },
      {
        name: 'department',
        description: 'Department or team that owns this process',
        required: true,
      },
      {
        name: 'frequency',
        description: 'How often this process runs',
        required: false,
        defaultValue: 'as needed',
      },
      {
        name: 'complianceRequirements',
        description: 'Any regulatory or compliance considerations',
        required: false,
      },
    ],
  },
  {
    slug: 'budget-planning',
    name: 'Budget Planning & Allocation',
    description:
      'Create structured budgets with allocation rationale, contingencies, and tracking mechanisms.',
    category: 'BUSINESS',
    template: {
      role: 'Financial Planner and Budget Analyst',
      taskStructure: `
1. Define budget scope, period, and objectives
2. Inventory all revenue sources and projections
3. Categorize expenses (fixed, variable, discretionary)
4. Allocate budget with clear rationale per line item
5. Build in contingency reserves
6. Create variance tracking mechanisms
7. Define approval and reallocation procedures
      `.trim(),
      cotGuidance: `
Consider:
- What are the non-negotiable costs vs discretionary?
- Where can we create the most ROI per dollar?
- What contingency is realistic (5-15%)?
- How do we track spending against plan?
- What triggers a budget reallocation conversation?
      `.trim(),
      constraints: [
        'Include all cost categories (do not underestimate)',
        'Build in 5-15% contingency reserve',
        'Justify major allocations with expected ROI',
        'Include monthly or quarterly tracking cadence',
        'Define approval thresholds for reallocation',
        'Compare to prior period where possible',
      ],
      formatSpec:
        'Budget Plan with: Executive Summary, Revenue Projections, Expense Categories, Line Item Budget (with rationale), Contingency Reserve, Cash Flow Forecast, Variance Tracking Template, Approval Procedures, Prior Period Comparison',
      qualityChecklist: [
        'All expense categories are included',
        'Revenue projections are realistic and sourced',
        'Allocations have clear rationale',
        'Contingency reserve is adequate',
        'Tracking mechanisms are practical',
        'Approval procedures are clear',
      ],
    },
    variables: [
      { name: 'scope', description: 'Budget scope (project, department, company)', required: true },
      {
        name: 'period',
        description: 'Budget period (quarter, year, project duration)',
        required: true,
      },
      { name: 'totalBudget', description: 'Total available budget', required: false },
      { name: 'priorities', description: 'Top spending priorities', required: false },
    ],
  },
  {
    slug: 'kpi-framework',
    name: 'KPI Design & Measurement',
    description:
      'Design meaningful KPI frameworks that drive the right behaviors and measure what matters.',
    category: 'BUSINESS',
    template: {
      role: 'Performance Management Specialist',
      taskStructure: `
1. Align KPIs with strategic objectives
2. Define each KPI precisely (formula, data source, frequency)
3. Set targets using benchmarks and historical data
4. Categorize as leading vs lagging indicators
5. Design dashboards and reporting cadence
6. Define accountability and ownership
7. Plan for KPI review and evolution
      `.trim(),
      cotGuidance: `
Consider:
- Does this KPI drive the RIGHT behavior?
- Can we actually measure this reliably?
- What is a realistic but ambitious target?
- Do we have enough leading indicators?
- Will gaming this KPI cause problems?
      `.trim(),
      constraints: [
        'Each KPI must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
        'Include both leading and lagging indicators',
        'Define data source and calculation method precisely',
        'Set targets based on benchmarks, not guesswork',
        'Consider unintended consequences of each KPI',
        'Limit to 5-7 KPIs per team or function for focus',
      ],
      formatSpec:
        'KPI Framework with: Strategic Objectives, KPI Definitions (name, formula, source, frequency, owner), Target Setting Rationale, Leading vs Lagging Classification, Dashboard Design, Reporting Cadence, Review & Adjustment Protocol',
      qualityChecklist: [
        'KPIs align directly with strategic objectives',
        'Each KPI has a precise measurement definition',
        'Targets are ambitious but achievable',
        'Mix of leading and lagging indicators',
        'Data sources are reliable and accessible',
        'Unintended consequences are considered',
      ],
    },
    variables: [
      { name: 'objectives', description: 'Strategic objectives to measure', required: true },
      { name: 'scope', description: 'Scope (company, department, team, project)', required: true },
      { name: 'currentMetrics', description: 'Any existing metrics or baselines', required: false },
      { name: 'benchmarks', description: 'Industry or competitor benchmarks', required: false },
    ],
  },
  {
    slug: 'team-charter',
    name: 'Team Charter & Operating Agreement',
    description:
      'Create team charters that define purpose, norms, roles, and working agreements for high-performing teams.',
    category: 'BUSINESS',
    template: {
      role: 'Team Coach and Organizational Development Specialist',
      taskStructure: `
1. Define team purpose and mission
2. Clarify roles, responsibilities, and decision rights
3. Establish communication norms and tools
4. Set meeting cadence and formats
5. Define conflict resolution process
6. Create accountability and feedback mechanisms
7. Establish success metrics for the team
      `.trim(),
      cotGuidance: `
Consider:
- What makes this team's purpose unique?
- Where do role ambiguities typically cause friction?
- What communication habits lead to dysfunction?
- How should this team make decisions?
- What does healthy conflict look like for this team?
      `.trim(),
      constraints: [
        'Keep the charter to 2-3 pages maximum',
        'Make norms specific and observable (not vague values)',
        'Include decision-making frameworks (RACI, consent, etc)',
        'Define escalation paths for unresolved conflicts',
        'Set review cadence to keep the charter living',
        'Include both in-person and remote work norms',
      ],
      formatSpec:
        'Team Charter with: Team Purpose, Members & Roles (RACI), Communication Norms, Meeting Cadence, Decision-Making Framework, Conflict Resolution Process, Accountability Practices, Success Metrics, Review Schedule',
      qualityChecklist: [
        'Purpose is clear and differentiated',
        'Roles have no ambiguous overlaps',
        'Communication norms are specific and practical',
        'Decision-making process is clear for different decisions',
        'Conflict resolution has clear escalation path',
        'Charter is concise enough to actually be used',
      ],
    },
    variables: [
      { name: 'teamName', description: 'Team name or identifier', required: true },
      { name: 'teamPurpose', description: 'Why this team exists', required: true },
      { name: 'members', description: 'Team members and their primary roles', required: true },
      {
        name: 'workModel',
        description: 'Work model (remote, hybrid, in-person)',
        required: false,
        defaultValue: 'hybrid',
      },
    ],
  },
  {
    slug: 'crisis-management',
    name: 'Crisis Response Plan',
    description:
      'Develop crisis management plans with response protocols, communication strategies, and recovery steps.',
    category: 'BUSINESS',
    template: {
      role: 'Crisis Management Consultant and Communications Expert',
      taskStructure: `
1. Identify and categorize potential crisis scenarios
2. Define severity levels and escalation triggers
3. Establish crisis response team and roles
4. Create communication protocols (internal and external)
5. Develop stakeholder-specific messaging
6. Plan operational continuity measures
7. Design post-crisis review and recovery process
      `.trim(),
      cotGuidance: `
Consider:
- What are the first 60 minutes of this crisis?
- Who needs to know, in what order?
- What is the worst thing we could say publicly?
- How do we maintain operations during the crisis?
- What does recovery look like?
      `.trim(),
      constraints: [
        'Include response timelines (golden hour, first 24h, first week)',
        'Define clear chain of command and decision authority',
        'Prepare holding statements for immediate use',
        'Address all stakeholder groups (employees, customers, media, regulators)',
        'Include contact lists and backup communication channels',
        'Plan for both digital and physical crisis scenarios',
      ],
      formatSpec:
        'Crisis Plan with: Risk Scenarios, Severity Classification, Crisis Team Roster, Escalation Protocol, Communication Templates (internal, external, media), Stakeholder Contact Lists, Operational Continuity Plan, Post-Crisis Review Framework',
      qualityChecklist: [
        'Crisis scenarios are realistic and comprehensive',
        'Escalation triggers are specific and measurable',
        'Response timelines are clearly defined',
        'Communication templates are pre-written and ready',
        'Chain of command is unambiguous',
        'Recovery process includes learning and improvement',
      ],
    },
    variables: [
      { name: 'organization', description: 'Organization or business unit', required: true },
      { name: 'crisisTypes', description: 'Types of crises to plan for', required: true },
      {
        name: 'industry',
        description: 'Industry context (affects regulatory requirements)',
        required: false,
      },
      { name: 'teamSize', description: 'Organization size for scaling response', required: false },
    ],
  },
  {
    slug: 'partnership-proposal',
    name: 'Strategic Partnership Proposal',
    description:
      'Create compelling partnership proposals that articulate mutual value, clear terms, and implementation roadmap.',
    category: 'BUSINESS',
    template: {
      role: 'Business Development Strategist and Partnership Architect',
      taskStructure: `
1. Research and understand the potential partner
2. Articulate the strategic rationale for partnership
3. Define mutual value proposition (what each side gains)
4. Propose partnership structure and governance
5. Outline specific collaboration activities
6. Define success metrics and milestones
7. Address risks and mitigation strategies
      `.trim(),
      cotGuidance: `
Consider:
- Why would THEY want to partner with us specifically?
- What unique value do we each bring?
- Where are the potential conflicts of interest?
- What does success look like for both parties?
- How do we start small and scale?
      `.trim(),
      constraints: [
        "Lead with the partner's benefit, not yours",
        'Be specific about value exchange (not vague synergies)',
        'Include clear governance and decision-making structure',
        'Propose a pilot or phase 1 to reduce risk',
        'Address IP, revenue sharing, and exit terms',
        'Keep proposal under 10 pages',
      ],
      formatSpec:
        'Partnership Proposal with: Executive Summary, Partner Research, Strategic Rationale, Mutual Value Proposition, Partnership Structure, Activities & Deliverables, Governance Model, Financial Terms, Success Metrics, Timeline, Risk Assessment, Next Steps',
      qualityChecklist: [
        'Partner feels understood and valued',
        'Value proposition is mutual and specific',
        'Governance structure is clear and fair',
        'Pilot phase reduces commitment risk',
        'Financial terms are transparent',
        'Exit terms are addressed respectfully',
      ],
    },
    variables: [
      { name: 'partnerName', description: 'Potential partner organization', required: true },
      { name: 'partnershipGoal', description: 'What you want to achieve together', required: true },
      { name: 'yourValue', description: 'What you bring to the partnership', required: true },
      { name: 'theirValue', description: 'What you hope they bring', required: true },
    ],
  },
  {
    slug: 'quarterly-review',
    name: 'Quarterly Business Review',
    description:
      'Prepare comprehensive quarterly business reviews with performance analysis, learnings, and next-quarter plans.',
    category: 'BUSINESS',
    template: {
      role: 'Business Operations Analyst and Executive Reporting Specialist',
      taskStructure: `
1. Summarize key achievements and milestones
2. Analyze performance against OKRs/KPIs
3. Review financial performance (revenue, costs, margins)
4. Assess team and operational health
5. Document key learnings and surprises
6. Identify risks and blockers for next quarter
7. Set priorities and goals for next quarter
      `.trim(),
      cotGuidance: `
Consider:
- What were the biggest wins and what drove them?
- Where did we miss and why (root cause, not blame)?
- What did we learn that changes our strategy?
- What risks are we carrying into next quarter?
- Are our priorities still the right priorities?
      `.trim(),
      constraints: [
        'Include specific metrics with trend context',
        'Be honest about misses — root cause, not excuses',
        'Highlight what you learned, not just what you did',
        'Next quarter goals must be specific and measurable',
        'Include resource and dependency needs',
        'Keep executive summary to 1 page',
      ],
      formatSpec:
        'QBR with: Executive Summary, Key Achievements, KPI Scorecard (actual vs target), Financial Summary, Team Health Check, Key Learnings, Risk Register, Next Quarter Priorities, Resource Needs, Open Questions for Leadership',
      qualityChecklist: [
        'Executive summary captures the quarter in 1 page',
        'Achievements are specific and impactful',
        'Misses include honest root cause analysis',
        'Metrics show trends, not just snapshots',
        'Learnings are actionable, not platitudes',
        'Next quarter goals are SMART',
      ],
    },
    variables: [
      { name: 'quarter', description: 'Quarter being reviewed (e.g., Q1 2026)', required: true },
      { name: 'team', description: 'Team or business unit', required: true },
      { name: 'kpis', description: 'Key KPIs and their targets', required: true },
      { name: 'financials', description: 'Key financial data for the quarter', required: false },
    ],
  },
]
