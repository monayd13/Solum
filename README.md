# 🌿 Solum

Live : https://solum-olive.vercel.app/ 

An AI Companion That Grows With You

Solum is an AI-powered conversational companion designed to provide meaningful, engaging, and emotionally aware conversations. Built with Next.js, Supabase, and AI APIs, Solum shares stories, remembers yours, and evolves over time.

## ✨ Features

💬 Real-time AI conversation

🧠 Memory-based interaction (remembers user context)

🔊 Voice-ready architecture (supports ElevenLabs integration)

🔐 Authentication with Supabase

🌱 Emotionally intelligent companion design

📱 Modern responsive UI (Next.js + React)


## 🏗 Tech Stack

Frontend: Next.js (App Router), React, TypeScript

Backend / DB: Supabase

AI Integration: LLM API (OpenAI-compatible)

Voice (Optional): ElevenLabs

Deployment: Vercel

## 🚀 Getting Started
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/shreyamahajan5/Solum.git
cd Solum
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Setup Environment Variables

#### Create a .env.local file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_AGENT_ID=your_agent_id
```
If you're using ElevenLabs Conversational AI, you can find your Agent ID in the ElevenLabs dashboard under Conversational AI → Agents.

## 4️⃣ Run the Development Server
```bash
npm run dev
```
## Visit:

http://localhost:3000

### 🧠 How Solum Works

User logs in via Supabase authentication

Messages are sent to an AI backend

The AI generates contextual responses

Conversation memory is stored in Supabase

(Optional) Responses are converted to speech using ElevenLabs

## 📁 Project Structure
app/              → Routes & pages (Next.js App Router)
components/       → Reusable UI components
hooks/            → Custom React hooks
lib/              → API utilities & helpers
supabase/         → Database configuration
public/           → Static assets
🔊 ElevenLabs Voice Integration (Optional)

## To enable voice responses:

Create an Agent in ElevenLabs

Copy the Agent ID

Add it to .env.local

Ensure Conversational AI is enabled in your ElevenLabs plan

## 🌎 Deployment

Solum is optimized for deployment on Vercel:

vercel
Link : https://devpost.com/software/solume?ref_content=my-projects-tab&ref_feature=my_projects


Make sure all environment variables are added in the Vercel dashboard.
 
## 🎯 Vision

Solum isn’t just a chatbot.
It’s designed to be:

A companion for the elderly

A memory-preserving conversational partner

A calm, emotionally aware AI presence


## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

### 📄 License

MIT License
