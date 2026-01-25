# EduSphere AI - Frontend

EduSphere AI is an advanced educational platform designed to leverage AI for enhanced learning experiences. This repository contains the frontend application built with [Next.js](https://nextjs.org), offering a responsive and interactive user interface.

## 🚀 Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Directory)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Authentication & Database:** [Firebase](https://firebase.google.com/), [Supabase](https://supabase.com/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/) (Supports English, German, Persian, French, Marathi)
- **Utilities:** [sonner](https://sonner.emilkowal.ski/) (Toasts), [react-markdown](https://github.com/remarkjs/react-markdown)

## ✨ Key Features

- **Multi-language Support:** Built-in i18n routing for global accessibility.
- **Modern Dashboard:** Intuitive user interfaces for managing courses (under development).
- **AI Integration:** Components primarily designed to interface with the core AI backend for processing educational content.
- **Secure File Handling:** Upload utilities for handling user documents.
- **Responsive Design:** Mobile-first approach using Tailwind CSS.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd edusphere-ai
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    pnpm install
    ```

3. Set up Environment Variables:
   Create a `.env.local` file in the root directory and add the necessary API keys for Firebase and Supabase.
   _(Refer to `.env.example` if available or ask the team for keys)_

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    ```

4. Run the development server:

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
edusphere-ai/
├── messages/          # I18n translation files (en, de, fr, etc.)
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── [locale]/  # Internationalized routes
│   │   └── api/       # API Routes
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization configuration
│   ├── lib/           # Utility libraries (Firebase, Supabase clients)
│   └── store/         # State management (Zustand)
└── ...config files
```

## 🌐 Internationalization

This project uses `next-intl` for routing and translations.

- Translation files are stored in `messages/*.json`.
- Routes are wrapped in `[locale]` to handle language prefixes (e.g., `/en/dashboard`, `/fr/about-us`).

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
