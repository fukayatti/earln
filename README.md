# My Next.js Template

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and enhanced with development tools.

## Features

- 🎨 **Prettier** - Code formatting
- 🔍 **ESLint** - Code linting with custom rules
- 🚀 **Automatic import sorting** - Organize imports automatically
- 🧹 **Remove unused imports** - Clean up unused imports
- 🪝 **Husky + lint-staged** - Pre-commit hooks for code quality
- ⚡ **VSCode integration** - Format on save and auto-fix

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint and fix issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check if code is formatted correctly

## Development Tools

### Automatic Formatting & Linting

- **On Save**: VSCode will automatically format your code and fix ESLint issues
- **On Commit**: Husky will run lint-staged to format and lint staged files
- **Import Organization**: Imports are automatically sorted and unused imports are removed

### ESLint Rules

- Import sorting with proper grouping (React → Next.js → Internal → Relative)
- Unused import removal
- Prettier integration
- Next.js recommended rules

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
