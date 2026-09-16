# Discord Role & Onboarding Bot

An automated Discord bot built with Node.js and [Discord.js v14](https://discord.js.org/) that provisions server channel structures and automatically assigns roles to users based on invitation codes.

---

## Features

- **Code-Based Role Assignment:** Users enter unique verification codes to instantly receive designated roles (e.g., \Second_Brain\, \Creator_Brain\, \Student_Brain\, \Finance_Brain\, \Game_Mode\).
- **Server Scaffolding:** Automatically sets up categorized server channels and permission hierarchies on bot startup.
- **Keep-Alive Server:** Built-in lightweight Express server for 24/7 uptime on platforms like Replit, Render, or Railway.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Discord Bot Application from the [Discord Developer Portal](https://discord.com/developers/applications)

### Installation & Configuration

1. Clone the repository:
   \\\ash
   git clone https://github.com/O2S-Y/my-discord-bot.git
   cd my-discord-bot
   \\\

2. Install dependencies:
   \\\ash
   npm install
   \\\

3. Configure Environment Variables:
   Copy \.env.example\ to \.env\ and add your bot token:
   \\\ash
   cp .env.example .env
   \\\
   \\\nv
   TOKEN=your_actual_discord_bot_token
   PORT=3000
   \\\

4. Run the bot:
   \\\ash
   npm start
   \\\

---

## Security Note

Never commit your \.env\ file or expose your Discord bot token. If a token is ever leaked, reset it immediately in the Discord Developer Portal.