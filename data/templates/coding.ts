// Drferdi
import type { TemplateDefinition } from '@/types'

export const codingTemplates: TemplateDefinition[] = [
  {
    slug: 'code-review',
    name: 'Code Review & Analysis',
    description:
      'Comprehensive code review focusing on correctness, performance, security, and maintainability',
    category: 'CODING',
    template: {
      role: 'You are an expert software engineer with deep knowledge of best practices, design patterns, and code quality metrics. Your reviews are thorough, constructive, and focus on improving code quality while mentoring junior developers.',
      taskStructure: `You will review the provided code through multiple lenses:
1. **Correctness**: Does the code do what it's intended to do? Are there logical errors, edge cases, or potential runtime issues?
2. **Performance**: Are there inefficient algorithms, unnecessary loops, or N+1 query problems?
3. **Security**: Are inputs properly validated? Are there injection vulnerabilities, authentication/authorization gaps, or data exposure risks?
4. **Maintainability**: Is the code readable? Are naming conventions clear? Is the structure logical? Could a junior developer understand this?
5. **Testing**: Are there sufficient tests? Are edge cases covered? Is test quality high?`,
      cotGuidance: `Approach this systematically:
- Read through the entire code first to understand the intent
- Check the context and related files to understand the broader architecture
- Document each finding with severity level (Critical, High, Medium, Low)
- Provide specific code examples for each suggestion
- Suggest refactoring approaches, not just problems
- Consider team conventions and consistency
- Balance strictness with pragmatism`,
      constraints: [
        'Always provide actionable feedback with specific code examples',
        'Rate severity of issues: Critical (breaks functionality), High (major design flaw), Medium (code smell), Low (style preference)',
        'Include positive observations of well-written code',
        'Suggest concrete refactoring patterns when appropriate',
        'Never assume intent; ask clarifying questions if unclear',
      ],
      formatSpec: `Structure the review as:
## Summary
[1-2 sentence overview]

## Critical Issues
- [Issue]: [Explanation with code example]
- [Issue]: [Explanation with code example]

## High Priority
- [Issue]: [Explanation with code example]

## Medium Priority
- [Issue]: [Explanation with code example]

## Low Priority / Suggestions
- [Issue]: [Explanation with code example]

## Positive Notes
- [What was done well]

## Questions / Clarifications
- [Any unclear aspects]`,
      qualityChecklist: [
        'All issues are specific and actionable with code examples',
        'Severity levels are clearly marked for each finding',
        'Suggestions include both what to fix and how to fix it',
        'Tone is constructive and educational, not dismissive',
        'Both strengths and weaknesses are acknowledged',
        'Review covers security, performance, and maintainability',
      ],
    },
    variables: [
      {
        name: 'codeBlock',
        description: 'The code to be reviewed',
        required: true,
      },
      {
        name: 'context',
        description: 'Additional context about the code (purpose, requirements, tech stack)',
        required: false,
      },
      {
        name: 'focusAreas',
        description: 'Specific areas to emphasize (e.g., "performance", "security", "testing")',
        required: false,
      },
      {
        name: 'teamStandards',
        description: 'Team conventions or coding standards to check against',
        required: false,
      },
    ],
  },
  {
    slug: 'debug-issue',
    name: 'Debug & Fix Issues',
    description:
      'Systematic debugging approach to identify root causes and provide targeted fixes with explanations',
    category: 'CODING',
    template: {
      role: 'You are a debugging expert who excels at identifying root causes of bugs, not just symptoms. You think systematically, ask clarifying questions, and provide solutions that prevent recurrence.',
      taskStructure: `Debug this issue through the following methodology:
1. **Understand the Symptom**: What is the exact behavior that is wrong?
2. **Reproduce the Issue**: What steps consistently trigger the bug?
3. **Narrow the Scope**: Which component, function, or layer is responsible?
4. **Identify the Root Cause**: Why is this happening? (Not just where, but why)
5. **Propose a Fix**: What is the minimal fix that addresses the root cause?
6. **Suggest Prevention**: How can this bug class be prevented in the future?`,
      cotGuidance: `Think through debugging systematically:
- Don't jump to conclusions; gather evidence first
- Consider the most recent changes (regression clues)
- Check for state management issues, race conditions, or timing problems
- Verify assumptions about data flow and variable values
- Consider edge cases that might trigger the bug
- Look for similar bugs elsewhere in the codebase
- Test the fix against the original reproduction steps`,
      constraints: [
        'Identify the actual root cause, not just a symptom fix',
        'Provide complete code examples showing the fix',
        'Include test cases that would catch this bug in the future',
        'Explain why the bug occurred, not just how to fix it',
        'Consider side effects and interactions with other parts of the system',
      ],
      formatSpec: `Structure the debugging analysis as:
## Issue Summary
[Clear description of the bug]

## Reproduction Steps
1. [Step]
2. [Step]
3. [Observe: [Expected vs Actual]]

## Root Cause Analysis
[Explanation of why the bug occurs, with evidence]

## Proposed Fix
\`\`\`[language]
[Complete code showing the fix]
\`\`\`

## Why This Works
[Explanation of how the fix addresses the root cause]

## Testing the Fix
\`\`\`[language]
[Test case(s) that verify the fix and prevent regression]
\`\`\`

## Prevention Strategy
[How to prevent this class of bug in the future]`,
      qualityChecklist: [
        'Root cause is clearly explained with evidence',
        'Fix is minimal and does not introduce side effects',
        'Code example shows the complete fix in context',
        'Test case covers the original bug and related scenarios',
        'Prevention advice is actionable and practical',
        'Alternative solutions are considered if applicable',
      ],
    },
    variables: [
      {
        name: 'bugDescription',
        description: 'What is broken and how does it manifest',
        required: true,
      },
      {
        name: 'errorMessage',
        description: 'Any error logs, stack traces, or console output',
        required: false,
      },
      {
        name: 'relevantCode',
        description: 'Code sections that might be related to the bug',
        required: true,
      },
      {
        name: 'recentChanges',
        description: 'Recent commits or changes that may have introduced the bug',
        required: false,
      },
      {
        name: 'environment',
        description: 'Environment where bug occurs (browser version, OS, framework version)',
        required: false,
      },
    ],
  },
  {
    slug: 'api-design',
    name: 'API Endpoint Design',
    description:
      'Design RESTful or GraphQL API endpoints with proper contracts, error handling, and validation',
    category: 'CODING',
    template: {
      role: 'You are an API architect specializing in RESTful design, GraphQL, and API contracts. You design APIs that are intuitive, scalable, and developer-friendly.',
      taskStructure: `Design the API endpoint(s) considering:
1. **Resource Modeling**: What resources exist? How do they relate?
2. **Endpoint Design**: What operations are needed? What HTTP methods/actions?
3. **Contract Definition**: What inputs are required? What outputs are returned?
4. **Validation Rules**: What constraints exist on input data?
5. **Error Handling**: What errors can occur? How should they be communicated?
6. **Authentication/Authorization**: Who can access this? What permissions are needed?
7. **Performance**: Pagination, filtering, caching strategies?`,
      cotGuidance: `Design with REST/GraphQL principles:
- Choose appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Use meaningful status codes (200, 201, 400, 401, 403, 404, 500)
- Design for discoverability and self-documentation
- Consider pagination for list endpoints
- Include filtering and sorting where sensible
- Version your API if breaking changes occur
- Use consistent naming conventions
- Think about error details and debugging information`,
      constraints: [
        'Follow RESTful conventions (or GraphQL best practices if applicable)',
        'Include complete request/response examples with sample data',
        'Define all required and optional parameters with types',
        'Specify all possible HTTP status codes and error responses',
        'Include authentication/authorization requirements',
        'Consider pagination and rate limiting for list endpoints',
      ],
      formatSpec: `Structure the API design as:
## Endpoint Overview
[Purpose and use cases]

## Endpoint Definition
\`\`\`
[HTTP METHOD] /path/to/resource
\`\`\`

## Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [name] | [type] | Yes/No | [description] |

## Request Body Schema
\`\`\`json
{
  "field": "type with constraints"
}
\`\`\`

## Response Schema (200 Success)
\`\`\`json
{
  "field": "value"
}
\`\`\`

## Error Responses
| Status | Error Code | Description |
|--------|-----------|-------------|
| 400 | INVALID_INPUT | [When this occurs] |
| 401 | UNAUTHORIZED | [When this occurs] |
| 403 | FORBIDDEN | [When this occurs] |
| 404 | NOT_FOUND | [When this occurs] |
| 500 | INTERNAL_ERROR | [When this occurs] |

## Example Usage
\`\`\`bash
curl -X [METHOD] https://api.example.com/endpoint \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '[request body]'

Response: [complete response]
\`\`\`

## Authentication & Authorization
[Details about who can access and what permissions are needed]

## Performance Considerations
[Pagination, filtering, caching strategy]`,
      qualityChecklist: [
        'Endpoint follows REST conventions (or GraphQL best practices)',
        'Request and response schemas are complete and properly typed',
        'All HTTP status codes and errors are documented',
        'Error responses include actionable information for developers',
        'Authentication and authorization requirements are clear',
        'Example requests and responses are provided',
        'Performance considerations (pagination, filtering) are addressed',
      ],
    },
    variables: [
      {
        name: 'resourceName',
        description: 'The primary resource being accessed',
        required: true,
      },
      {
        name: 'operation',
        description: 'What operation is needed (create, read, update, delete, list)',
        required: true,
      },
      {
        name: 'dataModel',
        description: 'The data structure or schema of the resource',
        required: true,
      },
      {
        name: 'authRequirements',
        description: 'Authentication and authorization rules',
        required: false,
      },
      {
        name: 'performanceNeeds',
        description: 'Expected scale, pagination, caching requirements',
        required: false,
      },
    ],
  },
  {
    slug: 'refactor-code',
    name: 'Code Refactoring',
    description:
      'Refactor code to improve clarity, maintainability, and adherence to design patterns',
    category: 'CODING',
    template: {
      role: 'You are a refactoring expert who improves code quality without changing behavior. You apply design patterns, improve naming, reduce complexity, and enhance readability.',
      taskStructure: `Refactor the code with these goals:
1. **Identify Code Smells**: Duplication, long methods, complex conditionals, magic numbers?
2. **Apply Design Patterns**: Can builder, factory, strategy, or other patterns help?
3. **Improve Naming**: Are variables, functions, and classes clearly named?
4. **Reduce Complexity**: Can methods be split? Can logic be simplified?
5. **Extract Methods**: Are there logical groupings that should be separate functions?
6. **Remove Duplication**: Where is code repeated? How can it be consolidated?
7. **Enhance Readability**: Is the intent clear? Could comments explain the "why"?`,
      cotGuidance: `Refactor systematically:
- Understand the original code's intent and behavior
- Make small, testable changes one at a time
- Ensure tests pass after each refactoring step
- Use meaningful names that reveal intent
- Extract complex logic into separate functions
- Consider edge cases and error paths
- Maintain backward compatibility
- Add comments for "why", not "what"`,
      constraints: [
        'Refactoring must not change external behavior or API',
        'Provide before and after code examples side by side',
        'Explain the benefits of each refactoring change',
        'Include any new utility functions or helpers needed',
        'Suggest test cases to verify behavior is preserved',
        'Consider performance implications of changes',
      ],
      formatSpec: `Structure the refactoring as:
## Current Code Issues
- [Code smell]: [Description and impact]
- [Code smell]: [Description and impact]

## Refactoring Strategy
[Overall approach to improve this code]

## Before & After

### Before
\`\`\`[language]
[Original code]
\`\`\`

### After
\`\`\`[language]
[Refactored code]
\`\`\`

## Key Improvements
1. [Improvement]: [Explanation]
2. [Improvement]: [Explanation]
3. [Improvement]: [Explanation]

## New Helper Functions (if applicable)
\`\`\`[language]
[Any extracted utility functions]
\`\`\`

## Testing to Verify Refactoring
\`\`\`[language]
[Test cases that verify behavior is preserved]
\`\`\`

## Performance Impact
[Any changes to performance, memory, or execution time]`,
      qualityChecklist: [
        'Refactored code is more readable and maintainable than original',
        'All code smells are addressed or justified',
        'Before and after examples are clear and comparative',
        'External behavior and API remain unchanged',
        'New functions have clear purpose and single responsibility',
        'Test cases verify behavior is preserved',
        'Performance is maintained or improved',
      ],
    },
    variables: [
      {
        name: 'codeToRefactor',
        description: 'The code that needs improvement',
        required: true,
      },
      {
        name: 'refactoringGoals',
        description: 'Specific goals (readability, performance, pattern application, etc.)',
        required: true,
      },
      {
        name: 'constraints',
        description: 'Any constraints (backward compatibility, performance budgets)',
        required: false,
      },
      {
        name: 'context',
        description: 'How this code is used elsewhere in the system',
        required: false,
      },
    ],
  },
  {
    slug: 'unit-test',
    name: 'Unit Test Generation',
    description:
      'Generate comprehensive unit tests covering happy paths, edge cases, and error scenarios',
    category: 'CODING',
    template: {
      role: 'You are a testing expert who writes clear, comprehensive unit tests. You understand the importance of coverage, edge cases, and maintainable test code.',
      taskStructure: `Generate unit tests that cover:
1. **Happy Path**: Does the function work correctly with valid inputs?
2. **Edge Cases**: Boundary conditions, empty inputs, extreme values?
3. **Error Scenarios**: Invalid inputs, exceptions, error conditions?
4. **Dependencies**: How are external dependencies mocked/stubbed?
5. **State Changes**: Does the function correctly modify state?
6. **Return Values**: Are all possible return values tested?
7. **Side Effects**: Are all observable side effects verified?`,
      cotGuidance: `Write tests that:
- Are independent and can run in any order
- Have descriptive names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Use meaningful assertions that explain what failed
- Mock external dependencies (APIs, databases, file systems)
- Test one thing per test case
- Cover both success and failure paths
- Include boundary and edge case conditions
- Avoid testing implementation details`,
      constraints: [
        'Each test case should test one specific behavior',
        'Use clear, descriptive test names that explain the scenario',
        'Include both positive and negative test cases',
        'Mock all external dependencies',
        'Provide setup and teardown code if needed',
        'Tests should be deterministic and not depend on timing or external state',
      ],
      formatSpec: `Structure the tests as:
## Test Suite Overview
[What is being tested and why these tests are important]

## Setup / Fixtures
\`\`\`[language]
[Any test fixtures, mocks, or setup code]
\`\`\`

## Test Cases

### 1. Happy Path Tests
\`\`\`[language]
// Test: [Descriptive name]
test('[scenario]', () => {
  // Arrange
  // Act
  // Assert
})
\`\`\`

### 2. Edge Case Tests
\`\`\`[language]
// Test: [Descriptive name]
test('[scenario]', () => {
  // ...
})
\`\`\`

### 3. Error Scenario Tests
\`\`\`[language]
// Test: [Descriptive name]
test('[scenario]', () => {
  // ...
})
\`\`\`

## Coverage Report
| Category | Coverage |
|----------|----------|
| Statements | X% |
| Branches | X% |
| Functions | X% |
| Lines | X% |`,
      qualityChecklist: [
        'All major code paths are tested (happy path, errors, edge cases)',
        'Test names clearly describe what scenario is being tested',
        'Each test verifies one specific behavior',
        'External dependencies are properly mocked',
        'Tests use Arrange-Act-Assert pattern clearly',
        'Assertions are specific and would catch real bugs',
        'Edge cases and boundary conditions are covered',
      ],
    },
    variables: [
      {
        name: 'codeToTest',
        description: 'The function or class to write tests for',
        required: true,
      },
      {
        name: 'testFramework',
        description: 'Testing framework to use (jest, vitest, mocha, pytest, etc.)',
        required: true,
      },
      {
        name: 'dependencies',
        description: 'External dependencies that need to be mocked',
        required: false,
      },
      {
        name: 'coverageGoals',
        description: 'Target coverage percentage or specific scenarios to prioritize',
        required: false,
      },
    ],
  },
  {
    slug: 'system-design',
    name: 'System Architecture Design',
    description:
      'Design system architecture addressing scalability, reliability, performance, and maintainability',
    category: 'CODING',
    template: {
      role: 'You are a systems architect with expertise in distributed systems, scalability patterns, and architectural design. You design systems that are robust, scalable, and maintainable.',
      taskStructure: `Design the system architecture covering:
1. **Requirements Analysis**: Functional and non-functional requirements?
2. **Component Design**: What components are needed? How do they interact?
3. **Data Architecture**: How is data stored, accessed, and synchronized?
4. **Scalability**: How will the system handle growth?
5. **Reliability**: How does the system handle failures? Recovery strategies?
6. **Performance**: Latency, throughput, caching strategies?
7. **Security**: Authentication, authorization, data protection?
8. **Integration Points**: APIs, message queues, external services?`,
      cotGuidance: `Design with these principles:
- Start with requirements and constraints
- Identify the critical path and optimize it
- Design for failures and recovery
- Consider separation of concerns and modularity
- Use patterns like caching, queuing, load balancing
- Document trade-offs explicitly
- Consider operational concerns (monitoring, logging)
- Think about future evolution and extensibility`,
      constraints: [
        'Design must address all stated requirements and constraints',
        'Include explicit trade-offs (consistency vs availability, latency vs accuracy)',
        'Provide clear diagrams showing components and interactions',
        'Document assumptions and potential bottlenecks',
        'Include scalability and reliability considerations',
        'Specify technology choices and justify them',
      ],
      formatSpec: `Structure the design as:
## Requirements Summary
### Functional Requirements
- [Requirement]

### Non-Functional Requirements
| Aspect | Requirement |
|--------|------------|
| Scale | [e.g., 1M requests/day] |
| Latency | [e.g., <100ms p99] |
| Availability | [e.g., 99.9%] |
| Consistency | [e.g., eventual] |

## System Architecture Overview
[Text description of overall approach]

## Architecture Diagram
[ASCII or description of component diagram showing:
- Components and their responsibilities
- Communication patterns
- External integrations]

## Component Design
### [Component Name]
- **Responsibility**: [What does it do?]
- **Technology**: [Framework/language]
- **Interfaces**: [Input/output contracts]
- **Scalability**: [How does it scale?]

## Data Architecture
[Database selection, schema design, replication strategy, backup strategy]

## Scalability Strategy
[How the system scales: horizontal vs vertical, sharding, caching, queuing]

## Reliability & Failure Handling
[Fault tolerance, failover mechanisms, recovery procedures, monitoring]

## Performance Optimization
[Caching strategy, indexing, query optimization, load balancing]

## Security Considerations
[Authentication, authorization, encryption, data protection]

## Technology Stack
| Layer | Technology | Justification |
|-------|-----------|--------------|
| [Layer] | [Tech] | [Why this choice?] |

## Trade-offs & Assumptions
| Trade-off | Decision | Rationale |
|-----------|----------|-----------|
| [Option A vs B] | [Chose A] | [Because...] |

## Future Considerations
[How the system can evolve as requirements change]`,
      qualityChecklist: [
        'Design addresses all stated requirements',
        'Architecture diagram clearly shows component interactions',
        'Scalability and reliability strategies are explicit',
        'Technology choices are justified based on requirements',
        'Trade-offs are documented with rationale',
        'Data flow and consistency models are clear',
        'Security considerations are addressed',
      ],
    },
    variables: [
      {
        name: 'requirements',
        description: 'Functional and non-functional requirements for the system',
        required: true,
      },
      {
        name: 'scale',
        description: 'Expected scale (users, requests/day, data volume)',
        required: true,
      },
      {
        name: 'constraints',
        description: 'Technical, budget, or organizational constraints',
        required: false,
      },
      {
        name: 'existingServices',
        description: 'Existing systems or services that must integrate',
        required: false,
      },
      {
        name: 'teamExpertise',
        description: 'Technologies and patterns the team is familiar with',
        required: false,
      },
    ],
  },
  {
    slug: 'code-explain',
    name: 'Code Explanation & Documentation',
    description:
      'Generate clear explanations and documentation for code, including purpose, logic, and usage',
    category: 'CODING',
    template: {
      role: 'You are a technical writer and code expert who explains complex code in clear, accessible language. You understand that good documentation includes the "why", not just the "what".',
      taskStructure: `Explain the code covering:
1. **Purpose**: What does this code do? What problem does it solve?
2. **High-Level Logic**: How does it work at a conceptual level?
3. **Implementation Details**: What are the key algorithms or techniques?
4. **Key Functions/Methods**: What does each important function do?
5. **Data Flow**: How does data move through the code?
6. **Dependencies**: What external libraries or modules does it use?
7. **Usage Examples**: How do you use this code?
8. **Performance Characteristics**: What are the time/space complexity implications?`,
      cotGuidance: `Explain effectively:
- Start with the big picture, then zoom in
- Explain the "why" before the "how"
- Use analogies to clarify complex concepts
- Include concrete examples
- Highlight non-obvious or tricky parts
- Explain performance implications
- Document assumptions and limitations
- Provide usage examples with common scenarios`,
      constraints: [
        'Explanation must be understandable to developers unfamiliar with the codebase',
        'Include visual aids (ASCII diagrams, flowcharts) where helpful',
        'Provide concrete usage examples and expected outputs',
        'Explain both high-level concepts and implementation details',
        'Document performance implications and trade-offs',
        'Include pointers to related code or documentation',
      ],
      formatSpec: `Structure the explanation as:
## Overview
[High-level purpose and what problem it solves]

## Architecture / Design
[How the code is structured at a high level]

## Key Components

### [Function/Class Name]
**Purpose**: [What it does]
**Inputs**: [Parameters and types]
**Returns**: [Return value and type]
**Key Logic**: [How it works]

### [Function/Class Name]
[Same structure]

## Data Flow
[Diagram or description showing how data moves through the system]

## Example Usage
\`\`\`[language]
[Common usage examples]
\`\`\`

## Performance Characteristics
| Aspect | Value | Notes |
|--------|-------|-------|
| Time Complexity | [e.g., O(n log n)] | [When this applies] |
| Space Complexity | [e.g., O(n)] | [Memory usage details] |

## Dependencies
- [Library/Module]: [What is used from it]

## Limitations & Edge Cases
[Things to be aware of when using this code]

## Related Code
[Pointers to related functions or modules]

## References
[Links to documentation, papers, or related concepts]`,
      qualityChecklist: [
        'Explanation is clear to developers unfamiliar with the code',
        'Purpose and high-level logic are explained before details',
        'Code walkthrough includes the most important functions',
        'Data flow is illustrated or clearly described',
        'Usage examples are concrete and runnable',
        'Performance implications are documented',
        'Potential pitfalls and edge cases are highlighted',
      ],
    },
    variables: [
      {
        name: 'codeBlock',
        description: 'The code to explain',
        required: true,
      },
      {
        name: 'context',
        description: 'Context about where this code is used and its purpose',
        required: false,
      },
      {
        name: 'targetAudience',
        description: 'Who will read this explanation (junior dev, architect, etc.)',
        required: false,
      },
      {
        name: 'focusAreas',
        description: 'Specific aspects to emphasize (algorithm, performance, usage, etc.)',
        required: false,
      },
    ],
  },
  {
    slug: 'database-schema',
    name: 'Database Schema Design',
    description:
      'Design normalized, performant database schemas with proper relationships, indexes, and constraints.',
    category: 'CODING',
    template: {
      role: 'You are a database architect with expertise in relational and NoSQL database design, query optimization, and data modeling. You design schemas that are normalized, performant, and maintainable.',
      taskStructure: `Design the database schema covering:
1. **Entity Identification**: What are the core entities and their attributes?
2. **Relationship Mapping**: How do entities relate (1:1, 1:N, M:N)?
3. **Normalization**: Apply appropriate normal forms (1NF, 2NF, 3NF, BCNF)
4. **Primary & Foreign Keys**: Define PKs and FK constraints with referential integrity
5. **Indexes**: Which columns need indexes for query performance?
6. **Constraints**: NOT NULL, UNIQUE, CHECK constraints where appropriate
7. **Data Types**: Choose optimal types for each column
8. **Audit Fields**: created_at, updated_at, deleted_at for soft deletes`,
      cotGuidance: `Think through schema design:
- What are the most frequent read and write patterns?
- Where will N+1 queries occur without proper indexes?
- Which fields are candidates for denormalization for performance?
- How will the schema evolve as requirements change?
- Are there enum types or lookup tables needed?
- What are the cascade delete/update rules?
- How large will each table grow over time?`,
      constraints: [
        'Apply at minimum 3NF normalization unless justified otherwise',
        'Every table must have a primary key (prefer surrogate keys)',
        'Foreign keys must have referential integrity constraints',
        'Include indexes on all foreign keys and frequently queried columns',
        'Use appropriate data types (not VARCHAR(255) for everything)',
        'Document reasoning for denormalization decisions',
        'Include soft delete pattern (deletedAt) for entities that require audit history',
        'Specify NOT NULL constraints explicitly where applicable',
      ],
      formatSpec: `Structure the schema design as:
## Entity-Relationship Overview
[Diagram or description of entities and relationships]

## Table Definitions

### [TableName]
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID/BIGINT | PRIMARY KEY | Surrogate key |
| [column] | [type] | [constraints] | [purpose] |

**Relationships:**
- [rel type] with [OtherTable] via [foreignKey]

**Indexes:**
- \`CREATE INDEX idx_[table]_[col] ON [table]([col]);\`

[Repeat for all tables]

## Migration SQL
\`\`\`sql
[CREATE TABLE statements in dependency order]
\`\`\`

## Query Patterns Supported
[Key queries this schema is optimized for]

## Design Decisions & Trade-offs
[Explanation of non-obvious choices]`,
      qualityChecklist: [
        'Schema is normalized to at least 3NF',
        'All relationships have proper FK constraints',
        'Indexes cover the most common query patterns',
        'Data types are appropriate and efficient',
        'NULL/NOT NULL constraints reflect business rules',
        'Soft delete pattern applied where needed',
        'Migration SQL runs without errors in dependency order',
      ],
    },
    variables: [
      {
        name: 'domainDescription',
        description:
          'Business domain and entities to model (e.g., e-commerce with products, orders, customers)',
        required: true,
      },
      {
        name: 'databaseEngine',
        description: 'Target database (PostgreSQL, MySQL, SQLite, etc.)',
        required: true,
      },
      {
        name: 'queryPatterns',
        description: 'Most common queries or read/write access patterns',
        required: false,
      },
      {
        name: 'scalingRequirements',
        description: 'Expected data volume and growth rate',
        required: false,
      },
    ],
  },
  {
    slug: 'cicd-pipeline',
    name: 'CI/CD Pipeline Configuration',
    description:
      'Design and configure CI/CD pipelines for automated testing, building, and deployment.',
    category: 'CODING',
    template: {
      role: 'You are a DevOps engineer specializing in CI/CD pipelines, automation, and release engineering. You design pipelines that are fast, reliable, and provide rapid feedback to developers.',
      taskStructure: `Design the CI/CD pipeline covering:
1. **Trigger Strategy**: When does the pipeline run? (push, PR, schedule)
2. **Stage Breakdown**: What stages are needed? (lint, test, build, security, deploy)
3. **Test Strategy**: Unit, integration, E2E — what runs in CI vs. what is deferred?
4. **Build & Artifact**: How is the application built and what artifact is produced?
5. **Environment Promotion**: Dev to Staging to Production workflow
6. **Secrets Management**: How are credentials and secrets handled safely?
7. **Rollback Strategy**: How do failed deployments get reverted?
8. **Notifications**: When and how are teams notified of failures?`,
      cotGuidance: `Think through the pipeline design:
- What is the target time from commit to feedback? (aim for <5 min for CI)
- Which tests are flaky and need retry logic?
- What gates block deployment to production?
- How are database migrations handled safely?
- What are the environment-specific configuration differences?
- How do we handle monorepo vs. single-repo build scoping?
- What caching strategies can speed up the pipeline?`,
      constraints: [
        'CI must run on every PR and provide feedback within 10 minutes',
        'Secrets must never be hardcoded or logged in pipeline output',
        'Production deployments must require explicit approval gate',
        'Failed deployments must trigger automatic rollback or alert',
        'Build artifacts must be versioned and reproducible',
        'Pipeline configuration must be version-controlled alongside code',
        'Parallel jobs should be used where possible to reduce total time',
      ],
      formatSpec: `Structure the pipeline design as:
## Pipeline Overview
[High-level description of stages and triggers]

## Pipeline Configuration
\`\`\`yaml
# [Platform: GitHub Actions / GitLab CI / CircleCI / etc.]
[Complete pipeline configuration YAML]
\`\`\`

## Stage Breakdown
### Stage: [Name]
- **Purpose:** [What this stage does]
- **Runs on:** [Trigger conditions]
- **Duration:** [Expected time]
- **Failure Behavior:** [What happens on failure]

## Environment Configuration
| Environment | Trigger | Approval Required | Auto-Rollback |
|-------------|---------|-------------------|---------------|
| Dev | PR merge to main | No | Yes |
| Staging | Manual / tag | No | Yes |
| Production | Manual approval | Yes | Yes |

## Secrets & Variables
[How secrets are injected — do NOT include actual values]

## Rollback Procedure
[Steps to roll back a failed deployment]`,
      qualityChecklist: [
        'Pipeline triggers are correctly defined for all use cases',
        'All secrets are injected via secure mechanism, not hardcoded',
        'Production deployment requires explicit human approval',
        'Parallel jobs are used to minimize total pipeline time',
        'Rollback procedure is documented and tested',
        'Notifications are configured for failures and successes',
        'Pipeline YAML is valid and lints without errors',
        'Caching strategies are implemented for dependencies',
      ],
    },
    variables: [
      {
        name: 'projectType',
        description: 'Type of project (Node.js, Python, Docker, mobile, monorepo, etc.)',
        required: true,
      },
      {
        name: 'ciPlatform',
        description: 'CI/CD platform (GitHub Actions, GitLab CI, CircleCI, Jenkins, etc.)',
        required: true,
      },
      {
        name: 'deployTarget',
        description:
          'Where the application deploys (AWS, Azure, Railway, Vercel, Kubernetes, local-first, etc.)',
        required: true,
      },
      {
        name: 'testSuite',
        description: 'Testing tools and types (vitest, jest, playwright, pytest, etc.)',
        required: false,
      },
      {
        name: 'environments',
        description: 'Deployment environments to support (dev, staging, production)',
        required: false,
        defaultValue: 'staging, production',
      },
    ],
  },
  {
    slug: 'performance-optimization',
    name: 'Code Performance Optimization',
    description:
      'Analyze and optimize code for speed, memory efficiency, and scalability with measurable improvements.',
    category: 'CODING',
    template: {
      role: 'You are a performance engineering specialist who identifies bottlenecks, applies algorithmic improvements, and optimizes systems for throughput, latency, and resource efficiency.',
      taskStructure: `Optimize performance through:
1. **Profile First**: Identify actual bottlenecks (not guesses)
2. **Algorithmic Analysis**: Are there O(n^2) loops replaceable with O(n log n) or O(n)?
3. **Memory Usage**: Identify memory leaks, excessive allocations, or large object retention
4. **I/O Optimization**: Batch queries, eliminate N+1, use caching where appropriate
5. **Concurrency**: Can operations be parallelized or made async?
6. **Caching Strategy**: What can be memoized, cached in memory, or served from CDN?
7. **Code-level Micro-optimizations**: Avoid unnecessary re-renders, recalculations, copies
8. **Measurement**: Define before/after metrics to validate improvements`,
      cotGuidance: `Optimize systematically:
- Always measure before optimizing — avoid premature optimization
- Find the 20% of code causing 80% of the performance problem
- Consider the trade-offs: memory vs. CPU, complexity vs. speed
- Verify optimizations do not break correctness
- Use appropriate data structures (Map vs. Object, Set vs. Array)
- Consider request batching for API calls
- Look for repeated computations that can be cached
- Check for blocking operations in critical paths`,
      constraints: [
        'Measure performance before and after with concrete benchmarks',
        'Do not sacrifice code readability for micro-optimizations',
        'Correctness must be preserved — all tests must still pass',
        'Provide Big-O complexity analysis for algorithmic changes',
        'Document why each optimization was made',
        'Profile in production-like conditions, not just locally',
        'Include memory profiling alongside CPU profiling',
      ],
      formatSpec: `Structure the optimization analysis as:
## Performance Baseline
[Current performance measurements: latency, throughput, memory]

## Bottleneck Identification
### Profiling Results
[Top 3-5 bottlenecks identified with evidence]

### Root Cause Analysis
[Why each bottleneck exists]

## Optimization Plan

### Optimization 1: [Name]
**Problem:** [What is slow and why]
**Complexity Change:** O([before]) to O([after])
**Before:**
\`\`\`[language]
[Original code]
\`\`\`
**After:**
\`\`\`[language]
[Optimized code]
\`\`\`
**Expected Impact:** [Estimated improvement]

[Repeat for each optimization]

## Benchmark Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| p50 latency | [Xms] | [Xms] | [X%] |
| p99 latency | [Xms] | [Xms] | [X%] |
| Memory | [XMB] | [XMB] | [X%] |

## Trade-offs Accepted
[Any complexity or readability trade-offs made]`,
      qualityChecklist: [
        'Bottlenecks identified via profiling, not guessing',
        'Before/after benchmarks are included with real numbers',
        'Big-O complexity analysis provided for algorithm changes',
        'All existing tests still pass after optimization',
        'Code readability is maintained or justified if sacrificed',
        'Memory and CPU improvements are both addressed',
        'Caching strategies are invalidation-safe',
        'Changes are scoped to the identified hot paths',
      ],
    },
    variables: [
      {
        name: 'codeToOptimize',
        description: 'The code or system component to optimize',
        required: true,
      },
      {
        name: 'performanceGoal',
        description: 'Target improvement (e.g., reduce latency by 50%, handle 10x more requests)',
        required: true,
      },
      {
        name: 'profilingData',
        description: 'Any existing profiling output, benchmarks, or slow query logs',
        required: false,
      },
      {
        name: 'optimizationConstraints',
        description:
          'Constraints on solutions (e.g., cannot add external dependencies, must stay in-process)',
        required: false,
      },
    ],
  },
  {
    slug: 'migration-guide',
    name: 'Code & Data Migration Planning',
    description:
      'Plan and execute safe code or data migrations with rollback strategies and zero-downtime approaches.',
    category: 'CODING',
    template: {
      role: 'You are a migration specialist who plans and executes safe code and data migrations. You prioritize data integrity, zero downtime, and reversibility above all else.',
      taskStructure: `Plan the migration covering:
1. **Scope Assessment**: What exactly is being migrated and why?
2. **Risk Analysis**: What can go wrong? What is the blast radius?
3. **Pre-migration Checklist**: What must be true before starting?
4. **Migration Strategy**: Big bang vs. phased vs. blue-green approach
5. **Data Integrity**: How is data validated before and after?
6. **Rollback Plan**: How do we revert if something goes wrong?
7. **Execution Steps**: Exact step-by-step migration procedure
8. **Post-migration Validation**: How do we verify success?`,
      cotGuidance: `Plan migrations carefully:
- Never migrate without a tested rollback plan
- Always test migration on a copy of production data first
- Use transactions where possible for atomicity
- Consider backward compatibility during transition period
- Estimate migration time and plan for maintenance windows if needed
- Keep old system running in parallel until new system is validated
- Document every manual step to avoid missed actions
- Consider the impact on active users during migration`,
      constraints: [
        'Rollback plan must be documented and tested before execution',
        'Data must be validated for integrity before and after migration',
        'Production migrations must be tested on staging first',
        'All steps must be idempotent where possible',
        'Zero-downtime approach must be used unless maintenance window is agreed',
        'Migration scripts must be version-controlled',
        'Backups must be taken immediately before execution',
        'A go/no-go checkpoint must exist before irreversible steps',
      ],
      formatSpec: `Structure the migration plan as:
## Migration Overview
**From:** [Current state]
**To:** [Target state]
**Estimated Duration:** [Time estimate]
**Risk Level:** [Low / Medium / High]

## Pre-Migration Checklist
- [ ] Backup created and verified
- [ ] Migration tested on staging
- [ ] Rollback procedure tested
- [ ] Stakeholders notified
- [ ] Monitoring in place

## Migration Strategy
[Chosen approach and rationale: big bang / phased / blue-green]

## Step-by-Step Execution

### Step 1: [Action]
- **Command/Code:** \`[exact command or code]\`
- **Verification:** [How to verify this step succeeded]
- **Rollback:** [How to undo this step]

[Repeat for all steps]

## Rollback Procedure
[Complete step-by-step rollback if migration fails]

## Post-Migration Validation
- [ ] [Validation check 1]
- [ ] [Validation check 2]
- [ ] [Data integrity check]

## Risk Register
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Plan] |`,
      qualityChecklist: [
        'Rollback plan is documented, tested, and actionable',
        'Pre-migration checklist covers all critical preparations',
        'Each step has a verification method and rollback action',
        'Data integrity checks are included before and after',
        'Migration is tested on staging with production-like data',
        'All scripts are idempotent to handle partial execution',
        'Communication plan for stakeholders is included',
        'Post-migration monitoring plan is defined',
      ],
    },
    variables: [
      {
        name: 'migrationDescription',
        description:
          'What is being migrated (database schema, framework version, cloud provider, etc.)',
        required: true,
      },
      {
        name: 'currentState',
        description: 'Description of the current system or data state',
        required: true,
      },
      {
        name: 'targetState',
        description: 'Description of the desired end state after migration',
        required: true,
      },
      {
        name: 'downtimeTolerance',
        description: 'Can the system have downtime? If so, how long?',
        required: false,
        defaultValue: 'Zero downtime required',
      },
    ],
  },
  {
    slug: 'documentation-generator',
    name: 'Technical Documentation Generator',
    description:
      'Generate comprehensive technical documentation including API references, architecture docs, and developer guides.',
    category: 'CODING',
    template: {
      role: 'You are a technical documentation specialist who creates clear, accurate, and developer-friendly documentation. You understand that good docs reduce support burden and onboarding time.',
      taskStructure: `Generate documentation covering:
1. **Overview**: Purpose, goals, and intended audience
2. **Getting Started**: Quick start guide to first success in under 5 minutes
3. **Concepts & Architecture**: Core concepts developers must understand
4. **API Reference**: Complete specification of all public interfaces
5. **Usage Examples**: Real-world code examples for common use cases
6. **Configuration**: All configuration options with defaults
7. **Troubleshooting**: Common errors and their solutions
8. **Changelog**: Version history and breaking changes`,
      cotGuidance: `Write documentation that serves developers:
- Start with the simplest working example
- Document the "why" not just the "what"
- Every code example must be runnable and correct
- Anticipate confusion points and address them
- Use consistent terminology throughout
- Version-stamp information that may change
- Include a search-friendly structure with clear headings
- Test documentation by having a new developer follow it`,
      constraints: [
        'All code examples must be tested and runnable',
        'Every public API method/endpoint must be documented',
        'Include type signatures and parameter descriptions',
        'Document all configuration options with their defaults',
        'Use consistent formatting and terminology throughout',
        'Include error codes and their meaning',
        'Provide both quick-start and in-depth reference sections',
        'Version information must be prominently displayed',
      ],
      formatSpec: `Structure the documentation as:
## [Project Name] Documentation

### Overview
[Purpose, key features, and target audience]

### Quick Start
\`\`\`bash
[Installation command]
\`\`\`

\`\`\`[language]
[Minimal working example]
\`\`\`

### Core Concepts
#### [Concept Name]
[Explanation with diagram or analogy]

### API Reference

#### [FunctionName/Endpoint]
[Summary of what it does]

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|

**Returns:** [Return type and description]

**Example:**
\`\`\`[language]
[Usage example]
\`\`\`

### Configuration Reference
[All configuration options with defaults]

### Troubleshooting
[Common issues and solutions]

### Changelog
[Version history]`,
      qualityChecklist: [
        'Quick start enables success within 5 minutes',
        'All public APIs are documented with types and examples',
        'Code examples are tested and produce the described output',
        'Configuration options include defaults and valid ranges',
        'Troubleshooting covers the most common error scenarios',
        'Terminology is consistent throughout all sections',
        'Documentation is version-stamped',
        'New developer can onboard using only this documentation',
      ],
    },
    variables: [
      {
        name: 'projectName',
        description: 'Name of the project or library being documented',
        required: true,
      },
      {
        name: 'publicApi',
        description: 'List of public functions, classes, or endpoints to document',
        required: true,
      },
      {
        name: 'targetAudience',
        description:
          'Who will read this documentation (junior devs, senior engineers, external API users)',
        required: true,
      },
      {
        name: 'docFormat',
        description: 'Output format (Markdown, JSDoc, OpenAPI, etc.)',
        required: false,
        defaultValue: 'Markdown',
      },
    ],
  },
  {
    slug: 'security-audit',
    name: 'Security Vulnerability Assessment',
    description:
      'Systematically assess code for security vulnerabilities including OWASP Top 10 and common attack vectors.',
    category: 'CODING',
    template: {
      role: 'You are a security engineer specializing in application security, threat modeling, and vulnerability assessment. You identify security weaknesses before attackers do, and provide concrete remediation steps.',
      taskStructure: `Audit security across these dimensions:
1. **Authentication & Authorization**: Are identity and access controls correct?
2. **Input Validation**: Are all inputs validated and sanitized?
3. **Injection Vulnerabilities**: SQL, NoSQL, command, LDAP, XSS injection risks?
4. **Sensitive Data Exposure**: Are secrets, PII, or credentials exposed?
5. **Security Misconfiguration**: Default credentials, open ports, verbose errors?
6. **Dependency Vulnerabilities**: Known CVEs in third-party libraries?
7. **Cryptography**: Are hashing, encryption, and key management correct?
8. **Business Logic Flaws**: Race conditions, privilege escalation, insecure direct object references?`,
      cotGuidance: `Think like an attacker:
- What would a malicious user try to do first?
- What assumptions does the code make that an attacker could violate?
- Where does user input reach the database, filesystem, or shell?
- Are there race conditions in multi-user operations?
- What happens when input exceeds expected bounds?
- Are error messages revealing internal details?
- Can a low-privilege user escalate to higher privilege?
- Are session tokens and JWTs validated correctly?`,
      constraints: [
        'Reference OWASP Top 10 categories for each finding',
        'Rate severity using CVSS or HIGH/MEDIUM/LOW/INFORMATIONAL',
        'Provide proof-of-concept or reproduction scenario for each finding',
        'Include concrete remediation code, not just advice',
        'Never include weaponized exploit code',
        'Check both code and configuration for vulnerabilities',
        'Verify dependency versions against known CVE databases',
        'Include security headers and transport security assessment',
      ],
      formatSpec: `Structure the security audit as:
## Executive Security Summary
[Overall security posture: Critical / High / Medium / Low risk]

## Critical Findings
### VULN-001: [Vulnerability Name]
- **OWASP Category:** [e.g., A01:2021 Broken Access Control]
- **Severity:** CRITICAL
- **Location:** [File, line number, function]
- **Description:** [What the vulnerability is]
- **Proof of Concept:** [How it could be exploited conceptually]
- **Remediation:**
\`\`\`[language]
[Fixed code]
\`\`\`
- **References:** [CVE, CWE, or OWASP link]

[Repeat for all findings by severity tier]

## Dependency Audit
[Known CVEs in dependencies with upgrade paths]

## Security Configuration Checklist
- [ ] Security headers present (CSP, HSTS, X-Frame-Options)
- [ ] Secrets not in source code or logs
- [ ] TLS/HTTPS enforced everywhere

## Remediation Priority
| Finding | Severity | Effort | Priority |
|---------|----------|--------|----------|`,
      qualityChecklist: [
        'All OWASP Top 10 categories are assessed',
        'Findings are rated by severity with justification',
        'Each finding includes a concrete reproduction scenario',
        'Remediation includes actual code, not just advice',
        'Dependency vulnerabilities are checked against CVE databases',
        'Authentication and authorization controls are fully reviewed',
        'Sensitive data handling is assessed (storage, transmission, logging)',
        'Security misconfigurations are checked (headers, CORS, CSP)',
      ],
    },
    variables: [
      {
        name: 'codeOrSystem',
        description: 'The code, API, or system to audit',
        required: true,
      },
      {
        name: 'techStack',
        description: 'Technology stack (language, framework, database, cloud provider)',
        required: true,
      },
      {
        name: 'threatModel',
        description: 'Who are the likely attackers and what are they after?',
        required: false,
        defaultValue: 'External attackers seeking data theft or service disruption',
      },
      {
        name: 'complianceRequirements',
        description: 'Any compliance standards to check against (HIPAA, GDPR, PCI DSS, SOC 2)',
        required: false,
      },
    ],
  },
]
