# AI Interaction Log

| Tool | Prompt | Output used | Output rejected | Verification | Commit |
|---|---|---|---|---|---|
| ChatGPT | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Plain-language descriptions of Next.js, TypeScript, Tailwind CSS, and responsive design. | None at this stage. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Gemini | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Explanations of SEO, server rendering, fast page loads, and property-data validation. | Extra technical details about backend APIs were not needed for the basic explanation. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Google AI Studio | Act as a senior teaching assistant. Propose a minimal Next.js App Router + TypeScript + Tailwind starter for a neighborhood property platform. Give a file plan, terminal commands, accessibility requirements, and a verification checklist. Never invent command results or credentials. | Used the suggested stack, file-plan concepts, accessibility requirements, and verification ideas. | Did not use unverified command results or credentials. | Created the application with the instructor-required settings and confirmed that the local page loaded. | e46ee87 |

## Two Differences Between ChatGPT and Gemini

1. Gemini provided a more technical explanation. It discussed Server Components, pre-rendering, backend APIs, and how search engines index property information. ChatGPT focused more on page organization and navigation using simpler language.

2. ChatGPT emphasized visual design and responsiveness by discussing buttons, menus, filters, and layouts for desktops, tablets, and phones. Gemini placed greater emphasis on performance, SEO, and preventing property-data errors.


## Lab 2: TypeScript Interface Consultation

- **Date:** September 25, 2026
- **Tool:** Google AI Studio — Gemini 3.7 Flash
- **Purpose:** Generate typed data blueprints for property listings and sponsors.

### Prompt

Create TypeScript interfaces only for a neighborhood property listing application.

Create a `Property` interface with these required fields: `id`, `title`, `address`, `price`, `facts`, `imageUrl`, `imageAlt`, and `href`. Include `badge` as an optional field.

Create a `Sponsor` interface with these required fields: `id`, `name`, `imageUrl`, `imageAlt`, and `href`. Include `tagline` as an optional field.

Return only the TypeScript interfaces. Do not create React components, JSX, functions, sample data, or explanations.

### Response and Evaluation

Gemini returned `Property` and `Sponsor` interfaces with the requested field types. It used `string[]` for the property facts, `number` for the price, and question marks for the optional `badge` and `tagline` fields.

I reviewed the response and confirmed that all required and optional fields were correct. I then added the reviewed interfaces to `src/types/index.ts`. I did not use Gemini to create the React components or sample data.

## Lab 2: Reusable Components and Page Assembly

- **Date:** September 29, 2026
- **Tool:** ChatGPT
- **Purpose:** Create and explain reusable interface components and assemble the property-listing page.

### Prompt Summary

I asked ChatGPT to guide me step by step while creating a reusable `PropertyCard`, a reusable `SponsorBanner`, search filters, three sample property listings, responsive layouts, and accessibility features. I also asked for explanations of the code and Git commands in beginner-friendly language.

### Response and Evaluation

ChatGPT suggested TypeScript and React code for `PropertyCard.tsx`, `SponsorBanner.tsx`, `SearchFilters.tsx`, and `page.tsx`. It also explained the component structure, terminal commands, Git staging, commits, and local testing.

I reviewed the suggested code, saved each file, ran `npm run lint`, and tested the website at `http://localhost:3000`. The lint check passed, and I visually confirmed that the search controls, three property cards, sponsor banner, responsive layout, and accessibility section appeared on the page.