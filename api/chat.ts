import type { VercelRequest, VercelResponse } from '@vercel/node';

const CITO_BASE = 'https://api.citoapi.com/api/v1';
const CITO_API_KEY = process.env.CITO_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_MODEL_FALLBACK =
  process.env.GEMINI_MODEL_FALLBACK || 'gemini-3.5-flash-lite';
const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const MAX_TOOL_ROUNDS = 5;
const MAX_INPUT_CHARS = 500;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_CHARS = 2000;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 10;

const SYSTEM_PROMPT = `You are a UFC Stats assistant. You MUST ALWAYS use your tools to answer questions. NEVER answer from your own knowledge.

You are NOT to entertain queries outside the bounds of the tools you are given.

## Tools

- search_ufc — Search by fighter name OR event number. Returns fighter profiles, career stats, fight history, and matching events (with slug). Use this FIRST for almost every question.
- get_fighter — Fighter profile by slug (e.g., "conor-mcgregor").
- get_fighter_stats — Detailed stats by slug.
- get_fighter_fights — Complete fight history by slug.
- get_rankings — All division rankings. No parameters.
- get_rankings_by_division — Rankings for one division (e.g., "welterweight").
- get_upcoming_events — Upcoming schedule. No parameters.
- get_event_bouts — Fight card by event slug (e.g., "ufc-329").
- get_bout_stats — Round-by-round stats by bout ID.

### Event Questions
For questions about an event (e.g., "UFC 300", "What happened at UFC 229?"):
1. search_ufc(query="ufc 300") — pass event number with a space
2. Take the slug from the events result (e.g., "ufc-300-pereira-vs-hill")
3. Call get_event_bouts(slug) for the fight card and results
Do NOT guess event slugs. Do NOT use formats like "ufc300" (no space) — they return no results.

### Slug Format
Fighter slugs are lowercase with hyphens:
- "Conor McGregor" -> "conor-mcgregor"
- "Islam Makhachev" -> "islam-makhachev"
Event slugs come from search_ufc events results (e.g., "ufc-300-pereira-vs-hill").

### Minimize API Calls
- Use search_ufc FIRST — it has profile + stats + fights + events
- Only call get_fighter/get_fighter_stats/get_fighter_fights if search_ufc is missing specific data
- Never call all three for the same fighter

### Follow-ups
Use the conversation history to understand follow-up questions (e.g., "what about his losses?").

### Response Format
- Present stats clearly and readably
- Always include: fighter name, opponent, event, method, and result
- Records format: W-L-D (e.g., 22-7-0)
- Keep answers concise
- If a tool returns an error or no data, say so honestly`;

type Rec = Record<string, unknown>;

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Rec };
  functionResponse?: { name: string; response: Rec };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Rec;
}

const strProp = (description: string): Rec => ({ type: 'string', description });

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'search_ufc',
    description:
      "Search UFC fighters, events, and bouts. For fighters pass name with spaces (e.g., 'conor mcgregor'). For events pass event number (e.g., 'ufc 300'). Returns fighter profiles, career stats, fight history, and matching events (with slug for get_event_bouts).",
    parameters: {
      type: 'object',
      properties: {
        query: strProp('Fighter name with spaces (e.g. conor mcgregor) OR event number (e.g. ufc 300)'),
      },
      required: ['query'],
    },
  },
  {
    name: 'get_fighter',
    description: 'Get fighter profile by slug. Slug is lowercase hyphenated (e.g., conor-mcgregor).',
    parameters: {
      type: 'object',
      properties: { slug: strProp('Fighter slug, lowercase hyphenated, e.g. conor-mcgregor') },
      required: ['slug'],
    },
  },
  {
    name: 'get_fighter_stats',
    description: 'Get fighter career stats by slug. Slug is lowercase hyphenated (e.g., conor-mcgregor).',
    parameters: {
      type: 'object',
      properties: { slug: strProp('Fighter slug, lowercase hyphenated, e.g. conor-mcgregor') },
      required: ['slug'],
    },
  },
  {
    name: 'get_fighter_fights',
    description: 'Get fighter fight history by slug. Slug is lowercase hyphenated (e.g., conor-mcgregor).',
    parameters: {
      type: 'object',
      properties: { slug: strProp('Fighter slug, lowercase hyphenated, e.g. conor-mcgregor') },
      required: ['slug'],
    },
  },
  {
    name: 'get_rankings',
    description: 'Get current UFC rankings for all divisions. No parameters needed.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_rankings_by_division',
    description: "Get rankings for a specific division. Pass division name in lowercase (e.g., 'welterweight', 'lightweight').",
    parameters: {
      type: 'object',
      properties: { division: strProp('Division name in lowercase, e.g. welterweight') },
      required: ['division'],
    },
  },
  {
    name: 'get_upcoming_events',
    description: 'Get upcoming UFC events and fight cards. No parameters needed.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_event_bouts',
    description: "Get all bouts for a specific event. Pass event slug (e.g., 'ufc-329').",
    parameters: {
      type: 'object',
      properties: { eventSlug: strProp('Event slug, e.g. ufc-329') },
      required: ['eventSlug'],
    },
  },
  {
    name: 'get_bout_stats',
    description: "Get round-by-round stats for a specific fight. Pass bout ID (e.g., '989760fa75321d69').",
    parameters: {
      type: 'object',
      properties: { boutId: strProp('Bout ID string') },
      required: ['boutId'],
    },
  },
];

function str(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === 'number' ? v : null;
}

function asArray(v: unknown): Rec[] {
  return Array.isArray(v) ? (v as Rec[]) : [];
}

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function normalizeSlug(v: unknown): string {
  return String(v ?? '').toLowerCase().trim().replace(/\s+/g, '-');
}

function asFunctionCall(part: Rec): { name: string; args: Rec } | null {
  const fc = part.functionCall;
  if (isRec(fc) && typeof fc.name === 'string') {
    return { name: fc.name, args: isRec(fc.args) ? fc.args : {} };
  }
  return null;
}

async function citoGet(path: string): Promise<unknown> {
  const res = await fetch(`${CITO_BASE}${path}`, {
    headers: { 'x-api-key': CITO_API_KEY },
  });
  if (!res.ok) {
    return { error: `Cito API error (${res.status})` };
  }
  const data: unknown = await res.json();
  if (isRec(data) && 'data' in data) {
    return data.data;
  }
  return data;
}

function slimFighter(f: Rec): Rec {
  const record = isRec(f.record) ? f.record : null;
  return {
    slug: str(f.slug),
    name: str(f.name),
    nickname: str(f.nickname),
    division: str(f.division),
    championStatus: str(f.championStatus),
    recordText: str(f.recordText) ?? (record ? str(record.text) : null),
    country: str(f.country),
    heightInches: str(f.heightInches),
    weightLbs: str(f.weightLbs),
    reachInches: str(f.reachInches),
    stance: str(f.stance),
    status: str(f.status),
    imageUrl: str(f.imageUrl) ?? str(f.headshotUrl),
  };
}

function slimProfile(f: Rec): Rec {
  const record = isRec(f.record) ? f.record : null;
  return {
    slug: str(f.slug),
    name: str(f.name),
    firstName: str(f.firstName),
    lastName: str(f.lastName),
    nickname: str(f.nickname),
    division: str(f.division),
    status: str(f.status),
    championStatus: str(f.championStatus),
    country: str(f.country),
    placeOfBirth: str(f.placeOfBirth),
    trainsAt: str(f.trainsAt),
    fightingStyle: str(f.fightingStyle),
    age: num(f.age),
    heightInches: str(f.heightInches),
    weightLbs: str(f.weightLbs),
    reachInches: str(f.reachInches),
    legReachInches: str(f.legReachInches),
    stance: str(f.stance),
    record: record
      ? {
          wins: num(record.wins),
          losses: num(record.losses),
          draws: num(record.draws),
          text: str(record.text),
        }
      : null,
    imageUrl: str(f.imageUrl),
    headshotUrl: str(f.headshotUrl),
  };
}

function slimEvent(e: Rec): Rec {
  return {
    slug: str(e.slug),
    id: str(e.id),
    title: str(e.title),
    status: str(e.status),
    startsAt: str(e.startsAt),
    venue: str(e.venue),
    city: str(e.city),
    country: str(e.country),
    locationText: str(e.locationText),
    eventDate: str(e.eventDate),
    eventDateLabel: str(e.eventDateLabel),
    hasStats: e.hasStats === true,
  };
}

function slimBout(b: Rec, includeEvent: boolean): Rec {
  const event = isRec(b.event) ? b.event : null;
  const out: Rec = {
    id: str(b.id),
    eventSlug: str(b.eventSlug) ?? (event ? str(event.slug) : null),
    cardSection: str(b.cardSection),
    weightClass: str(b.weightClass),
    titleBout: b.titleBout === true,
    status: str(b.status),
    isCancelled: b.isCancelled === true,
    winnerFighterSlug: str(b.winnerFighterSlug),
    resultRound: num(b.resultRound),
    resultTime: str(b.resultTime),
    method: str(b.method),
    fighters: asArray(b.fighters).map((f) => ({
      fighterSlug: str(f.fighterSlug),
      fighterName: str(f.fighterName),
      corner: str(f.corner),
      outcome: str(f.outcome),
    })),
  };
  if (includeEvent && event) {
    out.event = {
      slug: str(event.slug),
      title: str(event.title),
      eventDateLabel: str(event.eventDateLabel),
    };
  }
  return out;
}

function slimFight(fi: Rec): Rec {
  const opp = isRec(fi.opponent) ? fi.opponent : null;
  const ev = isRec(fi.event) ? fi.event : null;
  const bout = isRec(fi.bout) ? fi.bout : null;
  return {
    outcome: str(fi.outcome),
    opponent: opp
      ? { slug: str(opp.slug), name: str(opp.name), corner: str(opp.corner) }
      : null,
    event: ev
      ? { title: str(ev.title), eventDateLabel: str(ev.eventDateLabel) }
      : null,
    bout: bout
      ? {
          weightClass: str(bout.weightClass),
          method: str(bout.method),
          resultRound: num(bout.resultRound),
          resultTime: str(bout.resultTime),
          cardSection: str(bout.cardSection),
        }
      : null,
  };
}

function slimRanking(r: Rec): Rec {
  return {
    division: str(r.division),
    rankText: str(r.rankText),
    isChampion: r.isChampion === true,
    fighterName: str(fighterNameOf(r)),
    fighterSlug: str(fighterSlugOf(r)),
  };
}

function fighterNameOf(r: Rec): unknown {
  const fighter = isRec(r.fighter) ? r.fighter : null;
  return r.fighterName ?? (fighter ? fighter.name : null);
}

function fighterSlugOf(r: Rec): unknown {
  const fighter = isRec(r.fighter) ? r.fighter : null;
  return r.fighterSlug ?? (fighter ? fighter.slug : null);
}

async function runTool(name: string, args: Rec): Promise<Rec> {
  try {
    switch (name) {
      case 'search_ufc': {
        const q = String(args.query ?? '').trim();
        if (!q) return { error: 'query is required' };
        const data = await citoGet(`/ufc/search?q=${encodeURIComponent(q)}`);
        if (!isRec(data)) return { error: 'Unexpected search response' };
        return {
          fighters: asArray(data.fighters).slice(0, 5).map(slimFighter),
          events: asArray(data.events).slice(0, 5).map(slimEvent),
          bouts: asArray(data.bouts).slice(0, 5).map((b) => slimBout(b, true)),
        };
      }
      case 'get_fighter': {
        const slug = normalizeSlug(args.slug);
        if (!slug) return { error: 'slug is required' };
        const data = await citoGet(`/ufc/fighters/${encodeURIComponent(slug)}`);
        if (!isRec(data)) return { error: 'Fighter not found' };
        return slimProfile(data);
      }
      case 'get_fighter_stats': {
        const slug = normalizeSlug(args.slug);
        if (!slug) return { error: 'slug is required' };
        const data = await citoGet(`/ufc/fighters/${encodeURIComponent(slug)}/stats`);
        if (!isRec(data)) return { error: 'Stats not found' };
        return data;
      }
      case 'get_fighter_fights': {
        const slug = normalizeSlug(args.slug);
        if (!slug) return { error: 'slug is required' };
        const data = await citoGet(`/ufc/fighters/${encodeURIComponent(slug)}/fights`);
        return { fights: asArray(data).slice(0, 10).map(slimFight) };
      }
      case 'get_rankings': {
        const data = await citoGet('/ufc/rankings');
        return { rankings: asArray(data).map(slimRanking) };
      }
      case 'get_rankings_by_division': {
        const division = String(args.division ?? '').toLowerCase().trim();
        if (!division) return { error: 'division is required' };
        const data = await citoGet(`/ufc/rankings/${encodeURIComponent(division)}`);
        return { rankings: asArray(data).map(slimRanking) };
      }
      case 'get_upcoming_events': {
        const data = await citoGet('/ufc/events/upcoming');
        return { events: asArray(data).slice(0, 10).map(slimEvent) };
      }
      case 'get_event_bouts': {
        const slug = String(args.eventSlug ?? '').toLowerCase().trim();
        if (!slug) return { error: 'eventSlug is required' };
        const data = await citoGet(`/ufc/events/${encodeURIComponent(slug)}/bouts`);
        return { bouts: asArray(data).map((b) => slimBout(b, false)) };
      }
      case 'get_bout_stats': {
        const boutId = String(args.boutId ?? '').trim();
        if (!boutId) return { error: 'boutId is required' };
        const data = await citoGet(`/ufc/bouts/${encodeURIComponent(boutId)}/stats`);
        if (!isRec(data) && !Array.isArray(data)) return { error: 'Bout stats not found' };
        return isRec(data) ? data : { rounds: data };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Tool call failed' };
  }
}

function sanitizeHistory(raw: unknown): GeminiContent[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-MAX_HISTORY_MESSAGES).flatMap((m) => {
    if (!isRec(m)) return [];
    const role = str(m.role);
    const content = str(m.content);
    if (!content || (role !== 'user' && role !== 'assistant')) return [];
    return [{
      role: (role === 'assistant' ? 'model' : 'user') as GeminiContent['role'],
      parts: [{ text: content.slice(0, MAX_HISTORY_CHARS) }],
    }];
  });
}

async function callGeminiOnce(
  model: string,
  contents: GeminiContent[],
): Promise<Rec> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(geminiUrl(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools: [{ functionDeclarations: TOOLS }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });

    if (res.status === 429) {
      return { rateLimited: true };
    }
    if (res.status === 503 && attempt < 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      continue;
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`Gemini API error (${model})`, res.status, errText.slice(0, 500));
      return {
        error: `Gemini API error (${res.status})`,
        retriable: res.status === 503 || res.status === 404,
      };
    }
    return (await res.json()) as Rec;
  }
}

async function callGemini(contents: GeminiContent[]): Promise<Rec> {
  const primary = await callGeminiOnce(GEMINI_MODEL, contents);
  if (!primary.error || primary.rateLimited) {
    return primary;
  }
  if (
    primary.retriable &&
    GEMINI_MODEL_FALLBACK &&
    GEMINI_MODEL_FALLBACK !== GEMINI_MODEL
  ) {
    console.error(`Falling back to ${GEMINI_MODEL_FALLBACK}`);
    return callGeminiOnce(GEMINI_MODEL_FALLBACK, contents);
  }
  return primary;
}

const rateBuckets = new Map<string, number[]>();

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real;
  return 'unknown';
}

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const bucket = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (bucket.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(ip, bucket);
    return false;
  }
  bucket.push(now);
  rateBuckets.set(ip, bucket);
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ output: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY || !CITO_API_KEY) {
    return res.status(200).json({
      output: 'Chat is not configured on the server. Set GEMINI_API_KEY and CITO_API_KEY.',
    });
  }

  const body = isRec(req.body) ? req.body : {};
  const chatInput = (str(body.chatInput) ?? '').trim().slice(0, MAX_INPUT_CHARS);
  if (!chatInput) {
    return res.status(200).json({ output: 'Please enter a question.' });
  }

  const ip = getClientIp(req);
  if (!allowRequest(ip)) {
    return res.status(200).json({
      output: 'You are sending messages too quickly. Please wait a moment and try again.',
    });
  }

  try {
    const contents: GeminiContent[] = [
      ...sanitizeHistory(body.history),
      { role: 'user', parts: [{ text: chatInput }] },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const gemini = await callGemini(contents);

      if (gemini.rateLimited) {
        return res.status(200).json({
          output: 'The AI service is busy right now (rate limited). Please try again in a minute.',
        });
      }
      if (gemini.error) {
        return res.status(200).json({
          output: 'Something went wrong with the AI service. Please try again.',
        });
      }

      const candidate = asArray(gemini.candidates)[0];
      const content = candidate && isRec(candidate.content) ? candidate.content : null;
      const parts = content ? asArray(content.parts) : [];

      const functionCalls = parts
        .map(asFunctionCall)
        .filter((fc): fc is { name: string; args: Rec } => fc !== null);
      if (functionCalls.length === 0) {
        const text = parts
          .map((p) => str(p.text))
          .filter((t): t is string => Boolean(t))
          .join('\n')
          .trim();
        if (text) {
          return res.status(200).json({ output: text });
        }
        const finishReason = candidate ? str(candidate.finishReason) : null;
        return res.status(200).json({
          output:
            finishReason === 'SAFETY'
              ? "I can't help with that request."
              : "I couldn't generate a response. Please try again.",
        });
      }

      contents.push({
        role: 'model',
        parts: functionCalls.map((fc) => ({ functionCall: fc })),
      });

      const responseParts: GeminiPart[] = [];
      for (const fc of functionCalls) {
        const result = await runTool(fc.name, fc.args);
        responseParts.push({
          functionResponse: {
            name: fc.name,
            response: isRec(result) ? result : { result },
          },
        });
      }
      contents.push({ role: 'user', parts: responseParts });
    }

    return res.status(200).json({
      output: 'I hit the tool-use limit before finishing. Please try a simpler question.',
    });
  } catch (err) {
    console.error('Chat handler error', err);
    return res.status(200).json({ output: 'Something went wrong. Please try again.' });
  }
}
