import type { Draft, Repo, RepoFile } from '../types';

const now = Date.now();

export const seedRepos: Repo[] = [
  { id: 'mochi-emr', name: 'mochi-emr', source: null },
  { id: 'forge', name: 'forge', source: null },
  { id: 'language-app', name: 'language-app', source: null },
];

export const seedDrafts: Draft[] = [
  {
    id: 'password-reset',
    kind: 'draft',
    title: 'Password reset enumeration concerns',
    attachedRepo: null,
    createdAt: now - 1000 * 60 * 60 * 24 * 3,
    updatedAt: now - 1000 * 60 * 30,
    md: `# Password reset enumeration concerns

The routing layer may already be exposing account existence before the user ever reaches the confirmation screen — which would defeat the whole point of returning the same "if an account exists, we sent you a link" message on submit.

## Things to verify

- Does the API return different status codes for known vs. unknown emails?
- Does the post-submit redirect URL differ between the two cases?
- Are there timing differences that would let someone enumerate accounts at scale?

The generic confirmation screen only protects users if the *pre*-confirmation surface is also account-agnostic. Worth a 30-minute audit of the network calls during forgot-password with a known-good email vs. a random one.

## Open question

Raise with security before the flow ships, or fix in-line and document? Leaning raise — the routing layer isn't mine to change unilaterally.`,
  },
  {
    id: 'about-ai',
    kind: 'draft',
    title: 'About AI — rough outline',
    attachedRepo: null,
    createdAt: now - 1000 * 60 * 60 * 24 * 5,
    updatedAt: now - 1000 * 60 * 60 * 4,
    md: `# About AI — rough outline

A blog about AI by a human, written without AI assistance. The angle: working in the AI space, living in an AI-shaped world, building AI tools — but the writing itself is unmediated.

## Why this might work

- Most AI commentary is either evangelism or doom
- A practitioner's view from the inside, with design sensibility
- Slower cadence, longer essays, no SEO games

## Topics on deck

- The shape of agentic work
- What gets lost when prose is generated vs. composed
- Tools as a design problem, not an engineering one`,
  },
  {
    id: 'notes-app-arch',
    kind: 'draft',
    title: 'Notes app architecture',
    attachedRepo: null,
    createdAt: now - 1000 * 60 * 60 * 24 * 1,
    updatedAt: now - 1000 * 60 * 60 * 2,
    md: `# Notes app architecture

Two source types: unattached drafts (app-owned, no git) and repo files (live in a per-repo worktree on a dedicated branch).

## Drafts

App-owned markdown. Can be unattached or associated with a repo via metadata. Association is non-destructive — the draft simply appears under a different section.

## Repo integration

One worktree per repo on a \`notes-app/drafts\` branch. Saves are commits. Refresh = fetch + rebase onto default. Applying changes happens outside the app via cherry-pick.`,
  },
  {
    id: 'patient-onboarding',
    kind: 'draft',
    title: 'Patient onboarding flow ideas',
    attachedRepo: 'mochi-emr',
    createdAt: now - 1000 * 60 * 60 * 24 * 2,
    updatedAt: now - 1000 * 60 * 60 * 6,
    md: `# Patient onboarding flow ideas

Sketches for reducing first-week dropoff on the EMR onboarding flow.

## Hypotheses

- Pre-call intake is too heavy; people abandon before booking
- The dose calendar isn't immediately legible
- Provider matching feels arbitrary without explanation`,
  },
  {
    id: 'subscription-v2',
    kind: 'draft',
    title: 'Subscription delay v2',
    attachedRepo: 'mochi-emr',
    createdAt: now - 1000 * 60 * 60 * 24 * 1,
    updatedAt: now - 1000 * 60 * 60 * 3,
    md: `# Subscription delay v2

Iterating on the delay feature shipped in under two days. v1 worked; v2 needs to handle the edge cases v1 punted on.

## Known gaps

- Mid-cycle delays don't compose with renewals
- The confirmation copy is generic
- No surface for "I delayed by accident, undo"`,
  },
];

export const seedRepoFiles: RepoFile[] = [
  {
    id: 'mochi-claude-md',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: '',
    name: 'CLAUDE.md',
    isMarkdown: true,
    md: `# Mochi EMR — CLAUDE.md

Context for AI agents working in this repo.

## Stack

- Next.js 14, TypeScript, Tailwind
- Postgres via Prisma
- Sentry for errors, PostHog for analytics

## Conventions

- Components in \`packages/ui/\` are shared across surfaces
- Feature flags live in \`config/flags.ts\`
- Patient-facing copy lives in \`copy/patient/\`

## Don't

- Add new top-level routes without flagging
- Touch the billing module without a paired review`,
  },
  {
    id: 'mochi-readme',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: '',
    name: 'README.md',
    isMarkdown: true,
    md: `# Mochi EMR

Patient-facing telehealth platform for weight management.

## Quick start

\`\`\`
pnpm install
pnpm dev
\`\`\`

See \`core-docs/architecture.md\` for the broader system view.`,
  },
  {
    id: 'mochi-architecture',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: 'core-docs/',
    name: 'architecture.md',
    isMarkdown: true,
    md: `# Architecture

High-level system view. Patient flows live in \`patient-flows.md\`.

## Surfaces

- **Patient web** — Next.js app, patient-facing
- **Provider web** — same Next.js app, role-gated routes
- **Admin** — separate app, internal only

## Data

Postgres is the source of truth. Redis caches hot reads. S3 for uploaded media.`,
  },
  {
    id: 'mochi-patient-flows',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: 'core-docs/',
    name: 'patient-flows.md',
    isMarkdown: true,
    md: `# Patient flows

Maps the patient journey from signup → first visit → ongoing care.

## Signup

1. Email + state
2. Intake questionnaire
3. Provider match
4. First visit booking`,
  },
  {
    id: 'mochi-package-json',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: '',
    name: 'package.json',
    isMarkdown: false,
    md: '',
  },
  {
    id: 'mochi-tsconfig',
    kind: 'repo-file',
    repoId: 'mochi-emr',
    path: '',
    name: 'tsconfig.json',
    isMarkdown: false,
    md: '',
  },
];
