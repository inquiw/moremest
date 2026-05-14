<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words)
4. Answer using the fetched docs
<!-- context7 -->

<!-- premium-web-development -->
# Premium Web Application Development Standards

**CRITICAL: DYNAMIC CONTEXTUAL ROUTING**
You are equipped with multiple, sometimes conflicting, design skills (Sections 4, 5, and 6). You MUST NOT apply all of them simultaneously if they clash. Instead, analyze the user's specific request and dynamically select the appropriate design paradigm:
- If the user asks for a highly creative, unique, or "wow-factor" site, prioritize **Section 4 (Bold Aesthetics)**.
- If the user asks for a corporate, strict, or "Anthropic-style" site, prioritize **Section 6 (Anthropic Brand Guidelines)** and ignore Section 4's chaotic/maximalist rules.
- If the user asks for a complex interactive application (dashboards, state management), prioritize **Section 5 (Web Artifacts Builder & shadcn/ui)**.
- **Section 1 (Tech Stack)** and **Section 2 (Strict UI/UX 8px Grid GOST)** are global constraints. They provide the mathematical foundation and MUST be applied universally across ALL themes.

When acting as a web developer and building scalable websites, evaluate the context and apply these rules intelligently:

## 1. Technology Stack
- **Framework**: Use **Next.js** (App Router preferred) for large-scale, SEO-optimized, multifunctional projects, or **Vite** with React for SPAs.
- **Styling**: Use **Tailwind CSS**. Ensure utility classes are logically organized. Use `clsx` or `tailwind-merge` for dynamic classes.
- **Animations**: Use **Framer Motion** for React to implement micro-interactions, page transitions, and dynamic effects.
- **Icons**: Use **Lucide React** or **Phosphor Icons**.

## 2. Strict UI/UX Design System (The "GOST" of Premium Design)
You MUST apply the following mathematical and visual constraints for all UI components:
- **Spacing & Layout (8px Grid)**: All margins and paddings MUST be multiples of 0.25rem (4px). Use standard Tailwind spacing: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px). Avoid arbitrary values like `p-[10px]`.
- **Typography Pairings & Scaling**: 
  - *Primary Pairings*: Use [Inter + Roboto Mono], [Outfit + Plus Jakarta Sans], or [SF Pro + SF Mono].
  - *Scale*: H1: `text-5xl font-extrabold tracking-tight leading-tight` (desktop) / `text-4xl` (mobile); H2: `text-3xl font-bold`; H3: `text-2xl font-semibold`; Body: `text-base text-gray-300 leading-relaxed`; Small: `text-sm text-gray-500`.
- **Border Radii (Corners)**: Use geometric consistency. Buttons & Inputs: `rounded-xl` (12px) for a modern feel. Cards & Modals: `rounded-2xl` (16px) or `rounded-3xl` (24px).
- **Shadows & Elevation**: 
  - Dark mode surfaces: `shadow-2xl shadow-black/50`
  - Glowing accents: `shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]` (soft purple glow).
- **Borders & Glassmorphism**: For premium surfaces, use `bg-white/5 backdrop-blur-xl border border-white/10`.
- **Color Palette**: Use deep bases (e.g., `bg-neutral-950`). Use tailored gradient text: `bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-transparent bg-clip-text`.
- **Interactivity**: All interactive elements MUST have `transition-all duration-300 ease-out`. Hover states: `hover:bg-white/10`, `hover:-translate-y-1`. Active states: `active:scale-95`. Focus rings: `focus:ring-2 focus:ring-indigo-500/50 focus:outline-none`.
- **Responsiveness**: Strict mobile-first. No fixed `w-[...px]`. Use `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for layout containers. Use CSS Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-8`.

## 3. Workflow & AI Integration
- Before using unfamiliar or rapidly changing Tailwind utility syntax, Next.js APIs, or Framer Motion properties, use **Context7 MCP** to fetch up-to-date documentation.
- Maintain Component Modularity: Break UI into reusable components. Avoid massive single files.
- Performance & SEO: Ensure proper heading hierarchy (`<h1>` to `<h6>`), semantic HTML (`<main>`, `<section>`, `<nav>`), and `<meta>` tags. Add `alt` tags to all images.

Do not ask for permission to apply these premium design patterns; apply them proactively to all web projects.

## 4. Frontend Design & Aesthetic Point-of-View (Anthropic Skill Integration)
- **Design Thinking**: Before coding, commit to a BOLD aesthetic direction (e.g., brutally minimal, maximalist chaos, retro-futuristic, organic, luxury). Avoid generic "AI slop" aesthetics.
- **Typography Creativity**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial. Pair a distinctive display font with a refined body font.
- **Theme Constraints**: Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Spatial Composition**: Use unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds**: Create atmosphere and depth using gradient meshes, noise textures, geometric patterns, layered transparencies, and grain overlays rather than flat solid colors.

## 5. Web Artifacts Builder (Complex React UIs)
- **Architecture**: For elaborate, multi-component interfaces requiring state management or routing, initialize a modular React project (e.g., Vite) rather than writing massive single-file HTML/JSX artifacts.
- **Component Library**: Utilize `shadcn/ui` combined with Tailwind for high-quality, accessible base components. Initialize via `npx shadcn@latest init` and add components via `npx shadcn@latest add <component>`.
- **Anti-Slop Reminder**: Even when using standard UI libraries like Shadcn, rigorously apply the bold aesthetics from Section 4. Avoid default uniform rounded corners, centered boring layouts, and default shadcn styles. Override them to match the chosen bold aesthetic direction.

## 6. Anthropic Brand Guidelines
When the user requests an "Anthropic" style or a strict corporate brand guide, apply these exact constraints:
- **Colors**:
  - Backgrounds/Text: Dark `#141413`, Light `#faf9f5`, Mid Gray `#b0aea5`, Light Gray `#e8e6dc`.
  - Accents: Orange `#d97757` (primary), Blue `#6a9bcc` (secondary), Green `#788c5d` (tertiary).
- **Typography**: `Poppins` for all headings (fallback Arial). `Lora` for body text (fallback Georgia).
- **Shapes & Accents**: Cycle through orange, blue, and green for non-text shapes or interactive accents.
<!-- premium-web-development -->
