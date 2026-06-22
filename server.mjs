import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createServer as createViteServer } from 'vite';
import { searchMcpJobs } from './src/mcpJobsClient.js';

const port = Number(process.env.PORT || 5173);
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/jobs/search') {
      const body = await readBody(req);
      if (!body.keyword || typeof body.keyword !== 'string') {
        sendJson(res, 400, { error: '请输入搜索关键词。' });
        return;
      }
      const payload = await searchMcpJobs({
        keyword: body.keyword.trim(),
        city: typeof body.city === 'string' ? body.city.trim() : '',
        page: Number(body.page) || 1,
        salary: typeof body.salary === 'string' ? body.salary.trim() : '',
        workYear: typeof body.workYear === 'string' ? body.workYear.trim() : '',
      });
      sendJson(res, 200, payload);
      return;
    }

    if (req.method === 'GET' && req.url === '/data/jobs/latest.json') {
      try {
        const json = await readFile('public/data/jobs/latest.json', 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        res.end(json);
      } catch {
        sendJson(res, 404, { error: '暂无真实搜索结果。' });
      }
      return;
    }

    vite.middlewares(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || '搜索失败。' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Job Agent running at http://localhost:${port}/`);
});
