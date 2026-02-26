---
sidebar_position: 0
title: v0 | Cursor
description: Frontend development guide for using v0 and Cursor
---

## 1. Introduction

---

### 1.1 Purpose of This Document

This document defines the engineering standards and AI-assisted development workflow used in our Next.js project.

Its purpose is to:

* Establish clear architectural boundaries
* Define how AI tools are used responsibly
* Prevent technical debt caused by uncontrolled code generation
* Maintain consistency across a client-heavy codebase
* Provide structured onboarding for developers

This is an internal engineering handbook.  
It defines how we build software — not how frameworks work.

---

### 1.2 Project Overview

The project is a Next.js application built primarily as a client-side rendered system using the App Router.

The architecture emphasizes:

* Clear separation between visual components and business logic
* Predictable folder structure
* Explicit state management
* Controlled AI-assisted development
* Long-term maintainability over short-term speed

The system is designed so that:

* UI is generated rapidly
* Logic is implemented intentionally
* Refactoring is mandatory
* Structure is never left to AI decisions

---

### 1.3 Tech Stack Overview

#### Core Framework

* Next.js (App Router)
* React

#### Styling & UI

* Tailwind CSS
* shadcn/ui
* Shared UI layer inside `components/v0-pure-components`

#### Rendering Model

* Primarily Client Components
* Server usage only when strictly necessary

#### Tooling

* v0 — visual component generation
* Cursor — refactoring and business logic implementation
* Git — structured collaboration workflow

---

### 1.4 Why We Use v0 + Cursor

Our AI workflow is based on **strict responsibility separation**.

#### v0 → Visual Layer Only

v0 is used exclusively for generating:

* Layouts
* Presentational components
* Repetitive UI structures
* Static visual scaffolding

v0-generated components must be:

* Pure
* Stateless (unless strictly UI-local state)
* Free of business logic
* Free of API calls
* Free of global state manipulation

v0 does not define architecture.  
v0 does not implement logic.  
v0 does not make structural decisions.

It generates the visual layer — nothing more.

---

#### Cursor → Engineering & Logic Layer

Cursor is used for:

* Refactoring generated UI
* Implementing business logic
* Connecting services
* Managing state
* Optimizing performance
* Improving readability and structure

Cursor operates inside architectural constraints defined by developers.

AI suggestions are reviewed before acceptance.  
No blind generation is allowed.

---

#### Core Principle

> v0 generates how it looks.  
> Cursor defines how it works.  
> Engineers decide how it is structured.

This separation is mandatory.

---

### 1.5 Expected Developer Skill Level

Developers working in this project must:

* Understand React component architecture
* Understand rendering behavior and re-renders
* Know how to write pure components
* Be able to separate presentation from logic
* Be comfortable refactoring AI-generated code
* Think architecturally before prompting AI

This workflow assumes engineering maturity.

AI accelerates output.  
It does not replace engineering judgment.

---

## 2. Development Modes

---

### 2.1 v0 Mode (UI Generation Mode)

Official v0 project:

https://v0.app/chat/projects/prj_hnxz5GizwLe9F1sg324XvHyLFA4m

---

⚠️ **Model Usage Requirement**

Do NOT use `v0-max`.

Allowed models:

- `v0-mini`
- `v0-pro`

If the wrong model is selected, switch before generating any code.

Model selection is part of the engineering discipline.

---

v0 Mode is used strictly for generating the **visual layer** of the application.

It exists to accelerate UI creation while preserving architectural integrity.

v0 does not define structure, logic, or business rules.  
It generates presentation only.

All work must be done inside the official project above.

---

#### 2.1.1 Mandatory Project Instructions Check

The v0 project already contains predefined system instructions.

These instructions enforce:

- Component purity rules  
- Mock data handling rules  
- Folder placement rules  
- Naming conventions  
- Architectural constraints  

Before starting any new v0 chat:

1. Verify that project instructions are enabled.
2. Ensure they are checked and active.
3. Only then begin generation.

No chat should be started without active project instructions.

If instructions are disabled or modified, they must be restored before continuing.

Project instructions are part of the engineering contract.

---

#### 2.1.2 When to Use v0

Use v0 when you need to:

- Scaffold new UI sections  
- Generate presentational (pure) components  
- Create repetitive layout structures  
- Prototype visual ideas quickly  
- Build static interface blocks  
- Generate dashboards, lists, cards, and forms (visual only)  

Do **not** use v0 for:

- Business logic implementation  
- API integration  
- State architecture decisions  
- Performance optimization  
- Folder restructuring  
- Service layer implementation  

If logic is required, switch to Cursor Mode.

---

#### 2.1.3 How to Write Instructions

Instructions to v0 must be:

- Deterministic  
- Explicit  
- Constraint-driven  
- Focused on visual output only  

Always specify:

- Component responsibility  
- That it must be a pure component  
- That no business logic is allowed  
- That no API calls are allowed  
- That no global state is allowed  
- Exact file placement  
- Whether mock data should be used  

Avoid vague prompts like:

- “Create a component for checkout”
- “Build a user dashboard”

Instead, define:

- What it renders  
- What props it receives  
- What it must not include  
- Where it lives  

Clarity reduces refactoring overhead.

---

#### 2.1.4 Rules for Mock Data

When mock data is required:

1. Create a separate file inside the `/mocks` folder.  
2. Place all mock data inside that file.  
3. Export mock data as named exports.  
4. Import mock data into the generated component.  
5. Never inline mock objects inside components.  

Mock data exists only to support visual rendering.

Before production integration, mock usage must be replaced with service layer integration.

---

#### 2.1.5 Rules for Edit Mode

Edit Mode is used when modifying an existing component with v0.

Rules:

- Do not allow v0 to restructure the entire file  
- Do not allow v0 to introduce new architectural layers  
- Maintain original naming conventions  
- Preserve folder structure  
- Avoid regenerating large blocks unnecessarily  
- Keep changes minimal and scoped  

Edit Mode is for incremental visual adjustments — not architectural rewrites.

---

#### 2.1.6 Rules for Development Mode

Development Mode in v0 is used for generating new components.

Rules:

- Generate one component at a time  
- Keep components pure  
- Avoid nested business logic  
- Do not generate service calls  
- Do not introduce state management beyond local UI state  
- Do not generate context providers  
- Do not introduce global stores  

If the component requires data, it must receive it via props.

---

#### 2.1.7 Component Generation Workflow

The correct workflow is:

1. Define component responsibility.  
2. Define whether it is pure.  
3. Define expected props.  
4. Generate visual structure with v0.  
5. Move mock data to `/mocks` if required.  
6. Review generated code manually.  
7. Remove unnecessary wrappers or abstractions.  
8. Ensure naming matches project conventions.  
9. Extract reusable UI primitives if needed.  
10. Commit only after cleanup.  

Never merge raw generated output without review.

---

#### 2.1.8 What Must Never Be Generated Automatically

The following must never be generated by v0:

- Business logic  
- Service layer code  
- API calls  
- Authentication logic  
- Complex state management  
- Global state architecture  
- Context providers  
- Performance optimizations  
- Routing logic  
- Security-related code  
- Folder restructuring  

These belong to engineering decisions and must be implemented manually or with controlled Cursor assistance.

---

#### 2.1.9 Refactoring After Generation

Refactoring is mandatory.

After generating a component:

- Remove unnecessary div wrappers  
- Remove unused props  
- Remove duplicated logic  
- Simplify class structures  
- Ensure consistent naming  
- Enforce separation of concerns  
- Validate responsiveness  
- Validate accessibility basics  
- Confirm no hidden side effects  

Generated code is a starting point — not a final product.

---

#### 2.1.10 Core Rule

v0 accelerates UI production.  
It does not define system behavior.

Visual generation is step one.  
Engineering discipline completes the process.

---

### 2.2 Cursor Mode (Engineering Mode)

Cursor Mode is used for implementing and refining the **engineering layer** of the application.

While v0 generates the visual structure, Cursor is responsible for:

- Business logic implementation  
- State management  
- Service integration  
- Refactoring  
- Performance improvements  
- Structural cleanup  

Cursor operates within architectural constraints defined by developers.  
It assists engineering — it does not replace it.

---

#### 2.2.1 When to Switch to Cursor

Switch from v0 to Cursor when:

- A component requires business logic  
- API calls must be implemented  
- State coordination is needed  
- Mock data must be replaced with real services  
- Performance issues are identified  
- A component requires restructuring  
- Reusability extraction is required  
- Complex conditional rendering appears  

If the task affects how the system works (not how it looks), use Cursor.

---

#### 2.2.2 Refactoring Strategy

Refactoring is systematic, not reactive.

Follow this sequence:

1. Identify responsibility boundaries.  
2. Separate presentation from logic.  
3. Extract business logic into services or hooks.  
4. Reduce prop drilling where appropriate.  
5. Remove duplicated patterns.  
6. Simplify component trees.  
7. Normalize naming conventions.  
8. Validate rendering behavior.  

Refactoring should reduce complexity, not move it elsewhere.

Never refactor blindly.  
Define the goal before prompting Cursor.

---

#### 2.2.3 Safe AI Usage Rules

When using Cursor:

- Never accept large diffs without review.  
- Never allow architecture rewrites unless explicitly intended.  
- Avoid vague prompts such as “improve this file.”  
- Scope prompts to specific changes.  
- Prefer incremental improvements over full regeneration.  
- Review side effects before applying changes.  
- Avoid automatic dependency additions without evaluation.  

AI suggestions are proposals, not decisions.

The engineer remains responsible for correctness.

---

#### 2.2.4 Reviewing AI-Generated Code

Every AI-generated change must be reviewed for:

- Architectural consistency  
- Separation of concerns  
- Hidden side effects  
- Unnecessary abstractions  
- Performance impact  
- Security implications  
- Readability and naming clarity  

Ask:

- Does this introduce new state unnecessarily?  
- Does this increase render frequency?  
- Is logic leaking into presentation?  
- Does this align with project conventions?  

Never merge unreviewed AI output.

---

#### 2.2.5 Performance Considerations

In a client-heavy application, performance discipline is mandatory.

When using Cursor, validate:

- Re-render frequency  
- Memoization necessity  
- Dependency arrays in hooks  
- State granularity  
- Component splitting opportunities  
- Avoidance of unnecessary client boundaries  
- Avoidance of large inline objects or functions  

Do not optimize prematurely.  
Measure first when possible.

Performance improvements must be intentional.

---

#### 2.2.6 Edge Cases Handling

Cursor may generate “happy path” logic only.

Engineers must ensure coverage for:

- Empty states  
- Loading states  
- Error states  
- Network failures  
- Unexpected API responses  
- Undefined or null values  
- Partial data  

All logic must assume failure is possible.

Resilience is not optional.

---

#### 2.2.7 Type Safety Enforcement

Even if the project uses JavaScript instead of TypeScript:

- Define explicit prop shapes.  
- Validate required vs optional fields.  
- Avoid implicit assumptions about data shape.  
- Normalize API responses before usage.  
- Use consistent object structures.  

If using TypeScript:

- Do not allow `any`.  
- Prefer strict typing.  
- Define shared types in centralized locations.  
- Avoid duplicating type definitions.  

Type clarity reduces runtime bugs and improves AI-assisted refactoring reliability.

---

#### 2.2.8 Core Rule

Cursor defines how the system works.

All logic must be:

- Intentional  
- Reviewable  
- Testable  
- Performant  
- Maintainable  

AI accelerates engineering execution.  
Engineering judgment defines quality.

## 3. Component Architecture Rules

This section defines how components must be structured, named, organized, and reused.

Component architecture is not optional.  
It is the foundation that makes AI-assisted development safe.

---

### 3.1 Pure Component Definition

A pure component is a presentational unit responsible only for rendering UI.

A pure component must:

- Receive data via props  
- Render UI based on those props  
- Contain no business logic  
- Make no API calls  
- Not mutate global state  
- Not depend on external services  
- Avoid hidden side effects  

A pure component may contain:

- Local UI state (e.g., toggle, dropdown open/close)  
- Basic UI event handlers (onClick, onChange)  
- Styling and layout logic  

A pure component must be reusable and predictable.

If a component decides *how the system behaves*, it is no longer pure.

---

### 3.2 Container vs Presentational Components

We follow a clear separation model.

#### 3.2.1 Presentational Components

Responsible for:

- Rendering UI  
- Receiving props  
- Displaying data  
- Triggering callbacks  

They do **not**:

- Fetch data  
- Implement business logic  
- Manage global state  
- Perform transformations beyond formatting  

These are typically generated with v0.

---

#### 3.2.2 Container Components

Responsible for:

- Data fetching  
- Business logic  
- State orchestration  
- Service interaction  
- Transforming API responses  
- Passing processed data to presentational components  

Container components coordinate behavior.

They should remain thin and focused on orchestration — not rendering complexity.

---

### 3.3 Naming Conventions (Domain-Driven Names)

Component names must reflect **domain meaning**, not implementation details.

Good naming examples:

- `ProductCard`
- `CheckoutSummary`
- `UserAvatar`
- `OrderHistoryList`
- `PaymentMethodSelector`

Avoid abstract or technical names:

- `CardItem`
- `MainBlock`
- `Wrapper`
- `ComponentManager`
- `Handler`
- `ContainerBox`

Rules:

- Use PascalCase  
- Name by responsibility  
- Avoid generic suffixes unless meaningful  
- Do not prefix with “App” or “Main”  
- Avoid over-describing internal implementation  

If you cannot understand a component’s purpose from its name, rename it.

---

### 3.4 Folder Placement Rules

Folder structure must remain predictable and strictly enforced.

All UI-related code must live inside the root:

```
/components
```

No UI components should exist outside this directory.

---

#### Folder Structure Overview

```
/components
  /v0-examples
  /v0-pure-components
  /design-system
  /[feature-folders]
```

---

#### Placement Rules

**1. v0-Generated Pages**

- Pages or large UI examples generated by v0 must be placed inside:
  
  ```
  components/v0-examples
  ```

- These are experimental or scaffolding-level outputs.
- They are not considered production-ready architecture.
- They must not contain business logic.

---

**2. v0 Pure Components**

- Pure UI components generated by v0 must be placed inside:

  ```
  components/v0-pure-components
  ```

- These components:
  - Must remain pure
  - Must not contain business logic
  - Must not contain API calls
  - Must not depend on global state

This folder acts as a staging area for generated UI.

---

**3. Promotion to Design System**

After verification and refactoring:

- Stable, reusable pure components must be moved to:

  ```
  components/design-system
  ```

Promotion requirements:

- Naming verified
- Props cleaned
- No unnecessary wrappers
- Accessibility validated
- No architectural violations
- Confirmed reusability

Only verified components belong in the design system.

---

**4. Feature-Specific Components**

- Feature-bound components should live inside their respective feature folders:

  ```
  components/[feature-name]
  ```

- Container components should be placed near their feature entry point.
- Business logic must not live inside `v0-pure-components` or `design-system`.

---

#### What Must Be Avoided

- UI files outside `/components`
- Business logic inside `v0-pure-components`
- Moving unverified code directly into `design-system`
- Cross-folder duplication
- Deep unpredictable nesting

Folder structure communicates architecture.

If structure is unclear, architecture is unclear.

---

### 3.5 UI Kit Usage (`components/v0-pure-components`)

The UI kit is the shared visual foundation of the application.

It contains:

- Reusable UI primitives  
- Styled base components  
- Shared patterns  
- Design-consistent building blocks  

Rules:

- Do not duplicate primitives outside the UI kit  
- Do not place business logic inside the UI kit  
- Extend primitives — do not copy them  
- Keep primitives generic and reusable  
- Avoid feature-specific styling inside the UI kit  

The UI kit is presentation infrastructure — not feature code.

---

### 3.6 Reusability Principles

Reusability must be intentional.

Before extracting a reusable component, ask:

- Is it used in at least two places?
- Does it represent a stable pattern?
- Is its responsibility clearly defined?
- Does abstraction reduce duplication meaningfully?

Reusable components should:

- Have a clear API  
- Be configurable via props  
- Avoid implicit assumptions  
- Avoid coupling to a specific feature  

Do not over-engineer for theoretical reuse.

---

### 3.7 When NOT to Abstract

Abstraction is harmful when:

- The pattern exists only once  
- The logic is still evolving  
- The abstraction increases complexity  
- The API becomes harder to understand  
- It introduces unnecessary prop drilling  
- It hides domain intent  

Premature abstraction creates technical debt.

Prefer duplication over wrong abstraction.

Extract only when patterns stabilize.

---

### 3.8 Core Architecture Principle

Components must follow this hierarchy:

- UI primitives  
- Pure presentational components  
- Container components  
- Feature entry points  

Separation of concerns is mandatory.

If a component mixes:

- Rendering
- Business logic
- Data fetching
- State orchestration

It must be refactored.

Architecture clarity enables safe AI acceleration.

---

## 4. Mock Data Strategy

Mock data exists to support **UI generation and development speed**, not to simulate full backend behavior.

It is primarily used in v0 Mode to render presentational components before real service integration.

Mocks must be structured, isolated, and temporary by default.

---

### 4.1 Mocks Folder Structure

All mock data must live inside the dedicated:

```
/mocks
```

Rules:

- No mock data inside component files  
- No inline arrays or objects used as temporary placeholders  
- No mock data inside UI kit components  
- No mixing real API data with mock data in the same file  

Mocks should be organized clearly.

Recommended structure:

```
/mocks
  product.mock.js
  user.mock.js
  checkout.mock.js
```

Each file represents a domain entity or feature.

The filename must reflect the domain meaning.

---

### 4.2 Export / Import Rules

Each mock file must:

- Export named constants  
- Export stable data shapes  
- Avoid default exports  
- Avoid dynamic generation unless explicitly required  

Example pattern (conceptual):

- Export structured data
- Keep it predictable
- Match expected API shape

When importing:

- Import explicitly
- Do not re-export mocks from other layers
- Do not pass mocks through services

Mocks are consumed directly by container components during early development.

---

### 4.3 Temporary vs Persistent Mocks

Mocks can be either temporary or persistent.

---

#### 4.3.1 Temporary Mocks

Used for:

- UI scaffolding  
- Early feature prototyping  
- v0 component rendering  
- Design iteration  

These must be removed when real API integration is complete.

Temporary mocks should not survive production release.

---

#### 4.3.2 Persistent Mocks

Used for:

- Development fallback  
- Storybook-like isolated testing  
- Offline development  
- Visual regression testing  

Persistent mocks must:

- Be clearly marked  
- Mirror API structure exactly  
- Stay synchronized with backend schema changes  

If backend structure changes, mocks must be updated immediately.

Outdated mocks create false confidence.

---

### 4.4 Replacing Mocks with Real API

Replacing mocks is a structured process.

Steps:

1. Identify all components consuming the mock.
2. Move data fetching into a container component or service.
3. Replace mock import with service call.
4. Normalize API response.
5. Pass processed data to pure components.
6. Remove unused mock files.
7. Validate loading and error states.
8. Confirm data shape matches expectations.

Never mix mock data and real API data in the same execution path.

Once API integration is complete:

- Remove temporary mocks.
- Verify no orphan mock imports remain.
- Ensure no console logs reference mock data.

---

### 4.5 Data Shape Discipline

Mocks must always reflect the expected API structure.

Rules:

- Do not simplify the shape just for convenience.
- Do not rename fields arbitrarily.
- Match backend contract exactly.
- Include optional fields where relevant.
- Simulate empty states when appropriate.

If the API shape is unknown:

- Define a provisional contract.
- Document assumptions.
- Update mocks once backend is finalized.

Mock shape discipline ensures safe transition to real services.

---

### 4.6 Backend Contract First Rule

Do not ask v0 to invent or generate mock data structures.

Mock data structure must not be designed by AI.

Before creating mocks:

- Request a real API response example from the backend team.
- Use the actual server response shape.
- Mirror the backend contract exactly.
- Do not rename fields for convenience.
- Do not simplify nested structures.
- Do not remove nullable fields.

If the backend endpoint is not yet implemented:

- Request a provisional response contract.
- Document assumptions clearly.
- Update mocks immediately once the real API is available.

v0 may generate visual components.

It must not define data contracts.

The backend team defines the contract.  
Frontend mirrors it.

---

### 4.7 Core Principle

Mocks support visual acceleration.

They are not:

- A backend replacement
- A schema design tool
- A contract definition layer
- A long-term architecture layer

Mocks are scaffolding.

They must disappear or stabilize — never silently remain.

## 5. Git Workflow

Git workflow must support:

- Controlled AI-assisted development
- Safe synchronization between v0 and Cursor
- Predictable branch structure
- Clean review process
- Stable production releases

Git is the single source of truth.  
AI tools operate through Git — never outside it.

---

### 5.1 v0 Base Branch Rule

The stable base branch for AI UI generation is:

```
v0-branch
```

Important clarification:

- v0 commits and pushes automatically.
- There is no manual checkout inside the v0 interface.
- v0 may automatically create its own working branch.

The critical rule is:

While starting a new v0 chat:

1. Ensure the repository’s selected branch in v0 is `v0-branch`.
2. Confirm it is up to date.
3. Then start the new chat.

We do not control the branch name v0 creates.  
We control the branch it starts from.

`v0-branch` acts as the stable AI generation foundation.

---

### 5.2 v0 + Cursor Synchronization Workflow

The workflow between v0 and Cursor must follow this sequence.

---

#### Step 1 — Start v0 Session

- Confirm `v0-branch` is selected in the repository.
- Start a new v0 chat.
- Generate pure UI components only.
- v0 automatically commits and pushes changes.

If v0 creates a new branch, that branch becomes the working branch for this feature.

---

#### Step 2 — Sync in Cursor

To continue development in Cursor:

1. Identify the branch created/used by the v0 chat.
2. Checkout that branch locally.
3. Pull latest changes.
4. Implement business logic.
5. Refactor structure.
6. Commit changes manually.
7. Push updates.

Cursor is responsible for manual commits.

---

#### Step 3 — Sync Back to v0

After pushing changes from Cursor:

- Pull updates in v0.
- Continue UI adjustments if needed.
- v0 will automatically commit and push further changes.

Git is the synchronization layer between tools.

---

### 5.3 Feature Finalization Process

When the feature is complete:

1. Ensure business logic is implemented.
2. Ensure no unintended mock data remains.
3. Validate loading, error, and edge states.
4. Review architecture boundaries.
5. Confirm naming conventions.
6. Run local testing.
7. Create a Pull Request from the working branch.
8. Merge into development branch after approval.

Never merge directly into main or production branches from v0 or Cursor.

---

### 5.4 AI-Generated Code Review Policy

All AI-generated code must be reviewed before merging.

Review checklist:

- Is presentation separated from logic?
- Are pure components still pure?
- Is business logic isolated?
- Are services properly structured?
- Are edge cases handled?
- Is performance acceptable?
- Is mock data removed if required?
- Are naming conventions respected?

AI output is a draft — not a decision.

Human review is mandatory.

---

### 5.5 Commit Discipline

- v0 commits and pushes automatically.
- Cursor commits manually.
- Commits must be small and focused.
- Separate refactor commits from feature commits when possible.
- Avoid vague commit messages.

Clean commit history improves traceability.

---

### 5.6 Core Workflow Principle

- v0 generates UI and auto-commits.
- Cursor implements logic and commits manually.
- Both operate on the same Git branch.
- Synchronization happens via pull → commit → push.
- Final merge happens through Pull Request.

Branch naming is flexible.  
Branch origin and discipline are not.

Git governs AI.
