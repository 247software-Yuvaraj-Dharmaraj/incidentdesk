import { IncidentType, Priority } from '@prisma/client';
import { ApiError } from '../lib/api-error.js';
import { getGemini, isTriageEnabled } from '../lib/gemini.js';
import { env } from '../config/env.js';

const TYPES = Object.values(IncidentType);
const PRIORITIES = Object.values(Priority);

export interface TriageResult {
	type: IncidentType;
	priority: Priority;
	summary: string;
}

const SYSTEM_INSTRUCTION = `You are an incident triage assistant for a venue and facility operations platform.
Given an incident's title and optional description, classify it and return a JSON object with exactly these keys:
- "type": one of ${TYPES.join(', ')}.
- "priority": one of ${PRIORITIES.join(', ')}. Judge by safety impact and urgency — life-safety or security threats are CRITICAL; cosmetic or non-urgent issues are LOW.
- "summary": a single concise sentence (max 140 characters) restating the incident.
Respond with ONLY the JSON object — no markdown fences, no commentary.`;

function parseJson(text: string): { type?: string; priority?: string; summary?: string } {
	const cleaned = text
		.trim()
		.replace(/^```(?:json)?/i, '')
		.replace(/```$/, '')
		.trim();
	return JSON.parse(cleaned);
}

export async function triageIncident(input: { title: string; description?: string }): Promise<TriageResult> {
	if (!isTriageEnabled()) {
		throw new ApiError(503, 'AI triage is not configured');
	}

	const prompt = `Title: ${input.title}\n\nDescription: ${input.description?.trim() || '(none provided)'}`;

	let text: string | undefined;
	try {
		const response = await getGemini().models.generateContent({
			model: env.GEMINI_MODEL,
			contents: prompt,
			config: {
				systemInstruction: SYSTEM_INSTRUCTION,
				responseMimeType: 'application/json',
				temperature: 0.2,
			},
		});
		text = response.text;
	} catch (err) {
		console.error('Gemini request failed:', err);
		throw new ApiError(502, 'AI request failed');
	}

	if (!text) {
		throw new ApiError(502, 'AI returned an empty response');
	}

	let parsed: { type?: string; priority?: string; summary?: string };
	try {
		parsed = parseJson(text);
	} catch {
		throw new ApiError(502, 'AI returned an unparseable response');
	}

	// Validate against the real enums; fall back to safe defaults if the model drifts.
	return {
		type: TYPES.includes(parsed.type as IncidentType) ? (parsed.type as IncidentType) : IncidentType.INCIDENT,
		priority: PRIORITIES.includes(parsed.priority as Priority) ? (parsed.priority as Priority) : Priority.MEDIUM,
		summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 200) : '',
	};
}
