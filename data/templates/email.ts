// Drferdi

import type { TemplateDefinition } from '@/types'

export const emailTemplates: TemplateDefinition[] = [
  {
    slug: 'follow-up-email',
    name: 'Professional Follow-Up Email',
    description:
      'Craft a professional follow-up email after initial contact, meeting, or proposal submission',
    category: 'EMAIL',
    template: {
      role: 'You are an expert business communication specialist writing professional follow-up emails that are concise, respectful, and action-oriented.',
      taskStructure: `
1. Reference the original interaction (date, topic, context)
2. Acknowledge the recipient's time and prior communication
3. State the purpose of the follow-up clearly
4. Provide value or next steps
5. Include a soft call-to-action with clear timeline
6. Close with professional warmth`,
      cotGuidance: `Think through:
- How much time has passed since original contact?
- What was the outcome/status of previous communication?
- Is this following up on a decision, deliverable, or general check-in?
- What does the recipient benefit from responding?
- What specific action do you want them to take?`,
      constraints: [
        'Maximum 250 words',
        'No aggressive language or pressure tactics',
        'One clear call-to-action per email',
        "Respectful of recipient's time",
        'No assumptions about their availability or intent',
      ],
      formatSpec:
        'Structure: Subject Line → Greeting → Context → Value/Update → CTA → Closing | Tone: Professional, warm, respectful | Subject line: Reference original topic or action item (e.g., "Following Up: Q2 Proposal")',
      qualityChecklist: [
        'Acknowledges previous communication explicitly',
        'Clear reason for follow-up is stated',
        'Provides value or addresses concern',
        'Single, specific CTA with timeline',
        'Professional but personable tone',
        'Free of typos and grammatical errors',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's first name",
        required: true,
        defaultValue: 'John',
      },
      {
        name: 'originalTopic',
        description: 'Topic of the original interaction',
        required: true,
        defaultValue: 'Product Demo Meeting',
      },
      {
        name: 'daysAgo',
        description: 'Number of days since original contact',
        required: true,
        defaultValue: '3',
      },
      {
        name: 'keyUpdate',
        description: 'Key update or progress to share',
        required: true,
        defaultValue: 'Feature is now ready for review',
      },
      {
        name: 'desiredAction',
        description: 'Specific action you want the recipient to take',
        required: true,
        defaultValue: 'Schedule a 30-min call',
      },
      {
        name: 'proposedDate',
        description: 'Proposed date or timeframe for the desired action',
        required: true,
        defaultValue: 'Thursday or Friday',
      },
    ],
  },
  {
    slug: 'cold-outreach',
    name: 'Cold Outreach Email',
    description:
      'Generate a compelling cold outreach email that captures attention and drives engagement without prior relationship',
    category: 'EMAIL',
    template: {
      role: 'You are a persuasive business development professional crafting cold outreach emails that stand out, demonstrate research, and create genuine interest.',
      taskStructure: `
1. Personalized subject line that creates curiosity
2. Genuine compliment or specific reference to recipient's work
3. Brief statement of who you are
4. Clear value proposition (why now, why them)
5. Specific, low-friction next step
6. Social proof or credibility signal (optional)
7. Conversational close`,
      cotGuidance: `Consider:
- What makes this recipient unique? (Not generic)
- Why would they care about what you offer?
- What is your credibility or differentiation?
- What is the smallest possible ask to start conversation?
- Why should they respond TODAY vs. ignoring?
- Does this feel like a genuine connection or mass spam?`,
      constraints: [
        'Maximum 150 words (brevity is respect)',
        'No "I believe you are the perfect fit" - be specific',
        'No attachments without prior agreement',
        'One clear, small CTA (not multiple asks)',
        'Avoid generic openers ("I hope this email finds you")',
        'Research evident - personalization required',
      ],
      formatSpec:
        'Structure: Subject → Hook (personal reference) → Your value → Specific CTA → Closing | Tone: Authentic, respectful, curious, conversational | Subject line: Use curiosity, specificity, or urgency without clickbait (max 50 chars)',
      qualityChecklist: [
        'Recipient is identifiable and research shows',
        'Value proposition is specific and credible',
        'Opening line is genuine and non-generic',
        'CTA is low-friction (5-min call, not 1-hour meeting)',
        'Email can be read in under 30 seconds',
        'Tone is peer-to-peer, not salesy',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's first name",
        required: true,
        defaultValue: 'Sarah',
      },
      {
        name: 'recipientCompany',
        description: "Recipient's company name",
        required: true,
        defaultValue: 'TechCorp',
      },
      {
        name: 'recipientRole',
        description: "Recipient's job title or role",
        required: true,
        defaultValue: 'Head of Product',
      },
      {
        name: 'personalReference',
        description: "Specific reference to the recipient's work or achievements",
        required: true,
        defaultValue: 'Your recent article on scaling teams',
      },
      {
        name: 'yourValue',
        description: 'Your core value proposition',
        required: true,
        defaultValue: 'We help teams reduce meeting time by 40%',
      },
      {
        name: 'yourContext',
        description: 'Brief context establishing your credibility',
        required: true,
        defaultValue: 'We work with 20+ Series B companies',
      },
      {
        name: 'smallAsk',
        description: 'Small, low-friction first ask',
        required: true,
        defaultValue: 'Grab coffee for 20 minutes next week',
      },
    ],
  },
  {
    slug: 'meeting-recap',
    name: 'Meeting Recap Email',
    description:
      'Create a professional meeting recap email that documents discussion, decisions, and action items for alignment',
    category: 'EMAIL',
    template: {
      role: 'You are an executive communicator creating clear, action-oriented meeting recaps that ensure alignment and accountability across stakeholders.',
      taskStructure: `
1. Thank attendees for their time
2. Brief summary of meeting purpose
3. Key discussion points (3-5 bullets)
4. Decisions made (explicit)
5. Action items with owner and deadline
6. Next steps and follow-up meeting details
7. Closing statement inviting questions`,
      cotGuidance: `Think about:
- Who needs to act on what?
- Were all decisions actually decided or just discussed?
- Which action items have owners and dates?
- Are there any unresolved questions or blockers?
- Will this email serve as a record if someone was absent?
- Are next meeting expectations crystal clear?`,
      constraints: [
        'Maximum 400 words',
        'Action items must have owner and due date',
        'Decisions must be explicitly stated',
        'No ambiguous language ("maybe," "might")',
        'Organized with clear sections',
        'Tone remains professional and inclusive',
      ],
      formatSpec:
        'Structure: Greeting → Purpose → Discussion Points → Decisions → Action Items (table format) → Next Steps → Closing | Tone: Professional, clear, action-oriented | Subject line: Include meeting name and date (e.g., "Meeting Recap: Q2 Planning – March 20")',
      qualityChecklist: [
        'All attendees are thanked or acknowledged',
        'Meeting objective is restated',
        'Decisions are explicitly documented',
        'Each action item has owner, description, and deadline',
        'No one is assigned tasks without confirmation',
        'Next meeting date/time is confirmed',
        'Tone is inclusive (not assigning blame)',
      ],
    },
    variables: [
      {
        name: 'meetingName',
        description: 'Name or topic of the meeting',
        required: true,
        defaultValue: 'Q2 Product Planning',
      },
      {
        name: 'meetingDate',
        description: 'Date when the meeting took place',
        required: true,
        defaultValue: 'March 20, 2026',
      },
      {
        name: 'attendees',
        description: 'Comma-separated list of meeting attendees',
        required: true,
        defaultValue: 'Sarah, James, Priya',
      },
      {
        name: 'purpose',
        description: 'Meeting objective or purpose',
        required: true,
        defaultValue: 'Prioritize Q2 features and dependencies',
      },
      {
        name: 'keyDecisions',
        description: 'Key decisions made during the meeting',
        required: true,
        defaultValue: 'Focus on auth redesign; defer analytics refactor',
      },
      {
        name: 'blockers',
        description: 'Blockers or unresolved items from the meeting',
        required: false,
        defaultValue: 'Need design resources by March 25',
      },
      {
        name: 'nextMeetingDate',
        description: 'Date of the next scheduled meeting',
        required: false,
        defaultValue: 'April 3, 2026',
      },
    ],
  },
  {
    slug: 'apology-email',
    name: 'Professional Apology Email',
    description:
      'Compose a sincere professional apology that takes responsibility, explains impact, and restores trust',
    category: 'EMAIL',
    template: {
      role: 'You are a skilled communicator writing professional apologies that are sincere, accountable, and action-focused on preventing future issues.',
      taskStructure: `
1. Direct, sincere apology without qualification
2. Specific acknowledgment of what went wrong
3. Recognition of impact on recipient (not dismissive)
4. Clear explanation of cause (not excuse)
5. Concrete steps taken to prevent recurrence
6. Offer of specific remedy or next step
7. Brief statement of commitment to rebuild trust`,
      cotGuidance: `Reflect on:
- What exactly did I do wrong? (Be specific)
- How did this affect the other person? (Show empathy)
- Is my apology for the action or for being caught? (Intent matters)
- What am I actually doing differently? (Not just saying)
- Am I overexplaining or defending? (Both undermine sincerity)
- What does the recipient need to move forward?`,
      constraints: [
        'No "I\'m sorry if you felt..." - take full responsibility',
        'No but/however/except - no deflection',
        'Avoid over-explaining or justifying',
        'Maximum 300 words',
        'Specific remedy or next step included',
        'Tone is humble but not self-pitying',
      ],
      formatSpec:
        'Structure: Direct Apology → What Went Wrong → Impact Acknowledged → Root Cause → Steps Taken → Remedy Offered → Commitment | Tone: Sincere, humble, accountable, forward-looking | Subject line: Direct and honest (e.g., "I apologize for missing the deadline")',
      qualityChecklist: [
        'Apology is stated clearly in first sentence',
        'Specific wrong action is named',
        'Impact on recipient is explicitly acknowledged',
        'No deflection or blame-shifting',
        'Concrete changes or remedies offered',
        'Timeline for improvement is clear',
        'Shows understanding of why it matters',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's name",
        required: true,
        defaultValue: 'Alex',
      },
      {
        name: 'specificFailure',
        description: 'Specific failure or mistake to apologize for',
        required: true,
        defaultValue: 'Missed the project deadline by 2 weeks',
      },
      {
        name: 'impactOnRecipient',
        description: 'How the failure impacted the recipient or their team',
        required: true,
        defaultValue: 'Your team had to rush and the launch was delayed',
      },
      {
        name: 'rootCause',
        description: 'Root cause of the failure (honest explanation, not excuse)',
        required: true,
        defaultValue: "I underestimated complexity and didn't escalate early",
      },
      {
        name: 'stepsTaken',
        description: 'Steps already taken to address the issue',
        required: true,
        defaultValue: 'Implemented weekly check-ins with clearer estimates',
      },
      {
        name: 'concreteRemedy',
        description: 'Concrete remedy or compensation offered',
        required: true,
        defaultValue: 'Will deliver the revision 2 weeks early at no cost',
      },
      {
        name: 'preventionMeasure',
        description: 'Specific measure to prevent recurrence',
        required: true,
        defaultValue: 'Scheduled monthly sync to catch risks early',
      },
    ],
  },
  {
    slug: 'proposal-email',
    name: 'Business Proposal Email',
    description:
      'Draft a persuasive business proposal email that presents solution, value, and clear next steps',
    category: 'EMAIL',
    template: {
      role: 'You are a strategic business development professional crafting proposal emails that are compelling, clear, and easy to act upon.',
      taskStructure: `
1. Personalized opening referencing prior conversation or need
2. Problem statement (their challenge, not your product)
3. Solution overview (how you solve it)
4. Key benefits or value metrics
5. Investment/pricing (if appropriate)
6. Timeline or implementation overview
7. Clear next step with specific CTA
8. Availability/contact information`,
      cotGuidance: `Consider:
- Does the opening tie to their specific situation?
- Am I solving their problem or selling my solution?
- What metrics or proof points matter to them?
- Is pricing transparent or will it feel like a gotcha?
- What is the timeline they actually care about?
- What are their likely concerns and objections?
- What is the smallest commitment to move forward?`,
      constraints: [
        'Maximum 500 words (or separate with "full proposal attached")',
        'Problem-first, not solution-first',
        'Value metrics should be specific',
        'No aggressive pressure language',
        'Pricing (if included) is transparent',
        'CTA is clear and includes deadline',
      ],
      formatSpec:
        'Structure: Greeting → Reference/Problem → Solution → Value/ROI → Timeline → Investment → CTA → Availability | Tone: Professional, consultative, confident | Subject line: Solution-focused with recipient benefit (e.g., "Proposal: Streamline Your Hiring Process")',
      qualityChecklist: [
        'Opening references specific prior conversation or context',
        "Problem is stated from recipient's perspective",
        'Solution is clearly explained without jargon',
        'Specific value or ROI metrics included',
        'Implementation timeline is realistic',
        'Pricing is transparent (no hidden costs)',
        'Next step is specific and has deadline',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's first name",
        required: true,
        defaultValue: 'Jordan',
      },
      {
        name: 'recipientCompany',
        description: "Recipient's company name",
        required: true,
        defaultValue: 'FinanceFlow Inc',
      },
      {
        name: 'priorContext',
        description: 'Context from prior conversation or research',
        required: true,
        defaultValue: 'Your mention of scaling the finance team',
      },
      {
        name: 'theirChallenge',
        description: "The recipient's specific business challenge",
        required: true,
        defaultValue: 'Manual expense reporting takes 20+ hours per week',
      },
      {
        name: 'ourSolution',
        description: 'Your solution or offering',
        required: true,
        defaultValue: 'Automated expense categorization + real-time reporting',
      },
      {
        name: 'valueProposition',
        description: 'Specific value or ROI metrics',
        required: true,
        defaultValue: 'Reduce approval time by 75%, save $50k annually',
      },
      {
        name: 'investmentLevel',
        description: 'Investment or pricing information',
        required: false,
        defaultValue: '$200/month for 50 users',
      },
      {
        name: 'implementationTime',
        description: 'Estimated implementation timeline',
        required: true,
        defaultValue: '2 weeks',
      },
      {
        name: 'decisionDeadline',
        description: 'Proposed decision deadline',
        required: false,
        defaultValue: 'April 15',
      },
    ],
  },
  {
    slug: 'feedback-request',
    name: 'Feedback Request Email',
    description:
      'Create an effective feedback request email that makes it easy and clear for recipients to provide constructive input',
    category: 'EMAIL',
    template: {
      role: 'You are a thoughtful communicator requesting specific, actionable feedback in a way that respects recipient time and invites genuine input.',
      taskStructure: `
1. Clear statement of what you're requesting feedback on
2. Context: why you're asking them specifically
3. Specific questions or focus areas (not open-ended)
4. Format/medium for response (email, survey, call)
5. Estimated time commitment
6. Deadline with clear rationale
7. Assurance of confidentiality (if relevant)
8. Thank you and offer of reciprocal help`,
      cotGuidance: `Think through:
- Why am I asking THIS person for feedback? (Be specific)
- What exactly do I want feedback on? (Not "what do you think")
- Am I asking for validation or genuine critique?
- Have I made it easy to respond? (Specific questions > open-ended)
- What is a reasonable time commitment I'm asking for?
- Will they feel safe giving honest feedback?
- Why is the deadline this date? (Real reason or arbitrary)`,
      constraints: [
        'Maximum 200 words',
        '3-5 specific questions, not open-ended',
        'Estimated time to respond clearly stated',
        'Real deadline with reasoning',
        'Safe, non-defensive tone',
        'Offer of reciprocal value or gratitude',
      ],
      formatSpec:
        'Structure: Greeting → What/Why → Specific Questions → Format → Timeline → Assurance → Close | Tone: Genuine, humble, open to criticism, grateful | Subject line: Clear and specific (e.g., "Feedback request: New onboarding flow")',
      qualityChecklist: [
        'Clearly states what feedback is being requested',
        "Explains why this specific person's input matters",
        'Questions are specific and answerable',
        'Time commitment is realistic and stated',
        'Deadline is real (not arbitrary)',
        'Safe environment for honest feedback',
        'Gratitude is expressed genuinely',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's first name",
        required: true,
        defaultValue: 'Casey',
      },
      {
        name: 'whatFeedbackOn',
        description: 'What you are requesting feedback on',
        required: true,
        defaultValue: 'New product onboarding flow',
      },
      {
        name: 'whyThemSpecifically',
        description: 'Why you are asking this specific person',
        required: true,
        defaultValue: 'You work with early-stage teams and know their pain points',
      },
      {
        name: 'specificQuestion1',
        description: 'First specific feedback question',
        required: true,
        defaultValue: 'Would you understand this in first login?',
      },
      {
        name: 'specificQuestion2',
        description: 'Second specific feedback question',
        required: true,
        defaultValue: 'What step feels confusing or unnecessary?',
      },
      {
        name: 'specificQuestion3',
        description: 'Third specific feedback question',
        required: false,
        defaultValue: 'What would help you get to value faster?',
      },
      {
        name: 'responseFormat',
        description: 'Preferred format for receiving feedback',
        required: true,
        defaultValue: '5-min video review or email bullets',
      },
      {
        name: 'deadline',
        description: 'Deadline for feedback with rationale',
        required: true,
        defaultValue: 'March 28 (before we finalize design)',
      },
    ],
  },
  {
    slug: 'announcement-email',
    name: 'Company Announcement Email',
    description:
      'Write a clear, engaging company announcement that communicates news, impact, and any required actions',
    category: 'EMAIL',
    template: {
      role: 'You are a skilled internal communicator crafting announcements that inform, inspire, and provide clarity to the whole organization.',
      taskStructure: `
1. Direct headline of the announcement
2. Why this matters (impact on company or team)
3. Details: what, when, who (as relevant)
4. Why this decision was made (context helps acceptance)
5. How this affects different groups (be specific)
6. What people need to do (if anything)
7. When to expect more information
8. Tone of confidence or gratitude`,
      cotGuidance: `Consider:
- What is the most important thing people need to know?
- Why does this matter to different parts of the organization?
- What questions will people have? (Answer proactively)
- Are there concerns this will raise? (Acknowledge them)
- What action do people need to take?
- When will more details be available?
- Is the tone aligned with the news? (Exciting, empathetic, clear)`,
      constraints: [
        'Maximum 400 words',
        'Headline is direct and clear',
        'Why it matters is stated early',
        'Impact on different teams is spelled out',
        'Required actions are explicit with deadlines',
        'No surprises or hidden information',
        'Tone matches the message',
      ],
      formatSpec:
        'Structure: Headline → Why It Matters → Details (What/When/Who) → Rationale → Impact by Group → Required Actions → Next Steps → Closing | Tone: Clear, confident, inclusive, forward-looking | Subject line: Direct and specific (e.g., "Announcing: Product X Launch Date" or "Team Update: New Leadership Structure")',
      qualityChecklist: [
        'News is stated in first sentence',
        'Context and why it matters is clear',
        'Specific details (dates, names, impacts) included',
        'Different stakeholder impacts are addressed',
        'Required actions are explicit with deadlines',
        'Timeline for more information is clear',
        'Tone is appropriate and consistent',
        'No internal jargon that excludes people',
      ],
    },
    variables: [
      {
        name: 'announcementType',
        description: 'Type or category of announcement',
        required: true,
        defaultValue: 'Product Launch',
      },
      {
        name: 'headline',
        description: 'Main announcement headline',
        required: true,
        defaultValue: 'Announcing Feature X: Launching March 25',
      },
      {
        name: 'keyNews',
        description: 'Key news being announced',
        required: true,
        defaultValue: "We're launching automated reporting with AI insights",
      },
      {
        name: 'whyItMatters',
        description: 'Why this announcement matters to the organization',
        required: true,
        defaultValue: 'Customers will save 8+ hours per week on reporting',
      },
      {
        name: 'impactOnEngineering',
        description: 'Impact on the engineering or product team',
        required: false,
        defaultValue: 'Support team will need to handle new onboarding questions',
      },
      {
        name: 'impactOnSales',
        description: 'Impact on the sales team',
        required: false,
        defaultValue: 'Use this in new contracts as core differentiator',
      },
      {
        name: 'impactOnCS',
        description: 'Impact on the customer success team',
        required: false,
        defaultValue: 'Prepare success tracks and training materials',
      },
      {
        name: 'actionRequired',
        description: 'Specific action required from recipients and deadline',
        required: false,
        defaultValue: 'Review launch prep doc by March 23',
      },
      {
        name: 'nextInfoDate',
        description: 'Date when more information will be available',
        required: false,
        defaultValue: 'March 22 – final product walkthrough',
      },
    ],
  },
  {
    slug: 'negotiation-email',
    name: 'Negotiation & Deal-Closing Email',
    description:
      'Write persuasive negotiation emails that advance deals, handle objections, and move toward agreement.',
    category: 'EMAIL',
    template: {
      role: 'You are an expert negotiator and deal strategist who writes emails that maintain relationships while advancing positions and closing agreements.',
      taskStructure: `
1. Acknowledge the counterparty's position and concerns
2. Restate shared goals and mutual benefits
3. Present your proposal with clear justification
4. Address potential objections proactively
5. Offer creative alternatives or concessions
6. Include a clear, time-bound next step`,
      cotGuidance: `Think through:
- What does the other party value most?
- Where is there room for compromise?
- What is your BATNA (best alternative)?
- How can you frame this as a win-win?
- What urgency exists naturally?`,
      constraints: [
        'Maintain professional and respectful tone throughout',
        'Never use ultimatums or aggressive language',
        'Back proposals with data or precedent where possible',
        'One clear ask per email',
        'Preserve the relationship regardless of outcome',
        'Keep under 300 words',
      ],
      formatSpec:
        'Structure: Greeting → Acknowledgment → Shared Goal → Proposal → Justification → Alternative → Next Step → Closing | Tone: Confident, respectful, solution-oriented | Subject line: Direct and collaborative (e.g., "Proposal Update: Path Forward on Q3 Terms")',
      qualityChecklist: [
        'Counterparty feels heard and respected',
        'Proposal is specific with clear rationale',
        'At least one creative alternative is offered',
        'Next step has a specific timeline',
        'Tone is firm but not aggressive',
        'Relationship is preserved regardless of outcome',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's name",
        required: true,
        defaultValue: 'Sarah',
      },
      {
        name: 'dealContext',
        description: 'Context or nature of the deal being negotiated',
        required: true,
        defaultValue: 'Annual software licensing renewal',
      },
      {
        name: 'yourPosition',
        description: 'Your opening or counter position',
        required: true,
        defaultValue: '15% volume discount with 2-year commitment',
      },
      {
        name: 'theirConcern',
        description: "Recipient's main concern or objection",
        required: true,
        defaultValue: 'Budget constraints for this fiscal year',
      },
      {
        name: 'alternativeOffer',
        description: 'Alternative offer or concession to propose',
        required: true,
        defaultValue: 'Phased payment plan over 6 months',
      },
    ],
  },
  {
    slug: 'customer-support',
    name: 'Customer Support Response',
    description:
      'Craft empathetic, solution-focused customer support emails that resolve issues and build loyalty.',
    category: 'EMAIL',
    template: {
      role: 'You are a customer success specialist who writes support responses that combine empathy, technical accuracy, and clear resolution steps.',
      taskStructure: `
1. Acknowledge the customer's frustration or issue
2. Thank them for bringing it to your attention
3. Explain the root cause simply (without blame)
4. Provide a clear solution or workaround
5. Outline preventive measures or next steps
6. Offer additional help and close warmly`,
      cotGuidance: `Think through:
- How frustrated is the customer? Match empathy level accordingly
- Is this a known issue or a unique case?
- What is the fastest path to resolution?
- Should you offer compensation or goodwill gesture?
- How do you prevent this from happening again?`,
      constraints: [
        'Lead with empathy, not excuses',
        'Never blame the customer',
        'Provide specific, actionable steps',
        'Include timeline for resolution',
        'Avoid technical jargon unless customer is technical',
        'Keep under 250 words',
      ],
      formatSpec:
        'Structure: Greeting → Empathy → Root Cause → Solution Steps → Prevention → Offer Help → Closing | Tone: Empathetic, helpful, professional, solution-focused | Subject line: Clear resolution signal (e.g., "Re: Your Issue with Billing – Resolved")',
      qualityChecklist: [
        'Customer feels heard and valued',
        'Issue is clearly understood and restated',
        'Solution is specific and actionable',
        'Timeline for resolution is provided',
        'Preventive measures are mentioned',
        'Tone is warm and professional throughout',
      ],
    },
    variables: [
      {
        name: 'customerName',
        description: "Customer's name",
        required: true,
        defaultValue: 'Alex',
      },
      {
        name: 'issueDescription',
        description: "Description of the customer's issue",
        required: true,
        defaultValue: 'Unable to access account after password reset',
      },
      {
        name: 'rootCause',
        description: 'Root cause of the issue (simple explanation)',
        required: true,
        defaultValue: 'Cache conflict with browser session',
      },
      {
        name: 'solution',
        description: 'Solution or workaround steps',
        required: true,
        defaultValue: 'Clear browser cache and use the new reset link',
      },
      {
        name: 'compensationOffer',
        description: 'Goodwill gesture or compensation (if applicable)',
        required: false,
        defaultValue: '1 month free on your plan',
      },
    ],
  },
  {
    slug: 'networking-email',
    name: 'Professional Networking Email',
    description:
      'Write genuine networking emails that build professional relationships through value exchange and shared interests.',
    category: 'EMAIL',
    template: {
      role: 'You are a thoughtful professional connector who writes networking emails that feel genuine, provide value, and create meaningful professional relationships.',
      taskStructure: `
1. Establish a genuine connection point (shared interest, mutual contact, admiration)
2. Introduce yourself briefly and relevantly
3. Explain why you're reaching out specifically to them
4. Offer value before asking for anything
5. Make a small, easy-to-accept request
6. Close with appreciation and flexibility`,
      cotGuidance: `Think through:
- What genuine connection exists between you?
- What value can you provide to them?
- Is your ask reasonable for a first interaction?
- How can you make responding easy?
- Would you respond to this email yourself?`,
      constraints: [
        'Must include a genuine, specific connection point',
        'Lead with value, not asks',
        'Keep the initial ask small and specific',
        'Maximum 200 words',
        'No generic flattery or copy-paste feel',
        'Show you have done research on them',
      ],
      formatSpec:
        'Structure: Subject → Connection Point → Brief Intro → Why Them → Value Offer → Small Ask → Flexible Close | Tone: Genuine, curious, respectful, concise | Subject line: Personal and specific (e.g., "Loved your talk on API design at JSConf")',
      qualityChecklist: [
        'Connection point is genuine and specific',
        'Self-introduction is relevant and brief',
        'Value is offered before any ask',
        'Ask is small and easy to say yes to',
        'Email feels personal, not templated',
        'Tone is confident but not presumptuous',
      ],
    },
    variables: [
      {
        name: 'recipientName',
        description: "Recipient's full name or title",
        required: true,
        defaultValue: 'Dr. Patel',
      },
      {
        name: 'connectionPoint',
        description: 'Genuine point of connection or mutual interest',
        required: true,
        defaultValue: 'Your article on distributed systems in InfoQ',
      },
      {
        name: 'yourBackground',
        description: 'Brief, relevant self-introduction',
        required: true,
        defaultValue: 'Backend engineer at a healthcare AI startup',
      },
      {
        name: 'valueOffer',
        description: 'Value you can offer to the recipient',
        required: true,
        defaultValue: 'Happy to share our real-world benchmarks on event sourcing',
      },
      {
        name: 'specificAsk',
        description: 'Small, specific ask to initiate the relationship',
        required: true,
        defaultValue: '15-minute virtual coffee to discuss observability patterns',
      },
    ],
  },
  {
    slug: 'resignation-email',
    name: 'Professional Resignation Email',
    description:
      'Write a professional, graceful resignation email that maintains relationships and ensures a smooth transition.',
    category: 'EMAIL',
    template: {
      role: 'You are a career communication expert who helps professionals resign gracefully while preserving relationships and reputation.',
      taskStructure: `
1. State the resignation clearly and directly
2. Express genuine gratitude for the experience
3. Highlight specific positive memories or growth
4. Offer transition support and timeline
5. Commit to professional handoff
6. Close with warmth and forward-looking sentiment`,
      cotGuidance: `Think through:
- What is the required notice period?
- What specific things are you genuinely grateful for?
- How can you make the transition easiest for your team?
- What tone preserves the relationship long-term?
- Is there anything sensitive to avoid mentioning?`,
      constraints: [
        'Be direct about the resignation in the first paragraph',
        'Never burn bridges or include negative commentary',
        'Provide specific last working day',
        'Offer concrete transition support',
        'Keep under 250 words',
        'Maintain professional warmth throughout',
      ],
      formatSpec:
        'Structure: Subject → Clear Statement → Gratitude → Specific Memories → Transition Plan → Closing | Tone: Professional, grateful, warm, forward-looking | Subject line: Direct and professional (e.g., "Resignation – [Your Name] – Last Day [Date]")',
      qualityChecklist: [
        'Resignation is stated clearly in first paragraph',
        'Specific last working day is mentioned',
        'Gratitude is genuine and specific',
        'Transition support is concrete and helpful',
        'No negative commentary about company or colleagues',
        'Preserves relationship for future networking',
      ],
    },
    variables: [
      {
        name: 'managerName',
        description: "Manager's first name",
        required: true,
        defaultValue: 'Michael',
      },
      {
        name: 'lastDay',
        description: 'Your last working day',
        required: true,
        defaultValue: 'April 15, 2026',
      },
      {
        name: 'positiveExperience',
        description: 'A specific positive experience or achievement to highlight',
        required: true,
        defaultValue: 'Leading the migration to microservices',
      },
      {
        name: 'transitionOffer',
        description: 'Specific offer to support the transition',
        required: true,
        defaultValue: 'Document all active projects and train my replacement',
      },
      {
        name: 'personalNote',
        description: 'Optional personal note about your next step',
        required: false,
        defaultValue: 'Pursuing a new opportunity in AI research',
      },
    ],
  },
]
