# POSH Training Simulation

This project is an interactive training simulation for Prevention of Sexual Harassment (POSH) at workplace. It aims to provide HR professionals, Internal Committee (IC) members, and legal advisors with practice in analyzing POSH cases.

## Features

- Generates realistic POSH case studies using OpenAI's AI technology
- Provides a new and unique case each time
- Offers opportunity to analyze complainant and respondent statements
- References relevant sections of the POSH Act, 2013
- User-friendly interface

## Getting Started

### Requirements

- Node.js 14.0 or higher
- OpenAI API Key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/posh-training-simulation.git
cd posh-training-simulation
```

2. Install the required packages:

```bash
npm install
```

3. Copy `.env.local.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.local.example .env.local
```

4. Then add your OpenAI API key to the `.env.local` file.

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI API](https://openai.com/) - AI simulation generation
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

[MIT](LICENSE)

#git remote set-url origin https://github.com/vikash-codes/posh.git