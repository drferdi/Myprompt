// Drferdi Transformer Engine V2 — Marketing Templates
import type { TemplateDefinition } from '@/types'

export const marketingTemplates: TemplateDefinition[] = [
  {
    slug: 'ad-copy',
    name: 'Ad Copy Writing',
    description:
      'Create compelling, conversion-focused ad copy for digital platforms (Google Ads, social media, email) that drives clicks and engagement.',
    category: 'MARKETING',
    template: {
      role: 'Persuasive Copywriter and Digital Marketing Strategist',
      taskStructure: `
        1. Identify target audience and their pain points
        2. Define unique value proposition and key benefits
        3. Craft attention-grabbing headline
        4. Write body copy that speaks to specific needs
        5. Create clear, compelling call-to-action
        6. A/B test variations and optimize
        7. Ensure brand voice consistency
        8. Verify platform-specific requirements
      `,
      cotGuidance: `
        Think about:
        - Who exactly is your target person? (demographics, interests, pain points)
        - What problem does your product solve?
        - Why is your solution better than alternatives?
        - What specific benefit matters most to them RIGHT NOW?
        - What objections might they have? How do you address them?
        - What emotion drives them to action?
        - What's the one thing you want them to do?
      `,
      constraints: [
        'Headline must be attention-grabbing and benefit-focused',
        'Copy must address specific audience pain points',
        'Include clear value proposition',
        'CTA must be action-oriented and specific',
        'Avoid generic or overused marketing language',
        'Respect platform character/word limits',
        'Include social proof or credibility where appropriate',
        'Match tone to target audience and brand voice',
      ],
      formatSpec:
        'Ad Copy with: Platform (Google Ads/Facebook/LinkedIn/Email), Headline(s), Body Copy, Call-to-Action, Target Audience Summary, Key Benefits Listed, Variations (A/B test options), Character Count/Platform Specs Met, Brand Voice Notes',
      qualityChecklist: [
        'Headline is compelling and benefit-focused',
        'Copy speaks directly to target audience pain points',
        'Value proposition is crystal clear',
        'CTA is specific, urgent, and action-oriented',
        'No generic marketing clichés or buzzwords',
        'Copy adheres to platform requirements',
        'Tone matches brand voice and audience',
        'Conversion likelihood is high based on persuasion principles',
      ],
    },
    variables: [
      {
        name: 'product',
        description: 'What product/service are you advertising?',
        required: true,
      },
      {
        name: 'platform',
        description: 'Where the ad will run (e.g., Google Ads, Facebook, LinkedIn, Instagram)',
        required: true,
      },
      {
        name: 'targetAudience',
        description:
          'Who you are targeting (e.g., "Busy parents aged 30-45", "B2B SaaS decision makers")',
        required: true,
      },
      {
        name: 'primaryBenefit',
        description: 'The #1 benefit or outcome you want to emphasize',
        required: true,
      },
      {
        name: 'desiredAction',
        description:
          'What you want them to do (e.g., "Click to shop", "Schedule a demo", "Download guide")',
        required: true,
      },
      {
        name: 'uniqueAngle',
        description: 'What makes this different from competitors',
        required: false,
        defaultValue: 'To be determined from product research',
      },
    ],
  },
  {
    slug: 'seo-content',
    name: 'SEO Content Writing',
    description:
      'Create SEO-optimized content that ranks in search engines while providing genuine value to readers and maintaining natural flow.',
    category: 'MARKETING',
    template: {
      role: 'SEO Content Strategist and Search Engine Optimization Expert',
      taskStructure: `
        1. Conduct keyword research and competitive analysis
        2. Structure content with SEO best practices (headings, structure)
        3. Write compelling meta title and description
        4. Integrate target keywords naturally throughout
        5. Create content that answers search intent completely
        6. Optimize for featured snippets where applicable
        7. Build internal and external link opportunities
        8. Ensure E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
      `,
      cotGuidance: `
        Consider:
        - What is the search intent? (informational, commercial, navigational, transactional)
        - What questions are people actually asking?
        - What would make THIS result better than current top 10?
        - How can we earn featured snippet position?
        - Where are natural opportunities for keywords?
        - What authority signals can we include?
        - How does this support overall content strategy?
      `,
      constraints: [
        'Target keyword must appear in title, H1, and first 100 words',
        'Content must be 1500+ words (or justified shorter) with depth',
        'Include at least 3 subheadings with supporting content',
        'Natural keyword integration (never forced or stuffed)',
        'Answer search intent completely and thoroughly',
        'Include actionable takeaways and next steps',
        'Optimize meta title (50-60 chars) and description (150-160 chars)',
        'Include internal linking opportunities (3-5 relevant links)',
      ],
      formatSpec:
        'SEO Content with: Meta Title, Meta Description, H1 Heading, Introduction with Intent Match, H2 Subheadings with Content, Key Takeaways Section, CTA, Internal Link Suggestions, External Link Opportunities, Keyword Integration Notes, Featured Snippet Opportunity (if applicable), Reading Level Indicator',
      qualityChecklist: [
        'Content thoroughly answers search intent',
        'Keywords integrated naturally without stuffing',
        'Meta title and description are compelling and keyword-optimized',
        'Content is well-structured with clear hierarchy',
        'Information is accurate, current, and authoritative',
        'E-E-A-T signals are present (credentials, sources, experience)',
        'Internal linking opportunities are identified',
        'Length and depth are appropriate for topic',
        'Featured snippet optimization is considered',
      ],
    },
    variables: [
      {
        name: 'targetKeyword',
        description: 'Primary keyword or phrase you want to rank for',
        required: true,
      },
      {
        name: 'searchIntent',
        description:
          'What searchers want (e.g., "how-to", "buying guide", "informational", "local")',
        required: true,
      },
      {
        name: 'topic',
        description: 'The main topic or subject of the content',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who you are writing for (e.g., "beginners", "professionals", "parents")',
        required: true,
      },
      {
        name: 'contentFormat',
        description:
          'Type of content (e.g., "guide", "listicle", "comparison", "tutorial", "case study")',
        required: false,
        defaultValue: 'comprehensive guide',
      },
    ],
  },
  {
    slug: 'email-campaign',
    name: 'Email Campaign',
    description:
      'Design engaging email campaigns with compelling subject lines, persuasive body copy, and clear CTAs that drive opens, clicks, and conversions.',
    category: 'MARKETING',
    template: {
      role: 'Email Marketing Specialist and Direct Response Copywriter',
      taskStructure: `
        1. Analyze audience segment and campaign goals
        2. Craft subject line to maximize open rates
        3. Write preheader text that complements subject line
        4. Structure email for readability and mobile optimization
        5. Create compelling body copy with clear benefit
        6. Design strategic CTA(s) that convert
        7. Include personalization and segmentation logic
        8. Plan send time and frequency optimization
      `,
      cotGuidance: `
        Think about:
        - Why would someone open THIS email?
        - What does this audience care about right now?
        - What's the one thing they should do?
        - How do we stand out in a crowded inbox?
        - What pain point are we solving?
        - What creates urgency or relevance?
        - How does this fit into the customer journey?
      `,
      constraints: [
        'Subject line must be compelling and curiosity-inducing (50 chars ideal)',
        'Preheader text must complement subject line',
        'Email must be mobile-responsive and scannable',
        'Include 1-2 clear, strategically placed CTAs',
        'Body copy must be benefit-focused and concise',
        'Personalization tokens should be utilized',
        'Avoid spam trigger words and excessive capitalization',
        'Include unsubscribe and preference options (legally required)',
      ],
      formatSpec:
        'Email Campaign with: Subject Line (Primary + 2 A/B variants), Preheader Text, Sender Name and Email, Body Copy (Introduction, Main Message, Benefits, CTA), Email Design Notes (layout, images), Personalization Opportunities, Mobile Optimization Notes, Legal Compliance (unsubscribe, sender info), Send Time/Frequency Recommendations, Success Metrics to Track',
      qualityChecklist: [
        'Subject line is compelling and creates curiosity',
        'Email is mobile-responsive and easily scannable',
        'Copy is benefit-focused and addresses recipient pain point',
        'CTA is clear, prominent, and action-oriented',
        'Personalization is used meaningfully (not just names)',
        'Visual hierarchy guides reader to key information',
        'Tone matches brand voice and audience relationship',
        'Compliance requirements are met (unsubscribe, headers)',
      ],
    },
    variables: [
      {
        name: 'campaignGoal',
        description:
          'Primary objective (e.g., "drive sales", "nurture leads", "announce product", "re-engage inactive")',
        required: true,
      },
      {
        name: 'audience',
        description:
          'Who is receiving this email (e.g., "new subscribers", "past customers", "leads in pipeline")',
        required: true,
      },
      {
        name: 'offer',
        description: 'What are you offering/asking them to do?',
        required: true,
      },
      {
        name: 'brandVoice',
        description:
          'Tone to match (e.g., "professional", "casual and friendly", "humorous", "urgent")',
        required: false,
        defaultValue: 'professional and friendly',
      },
      {
        name: 'urgencyLevel',
        description: 'How urgent is this? (e.g., "high", "medium", "low")',
        required: false,
        defaultValue: 'medium',
      },
    ],
  },
  {
    slug: 'brand-messaging',
    name: 'Brand Messaging',
    description:
      'Develop consistent, compelling brand messaging framework including positioning, key messages, and value propositions for all channels.',
    category: 'MARKETING',
    template: {
      role: 'Brand Strategist and Positioning Expert',
      taskStructure: `
        1. Define target audience segments and their needs
        2. Analyze competitive landscape and opportunities
        3. Develop brand positioning statement
        4. Create primary and supporting key messages
        5. Define unique value propositions for each segment
        6. Articulate brand personality and voice
        7. Create messaging architecture for consistency
        8. Develop proof points and supporting evidence
      `,
      cotGuidance: `
        Think about:
        - Who is our ideal customer and what do they really want?
        - What makes us fundamentally different?
        - Why should they choose us over competitors?
        - What emotional benefit do we deliver?
        - What's our "why" — our deeper purpose?
        - How do we want to be perceived?
        - What proof or evidence backs our claims?
      `,
      constraints: [
        'Positioning must be differentiated and defensible',
        'Key messages must be consistent across channels',
        'Value propositions must be specific to audience segments',
        'Messaging must reflect actual brand capabilities (no exaggeration)',
        'Brand voice must be distinctive and recognizable',
        'All claims must be supported by evidence or proof points',
        'Messaging must resonate emotionally with target audience',
        'Framework must be simple enough for all employees to use',
      ],
      formatSpec:
        'Brand Messaging Framework with: Brand Positioning Statement, Target Audience Segments, Key Messages (3-5 primary), Supporting Messages by Segment, Unique Value Propositions, Brand Personality Profile, Voice and Tone Guidelines, Proof Points and Evidence, Messaging Hierarchy, Competitive Differentiation, Usage Examples by Channel',
      qualityChecklist: [
        'Brand positioning is clear, compelling, and differentiated',
        'Key messages are internally consistent and memorable',
        'Each message is distinct and serves a purpose',
        'Messaging resonates with target audience emotionally and rationally',
        'Value propositions are specific and compelling',
        'Brand voice is distinctive and consistently applied',
        'All claims are supported by credible proof points',
        'Framework is practical and usable across organization',
      ],
    },
    variables: [
      {
        name: 'brandName',
        description: 'Name of the brand or company',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Primary target audience segments',
        required: true,
      },
      {
        name: 'productOrService',
        description: 'What you offer',
        required: true,
      },
      {
        name: 'competitiveContext',
        description: 'Main competitors or competitive category',
        required: true,
      },
      {
        name: 'brandPersonality',
        description:
          'How you want to be perceived (e.g., "innovative and trustworthy", "fun and approachable")',
        required: false,
        defaultValue: 'To be developed',
      },
    ],
  },
  {
    slug: 'landing-page',
    name: 'Landing Page Copy',
    description:
      'Write high-conversion landing page copy with compelling headlines, persuasive benefits, social proof, and strong CTAs optimized for a specific offer.',
    category: 'MARKETING',
    template: {
      role: 'Conversion Rate Optimization Specialist and Persuasive Copywriter',
      taskStructure: `
        1. Clarify specific offer and campaign goal
        2. Identify and understand target visitor
        3. Write compelling headline that matches ad/traffic source
        4. Create subheadline that reinforces main promise
        5. Develop benefit-focused body copy
        6. Address objections and build credibility
        7. Incorporate social proof and testimonials
        8. Create primary and secondary CTAs
        9. Optimize page structure for scanning and flow
      `,
      cotGuidance: `
        Consider:
        - Who is clicking to this page? What do they expect?
        - What is the single biggest objection they have?
        - Why should they care about this offer RIGHT NOW?
        - What proof can we show that this works?
        - What's the easiest path to saying "yes"?
        - What common questions will they have?
        - How do we build urgency and scarcity ethically?
      `,
      constraints: [
        'Headline must match traffic source and create immediate relevance',
        'Copy must focus on benefits, not features',
        'Include at least 3 types of social proof (testimonials, stats, logos)',
        'Address 2-3 major objections directly',
        'CTA must be clear, specific, and benefit-focused',
        'Page must be scannable (short paragraphs, bullet points)',
        'Include urgency or scarcity element (legitimate, not manipulative)',
        'One primary CTA, optionally secondary CTA(s)',
      ],
      formatSpec:
        'Landing Page Copy with: Headline, Subheadline, Hero Section Message, Key Benefits Section, Social Proof (testimonials, stats, logos), Addressing Objections Section, Feature/Capability Details, Call-to-Action (primary + secondary), Scarcity/Urgency Element, FAQ Section, Visual Layout Notes, Mobile Optimization Notes, Form Fields (if applicable)',
      qualityChecklist: [
        'Headline immediately clarifies value and relevance',
        'Copy is benefit-focused and speaks to specific pain point',
        'Subheadline reinforces main promise and creates curiosity',
        'Social proof is specific and credible (not generic)',
        'Objections are addressed directly and persuasively',
        'CTA is impossible to miss and creates clarity',
        'Page is optimized for scanning and quick understanding',
        'Copy creates genuine desire to take action',
      ],
    },
    variables: [
      {
        name: 'offer',
        description:
          'What specifically are you offering? (e.g., "Free 30-day trial", "Buy now and save 50%")',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who is this landing page for?',
        required: true,
      },
      {
        name: 'trafficSource',
        description:
          'Where traffic is coming from (e.g., "Google Ads", "Facebook", "Email campaign")',
        required: true,
      },
      {
        name: 'mainPainPoint',
        description: 'The primary problem you solve for them',
        required: true,
      },
      {
        name: 'competitiveDifferentiator',
        description: 'Why choose you over alternatives?',
        required: false,
        defaultValue: 'To be determined',
      },
    ],
  },
  {
    slug: 'press-release',
    name: 'Press Release',
    description:
      'Create newsworthy press releases that inform media, build credibility, and generate coverage for company news, product launches, or announcements.',
    category: 'MARKETING',
    template: {
      role: 'PR Professional and News Writer',
      taskStructure: `
        1. Identify the newsworthy angle and key story
        2. Write compelling headline that grabs attention
        3. Craft strong opening paragraph (who, what, when, where, why)
        4. Develop supporting details and context
        5. Include relevant quotes from key stakeholders
        6. Provide background information on company/product
        7. Include call-to-action or media contact information
        8. Follow AP style and press release conventions
      `,
      cotGuidance: `
        Think about:
        - What is actually NEW or newsworthy here?
        - Why would media outlets care about this?
        - What's the angle that makes this interesting?
        - Who is affected and why do they care?
        - What's the one-sentence summary?
        - What questions will journalists ask?
        - How does this fit into bigger industry trends?
      `,
      constraints: [
        'Lead paragraph must answer who, what, when, where, why',
        'Include at least 2 substantial quotes from key stakeholders',
        'Keep to 1-2 pages maximum (400-600 words ideal)',
        'Use AP style and journalistic tone (third person)',
        'Include date and specific location',
        'Provide clear contact information for media',
        'Include boilerplate about company at end',
        'Avoid excessive marketing language and hype',
      ],
      formatSpec:
        'Press Release with: Header with FOR IMMEDIATE RELEASE and date, Headline (compelling and newsworthy), Subheading (clarifies main news), Dateline (city, date), Opening Paragraph (who, what, when, where, why), Supporting Details (2-3 paragraphs), Quotes (2+ from stakeholders), Company Boilerplate, Media Contact Information, ### (end marker)',
      qualityChecklist: [
        'Headline is compelling and genuinely newsworthy',
        'Opening paragraph provides essential information efficiently',
        'Quotes are substantial and add genuine insight',
        'Tone is journalistic, not overly promotional',
        'Story angle is clear and interesting to media',
        'Facts are accurate and specific',
        'Length is appropriate (not too long)',
        'Contact information is clear and complete',
      ],
    },
    variables: [
      {
        name: 'announcement',
        description:
          'What are you announcing? (e.g., "new product launch", "company milestone", "partnership")',
        required: true,
      },
      {
        name: 'newsAngle',
        description: 'Why is this newsworthy? What makes it interesting?',
        required: true,
      },
      {
        name: 'company',
        description: 'Company name and brief context',
        required: true,
      },
      {
        name: 'targetMedia',
        description: 'Who is the intended audience? (e.g., "tech journalists", "business press")',
        required: false,
        defaultValue: 'General business/industry media',
      },
      {
        name: 'stakeholderQuotes',
        description: 'Key people who might provide quotes (executives, customers, partners)',
        required: false,
        defaultValue: 'To be determined',
      },
    ],
  },
  {
    slug: 'social-strategy',
    name: 'Social Media Strategy',
    description:
      'Develop a comprehensive social media strategy with platform-specific content plans, posting schedules, engagement tactics, and measurable KPIs.',
    category: 'MARKETING',
    template: {
      role: 'Social Media Strategist and Community Growth Expert',
      taskStructure: `
        1. Audit current social media presence and performance
        2. Define goals and KPIs aligned with business objectives
        3. Identify and profile target audience per platform
        4. Select optimal platforms based on audience and resources
        5. Develop content pillars and themes
        6. Create posting schedule and content calendar framework
        7. Design engagement and community-building tactics
        8. Plan measurement and optimization cadence
      `,
      cotGuidance: `
        Think about:
        - Where does our target audience actually spend time?
        - What content format works best on each platform?
        - What would make someone follow, engage, and share?
        - How do we balance promotion with genuine value?
        - What resources do we have for content creation?
        - How do we differentiate from competitors on social?
        - What does success look like in 30, 60, 90 days?
      `,
      constraints: [
        'Strategy must be platform-specific, not one-size-fits-all',
        'Content pillars must balance value, engagement, and promotion',
        'Posting frequency must be realistic and sustainable',
        'KPIs must be measurable and tied to business outcomes',
        'Include both organic and paid strategy considerations',
        'Community engagement must be proactive, not just reactive',
        'Brand voice must be consistent but platform-adapted',
        'Include crisis management guidelines',
      ],
      formatSpec:
        'Social Media Strategy with: Executive Summary, Platform Selection Rationale, Audience Personas per Platform, Content Pillars (3-5), Content Mix Ratio, Posting Schedule by Platform, Engagement Playbook, Hashtag Strategy, Influencer/Partnership Opportunities, Paid Social Guidelines, KPIs and Measurement Plan, Monthly Review Cadence, Crisis Response Protocol',
      qualityChecklist: [
        'Strategy is tailored to each selected platform',
        'Content pillars are clear and differentiated',
        'Posting schedule is realistic and sustainable',
        'KPIs are specific, measurable, and relevant',
        'Engagement tactics go beyond basic replies',
        'Brand voice is consistent yet platform-appropriate',
        'Both organic and paid approaches are covered',
        'Measurement plan enables data-driven optimization',
      ],
    },
    variables: [
      {
        name: 'brand',
        description: 'Brand or business name and industry',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Primary target audience (demographics, interests, behaviors)',
        required: true,
      },
      {
        name: 'platforms',
        description: 'Social platforms to include (e.g., "Instagram, LinkedIn, TikTok")',
        required: true,
      },
      {
        name: 'primaryGoal',
        description:
          'Main objective (e.g., "brand awareness", "lead generation", "community building")',
        required: true,
      },
      {
        name: 'budget',
        description: 'Monthly budget for paid social (if applicable)',
        required: false,
        defaultValue: 'Organic-first strategy',
      },
    ],
  },
  {
    slug: 'competitor-positioning',
    name: 'Competitor Positioning Analysis',
    description:
      'Analyze competitor positioning to identify market gaps, differentiation opportunities, and develop a winning competitive strategy.',
    category: 'MARKETING',
    template: {
      role: 'Competitive Intelligence Analyst and Market Strategist',
      taskStructure: `
        1. Identify and categorize key competitors (direct, indirect, aspirational)
        2. Analyze each competitor's positioning and messaging
        3. Map competitor strengths and weaknesses
        4. Identify market gaps and unserved needs
        5. Evaluate competitor pricing and value propositions
        6. Assess competitor marketing channels and tactics
        7. Develop differentiation strategy and positioning recommendations
        8. Create competitive battle cards for sales enablement
      `,
      cotGuidance: `
        Consider:
        - Who are the real competitors (not just obvious ones)?
        - What are customers choosing between?
        - Where are competitors weak that we can exploit?
        - What market needs are currently unmet?
        - How are competitors positioning themselves vs. reality?
        - What would make us the obvious choice?
        - What competitive advantages are sustainable long-term?
      `,
      constraints: [
        'Analysis must be based on observable evidence, not assumptions',
        'Include both direct and indirect competitors',
        'Differentiation must be genuine and sustainable',
        'Recommendations must be actionable and specific',
        'Avoid disparaging competitors — focus on factual comparison',
        'Consider both product and marketing positioning',
        'Include pricing intelligence where available',
        'Battle cards must be practical for sales teams',
      ],
      formatSpec:
        'Competitive Analysis with: Competitor Landscape Map, Individual Competitor Profiles (positioning, strengths, weaknesses, messaging), Feature Comparison Matrix, Pricing Comparison, Market Gap Analysis, Differentiation Opportunities, Recommended Positioning, Battle Cards per Competitor, Competitive Monitoring Plan, Win/Loss Analysis Framework',
      qualityChecklist: [
        'All key competitors are identified and categorized',
        'Analysis is evidence-based and objective',
        'Market gaps are clearly identified and validated',
        'Differentiation strategy is genuine and defensible',
        'Battle cards are practical and sales-ready',
        'Pricing intelligence is current and accurate',
        'Recommendations are specific and actionable',
        'Monitoring plan enables ongoing competitive awareness',
      ],
    },
    variables: [
      {
        name: 'yourProduct',
        description: 'Your product/service and its core value proposition',
        required: true,
      },
      {
        name: 'competitors',
        description: 'Known competitors to analyze (list names)',
        required: true,
      },
      {
        name: 'market',
        description: 'Market or industry context',
        required: true,
      },
      {
        name: 'differentiators',
        description: 'What you believe makes you different today',
        required: false,
        defaultValue: 'To be identified through analysis',
      },
    ],
  },
  {
    slug: 'content-calendar',
    name: 'Content Calendar',
    description:
      'Create a structured content calendar with themes, topics, formats, and publishing schedules across all marketing channels.',
    category: 'MARKETING',
    template: {
      role: 'Content Marketing Strategist and Editorial Planner',
      taskStructure: `
        1. Define content goals and align with business objectives
        2. Establish content pillars and recurring themes
        3. Map content to buyer journey stages
        4. Identify key dates, events, and seasonal opportunities
        5. Plan content mix across formats (blog, video, social, email)
        6. Assign responsibilities and production workflow
        7. Set publishing cadence per channel
        8. Build measurement framework for content performance
      `,
      cotGuidance: `
        Think about:
        - What content themes align with our expertise and audience needs?
        - How does each piece move someone through the buyer journey?
        - What seasonal or industry events should we capitalize on?
        - What content can be repurposed across multiple channels?
        - What's a realistic production capacity?
        - How do we maintain consistency without burning out?
        - What content gaps exist in our current strategy?
      `,
      constraints: [
        'Calendar must be realistic given available resources',
        'Content must map to specific buyer journey stages',
        'Include content repurposing and cross-channel distribution',
        'Balance evergreen content with timely/seasonal pieces',
        'Each content piece must have a clear purpose and CTA',
        'Include production timeline with deadlines and owners',
        'Plan for at least 30 days of content minimum',
        'Include content performance metrics to track',
      ],
      formatSpec:
        'Content Calendar with: Content Strategy Overview, Content Pillars (3-5 themes), Monthly Themes, Weekly Publishing Schedule by Channel, Content Briefs (topic, format, audience, goal, CTA, keywords), Key Dates and Seasonal Hooks, Repurposing Plan, Production Workflow and Deadlines, Performance Metrics per Content Type, Review and Optimization Cadence',
      qualityChecklist: [
        'Content pillars are clear and strategically chosen',
        'Calendar covers all relevant channels consistently',
        'Content maps to specific audience needs and journey stages',
        'Publishing cadence is sustainable long-term',
        'Key dates and seasonal opportunities are captured',
        'Each content piece has a clear purpose and target outcome',
        'Repurposing strategy maximizes content ROI',
        'Measurement framework enables performance optimization',
      ],
    },
    variables: [
      {
        name: 'business',
        description: 'Business name and what you offer',
        required: true,
      },
      {
        name: 'channels',
        description:
          'Marketing channels to plan for (e.g., "blog, LinkedIn, email newsletter, YouTube")',
        required: true,
      },
      {
        name: 'timeframe',
        description: 'Calendar duration (e.g., "1 month", "quarter", "6 months")',
        required: true,
      },
      {
        name: 'audience',
        description: 'Target audience and their content preferences',
        required: true,
      },
      {
        name: 'contentCapacity',
        description:
          'How much content you can realistically produce (e.g., "2 blogs + 5 social posts per week")',
        required: false,
        defaultValue: 'To be determined based on resources',
      },
    ],
  },
  {
    slug: 'influencer-brief',
    name: 'Influencer Campaign Brief',
    description:
      'Create detailed influencer collaboration briefs with campaign objectives, content guidelines, deliverables, and performance expectations.',
    category: 'MARKETING',
    template: {
      role: 'Influencer Marketing Strategist and Campaign Manager',
      taskStructure: `
        1. Define campaign objectives and target outcomes
        2. Identify ideal influencer profile and selection criteria
        3. Develop creative brief with brand guidelines
        4. Specify deliverables, timelines, and approval process
        5. Set content guidelines (dos, don'ts, required elements)
        6. Define compensation structure and terms
        7. Establish performance metrics and reporting requirements
        8. Plan content amplification and repurposing strategy
      `,
      cotGuidance: `
        Consider:
        - What type of influencer best reaches our target audience?
        - How do we balance creative freedom with brand safety?
        - What makes an authentic partnership vs. paid promotion?
        - How do we measure ROI beyond vanity metrics?
        - What content will resonate with both the influencer's audience and ours?
        - What are the FTC/disclosure requirements?
        - How can we build long-term relationships, not one-offs?
      `,
      constraints: [
        'Brief must balance brand requirements with influencer creative freedom',
        'Include clear FTC/advertising disclosure requirements',
        'Deliverables must be specific and measurable',
        'Timeline must allow adequate production and review time',
        'Content guidelines must be clear but not overly restrictive',
        'Compensation must be fair and transparent',
        'Include usage rights and content ownership terms',
        'Performance expectations must be realistic for influencer tier',
      ],
      formatSpec:
        'Influencer Brief with: Campaign Overview and Objectives, Brand Background, Target Audience, Ideal Influencer Profile, Creative Direction and Key Messages, Content Deliverables (format, quantity, timeline), Brand Guidelines (dos and donts), Required Elements (hashtags, tags, links, disclosures), Approval Process, Compensation and Terms, Usage Rights, Performance KPIs, Reporting Requirements, Contact Information',
      qualityChecklist: [
        'Campaign objectives are clear and measurable',
        'Influencer profile criteria are specific and realistic',
        'Creative brief inspires without being overly prescriptive',
        'Deliverables are clearly defined with realistic timelines',
        'Brand guidelines protect brand while enabling authenticity',
        'FTC disclosure requirements are explicitly stated',
        'Compensation structure is fair and clearly outlined',
        'Success metrics go beyond vanity metrics to business impact',
      ],
    },
    variables: [
      {
        name: 'brand',
        description: 'Brand name and product/service being promoted',
        required: true,
      },
      {
        name: 'campaignGoal',
        description:
          'Primary campaign objective (e.g., "awareness", "product launch", "sales", "UGC")',
        required: true,
      },
      {
        name: 'influencerType',
        description:
          'Type of influencer (e.g., "micro 10K-50K", "mid-tier 50K-500K", "macro 500K+")',
        required: true,
      },
      {
        name: 'platform',
        description: 'Primary platform (e.g., "Instagram", "TikTok", "YouTube")',
        required: true,
      },
      {
        name: 'budget',
        description: 'Budget per influencer or total campaign budget',
        required: false,
        defaultValue: 'To be discussed',
      },
    ],
  },
  {
    slug: 'product-launch',
    name: 'Product Launch Plan',
    description:
      'Create a comprehensive go-to-market launch plan with pre-launch, launch day, and post-launch activities across all marketing channels.',
    category: 'MARKETING',
    template: {
      role: 'Product Marketing Manager and Go-to-Market Strategist',
      taskStructure: `
        1. Define launch objectives, success metrics, and timeline
        2. Develop product positioning and key messaging
        3. Identify target segments and early adopter strategy
        4. Plan pre-launch activities (teaser, waitlist, beta)
        5. Design launch day execution plan across channels
        6. Create post-launch engagement and optimization plan
        7. Prepare sales enablement and support materials
        8. Build measurement framework and reporting cadence
      `,
      cotGuidance: `
        Think about:
        - What makes this product launch-worthy? What's the story?
        - Who are the first users and how do we reach them?
        - How do we build anticipation before launch?
        - What could go wrong on launch day?
        - How do we sustain momentum after the initial buzz?
        - What channels will have the highest impact?
        - How do we turn early adopters into advocates?
      `,
      constraints: [
        'Launch plan must cover pre-launch, launch day, and post-launch phases',
        'Each activity must have an owner, deadline, and success metric',
        'Messaging must be consistent across all channels',
        'Include contingency plans for potential issues',
        'Sales and support teams must be briefed before launch',
        'Budget allocation must be specified per channel',
        'Include PR and earned media strategy',
        'Plan must be realistic given team size and resources',
      ],
      formatSpec:
        'Product Launch Plan with: Launch Overview and Objectives, Product Positioning, Target Audience Segments, Pre-Launch Timeline (T-30 to T-1), Launch Day Execution Plan (hour by hour), Post-Launch Plan (Week 1-4), Channel-Specific Tactics (email, social, PR, ads, content), Sales Enablement Materials List, Support Preparation, Budget Breakdown, Risk Mitigation Plan, Success Metrics and Reporting, Team Responsibilities Matrix',
      qualityChecklist: [
        'Launch objectives are specific and measurable',
        'Product positioning is clear and compelling',
        'Pre-launch builds genuine anticipation',
        'Launch day plan is detailed and actionable',
        'Post-launch sustains momentum beyond day one',
        'All channels are coordinated with consistent messaging',
        'Sales and support are properly enabled',
        'Contingency plans address key risks',
      ],
    },
    variables: [
      {
        name: 'product',
        description: 'Product name and brief description',
        required: true,
      },
      {
        name: 'launchDate',
        description: 'Target launch date or timeframe',
        required: true,
      },
      {
        name: 'targetMarket',
        description: 'Primary target market and ideal customer profile',
        required: true,
      },
      {
        name: 'channels',
        description:
          'Available marketing channels (e.g., "email list 10K, social 5K followers, blog, PR contacts")',
        required: true,
      },
      {
        name: 'budget',
        description: 'Total launch marketing budget',
        required: false,
        defaultValue: 'To be determined',
      },
    ],
  },
  {
    slug: 'customer-persona',
    name: 'Customer Persona Builder',
    description:
      'Build detailed, research-backed customer personas with demographics, psychographics, behaviors, pain points, and buying journey insights.',
    category: 'MARKETING',
    template: {
      role: 'Market Research Analyst and Customer Insights Strategist',
      taskStructure: `
        1. Gather and synthesize available customer data
        2. Define demographic profile (age, location, income, role)
        3. Develop psychographic profile (values, motivations, fears)
        4. Map behavioral patterns (media consumption, buying habits)
        5. Identify key pain points and unmet needs
        6. Document goals, aspirations, and desired outcomes
        7. Map the buying journey (awareness → decision → advocacy)
        8. Create actionable persona document for team use
      `,
      cotGuidance: `
        Think about:
        - What data do we have vs. what are we inferring?
        - What drives this person's decisions (rational and emotional)?
        - What keeps them up at night?
        - Where do they go for information and advice?
        - What objections will they have to our solution?
        - What does success look like for them personally?
        - How do they evaluate and compare options?
      `,
      constraints: [
        'Persona must be based on research and data, not stereotypes',
        'Include both demographic and psychographic dimensions',
        'Pain points must be specific and validated',
        'Buying journey must reflect actual decision-making process',
        'Persona must be actionable for marketing and sales teams',
        'Include direct quotes or representative statements',
        'Distinguish between confirmed data and educated assumptions',
        'Keep persona focused — avoid making it too broad or generic',
      ],
      formatSpec:
        'Customer Persona with: Persona Name and Photo Description, Demographic Profile, Role and Responsibilities, Goals and Aspirations, Pain Points and Frustrations, Information Sources and Influences, Buying Behavior and Decision Criteria, Common Objections, Preferred Communication Channels, Representative Quotes, Day-in-the-Life Scenario, How We Help Them, Marketing Message That Resonates, Content Preferences',
      qualityChecklist: [
        'Persona feels like a real person, not a stereotype',
        'Demographics and psychographics are balanced',
        'Pain points are specific and emotionally resonant',
        'Buying journey reflects realistic decision-making',
        'Quotes sound authentic and insightful',
        'Persona is actionable for marketing and sales decisions',
        'Information sources are specific and current',
        'Data vs. assumptions are clearly distinguished',
      ],
    },
    variables: [
      {
        name: 'productOrService',
        description: 'What you sell and what problem it solves',
        required: true,
      },
      {
        name: 'existingData',
        description:
          'Customer data you have access to (e.g., "analytics, survey results, interviews, CRM data")',
        required: true,
      },
      {
        name: 'market',
        description: 'Industry or market you operate in',
        required: true,
      },
      {
        name: 'personaType',
        description:
          'Type of persona (e.g., "B2B decision maker", "end consumer", "enterprise buyer")',
        required: false,
        defaultValue: 'Primary target customer',
      },
    ],
  },
]
