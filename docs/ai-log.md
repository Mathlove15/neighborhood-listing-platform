# AI Interaction Log

| Tool | Prompt | Output used | Output rejected | Verification | Commit |
|---|---|---|---|---|---|
| ChatGPT | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Plain-language descriptions of Next.js, TypeScript, Tailwind CSS, and responsive design. | None at this stage. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Gemini | In plain language, explain the proposed technology stack for a neighborhood property listing platform: Next.js with the App Router, TypeScript, and Tailwind CSS. Explain what each technology does, why it is useful for this project, and how the technologies work together. Do not include any credentials or secrets. | Explanations of SEO, server rendering, fast page loads, and property-data validation. | Extra technical details about backend APIs were not needed for the basic explanation. | Compared the response with the required technology stack in the lab instructions. | a5901ec |
| Google AI Studio | Act as a senior teaching assistant. Propose a minimal Next.js App Router + TypeScript + Tailwind starter for a neighborhood property platform. Give a file plan, terminal commands, accessibility requirements, and a verification checklist. Never invent command results or credentials. | Used the suggested stack, file-plan concepts, accessibility requirements, and verification ideas. | Did not use unverified command results or credentials. | Created the application with the instructor-required settings and confirmed that the local page loaded. | e46ee87 |

## Two Differences Between ChatGPT and Gemini

1. Gemini provided a more technical explanation. It discussed Server Components, pre-rendering, backend APIs, and how search engines index property information. ChatGPT focused more on page organization and navigation using simpler language.

2. ChatGPT emphasized visual design and responsiveness by discussing buttons, menus, filters, and layouts for desktops, tablets, and phones. Gemini placed greater emphasis on performance, SEO, and preventing property-data errors.
