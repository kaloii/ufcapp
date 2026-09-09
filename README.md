# UFC Stats App 
An information repository for the Ultimate Fighting Championship (UFC) MMA promotion.  Utilizes the Cito API for hisotrical data on fighters.

## **Features**
- **Search** - find fighters by name with instant autocomplete
- **Fighter Profiles** - bio, record, career stats, and full fight history
- **Rankings** - official UFC rankings across all divisions
- **Compare** - head-to-head stat comparison for any two fighters
- **Caching** - localStorage caching to stay within API free tier (500 req/month)

## **Tech Stack**: 
 - React 19 + TypeScript 6
 - Vite 8
 - Tailwind CSS 4
 - React Router v6
 - Cito API for UFC data

## **Getting Started**
**Prerequisites**
- Node.js 18+
- Cito API key (free tier: 500 req/month) - sign up at citoapi.com

**Setup**

```
git clone kaloii/ufcapp
cd ufcapp
npm install
```
Create a `.env` file in the project root:
>VITE_UFC_API_KEY=your_api_key

**Development**
```
npm run dev # start dev server at localhs:5173
npm run build # type-check + production build
npm run lint # run OxLint 
```
**Project Structure**
>src/ <br>
├── api/              # Cito API client (fighters, rankings) <br>
├── cache/            # localStorage cache with TTL <br>
├── components/ <br>
│   ├── layout/       # Navbar, Footer <br>
│   ├── fighters/     # FighterCard, FighterStats, SearchBar <br>
│   ├── fights/       # FightCard <br>
│   └── comparison/   # ComparisonTable <br>
├── hooks/            # useFighter, useSearch, useRankings <br>
├── pages/            # Home, Search, FighterProfile, Rankings, Compare <br>
└── types/            # TypeScript interfaces

**Routes**

| Route | Page |
|------------|----------|
|`/`|Home with search bar|
|`/search?q=`|Search results|
|`/fighters/:slug`|Fighter profile + stats + fight history|
|`/rankings`|Division rankings|
|`/compare`|Side-by-side fighter comparison|

**Deployment**

Built for Vercel. The vercel.json config rewrites all routes to index.html for SPA client-side routing.

**Data**
Fighter data provided by Cito API. Not affiliated with the UFC.