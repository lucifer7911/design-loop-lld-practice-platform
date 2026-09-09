const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { rubricFor } = require('./app.js');

const root = __dirname;
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  });
}
const port = Number(process.env.PORT || 3000);
const model = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gemini-2.0-flash';
const apiUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function buildPrompt(problem, text, checks) {
  return [
    'You are an LLD design reviewer. Evaluate the learner submission without enforcing a single canonical design.',
    'Return JSON only with this shape: {"score": number, "coach": string, "next": {"name": string, "prompt": string}}.',
    'Score the quality of responsibilities, relationships, coupling, extensibility, trade-offs, and edge cases.',
    `Problem: ${problem.title}\nRequirements: ${problem.brief.join(' ')}`,
    `Deterministic evidence checks: ${JSON.stringify(checks)}`,
    `Learner submission: ${text}`
  ].join('\n\n');
}

async function evaluateWithGemini(problem, text, checks) {
  if (!process.env.GEMINI_API_KEY) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'You provide concise, evidence-based LLD feedback.' }] },
      contents: [{ parts: [{ text: buildPrompt(problem, text, checks) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    })
  });
  if (!response.ok) throw new Error(`Gemini evaluator returned ${response.status}`);
  const payload = await response.json();
  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini evaluator returned no content');
  return JSON.parse(content);
}

async function evaluateWithOpenAI(problem, text, checks) {
  if (!process.env.OPENAI_API_KEY) return null;
  const prompt = [
    'You are an LLD design reviewer. Evaluate the learner submission without enforcing a single canonical design.',
    'Return JSON only with this shape: {"score": number, "coach": string, "next": {"name": string, "prompt": string}}.',
    'Score the quality of responsibilities, relationships, coupling, extensibility, trade-offs, and edge cases.',
    `Problem: ${problem.title}\nRequirements: ${problem.brief.join(' ')}`,
    `Deterministic evidence checks: ${JSON.stringify(checks)}`,
    `Learner submission: ${text}`
  ].join('\n\n');

  const result = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You provide concise, evidence-based LLD feedback.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!result.ok) throw new Error(`External evaluator returned ${result.status}`);
  const payload = await result.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('External evaluator returned no content');
  const report = JSON.parse(content);

  return {
    score: Math.max(0, Math.min(100, Number(report.score) || 0)),
    coach: String(report.coach || 'The external reviewer did not provide coaching feedback.'),
    next: {
      name: String(report.next?.name || 'Trade-offs'),
      prompt: String(report.next?.prompt || 'Explain one important trade-off in your design.')
    }
  };
}

async function handleEvaluation(request, response) {
  try {
    const input = JSON.parse(await readBody(request));
    if (!input.text || !input.problem) return sendJson(response, 400, { error: 'Problem and submission are required.' });
    const localReport = rubricFor(input.text, input.problem);
    const externalReport = await evaluateWithGemini(input.problem, input.text, localReport.checks)
      || await evaluateWithOpenAI(input.problem, input.text, localReport.checks);
    sendJson(response, 200, { report: externalReport ? { ...localReport, ...externalReport, source: 'external-ai' } : { ...localReport, source: 'local-fallback' } });
  } catch (error) {
    sendJson(response, 502, { error: error.message });
  }
}

function serveStatic(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.resolve(root, `.${requested}`);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404); response.end('Not found'); return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/evaluate') return handleEvaluation(request, response);
  if (request.method === 'GET') return serveStatic(request, response);
  response.writeHead(405); response.end('Method not allowed');
}).listen(port, () => console.log(`Design Loop running at http://localhost:${port}`));
