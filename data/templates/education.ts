// Drferdi Transformer Engine V2 — Education Templates
import type { TemplateDefinition } from '@/types'

export const educationTemplates: TemplateDefinition[] = [
  {
    slug: 'lesson-plan',
    name: 'Lesson Plan Creation',
    description:
      'Generate comprehensive lesson plans with objectives, activities, and assessment strategies.',
    category: 'EDUCATION',
    template: {
      role: 'Expert Curriculum Designer and Educator',
      taskStructure: `
        1. Define learning objectives aligned with educational standards
        2. Outline lesson structure with timing and pacing
        3. Design instructional activities and student engagement strategies
        4. Create assessment methods and success criteria
        5. Identify resources and materials needed
        6. Plan for differentiation and accessibility
      `,
      cotGuidance: `
        Think through:
        - Age/grade level and learner readiness
        - Prior knowledge and prerequisites
        - Multiple modalities (visual, auditory, kinesthetic)
        - Formative and summative assessment points
        - Time constraints and realistic pacing
        - Classroom management considerations
      `,
      constraints: [
        'Must align with specified grade level standards',
        'Include clear, measurable learning objectives',
        'Provide realistic time allocations for each activity',
        'Address diverse learning styles and needs',
        'Include formative assessment checkpoints',
        'Be adaptable for different class sizes',
      ],
      formatSpec:
        'Structured lesson plan with: Title, Grade Level, Duration, Objectives, Materials, Procedures (Introduction, Main Activity, Closure), Assessment, Differentiation Notes, Reflection Prompts',
      qualityChecklist: [
        'Learning objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
        'Activities are age-appropriate and engaging',
        'Assessment methods directly measure stated objectives',
        'Differentiation strategies address diverse learners',
        'Materials and resources are practical and accessible',
        'Timing is realistic and includes transitions',
        'Instructions are clear and easy to follow',
        'Connections to prior learning are explicit',
      ],
    },
    variables: [
      {
        name: 'gradeLevel',
        description:
          'Target grade or age group (e.g., Grade 5, High School Seniors, Adult Learners)',
        required: true,
      },
      {
        name: 'subject',
        description: 'Subject area or topic (e.g., Photosynthesis, Constitutional Law, Fractions)',
        required: true,
      },
      {
        name: 'duration',
        description: 'Total lesson duration (e.g., 45 minutes, 90 minutes, one week)',
        required: true,
      },
      {
        name: 'classSize',
        description: 'Expected number of students',
        required: false,
        defaultValue: '25-30',
      },
      {
        name: 'learningStyle',
        description: 'Focus on visual, auditory, kinesthetic, or mixed approaches',
        required: false,
        defaultValue: 'mixed',
      },
    ],
  },
  {
    slug: 'quiz-generator',
    name: 'Quiz/Assessment Generator',
    description:
      'Create effective quizzes and assessments that measure learning outcomes with diverse question types.',
    category: 'EDUCATION',
    template: {
      role: 'Assessment Specialist and Subject Matter Expert',
      taskStructure: `
        1. Identify learning outcomes being assessed
        2. Design question mix (multiple choice, short answer, essay, practical)
        3. Ensure question clarity and appropriate difficulty progression
        4. Create answer keys with rubrics for scoring
        5. Establish alignment between questions and objectives
        6. Develop accommodation strategies for diverse learners
      `,
      cotGuidance: `
        Consider:
        - Bloom's taxonomy levels (remembering → creating)
        - Question clarity and lack of ambiguity
        - Balanced coverage of content areas
        - Appropriate difficulty distribution
        - Validity and reliability of assessment
        - Time needed to complete assessment
        - Equity and accessibility in question design
      `,
      constraints: [
        'Questions must directly align with stated learning objectives',
        'Avoid ambiguous or trick questions',
        'Include multiple question types for comprehensive assessment',
        'Establish clear grading rubrics and point values',
        'Ensure questions are free of cultural bias',
        'Provide answer keys and model responses',
        'Include difficulty indicators for each question',
      ],
      formatSpec:
        'Quiz document with: Learning Objectives, Instructions, Numbered Questions with Options (multiple choice) or Prompts (open-ended), Answer Key with Point Values, Grading Rubric, Time Estimate, Accommodation Notes',
      qualityChecklist: [
        'All questions align with stated learning objectives',
        'Questions test understanding, not just recall',
        'Difficulty is appropriately distributed (easy to challenging)',
        'No ambiguous or confusing wording',
        'Answer key is complete and accurate',
        'Rubrics are specific and objective',
        'Questions are free of bias and stereotypes',
        'Assessment format matches course objectives and student needs',
      ],
    },
    variables: [
      {
        name: 'learningOutcomes',
        description: 'The specific learning objectives being assessed',
        required: true,
      },
      {
        name: 'contentTopic',
        description: 'Subject matter or unit being assessed',
        required: true,
      },
      {
        name: 'questionCount',
        description: 'Number of questions (e.g., 10, 25, 50)',
        required: true,
      },
      {
        name: 'questionTypes',
        description: 'Types to include (e.g., multiple choice, short answer, essay)',
        required: true,
      },
      {
        name: 'difficultyLevel',
        description: 'Intended difficulty (e.g., introductory, intermediate, advanced)',
        required: false,
        defaultValue: 'mixed',
      },
    ],
  },
  {
    slug: 'concept-explainer',
    name: 'Concept Explanation',
    description:
      'Create clear, engaging explanations of complex concepts using analogies, examples, and layered detail.',
    category: 'EDUCATION',
    template: {
      role: 'Master Teacher and Science Communicator',
      taskStructure: `
        1. Identify core concept and essential understanding
        2. Start with simple, relatable foundation
        3. Build complexity progressively with examples
        4. Use analogies and concrete comparisons
        5. Address common misconceptions directly
        6. Connect to real-world applications
        7. Provide practice or exploration prompts
      `,
      cotGuidance: `
        Think about:
        - What is the simplest version of this concept?
        - What everyday example makes it relatable?
        - Where do students typically get confused?
        - How does this connect to things they already know?
        - What is the "why" behind this concept?
        - How would experts explain this simply?
      `,
      constraints: [
        'Avoid jargon without clear definition',
        'Start simple, increase complexity gradually',
        'Include at least 2-3 concrete examples',
        'Address 2+ common misconceptions',
        'Use vivid, relatable language',
        'Connect to prior knowledge where possible',
        'Include a summary or key takeaway',
      ],
      formatSpec:
        'Explanation with: Hook/Relatable Opening, Simple Definition, Foundational Example, Progressive Complexity with Examples, Common Misconceptions, Real-World Applications, Summary, Reflection Questions',
      qualityChecklist: [
        'Explanation is accurate and scientifically sound',
        'Opening captures attention and creates relevance',
        'Complexity builds progressively',
        'Examples are concrete and relatable',
        'Common misconceptions are directly addressed',
        'Language is accessible without being condescending',
        'Real-world connections are meaningful',
        'Reader can articulate the concept after reading',
      ],
    },
    variables: [
      {
        name: 'concept',
        description:
          'The concept to explain (e.g., photosynthesis, supply and demand, exponential growth)',
        required: true,
      },
      {
        name: 'targetAudience',
        description:
          'Who will read this explanation (e.g., high school students, general public, young children)',
        required: true,
      },
      {
        name: 'contextOrDomain',
        description: 'Subject area or field (e.g., biology, economics, physics)',
        required: true,
      },
      {
        name: 'depthLevel',
        description: 'How deep to go (e.g., overview, intermediate, detailed)',
        required: false,
        defaultValue: 'intermediate',
      },
    ],
  },
  {
    slug: 'study-guide',
    name: 'Study Guide Creation',
    description:
      'Develop comprehensive study guides with key concepts, summaries, practice problems, and test preparation strategies.',
    category: 'EDUCATION',
    template: {
      role: 'Study Skills Coach and Content Specialist',
      taskStructure: `
        1. Organize content by major topics and themes
        2. Extract and prioritize key concepts and vocabulary
        3. Create summaries and concept maps
        4. Develop practice problems with solutions
        5. Include test-taking strategies and tips
        6. Suggest study schedules and memory techniques
        7. Provide self-assessment tools and resources
      `,
      cotGuidance: `
        Focus on:
        - What are the essential takeaways?
        - How can students organize information mentally?
        - What practice will build confidence?
        - How should students approach the exam?
        - What study techniques work best for this content?
        - Where do students typically struggle?
      `,
      constraints: [
        'Organize content logically by topic',
        'Include key vocabulary with definitions',
        'Provide concept summaries (not full text recap)',
        'Include 10+ practice problems with answers',
        'Address exam format and question types',
        'Suggest evidence-based study techniques',
        'Include self-assessment and review tools',
        'Be comprehensive but manageable in length',
      ],
      formatSpec:
        'Study Guide with: Table of Contents, Learning Objectives, Key Concepts by Topic, Vocabulary List, Summary Sheets, Practice Problems (with solutions), Concept Maps/Diagrams, Study Tips and Strategies, Practice Exam or Review Questions, Answer Key',
      qualityChecklist: [
        'Content is well-organized and easy to navigate',
        'Key concepts are clearly identified and explained',
        'Vocabulary is complete and accessible',
        'Practice problems are varied in difficulty',
        'Solutions are detailed and instructive',
        'Study strategies are evidence-based and practical',
        'Self-assessment tools help students identify gaps',
        'Guide covers all material on the actual assessment',
      ],
    },
    variables: [
      {
        name: 'courseOrUnit',
        description: 'Name of course, subject, or unit being studied',
        required: true,
      },
      {
        name: 'assessmentType',
        description:
          'What students are studying for (e.g., midterm exam, standardized test, project)',
        required: true,
      },
      {
        name: 'studyTimeframe',
        description: 'How long students have to study (e.g., 1 week, 2 weeks, entire semester)',
        required: true,
      },
      {
        name: 'studentLevel',
        description: 'Grade or experience level of students',
        required: false,
        defaultValue: 'high school',
      },
    ],
  },
  {
    slug: 'curriculum-design',
    name: 'Curriculum Design',
    description:
      'Create structured, coherent curricula that align standards, sequence learning progressively, and integrate assessment.',
    category: 'EDUCATION',
    template: {
      role: 'Curriculum Developer and Educational Strategist',
      taskStructure: `
        1. Align with relevant educational standards and frameworks
        2. Define unit learning outcomes and essential questions
        3. Sequence content and skills progressively
        4. Design integrated units and projects
        5. Create summative and formative assessment plans
        6. Plan resource requirements and materials
        7. Build in flexibility and differentiation strategies
        8. Establish pacing guides and timelines
      `,
      cotGuidance: `
        Think about:
        - What are the foundational skills students need?
        - How do concepts build on each other?
        - What big questions drive the learning?
        - Where can we integrate across subjects?
        - How will we know students have learned?
        - What support do diverse learners need?
      `,
      constraints: [
        'Must align with stated standards and frameworks',
        'Include clear, measurable unit outcomes',
        'Sequence skills and content appropriately',
        'Incorporate formative and summative assessment',
        'Address differentiation and accessibility',
        'Provide realistic pacing and timelines',
        'Include resource and material specifications',
        'Show connections between units and concepts',
      ],
      formatSpec:
        'Curriculum Document with: Overview and Rationale, Standards Alignment, Unit Outcomes, Unit Sequencing, Essential Questions, Assessment Plan, Resource List, Pacing Guide, Differentiation Strategies, Integration Opportunities, Sample Unit Plans (1-2 detailed examples)',
      qualityChecklist: [
        'Curriculum aligns with relevant standards',
        'Learning progressions are logical and research-based',
        'Essential questions drive meaningful learning',
        'Assessment is integrated throughout (not just at end)',
        'Differentiation strategies are specific and actionable',
        'Resources are accessible and realistic',
        'Pacing is feasible for intended time frame',
        'Coherence across units is evident',
      ],
    },
    variables: [
      {
        name: 'subject',
        description: 'Subject area or course name',
        required: true,
      },
      {
        name: 'gradeLevel',
        description: 'Grade or level for which curriculum is designed',
        required: true,
      },
      {
        name: 'duration',
        description: 'Time span for curriculum (e.g., full year, semester, quarter)',
        required: true,
      },
      {
        name: 'standardsFramework',
        description: 'Standards to align with (e.g., Common Core, state standards, IB)',
        required: true,
      },
    ],
  },
  {
    slug: 'tutorial-writing',
    name: 'Tutorial/How-To Guide',
    description:
      'Write clear, step-by-step tutorials and how-to guides that enable learners to successfully complete procedures or use tools.',
    category: 'EDUCATION',
    template: {
      role: 'Technical Writer and User Experience Specialist',
      taskStructure: `
        1. Analyze the task and identify prerequisites
        2. Break procedure into logical, manageable steps
        3. Provide clear instructions for each step
        4. Include relevant screenshots, diagrams, or examples
        5. Anticipate common pitfalls and troubleshoot
        6. Add tips for efficiency and best practices
        7. Include verification/success criteria
        8. Provide next steps or advanced options
      `,
      cotGuidance: `
        Keep in mind:
        - What does a complete beginner need to know first?
        - What are the smallest meaningful steps?
        - Where are people likely to get stuck?
        - What should they see/hear/feel at each point?
        - How can they tell if they succeeded?
        - What could go wrong and how do you fix it?
      `,
      constraints: [
        'Include clear, numbered steps in logical order',
        'Provide prerequisites and required materials upfront',
        'Use imperative voice (action-oriented)',
        'Include visuals or examples for clarity',
        'Anticipate and address 2+ common errors',
        'Provide success criteria for each step',
        'Include troubleshooting section',
        'Be concise but complete',
      ],
      formatSpec:
        'Tutorial with: Title and Overview, Learning Objectives, Prerequisites and Materials, Step-by-Step Instructions (with visuals), Tips and Best Practices, Troubleshooting Guide, Verification Checklist, Next Steps/Advanced Options, FAQ',
      qualityChecklist: [
        'Tutorial is complete and follows a logical sequence',
        'Each step is clear, concise, and actionable',
        'Visual aids support understanding without clutter',
        'Language is simple and jargon-free (or defined)',
        'Common mistakes are addressed with solutions',
        'Readers can verify success at each stage',
        'Troubleshooting section covers real issues',
        'Advanced readers have paths for deeper learning',
      ],
    },
    variables: [
      {
        name: 'skillOrTool',
        description:
          'What the tutorial teaches (e.g., "Create a Pivot Table in Excel", "Tie a Bowline Knot")',
        required: true,
      },
      {
        name: 'targetAudience',
        description: 'Who is learning (e.g., absolute beginners, intermediate users)',
        required: true,
      },
      {
        name: 'duration',
        description: 'How long the tutorial should take to complete',
        required: false,
        defaultValue: '15-30 minutes',
      },
      {
        name: 'prerequisites',
        description: 'Skills or knowledge needed before starting',
        required: false,
        defaultValue: 'None (absolute beginner friendly)',
      },
    ],
  },
  {
    slug: 'course-syllabus',
    name: 'Course Syllabus Creation',
    description:
      'Design comprehensive course syllabi with learning outcomes, schedule, policies, and assessment plans.',
    category: 'EDUCATION',
    template: {
      role: 'Academic Course Designer and Instructional Expert',
      taskStructure: `
1. Define course overview, rationale, and learning outcomes
2. Outline weekly/module schedule with topics
3. Specify required materials and resources
4. Design assessment plan with grading breakdown
5. Establish course policies (attendance, academic integrity, late work)
6. Include accessibility and accommodation statements
7. Create office hours and communication guidelines
      `.trim(),
      cotGuidance: `
Think about:
- What should students be able to DO after this course?
- Is the weekly pacing realistic?
- Do assessments actually measure learning outcomes?
- Are policies clear and fair?
- How do students get help when stuck?
      `.trim(),
      constraints: [
        "Learning outcomes must use measurable action verbs (Bloom's taxonomy)",
        'Weekly schedule must be realistic for credit hours',
        'Assessment methods must align with learning outcomes',
        'Include accessibility and accommodation policies',
        'Provide clear contact and communication expectations',
        'Include academic integrity policy and consequences',
      ],
      formatSpec:
        'Syllabus with: Course Info (title, code, credits, instructor), Course Description, Learning Outcomes, Required Materials, Weekly Schedule, Assessment Plan (with weights), Grading Scale, Course Policies, Accessibility Statement, Academic Integrity Policy, Office Hours & Communication',
      qualityChecklist: [
        'Learning outcomes are specific and measurable',
        'Schedule aligns with credit hours and pacing',
        'Assessments directly measure stated outcomes',
        'Policies are clear, fair, and complete',
        'Accessibility information is prominently included',
        'Students know how to get help',
      ],
    },
    variables: [
      { name: 'courseName', description: 'Course title and code', required: true },
      {
        name: 'level',
        description: 'Course level (undergraduate, graduate, professional)',
        required: true,
      },
      {
        name: 'duration',
        description: 'Course duration (semester, quarter, intensive)',
        required: true,
      },
      {
        name: 'meetingPattern',
        description: 'Meeting schedule (e.g., Mon/Wed 2:00-3:15)',
        required: false,
      },
      {
        name: 'prerequisites',
        description: 'Required prerequisite courses or knowledge',
        required: false,
      },
    ],
  },
  {
    slug: 'rubric-creator',
    name: 'Assessment Rubric Development',
    description:
      'Create detailed, fair assessment rubrics with clear criteria and performance level descriptors.',
    category: 'EDUCATION',
    template: {
      role: 'Assessment Design Specialist and Rubric Expert',
      taskStructure: `
1. Identify the assignment and its learning objectives
2. Define evaluation criteria (dimensions of quality)
3. Describe performance levels for each criterion
4. Assign point values or weights
5. Write specific, observable descriptors for each cell
6. Include examples of each performance level
7. Test rubric against sample student work
      `.trim(),
      cotGuidance: `
Think about:
- What distinguishes excellent from adequate work?
- Are descriptors specific enough to apply consistently?
- Would two different graders assign the same score?
- Are criteria aligned with learning objectives?
- Does the rubric help students understand expectations?
      `.trim(),
      constraints: [
        'Use observable, measurable descriptors (not vague adjectives)',
        'Performance levels must be clearly distinguishable',
        'Criteria must align with assignment learning objectives',
        'Include 3-5 performance levels per criterion',
        'Weight criteria by importance to learning outcomes',
        'Make the rubric usable as a student self-assessment tool',
      ],
      formatSpec:
        'Rubric with: Assignment Description, Learning Objectives Assessed, Criteria Matrix (criteria × performance levels with descriptors and points), Total Points, Grading Thresholds, Exemplar Descriptions, Self-Assessment Guide',
      qualityChecklist: [
        'Each criterion has clear, observable descriptors',
        'Performance levels are genuinely distinguishable',
        'Two graders would assign similar scores using this rubric',
        'Criteria cover all important aspects of the assignment',
        'Point distribution reflects learning priorities',
        'Students could use this to improve their work',
      ],
    },
    variables: [
      { name: 'assignment', description: 'Assignment or project being assessed', required: true },
      {
        name: 'learningObjectives',
        description: 'Learning objectives this assignment measures',
        required: true,
      },
      {
        name: 'performanceLevels',
        description:
          'Number and names of levels (e.g., Excellent, Good, Adequate, Needs Improvement)',
        required: false,
        defaultValue: '4 levels: Exemplary, Proficient, Developing, Beginning',
      },
      {
        name: 'totalPoints',
        description: 'Total points possible',
        required: false,
        defaultValue: '100',
      },
    ],
  },
  {
    slug: 'discussion-prompts',
    name: 'Classroom Discussion Facilitation',
    description:
      'Design thought-provoking discussion prompts and facilitation guides that encourage deep thinking and participation.',
    category: 'EDUCATION',
    template: {
      role: 'Socratic Facilitator and Discussion Design Expert',
      taskStructure: `
1. Design an opening prompt that hooks student interest
2. Create scaffolded follow-up questions (lower to higher order)
3. Prepare devil's advocate or alternative perspective prompts
4. Design small group discussion activities
5. Plan whole-class synthesis questions
6. Create reflection prompts for individual processing
      `.trim(),
      cotGuidance: `
Think about:
- What question would create genuine disagreement?
- How do I scaffold from recall to analysis to evaluation?
- What makes quiet students want to participate?
- How do I prevent one person from dominating?
- What connection to students' lives makes this relevant?
      `.trim(),
      constraints: [
        "Include questions at multiple Bloom's taxonomy levels",
        'Design for equitable participation (not just the vocal few)',
        'Include wait time guidance for facilitators',
        'Provide alternative perspectives to introduce if needed',
        'Connect abstract concepts to concrete student experiences',
        'Include 8-12 questions with facilitation notes',
      ],
      formatSpec:
        "Discussion Guide with: Topic & Objectives, Opening Hook Question, Scaffolded Core Questions (with Bloom's level noted), Small Group Prompts, Devil's Advocate Questions, Synthesis Questions, Individual Reflection Prompts, Facilitation Tips (wait time, cold calling, think-pair-share)",
      qualityChecklist: [
        'Opening question creates genuine curiosity',
        'Questions progress from lower to higher order thinking',
        'Multiple perspectives are represented',
        'Quiet students have structured entry points',
        'Facilitation notes help manage discussion dynamics',
        'Reflection prompts support individual processing',
      ],
    },
    variables: [
      { name: 'topic', description: 'Discussion topic or reading', required: true },
      {
        name: 'gradeLevel',
        description: 'Student level (middle school, high school, college)',
        required: true,
      },
      { name: 'classSize', description: 'Number of students', required: false, defaultValue: '25' },
      {
        name: 'duration',
        description: 'Available discussion time',
        required: false,
        defaultValue: '30-45 minutes',
      },
    ],
  },
  {
    slug: 'learning-activity',
    name: 'Interactive Learning Activity',
    description:
      'Design engaging, interactive learning activities that promote active learning and deep understanding.',
    category: 'EDUCATION',
    template: {
      role: 'Instructional Designer and Active Learning Specialist',
      taskStructure: `
1. Define learning objectives and target skills
2. Choose activity format (simulation, role-play, project, game, lab)
3. Design step-by-step activity instructions
4. Create materials and resources needed
5. Plan facilitation and debriefing strategies
6. Design assessment of learning during the activity
7. Plan for differentiation and accessibility
      `.trim(),
      cotGuidance: `
Think about:
- What makes students WANT to participate?
- How does hands-on experience deepen understanding?
- What misconceptions might surface during the activity?
- How do I debrief to solidify learning?
- How do I ensure all students are engaged, not just a few?
      `.trim(),
      constraints: [
        'Activity must directly serve stated learning objectives',
        'Include clear instructions a substitute teacher could follow',
        'Design for all learning styles (visual, auditory, kinesthetic)',
        'Include debrief questions that connect activity to concepts',
        'Provide adaptations for different ability levels',
        'Keep within realistic time and resource constraints',
      ],
      formatSpec:
        'Learning Activity with: Title, Learning Objectives, Duration, Materials Needed, Setup Instructions, Activity Steps (detailed), Facilitation Notes, Debrief Questions, Assessment Checkpoints, Differentiation Options, Extension Activities',
      qualityChecklist: [
        'Activity clearly connects to learning objectives',
        'Instructions are detailed enough for any facilitator',
        'Students are actively engaged throughout',
        'Debrief bridges experience to conceptual understanding',
        'Differentiation options serve diverse learners',
        'Time estimates are realistic',
      ],
    },
    variables: [
      { name: 'concept', description: 'Concept or skill the activity teaches', required: true },
      { name: 'gradeLevel', description: 'Target grade or age group', required: true },
      { name: 'duration', description: 'Available time for the activity', required: true },
      {
        name: 'activityType',
        description: 'Preferred format (simulation, game, project, experiment)',
        required: false,
        defaultValue: 'flexible',
      },
    ],
  },
  {
    slug: 'feedback-template',
    name: 'Student Feedback & Evaluation',
    description:
      'Write constructive, specific student feedback that promotes growth and maintains motivation.',
    category: 'EDUCATION',
    template: {
      role: 'Educational Assessment Expert and Growth Mindset Coach',
      taskStructure: `
1. Acknowledge specific strengths in the work
2. Identify areas for improvement with specific examples
3. Provide actionable suggestions for next steps
4. Connect feedback to learning objectives
5. Use growth-oriented language (effort and strategy, not fixed traits)
6. Set clear expectations for revision or future work
      `.trim(),
      cotGuidance: `
Think about:
- What did the student do WELL that I can build on?
- What is the most impactful area for improvement?
- How do I make suggestions actionable, not vague?
- Does my language promote growth mindset?
- Will the student know exactly what to do differently?
      `.trim(),
      constraints: [
        'Start with genuine, specific praise',
        'Limit improvement areas to 2-3 most impactful',
        'Make all suggestions actionable with clear next steps',
        'Use growth mindset language (effort, strategy, progress)',
        'Connect feedback to rubric criteria or learning objectives',
        'Avoid vague praise ("good job") or vague criticism ("needs work")',
      ],
      formatSpec:
        'Feedback with: Strengths (specific examples), Areas for Growth (with examples from their work), Actionable Next Steps, Connection to Learning Goals, Encouragement and Growth Language, Revision Expectations (if applicable)',
      qualityChecklist: [
        'Praise is specific and evidence-based',
        'Improvement areas are limited and prioritized',
        'Suggestions are concrete and actionable',
        'Language promotes growth mindset',
        'Student knows exactly what to do next',
        'Overall tone is supportive and motivating',
      ],
    },
    variables: [
      {
        name: 'studentWork',
        description: 'Description of or excerpt from student work',
        required: true,
      },
      { name: 'assignment', description: 'Assignment or assessment context', required: true },
      { name: 'learningObjectives', description: 'Relevant learning objectives', required: false },
      { name: 'studentLevel', description: 'Student performance level context', required: false },
    ],
  },
  {
    slug: 'differentiated-instruction',
    name: 'Differentiated Instruction Plan',
    description:
      'Plan differentiated instruction strategies that meet diverse learner needs within the same classroom.',
    category: 'EDUCATION',
    template: {
      role: 'Inclusive Education Specialist and Differentiation Expert',
      taskStructure: `
1. Assess learner diversity (readiness, interests, learning profiles)
2. Identify the core concept all students must learn
3. Design tiered activities (approaching, on-level, advanced)
4. Plan flexible grouping strategies
5. Create choice boards or learning menus
6. Adapt assessment methods for different learners
7. Plan scaffolding and extension opportunities
      `.trim(),
      cotGuidance: `
Think about:
- What is the essential understanding ALL students need?
- How do I challenge advanced learners without losing struggling ones?
- What scaffolds make the content accessible without diluting it?
- How do I assess the same learning at different levels?
- What student choice increases engagement and ownership?
      `.trim(),
      constraints: [
        'All tiers must address the same core learning objective',
        'Differentiate content, process, or product — not expectations',
        'Include scaffolds for struggling learners (not just easier work)',
        'Include extensions for advanced learners (deeper, not more)',
        'Plan for at least 3 readiness levels',
        'Include assessment adaptations that maintain rigor',
      ],
      formatSpec:
        'Differentiation Plan with: Lesson Topic, Core Learning Objective, Learner Profile Assessment, Tiered Activities (3 levels), Flexible Grouping Plan, Choice Board Options, Scaffolding Strategies, Extension Activities, Assessment Adaptations, Materials & Resources per Tier',
      qualityChecklist: [
        'Core learning objective is the same for all tiers',
        'Tiers differ in complexity, not just quantity',
        'Scaffolds provide access without lowering expectations',
        'Extensions deepen thinking, not just add more work',
        'Grouping strategies are flexible and purposeful',
        'Assessment measures the same objectives at all levels',
      ],
    },
    variables: [
      { name: 'topic', description: 'Lesson topic or concept', required: true },
      { name: 'gradeLevel', description: 'Grade or level of students', required: true },
      {
        name: 'diversityProfile',
        description: 'Description of learner diversity (ELL, gifted, IEP, etc)',
        required: true,
      },
      {
        name: 'classSize',
        description: 'Number of students',
        required: false,
        defaultValue: '25-30',
      },
    ],
  },
]
