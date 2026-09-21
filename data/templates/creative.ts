// Drferdi Transformer Engine V2 — Creative Templates
import type { TemplateDefinition } from '@/types'

export const creativeTemplates: TemplateDefinition[] = [
  {
    slug: 'blog-post',
    name: 'Blog Post Writing',
    description:
      'Engaging blog post with compelling narrative, structure, and audience connection.',
    category: 'CREATIVE',
    template: {
      role: 'Content Strategist & Writer',
      taskStructure: `
1. Topic & Angle: Define the core topic and unique perspective
2. Audience Analysis: Understand reader pain points and interests
3. Hook & Headline: Create compelling opening that draws readers in
4. Body Structure: Organize ideas into logical, engaging sections
5. Evidence & Examples: Support claims with specific, relatable examples
6. Visual Direction: Recommend images, callouts, or formatting
7. Call-to-Action: Clear next step for reader engagement
8. SEO Optimization: Naturally incorporate relevant keywords
      `.trim(),
      cotGuidance: `
Think about:
- What unique perspective or insight am I offering?
- What problem does my reader have that I'm solving?
- What will make someone stop scrolling and read this?
- How can I make this memorable and shareable?
- What examples will resonate most?
- Where should I add variety (quotes, lists, short paragraphs)?
- What's the reader's emotional journey through this post?
- What do I want them to do after reading?
      `.trim(),
      constraints: [
        'Hook readers within first 100 words',
        'Use active voice and conversational tone',
        'Break up text with subheadings and white space',
        'Include at least one specific example or story',
        'Balance expertise with accessibility',
        'Avoid jargon without explanation',
        'End with clear value or call-to-action',
      ],
      formatSpec: `
# [Compelling Headline]

## The Hook
[2-3 sentences that grab attention and establish relevance to reader]

## [Section 1 Title]
[Body paragraph introducing first major point]

[Supporting details, examples, or evidence]

### [Subsection if needed]
[Deeper exploration or practical application]

## [Section 2 Title]
[Next major idea or argument]

[Supporting details and examples]

## [Section 3 Title]
[Third key point or counterpoint]

[Details and context]

## Key Takeaways
- [Key point 1: Memorable summary]
- [Key point 2: What they learned]
- [Key point 3: Actionable insight]

## What's Next?
[Call-to-action: Subscribe? Download? Share? Start?]

---

## Content Notes
- **Tone:** [Conversational/expert/inspirational/practical]
- **Target Length:** [Word count]
- **Suggested Images:** [Descriptions of visual elements]
- **Keywords:** [3-5 SEO keywords naturally incorporated]
      `.trim(),
      qualityChecklist: [
        'Headline is compelling and specific (not generic)',
        'Hook engages reader within first paragraph',
        'Main points are clear and well-organized',
        'Examples are concrete and relatable',
        'Tone matches audience and topic',
        'Pacing includes variety in sentence length',
        'Call-to-action is clear and appropriate',
        'Post provides genuine value or insight',
      ],
    },
    variables: [
      {
        name: 'topic',
        description: 'What is the main topic or subject of the blog post?',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who is the primary reader? (beginners/intermediate/experts/general)',
        required: true,
      },
      {
        name: 'uniqueAngle',
        description: 'What unique perspective or insight will this post offer?',
        required: false,
      },
      {
        name: 'keyPoints',
        description: 'Main points or arguments to cover',
        required: false,
      },
      {
        name: 'tone',
        description: 'Desired tone (conversational, expert, inspirational, etc)',
        required: false,
        defaultValue: 'conversational',
      },
    ],
  },
  {
    slug: 'story-writing',
    name: 'Short Story Writing',
    description:
      'Compelling short story with engaging narrative, character development, and satisfying resolution.',
    category: 'CREATIVE',
    template: {
      role: 'Narrative Storyteller',
      taskStructure: `
1. Story Premise: Core conflict or question driving the story
2. Character Development: Protagonist with clear desires and obstacles
3. World & Setting: Vivid, immersive scene-setting
4. Opening Hook: Immediate engagement with narrative voice
5. Rising Action: Building tension and complications
6. Character Arc: How protagonist changes or learns
7. Climax: Peak moment of conflict or realization
8. Resolution: Satisfying conclusion that addresses the premise
      `.trim(),
      cotGuidance: `
Consider:
- What is the core human truth or emotion this story explores?
- What does my protagonist *want* vs. what do they *need*?
- What's the obstacle or conflict that drives the story?
- What sensory details bring scenes to life?
- What dialogue reveals character naturally?
- How does each scene build tension or develop character?
- What unexpected twist or revelation deepens the story?
- What does the reader feel at the end?
      `.trim(),
      constraints: [
        'Show rather than tell emotions and character traits',
        'Use specific, sensory details',
        'Dialogue should sound natural and reveal character',
        'Pacing builds toward climax',
        'Resolution should feel earned, not contrived',
        'Avoid info-dumping or heavy exposition',
        'Maintain consistent narrative voice',
        'Every scene should serve purpose',
      ],
      formatSpec: `
# [Story Title]

## [Scene 1: Opening]
[Immersive opening that establishes setting and character]

[Dialogue and action revealing character and introducing conflict]

## [Scene 2: Complication]
[First obstacle or turn that deepens the conflict]

[Character reaction and decision]

## [Scene 3: Rising Tension]
[Escalating stakes and complications]

[Character struggling or making choices]

## [Scene 4: Climactic Moment]
[Peak of tension and conflict]

[Character confrontation with central problem or other characters]

## [Scene 5: Resolution]
[Consequences and how things settle]

[Character's changed understanding or new situation]

## [Final Image/Thought]
[Closing image or reflection that echoes opening and completes arc]

---

## Story Notes
- **Narrative Voice:** [First/third person, tone]
- **Setting:** [Time and place]
- **Core Theme:** [Central human truth or question]
- **Word Count:** [Target length]
- **Tone:** [Overall mood - melancholic, hopeful, darkly funny, etc]
      `.trim(),
      qualityChecklist: [
        'Opening immediately engages reader',
        'Protagonist has clear desire and obstacle',
        'Sensory details ground reader in scenes',
        'Dialogue reveals character naturally',
        'Pacing builds toward climax',
        'Character arc is clear and earned',
        'Climax delivers emotional or narrative payoff',
        'Resolution feels satisfying and inevitable',
      ],
    },
    variables: [
      {
        name: 'premise',
        description: 'Core conflict or question: What is the story about?',
        required: true,
      },
      {
        name: 'protagonist',
        description: 'Main character: Who are they and what do they want?',
        required: true,
      },
      {
        name: 'setting',
        description: 'Where and when does the story take place?',
        required: false,
      },
      {
        name: 'theme',
        description: 'Central human truth or emotional insight the story explores',
        required: false,
      },
      {
        name: 'tone',
        description: 'Overall mood or emotional tone (hopeful, dark, melancholic, humorous)',
        required: false,
        defaultValue: 'hopeful',
      },
      {
        name: 'length',
        description: 'Target word count (flash fiction ~1000, short story 2000-5000)',
        required: false,
        defaultValue: '2000-3000 words',
      },
    ],
  },
  {
    slug: 'social-media',
    name: 'Social Media Content',
    description:
      'Platform-optimized social media posts designed for engagement, shareability, and action.',
    category: 'CREATIVE',
    template: {
      role: 'Social Media Strategist',
      taskStructure: `
1. Platform & Format: Optimize for specific platform (LinkedIn/Twitter/Instagram/TikTok)
2. Hook First 3 Words: Grab attention immediately
3. Core Message: One clear, valuable idea
4. Engagement Strategy: Question, call-to-action, or conversation starter
5. Visual Strategy: Describe image, video, or formatting
6. Hashtag Strategy: Relevant, discoverable hashtags
7. Tone & Voice: Platform-appropriate voice and personality
8. CTA: Clear next action (comment, share, link, follow)
      `.trim(),
      cotGuidance: `
Think about:
- What stops the scroll on this platform?
- What value or emotion am I delivering in 280 characters (or 2000)?
- Who is my ideal commenter or sharer?
- What conversation do I want to start?
- What visual will make this stand out?
- How does this platform's algorithm work? (Engagement, video time, etc)
- Am I being authentic or performative?
- What do I want this post to do?
      `.trim(),
      constraints: [
        'Platform-specific formatting and character limits',
        'Hook in first line (5-10 words max)',
        'One clear message or value proposition',
        'Visual content is described or specified',
        'Authentic voice, not generic corporate speak',
        'Hashtags relevant and not overdone',
        'CTA is clear and achievable',
        'Respects platform norms and etiquette',
      ],
      formatSpec: `
## [Platform]: [Post Title/Type]

### Post Copy
[Hook - first 3-5 words that stop the scroll]

[Core message with value, insight, or conversation starter]

[Optional: Story, data point, or specific example]

[Call-to-action or question to drive engagement]

[Platform-appropriate hashtags]

---

### Visual Strategy
[Description of image, video, carousel, or formatting]

**Specs:** [Platform-specific specs: dimensions, duration, format]

---

### Engagement Strategy
- **Goal:** [Traffic/awareness/engagement/sales]
- **Primary CTA:** [What do you want people to do?]
- **Success Metric:** [How will you measure success?]

### Tone & Voice Notes
- **Tone:** [Professional/funny/inspirational/educational]
- **Platform Voice:** [Authentic to this platform]
- **Audience Mindset:** [What's the reader thinking about?]

### Alternative Versions
**Version A (Short):** [More concise version for different timing]

**Version B (Long):** [More detailed version for deeper engagement]

**Version C (Visual Focus):** [Image-heavy version]
      `.trim(),
      qualityChecklist: [
        'Hook appears in first 3-5 words',
        'Message is clear and valuable',
        'Content is authentic, not robotic',
        'Visual is described and platform-appropriate',
        'CTA is specific and clear',
        'Hashtags are relevant and not excessive',
        'Tone matches platform and audience',
        'Post invites engagement or action',
      ],
    },
    variables: [
      {
        name: 'platform',
        description: 'Which social platform? (LinkedIn, Twitter, Instagram, TikTok, Facebook)',
        required: true,
      },
      {
        name: 'objective',
        description: 'What do you want this post to achieve? (awareness/engagement/traffic/sales)',
        required: true,
      },
      {
        name: 'audience',
        description: 'Who is the primary audience for this post?',
        required: true,
      },
      {
        name: 'message',
        description: 'Core message or value prop to communicate',
        required: false,
      },
      {
        name: 'tone',
        description: 'Desired tone for this platform (professional, funny, inspirational)',
        required: false,
      },
    ],
  },
  {
    slug: 'product-description',
    name: 'Product Description',
    description:
      'Persuasive product copy that highlights benefits, addresses pain points, and drives conversion.',
    category: 'CREATIVE',
    template: {
      role: 'Copywriter & Product Marketer',
      taskStructure: `
1. Hook: Lead with the primary benefit or emotional payoff
2. Problem Statement: What pain point does this solve?
3. Product Overview: What is it and what does it do?
4. Key Features: 3-5 most important features
5. Benefits Translation: How features translate to user value
6. Social Proof: Testimonials, ratings, or usage indicators
7. Objection Handling: Address common concerns
8. CTA & Value Proposition: Clear, compelling call-to-action
      `.trim(),
      cotGuidance: `
Remember:
- Nobody cares about features. They care about what it does for *them*.
- What is the ONE biggest benefit or result?
- What problem keeps the target customer awake at night?
- What objections will they have?
- Why is this better than alternatives?
- What emotion drives the purchase decision?
- What's the outcome they'll experience?
- What does success look like for them?
      `.trim(),
      constraints: [
        'Lead with benefit, not feature',
        'Translate every feature to a user benefit',
        'Use active, persuasive language',
        'Avoid superlatives without proof',
        'Address at least one objection',
        'Include social proof or credibility indicator',
        'Keep CTA clear and action-oriented',
        'Match tone to product and audience',
      ],
      formatSpec: `
# [Product Name]

## The Hook
[Lead with primary benefit or transformation, 1-2 sentences]

## The Problem You're Solving
[What pain point or frustration does this address?]

---

## What It Is
[Clear, concise explanation of the product]

---

## Key Features & Benefits

### Feature 1: [Feature Name]
**What it does:** [Feature description]
**What it means for you:** [Benefit and impact]

### Feature 2: [Feature Name]
**What it does:** [Feature description]
**What it means for you:** [Benefit and impact]

### Feature 3: [Feature Name]
**What it does:** [Feature description]
**What it means for you:** [Benefit and impact]

---

## Why You'll Love It
[2-3 sentence paragraph on overall value and results]

---

## Who It's For
[Ideal customer profile and use case]

---

## What Others Say
[Testimonial or social proof - quote with attribution]

---

## Common Questions
**Q: Is this [common concern]?**
A: [Direct answer addressing objection]

**Q: How is this different from [competitor/alternative]?**
A: [Clear differentiation]

---

## Ready to [Primary Benefit]?

[Strong CTA button text] → [Next step]

**[Secondary reassurance or guarantee if applicable]**

---

## Additional Information
- **Price:** [Pricing model]
- **Warranty/Guarantee:** [If applicable]
- **Support:** [How customers get help]
      `.trim(),
      qualityChecklist: [
        'Primary benefit is stated in opening',
        'Each feature translates to user benefit',
        'Problem statement is emotionally resonant',
        'Language is persuasive but honest',
        'Social proof or credibility is evident',
        'Objections are addressed directly',
        'CTA is clear and compelling',
        'Tone matches product and audience',
      ],
    },
    variables: [
      {
        name: 'productName',
        description: 'What is the product?',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who is the ideal customer?',
        required: true,
      },
      {
        name: 'primaryBenefit',
        description: 'What is the main benefit or transformation?',
        required: true,
      },
      {
        name: 'keyFeatures',
        description: 'Top 3-5 features to highlight',
        required: false,
      },
      {
        name: 'pricing',
        description: 'Price point or pricing model',
        required: false,
      },
      {
        name: 'tone',
        description: 'Product tone (luxury, practical, playful, professional)',
        required: false,
        defaultValue: 'professional',
      },
    ],
  },
  {
    slug: 'speech-writing',
    name: 'Speech Writing',
    description:
      'Compelling speech with strong opening, clear structure, emotional resonance, and memorable closing.',
    category: 'CREATIVE',
    template: {
      role: 'Speech Writer & Orator',
      taskStructure: `
1. Thesis: Clear central message or call-to-action
2. Audience Analysis: Who is listening and why?
3. Opening Hook: Capture attention in first 30 seconds
4. Body Structure: 3-4 main points with transitions
5. Storytelling: Use specific examples and narratives
6. Rhetorical Devices: Repetition, metaphor, parallel structure
7. Emotional Arc: Build energy toward climax
8. Strong Closing: Memorable ending and clear call-to-action
      `.trim(),
      cotGuidance: `
Think like a speaker:
- What is the ONE thing I want them to remember?
- How do I want them to feel?
- What story will they remember and retell?
- Where should I pause for effect?
- Where should emotion rise and fall?
- What's the memorable phrase they'll repeat?
- How do I inspire action, not just agreement?
- What would great orators do here?
      `.trim(),
      constraints: [
        'Opening must capture attention in <30 seconds',
        'One central thesis or call-to-action',
        'Use concrete stories and examples',
        'Short sentences for punch and pace',
        'Repetition for memory and emphasis',
        'Include natural pauses for effect',
        'Build toward emotional/logical climax',
        'Closing ties back to opening',
      ],
      formatSpec: `
# [Speech Title]

## [OPENING - 30 seconds]

[Hook/story/question that grabs attention]

[Brief thesis or context]

---

## [MAIN POINT 1]

[Clear topic sentence]

[Story, example, or evidence]

[Relevance to audience]

**[Transition to next point]**

---

## [MAIN POINT 2]

[Clear topic sentence]

[Story, example, or data]

[Why it matters]

**[Transition to next point]**

---

## [MAIN POINT 3]

[Clear topic sentence]

[Powerful example or moment]

[Connection to audience values]

**[Build toward closing]**

---

## [CLOSING - 1 minute]

[Return to opening theme or story]

[Restate central message with power]

[Clear call-to-action or inspiring vision]

[Final memorable line]

---

## Speaker Notes
- **Duration:** [X minutes]
- **Tone:** [Inspirational/humorous/solemn/energetic]
- **Audience:** [Size, demographics, context]
- **Key Moments:** [Where to pause, where to emphasize]
- **Emotional Arc:** [How energy/emotion changes throughout]

## Rhetorical Devices Used
- **[Device]:** [Example and purpose]
- **[Device]:** [Example and purpose]

## Delivery Notes
- [Where to slow down]
- [Where to add urgency or energy]
- [Pause points for effect]
      `.trim(),
      qualityChecklist: [
        'Opening captures attention immediately',
        'Central thesis is clear and repeated',
        'Stories are specific and memorable',
        'Language is conversational, not written',
        'Transitions connect points smoothly',
        'Emotional arc builds throughout',
        'Examples are concrete and relatable',
        'Closing ties back to opening and motivates',
      ],
    },
    variables: [
      {
        name: 'occasion',
        description: 'What is the occasion or context? (conference, ceremony, rally, fundraiser)',
        required: true,
      },
      {
        name: 'audience',
        description: 'Who is listening and what matters to them?',
        required: true,
      },
      {
        name: 'centralMessage',
        description: 'What is the main idea, call-to-action, or inspiration?',
        required: true,
      },
      {
        name: 'duration',
        description: 'How long is the speech? (3 min, 10 min, 20 min)',
        required: false,
        defaultValue: '10 minutes',
      },
      {
        name: 'tone',
        description: 'Speech tone (inspirational, humorous, motivational, solemn)',
        required: false,
        defaultValue: 'inspirational',
      },
      {
        name: 'keyStories',
        description: 'Any specific stories or examples to include',
        required: false,
      },
    ],
  },
  {
    slug: 'script-writing',
    name: 'Video/Podcast Script',
    description:
      'Engaging video or podcast script with natural dialogue, pacing, and production guidance.',
    category: 'CREATIVE',
    template: {
      role: 'Screenwriter & Producer',
      taskStructure: `
1. Format & Duration: Video or podcast, target length
2. Hook: First 5-10 seconds that stop the scroll
3. Premise: What is the episode or video about?
4. Segment Structure: Logical flow of segments or scenes
5. Dialogue & Narration: Natural, conversational language
6. Transitions: Smooth movement between segments
7. Production Notes: Audio, visual, or technical direction
8. Closing: Strong ending with CTA or preview
      `.trim(),
      cotGuidance: `
Think about:
- How do people actually talk? (Not how they write)
- What's the hook in the first 10 seconds?
- How does energy change throughout?
- Where are natural break points?
- What visuals would enhance the message?
- What will keep people from skipping?
- How do I maintain engagement across segments?
- What's the takeaway or emotional beat?
      `.trim(),
      constraints: [
        'Hook in first 10 seconds',
        'Dialogue sounds natural, not scripted',
        'Transitions are smooth and logical',
        'Production notes are clear and specific',
        'Pacing maintains energy',
        'Segment lengths vary for pacing',
        'Audio/visual cues enhance engagement',
        'Closing is strong and clear',
      ],
      formatSpec: `
# [Video/Podcast Title]

## [SEGMENT 1: OPENING - 0:00-0:30]

**[VISUAL/AUDIO]:** [Description of opening shot or sound]

**[SPEAKER]:** [Opening hook, 1-2 sentences]

[Natural transition to topic]

---

## [SEGMENT 2: Main Content - 0:30-2:00]

**[VISUAL/AUDIO]:** [Production notes]

**[SPEAKER]:** [Main content delivery]

[Discussion or narrative of first major point]

**[CUT TO/TRANSITION]:** [How we move to next segment]

---

## [SEGMENT 3: Key Story or Example - 2:00-3:30]

**[VISUAL/AUDIO]:** [Production direction]

**[SPEAKER]:** [Story or detailed example]

[Narrative that brings content to life]

[Connection back to main topic]

---

## [SEGMENT 4: Secondary Points or Interview - 3:30-5:00]

**[VISUAL/AUDIO]:** [Production notes]

**[SPEAKER/GUEST]:** [Information or perspective]

[Dialogue or narration]

---

## [SEGMENT 5: CLOSING - 5:00-5:30]

**[VISUAL/AUDIO]:** [Closing visual/audio treatment]

**[SPEAKER]:** [Strong closing statement]

[Call-to-action or next episode preview]

[Sign-off]

---

## Production Notes

### Audio
- **Music:** [Opening/closing/segment music suggestions]
- **SFX:** [Sound effects or ambient audio]
- **Tone:** [Warm/energetic/serious/casual]

### Video
- **Shots:** [Key visuals - B-roll, lower thirds, graphics]
- **Graphics:** [Any text overlays or animations]
- **Pacing:** [Cuts, transitions, energy levels]

### General
- **Target Length:** [X minutes/episodes]
- **Format:** [Vlog/interview/educational/entertainment]
- **Tone:** [Overall mood and voice]

## Talking Points Summary
- [Point 1]
- [Point 2]
- [Point 3]
      `.trim(),
      qualityChecklist: [
        'Hook appears in first 10 seconds',
        'Dialogue and narration sound natural',
        'Segments flow logically and smoothly',
        'Production notes are clear and actionable',
        'Pacing maintains viewer/listener interest',
        'Key points are emphasized',
        'Closing is strong with clear CTA',
        'Overall arc builds toward satisfying ending',
      ],
    },
    variables: [
      {
        name: 'topic',
        description: 'What is the video/podcast about?',
        required: true,
      },
      {
        name: 'format',
        description: 'Video or podcast? (Vlog/interview/educational/entertainment)',
        required: true,
      },
      {
        name: 'targetLength',
        description: 'Target duration (5 min video, 30 min podcast, etc)',
        required: false,
        defaultValue: '10 minutes',
      },
      {
        name: 'audience',
        description: 'Who is watching or listening?',
        required: true,
      },
      {
        name: 'tone',
        description: 'Overall tone (educational, entertaining, inspirational, casual)',
        required: false,
        defaultValue: 'casual',
      },
      {
        name: 'mainPoints',
        description: '2-3 key points or topics to cover',
        required: false,
      },
    ],
  },
  {
    slug: 'poetry',
    name: 'Poetry Composition',
    description: 'Original poetry with imagery, emotion, rhythm, and resonance.',
    category: 'CREATIVE',
    template: {
      role: 'Poet & Wordsmith',
      taskStructure: `
1. Theme & Emotion: Core feeling or truth to explore
2. Imagery: Specific sensory details and metaphors
3. Structure: Form, meter, rhyme scheme (if any)
4. Voice: Unique poetic perspective and tone
5. Rhythm & Music: How the poem sounds when read aloud
6. Metaphor & Symbolism: Layers of meaning
7. Emotional Arc: How feeling deepens or transforms
8. Resolution: What lingers with the reader?
      `.trim(),
      cotGuidance: `
Think deeply:
- What feeling am I trying to evoke?
- What specific image captures this emotion?
- What words have music and weight?
- What metaphor transforms the ordinary?
- How does silence and white space matter?
- What truth am I hiding in the imagery?
- What will the reader carry away?
- Where is beauty in the pain?
      `.trim(),
      constraints: [
        'Specific, sensory images (not abstract statements)',
        'Words chosen for sound, not just meaning',
        'Avoid clichés and predictable rhymes',
        "Trust the image; don't over-explain",
        'Line breaks serve purpose (emphasis, surprise)',
        'Rhythm supports meaning',
        'Depth beneath the surface',
        'Resonance that lingers',
      ],
      formatSpec: `
# [Poem Title]

[First stanza with vivid imagery and emotional truth]

[Stanza that deepens or complicates the feeling]

[Stanza that shifts perspective or introduces surprise]

[Stanza that moves toward resolution or realization]

[Final stanza that leaves the reader with resonance]

---

## Poetic Elements

**Form:** [Free verse/sonnet/haiku/other - any structure choices]

**Rhyme Scheme:** [If any - ABAB, AABB, none, etc]

**Meter/Rhythm:** [How the poem should sound]

**Central Image(s):** [Primary metaphors or symbols]

**Tone:** [Melancholic/celebratory/introspective/urgent/gentle]

**Emotional Arc:** [How feeling shifts from beginning to end]

## Themes & Layers
- **Surface:** [What a quick reader sees]
- **Deeper:** [What closer reading reveals]
- **Symbolic:** [What the images represent]

## Writing Notes
- **Inspiration:** [What sparked this poem]
- **Word Choices:** [Any particularly important word selections]
- **Sound:** [How it should be read aloud]
      `.trim(),
      qualityChecklist: [
        'Imagery is specific and sensory',
        'Words are chosen for sound and meaning',
        'No clichés or predictable phrases',
        'Metaphors are fresh and revealing',
        'Line breaks are purposeful',
        'Rhythm enhances meaning',
        'Emotional depth is present',
        'Reader is left with resonance',
      ],
    },
    variables: [
      {
        name: 'theme',
        description: 'What emotion, truth, or theme does the poem explore?',
        required: true,
      },
      {
        name: 'tone',
        description: 'Emotional tone (melancholic, celebratory, introspective, urgent)',
        required: false,
        defaultValue: 'introspective',
      },
      {
        name: 'form',
        description: 'Poetry form preference (free verse, sonnet, haiku, other)',
        required: false,
        defaultValue: 'free verse',
      },
      {
        name: 'imagery',
        description: 'Specific images, settings, or sensory elements to include',
        required: false,
      },
      {
        name: 'length',
        description: 'Approximate length (short poem/medium/long)',
        required: false,
        defaultValue: 'medium',
      },
      {
        name: 'inspiration',
        description: 'What inspired this poem or sparked the idea?',
        required: false,
      },
    ],
  },
  {
    slug: 'newsletter',
    name: 'Newsletter Content',
    description:
      'Create engaging newsletter editions with curated content, original insights, and reader value.',
    category: 'CREATIVE',
    template: {
      role: 'Newsletter Editor and Content Strategist',
      taskStructure: `
1. Define the edition theme and key message
2. Write a compelling opening hook
3. Curate and summarize key stories or insights
4. Add original commentary or analysis
5. Include actionable takeaways for readers
6. Create engaging section transitions
7. Write a strong closing with CTA
      `.trim(),
      cotGuidance: `
Think about:
- What is the one thing readers should remember?
- What mix of content types keeps engagement high?
- How do I add unique perspective, not just aggregation?
- What makes someone forward this to a friend?
- Is each section earning the reader's continued attention?
      `.trim(),
      constraints: [
        'Lead with the most valuable or surprising content',
        'Each section must provide standalone value',
        'Include at least one actionable takeaway per section',
        'Keep sections scannable with clear headers',
        'Maintain consistent voice and brand personality',
        'Total length 800-1500 words for optimal engagement',
      ],
      formatSpec:
        'Newsletter with: Subject Line, Opening Hook, 3-5 Content Sections (each with header, content, takeaway), Featured Resource/Tool, Reader CTA, Sign-off',
      qualityChecklist: [
        'Subject line creates curiosity without clickbait',
        'Opening hook grabs attention in first 2 sentences',
        'Content sections provide genuine value',
        'Transitions between sections are smooth',
        'Actionable takeaways are specific and useful',
        'Voice is consistent and engaging throughout',
        'CTA is clear and compelling',
      ],
    },
    variables: [
      { name: 'theme', description: 'Edition theme or focus area', required: true },
      { name: 'audience', description: 'Target reader profile', required: true },
      {
        name: 'keyStories',
        description: 'Main stories, links, or insights to include',
        required: true,
      },
      {
        name: 'brandVoice',
        description: 'Newsletter voice/personality',
        required: false,
        defaultValue: 'informative and conversational',
      },
    ],
  },
  {
    slug: 'video-script',
    name: 'Video Script Writing',
    description:
      'Write engaging video scripts for YouTube, explainers, or presentations with hooks, pacing, and visual cues.',
    category: 'CREATIVE',
    template: {
      role: 'Video Scriptwriter and Content Producer',
      taskStructure: `
1. Open with a strong hook (first 5-10 seconds)
2. State what the viewer will learn or gain
3. Build the narrative arc with clear sections
4. Include visual and B-roll cues
5. Add engagement prompts (questions, challenges)
6. Deliver key takeaways
7. Close with CTA (subscribe, comment, share)
      `.trim(),
      cotGuidance: `
Think about:
- What makes someone NOT click away in the first 10 seconds?
- How do I balance information with entertainment?
- Where should I add visual variety to maintain attention?
- What is the ideal pacing for this topic?
- How do I make complex topics feel simple?
      `.trim(),
      constraints: [
        'Hook must grab attention within first 10 seconds',
        'Write for spoken delivery (conversational, not formal)',
        'Include visual/B-roll cues in brackets',
        'Keep sentences short and punchy for delivery',
        'Include timestamp estimates for each section',
        'Add engagement prompts every 2-3 minutes',
      ],
      formatSpec:
        'Video Script with: Title, Target Duration, Hook (0:00-0:10), Intro (promise), Main Sections (with [VISUAL CUE] markers), Engagement Prompts, Key Takeaways, Outro + CTA, Thumbnail Concept',
      qualityChecklist: [
        'Hook creates immediate curiosity or tension',
        'Script reads naturally when spoken aloud',
        'Visual cues are included for production',
        'Pacing varies to maintain attention',
        'Key points are reinforced with examples',
        'CTA is natural and not forced',
        'Total duration matches target length',
      ],
    },
    variables: [
      { name: 'topic', description: 'Video topic or title', required: true },
      {
        name: 'targetDuration',
        description: 'Target video length (e.g., 5 min, 10 min, 15 min)',
        required: true,
      },
      {
        name: 'platform',
        description: 'Platform (YouTube, TikTok, Instagram Reels, corporate)',
        required: false,
        defaultValue: 'YouTube',
      },
      { name: 'audience', description: 'Target viewer profile', required: true },
      {
        name: 'style',
        description: 'Video style (educational, entertaining, documentary, tutorial)',
        required: false,
        defaultValue: 'educational',
      },
    ],
  },
  {
    slug: 'podcast-outline',
    name: 'Podcast Episode Planning',
    description:
      'Plan structured podcast episodes with talking points, transitions, and guest questions.',
    category: 'CREATIVE',
    template: {
      role: 'Podcast Producer and Show Runner',
      taskStructure: `
1. Define episode theme and key takeaway
2. Write the cold open or teaser
3. Structure segments with timing
4. Develop talking points per segment
5. Prepare guest questions (if interview format)
6. Plan transitions between segments
7. Create outro with listener CTA
      `.trim(),
      cotGuidance: `
Think about:
- What makes this episode worth listening to?
- How do I hook listeners in the first 30 seconds?
- What is the right balance of depth vs breadth?
- Are questions open-ended enough for great answers?
- How do I make transitions feel natural?
      `.trim(),
      constraints: [
        'Include timestamp targets for each segment',
        'Questions must be open-ended and thought-provoking',
        'Include backup talking points if conversation stalls',
        'Plan for natural transitions, not abrupt topic changes',
        'Keep total episode within target duration',
        'Include listener engagement prompts',
      ],
      formatSpec:
        'Episode Outline with: Episode Title, Theme, Target Duration, Cold Open Script, Segment Breakdown (with timing), Talking Points per Segment, Guest Questions (if applicable), Transitions, Key Takeaways, Outro + CTA, Show Notes Draft',
      qualityChecklist: [
        'Episode has a clear central theme',
        'Cold open creates immediate interest',
        'Segments build on each other logically',
        'Talking points are specific, not generic',
        'Questions would produce interesting answers',
        'Timing is realistic for each segment',
        'Listener CTA is clear and actionable',
      ],
    },
    variables: [
      { name: 'episodeTopic', description: 'Episode topic or theme', required: true },
      {
        name: 'format',
        description: 'Format (solo, interview, panel, storytelling)',
        required: true,
      },
      {
        name: 'duration',
        description: 'Target episode length',
        required: false,
        defaultValue: '30-45 minutes',
      },
      {
        name: 'guestName',
        description: 'Guest name and background (if interview)',
        required: false,
      },
    ],
  },
  {
    slug: 'whitepaper',
    name: 'Technical Whitepaper',
    description:
      'Write authoritative technical whitepapers that establish thought leadership and educate professional audiences.',
    category: 'CREATIVE',
    template: {
      role: 'Technical Writer and Subject Matter Expert',
      taskStructure: `
1. Define the problem or opportunity clearly
2. Establish context with industry data and trends
3. Present the thesis or approach
4. Develop the argument with evidence and examples
5. Address counterarguments or limitations
6. Provide actionable conclusions and recommendations
7. Include references and further reading
      `.trim(),
      cotGuidance: `
Think about:
- What problem does this whitepaper solve for the reader?
- What evidence makes the argument credible?
- How do I balance depth with readability?
- What would a skeptical reader challenge?
- How does this establish thought leadership?
      `.trim(),
      constraints: [
        'Support all claims with data, research, or case studies',
        'Write for a professional audience (no oversimplification)',
        'Include executive summary for time-pressed readers',
        'Address counterarguments to strengthen credibility',
        'Target 2000-4000 words for standard whitepapers',
        'Include clear methodology if presenting original research',
        'Cite all sources and provide references',
      ],
      formatSpec:
        'Whitepaper with: Title Page, Executive Summary, Problem Statement, Background/Context, Methodology (if applicable), Findings/Analysis, Case Studies or Examples, Recommendations, Conclusion, References, About the Author/Company',
      qualityChecklist: [
        'Executive summary captures the full argument in 200 words',
        'Problem statement resonates with target audience',
        'Evidence is credible and well-sourced',
        'Argument is logical and well-structured',
        'Counterarguments are addressed fairly',
        'Recommendations are specific and actionable',
        'Tone is authoritative but accessible',
        'References are complete and credible',
      ],
    },
    variables: [
      { name: 'topic', description: 'Whitepaper topic or thesis', required: true },
      { name: 'audience', description: 'Target professional audience', required: true },
      {
        name: 'keyData',
        description: 'Key data points or research to incorporate',
        required: false,
      },
      {
        name: 'objective',
        description: 'Primary objective (thought leadership, lead generation, education)',
        required: false,
        defaultValue: 'thought leadership',
      },
    ],
  },
  {
    slug: 'case-study-writing',
    name: 'Customer Success Case Study',
    description:
      'Write compelling customer success stories that demonstrate value through real results and relatable challenges.',
    category: 'CREATIVE',
    template: {
      role: 'Case Study Writer and Business Storyteller',
      taskStructure: `
1. Set the scene: Who is the customer and their industry?
2. Define the challenge: What problem were they facing?
3. Describe the journey: How did they find and adopt the solution?
4. Show the solution: What was implemented and how?
5. Quantify results: Specific metrics and outcomes
6. Capture the human element: Quotes and testimonials
7. Provide transferable lessons
      `.trim(),
      cotGuidance: `
Think about:
- What makes this customer's story relatable to prospects?
- What specific metrics demonstrate ROI?
- How do I balance storytelling with credibility?
- What objections does this case study overcome?
- What quote would a prospect remember?
      `.trim(),
      constraints: [
        'Include specific, quantified results (numbers, percentages, timeframes)',
        'Use direct quotes from the customer',
        'Follow the Challenge → Solution → Results arc',
        'Make the customer the hero, not your product',
        'Include timeline from problem to results',
        'Keep between 800-1500 words',
      ],
      formatSpec:
        'Case Study with: Headline (result-focused), Customer Profile (industry, size, location), Challenge, Solution, Implementation Timeline, Results (quantified), Customer Quotes, Key Takeaways, CTA',
      qualityChecklist: [
        'Headline leads with the most impressive result',
        'Challenge is relatable to target audience',
        'Solution description is clear but not overly technical',
        'Results are specific and quantified',
        'Customer quotes feel authentic and compelling',
        'Story follows a clear narrative arc',
        'Transferable lessons are explicit',
      ],
    },
    variables: [
      { name: 'customerName', description: 'Customer or company name', required: true },
      { name: 'challenge', description: 'The key business challenge they faced', required: true },
      { name: 'solution', description: 'What solution was implemented', required: true },
      { name: 'results', description: 'Key metrics and outcomes achieved', required: true },
      { name: 'industry', description: 'Customer industry for context', required: false },
    ],
  },
  {
    slug: 'brand-story',
    name: 'Brand Narrative & Storytelling',
    description:
      'Craft compelling brand origin stories and narratives that connect emotionally with audiences and build brand identity.',
    category: 'CREATIVE',
    template: {
      role: 'Brand Storyteller and Narrative Designer',
      taskStructure: `
1. Identify the brand's core purpose and "why"
2. Find the origin moment or founding story
3. Define the hero (customer or founder) and their journey
4. Establish the conflict or challenge overcome
5. Articulate the transformation and vision
6. Connect to audience values and aspirations
7. Create a memorable, shareable narrative
      `.trim(),
      cotGuidance: `
Think about:
- What is the emotional truth behind this brand?
- What moment made this brand inevitable?
- Who is the real hero — the founder or the customer?
- What conflict creates tension and interest?
- How does this story make someone FEEL?
      `.trim(),
      constraints: [
        'Lead with emotion, support with facts',
        'Find the universal truth in the specific story',
        'Use sensory details to make the story vivid',
        'Keep the narrative focused on one central theme',
        'Ensure authenticity — never fabricate origin stories',
        'Connect brand values to audience aspirations',
      ],
      formatSpec:
        'Brand Story with: The Hook (opening moment), The Origin (how it started), The Challenge (what was hard), The Breakthrough (turning point), The Mission (why it matters), The Vision (where we are going), The Invitation (how audience fits in)',
      qualityChecklist: [
        'Story has a clear emotional arc',
        'Opening creates immediate emotional connection',
        'Conflict creates genuine tension',
        'Brand values emerge naturally from the story',
        'Narrative feels authentic, not manufactured',
        'Reader can see themselves in the story',
        'Story is memorable and shareable',
      ],
    },
    variables: [
      { name: 'brandName', description: 'Brand or company name', required: true },
      {
        name: 'originStory',
        description: 'How the brand started (founding moment, inspiration)',
        required: true,
      },
      { name: 'coreValues', description: 'Brand core values and mission', required: true },
      {
        name: 'audience',
        description: 'Target audience for this narrative',
        required: false,
        defaultValue: 'general public',
      },
    ],
  },
]
