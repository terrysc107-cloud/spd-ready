# SPD Ready — Planning Handoff for Claude Code

## Purpose of this file
This document is the source-of-truth planning brief for the **SPD Ready** application.

It is intended to help Claude Code understand:
- what the app is
- what problem it solves
- who the users are
- what the MVP should include
- how readiness scoring should work
- how students and hospitals should interact
- how the product relates to SPD Cert Prep
- what should be built now versus later

This is not a generic app. It is a workflow and intelligence system for sterile processing students and externship sites.

---

# 1. Product summary

## Product name
**SPD Ready**

## Core concept
SPD Ready is a **readiness, placement, and feedback system** for sterile processing students and externship sites.

It is designed to:
- assess whether a student is ready for externship placement
- generate a structured readiness profile
- match students to the right hospital or surgery center environment
- help hospitals review candidates with more confidence
- create a feedback loop that improves placement quality over time

## Important framing
This is **not just an externship marketplace**.

It should be treated as:
> a readiness-to-placement engine for sterile processing

The app is meant to solve more than just “where can I find an internship?”
It should help answer:
- Is this student ready now?
- What kind of site fits them best?
- What are their strengths and risks?
- What support will they need?
- How can we reduce failed placements and bad fit?

---

# 2. Relationship to SPD Cert Prep

## Existing product
There is already an existing study platform called **SPD Cert Prep**.

SPD Cert Prep is focused on:
- CRCST exam prep
- learning content
- quizzes and explanations
- domain mastery
- situational questions for learning

## SPD Ready should be separate
SPD Ready should be a **separate product**, but tightly connected.

### Why keep them separate
If both are merged too early, the product risks becoming confusing.

SPD Cert Prep answers:
> Can this person learn and pass?

SPD Ready answers:
> Can this person function in a real SPD environment, and what kind of placement/support do they need?

## How they connect
SPD Ready can later ingest or sync selected signals from SPD Cert Prep such as:
- quiz averages
- category mastery
- completion consistency
- situational performance

But the products should remain distinct in identity and primary workflow.

Recommended ladder:
1. Learn in SPD Cert Prep
2. Prove readiness in SPD Ready
3. Get matched to an externship in SPD Ready

---

# 3. Main users

## 3.1 Students
Students need to:
- create an account
- complete a profile
- complete a readiness assessment
- receive a readiness score and profile
- improve weak areas over time
- apply for externship opportunities

## 3.2 Hospitals / surgery centers / externship sites
Sites need to:
- create a facility profile
- describe capacity, environment, support level, and requirements
- post externship openings
- review ranked candidates
- accept / reject / waitlist candidates
- provide post-placement feedback

## 3.3 Admin / platform owner
Internal admin needs to:
- view student and site data
- monitor applications and placement flow
- view aggregate readiness trends
- manage openings and candidate visibility
- later monitor quality of placements over time

---

# 4. Problem the product solves

## Student problem
Many sterile processing students struggle to find externships.
Even when they are motivated, sites may not know:
- whether they are actually ready
- how much support they need
- whether they will fit the environment

## Hospital problem
Hospitals and surgery centers do not want random students.
They want:
- lower-risk candidates
- candidates with a quality mindset
- candidates who can be coached successfully
- faster review and decision-making
- fewer failed placements

## Program / training problem
Programs want better outcomes and a stronger externship pipeline.
A structured readiness system can help training programs prove that students are not just enrolled, but actually placement-ready.

---

# 5. Product philosophy

This system should not be designed like a simple job board.

The real goal is:
> filter, prepare, match, and improve

The system should combine:
- readiness assessment
- fit scoring
- placement workflow
- feedback loop
- improvement path

If it only does student-to-site matching, it becomes a shallow marketplace.
If it measures readiness and supports improvement, it becomes real infrastructure.

---

# 6. MVP goal

## The MVP only needs to prove one loop
> Student → Assessment → Readiness Profile → Hospital Review → Placement Decision

The MVP does **not** need to be a full platform yet.
It should not try to do everything.

## What the MVP must prove
The MVP should make a hospital or executive say:
> “This already helps me understand and place the right student faster.”

---

# 7. MVP feature scope

## 7.1 Student onboarding
Students create a profile with information like:
- first name / last name
- city / state
- travel radius
- certification status
- current training program or source
- expected completion date
- shift availability
- transportation reliability
- preferred environment if relevant

This should be simple and focused.

## 7.2 Student readiness assessment
The student completes an assessment that measures several dimensions of readiness.

The initial version should include these categories:
1. technical knowledge
2. situational judgment
3. process discipline
4. behavioral / culture fit
5. instrument / workflow familiarity
6. reliability / practical readiness

The first version can use multiple-choice only.
Later versions can add images, ranking, and short-answer explanation.

## 7.3 Student results page
After completion, the student receives:
- overall readiness score
- readiness tier
- strengths
- growth areas
- application eligibility status
- suggested next steps

## 7.4 Hospital onboarding
The hospital or site completes a profile including:
- organization name
- site name
- city / state
- facility type
- department size
- case volume
- complexity level
- teaching capacity
- preceptor strength
- number of extern slots
- scheduling / shift preferences
- requirements or notes

## 7.5 Externship opening creation
The site can create one or more externship listings.
Each listing should include:
- title
- start date / date window
- number of slots
- shift info
- requirements
- status

## 7.6 Candidate matching / ranking
The system should rank students against openings using a deterministic score at first.

## 7.7 Candidate review page
The site should be able to see:
- readiness score
- readiness tier
- summary narrative
- strengths
- growth areas
- coaching recommendations
- risk notes or fit notes
- accept / reject / waitlist actions

## 7.8 Post-placement feedback
After placement or externship completion, the site should be able to rate the student on simple attributes such as:
- attendance
- coachability
- professionalism
- communication
- attention to detail
- overall recommendation

---

# 8. What “readiness” should mean

Readiness should not be a single exam score.
It should be a composite view of whether the student can function safely and productively in a real SPD environment.

## Readiness pillars

### 8.1 Technical knowledge
Measures whether the student understands foundational sterile processing concepts.
Examples:
- decontamination principles
- cleaning vs disinfection vs sterilization
- packaging basics
- inspection basics
- documentation basics

### 8.2 Situational judgment
Measures whether the student makes the right choice when reality is messy or under pressure.
Examples:
- missing indicator
- visible debris found late
- OR pressure versus quality
- uncertain assembly decisions
- whether to escalate concerns

### 8.3 Process discipline
Measures whether the student respects sequence, standards, and order of operations.
Examples:
- putting steps in order
- identifying the first correct action
- recognizing workflow breaks
- understanding why shortcuts create risk

### 8.4 Behavioral / culture fit
Measures professional behavior in a real department.
Examples:
- response to correction
- willingness to ask for help
- ownership
- coachability
- professionalism
- balancing urgency with quality

### 8.5 Instrument / workflow familiarity
Measures exposure to real SPD workflow and practical recognition.
Examples:
- instrument familiarity
- tray familiarity
- workflow zones
- department vocabulary
- common inspection concerns

### 8.6 Reliability / practical readiness
Measures practical readiness factors.
Examples:
- transportation reliability
- schedule consistency
- ability to commit
- follow-through

---

# 9. Suggested readiness scoring model

Recommended initial weighting:
- 30% technical knowledge
- 25% situational judgment
- 15% process discipline
- 15% behavioral / culture fit
- 10% instrument / workflow familiarity
- 5% reliability

## Reason for this weighting
This reflects that knowledge matters, but judgment and behavior matter a lot too.
A student can know content and still be risky in a live department.

## Example formula
```ts
readiness_score =
  technical * 0.30 +
  situational * 0.25 +
  process * 0.15 +
  behavior * 0.15 +
  instrument * 0.10 +
  reliability * 0.05
```

---

# 10. Suggested readiness tiers

Keep tiers simple in the MVP.

## Tier 1 — Ready
Can be placed now with standard onboarding and support.

## Tier 2 — Ready with support
Can be placed, but the site should expect coaching in certain areas.

## Tier 3 — Not ready yet
Should complete targeted improvement steps before applications or placement.

These tiers are more useful than raw scores alone.

---

# 11. Assessment question design guidance

The questions should feel grounded in sterile processing, not generic education or generic personality testing.

## Technical questions
Format:
- multiple choice
- clean, practical wording

## Situational judgment questions
These are very important and should be a differentiator.
Examples:
- tray is missing an indicator
- instrument still appears dirty
- senior tech says to “just send it” because OR is waiting
- you are unsure whether a set is assembled correctly

These should reveal whether the student chooses quality, process, and escalation appropriately.

## Process discipline questions
Examples:
- put steps in correct order
- choose the first correct action in a workflow
- identify what should never be skipped

## Behavioral / culture questions
Avoid fluffy language.
These should feel like work-style questions in SPD.
Examples:
- when you are corrected, what do you do?
- if you are unsure, what is your first move?
- what matters more under pressure: speed or correctness?
- how do you respond to shortcuts by others?

## Instrument / workflow questions
For MVP these can still be text-based.
Later they can include images.
Examples:
- identify tray types or use cases
- identify department zones
- identify concerns related to hinges, stains, visible debris, etc.

## Reliability questions
Simple, practical questions.
Examples:
- availability
- transportation consistency
- ability to show up on schedule

---

# 12. Matching logic for MVP

The first version of matching should be deterministic, not AI-native.

## Why
This makes the logic understandable, controllable, and faster to build.
AI can be layered on later for summaries and recommendations.

## Suggested fit inputs
- location match
- travel radius match
- schedule / shift alignment
- readiness score / tier
- site teaching capacity vs student support need
- behavioral / environment fit
- instrument / workflow familiarity if relevant

## Example fit scoring structure
- 20 points: geography
- 20 points: schedule alignment
- 20 points: readiness score / tier
- 15 points: support need alignment
- 15 points: environment fit
- 10 points: instrument / workflow familiarity

Then sort candidates by fit score.

---

# 13. What the hospital should see

The hospital should not just receive a score.
They should receive a structured profile.

## Candidate profile should include
- readiness score
- readiness tier
- strengths
- growth areas
- fit notes
- possible coaching focus areas
- summary narrative

## Example summary style
“This candidate shows strong process discipline and quality instinct, with moderate need for coaching in instrument recognition and confidence under pace. Best fit is a structured teaching site with moderate volume.”

This summary can later be AI-generated from structured inputs.

---

# 14. Should the app be gamified?

## Yes, but only in a meaningful way
The app should not use shallow gamification.
Do not focus on random badges or vanity points.

## Good gamification
Gamification should be tied to opportunity and improvement.
Examples:
- improve readiness score to unlock externship eligibility
- complete targeted missions to raise score
- complete 3 scenario sets to unlock applications
- show progress toward “placement-ready” status

## Bad gamification
Avoid:
- childish trophies
- empty streak mechanics
- irrelevant points systems

## Best way to think about it
The product is not gamifying “learning” in the abstract.
It is gamifying:
> progress toward real-world placement readiness

---

# 15. Should students complete the profile once?

## No — the profile should become a living profile
There can be a one-time baseline intake and baseline assessment.
But the profile should update over time as the student improves.

Signals that can update the profile later:
- repeated assessments
- additional scenarios completed
- linked Cert Prep performance
- hospital feedback
- completion consistency

This is important because the product should not freeze a student in one moment.
It should show movement and development.

---

# 16. Suggested business model directions

This was discussed conceptually but should not distort MVP build decisions.

## Possible payer groups
### Students
Possible value:
- readiness report
- profile creation
- application access
- priority matching

### Hospitals / sites
Possible value:
- filtered candidate access
- faster review
- readiness profiles
- dashboard insights
- placement workflow

### Training programs
Possible value:
- student placement support
- outcome reporting
- readiness analytics

## Product positioning caution
Avoid phrasing that sounds like “pay us to get an internship.”
A better framing is:
- prepare
- validate
- match
- improve placement quality

---

# 17. Tech stack direction

The app should be built as a real web application using AI-assisted development.

## Recommended stack
- **Next.js App Router** for frontend and route structure
- **Supabase** for Postgres database, Auth, storage, and APIs
- **Vercel** for hosting and deployment
- **Resend** for transactional email
- **PostHog** for product analytics
- **Stripe** later if monetization is added

## Development model
The product owner does not need to hand-code.
AI can generate the code.
But Claude Code or any AI builder should follow a clearly defined architecture.

The human defines:
- data model
- logic
- workflow
- product boundaries

The AI implements:
- pages
- forms
- API routes
- components
- database schema

---

# 18. Important product constraints

The MVP should not overbuild.

## Do not build yet
- full LMS inside this app
- complex compliance / audit engine
- native mobile app
- advanced AI agents
- white-label enterprise architecture
- multi-tenant complexity beyond what is needed
- messaging inbox systems
- deep workflow orchestration
- complicated billing system

## Build now
- student profile
- assessment
- scoring
- hospital profile
- externship opening
- candidate matching
- candidate review page
- feedback form
- admin dashboard with simple metrics

---

# 19. Suggested route structure

This is a suggested application route structure for MVP:

- `/` — landing page
- `/student/onboarding` — student profile intake
- `/student/assessment` — assessment flow
- `/student/results` — readiness results
- `/hospital/onboarding` — site profile intake
- `/hospital/openings/new` — create externship opening
- `/hospital/candidates` — ranked candidate review
- `/admin` — internal dashboard

---

# 20. Suggested core data entities

## Users
Stores login/auth identity and role.

## Student Profiles
Stores student demographic / operational info.

## Student Assessments
Stores category scores, total score, status, timestamps.

## Assessment Questions
Stores the question bank.

## Assessment Responses
Stores answers per assessment attempt.

## Hospital Profiles
Stores facility/site details.

## Externship Openings
Stores openings by site.

## Applications
Stores student applications to openings, fit score, and status.

## Hospital Feedback
Stores post-placement ratings.

---

# 21. Suggested starter schema fields

## users
- id
- email
- role
- created_at

## student_profiles
- user_id
- first_name
- last_name
- city
- state
- travel_radius_miles
- certification_status
- program_name
- expected_completion_date
- availability_json
- transportation_reliability
- readiness_score
- readiness_tier
- summary
- strengths_json
- growth_areas_json

## student_assessments
- id
- student_user_id
- status
- submitted_at
- technical_score
- situational_score
- process_score
- behavior_score
- instrument_score
- reliability_score
- overall_score

## assessment_questions
- id
- category
- type
- prompt
- options_json
- scoring_key_json
- active

## assessment_responses
- id
- assessment_id
- question_id
- selected_answer
- free_text
- score

## hospital_profiles
- user_id
- organization_name
- site_name
- city
- state
- facility_type
- dept_size
- case_volume
- complexity_level
- teaching_capacity
- preceptor_strength
- notes

## externship_openings
- id
- hospital_user_id
- title
- start_date
- end_date
- slots
- shift
- requirements_json
- status

## applications
- id
- externship_id
- student_user_id
- fit_score
- status
- hospital_notes
- submitted_at

## hospital_feedback
- id
- application_id
- attendance_score
- coachability_score
- professionalism_score
- quality_score
- communication_score
- recommended
- notes

---

# 22. AI usage guidance

AI should help with:
- generating pages and components
- scaffolding routes
- form handling
- database queries and mutations
- summary generation from structured data
- generating question datasets

AI should not be treated as the source of product truth.
The product logic should remain explicit.

## Good uses of AI in MVP
- student profile summary generation
- coaching summary generation
- hospital-facing candidate narrative
- seeded question generation

## Avoid in MVP
- agentic matching black boxes
- autonomous decisions that cannot be explained
- overcomplicated AI workflows

---

# 23. What a conference-ready demo should show

The demo should feel like a working system, not a concept deck.

## Recommended demo sequence
1. Student signs up
2. Student completes onboarding
3. Student completes readiness assessment
4. Student receives readiness profile
5. Hospital logs in
6. Hospital completes site profile
7. Hospital creates an externship opening
8. Hospital sees ranked candidates
9. Hospital opens a candidate profile
10. Hospital accepts or waitlists the student
11. Admin dashboard shows simple trend data

Seeded data is acceptable for the conference.
The flow just needs to feel believable and cohesive.

---

# 24. Long-term expansion paths

These were discussed as future directions and should not all be built now.

## Potential future modules
- deeper integration with SPD Cert Prep
- competency tracking over time
- preceptor tools
- site-level trend analysis
- training recommendations
- compliance / audit intelligence
- workforce intelligence dashboards

Important note:
The compliance / audit idea is strong, but it should be a later module, not MVP.

---

# 25. Final framing for Claude Code

Claude should think of this as:
> a structured, database-driven, AI-assisted web app for sterile processing readiness and externship placement

It should not be planned like a generic job board, LMS, or chat app.

It should be planned like a product that sits between:
- education
- readiness evaluation
- placement workflow
- operational feedback

## The immediate build priority
Build the best MVP possible around this loop:
> student profile → readiness assessment → readiness score → site profile → externship opening → ranked candidate review → placement decision

---

# 26. Instructions to Claude Code for planning next steps

Claude Code should:
1. Review this document and preserve the product framing
2. Propose the best MVP architecture using the stated stack
3. Recommend route structure, DB schema, and app flow
4. Keep the build lean and focused
5. Avoid overengineering
6. Identify which parts can be mocked or seeded for a first demo
7. Help generate the first assessment questions and UI flows

