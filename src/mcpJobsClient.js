import { mkdir, writeFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { normalizeMcpJob } from './jobParser.js';

async function callMcpJobs(params) {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['node_modules/mcp-jobs/dist/mcp.js'],
  });
  const client = new Client({ name: 'job-agent-local', version: '0.1.0' });
  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: 'mcp_search_job',
      arguments: params,
    });
    const text = result.content?.find((item) => item.type === 'text')?.text || '{}';
    return JSON.parse(text);
  } finally {
    await client.close();
  }
}

export async function searchMcpJobs(searchParams, options = {}) {
  const startedAt = new Date().toISOString();
  const params = {
    keyword: searchParams.keyword,
    city: searchParams.city || undefined,
    page: Number(searchParams.page) || 1,
    salary: searchParams.salary || undefined,
    workYear: searchParams.workYear || undefined,
  };
  const data = await callMcpJobs(params);
  const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
  const jobs = rawJobs.map((job, index) => normalizeMcpJob(job, index, params));
  const payload = {
    source: 'mcp-jobs',
    fetchedAt: new Date().toISOString(),
    startedAt,
    searchParams: params,
    total: jobs.length,
    jobs,
    metadata: data.metadata || {},
  };

  if (options.writeLatest !== false) {
    await mkdir('public/data/jobs', { recursive: true });
    await writeFile('public/data/jobs/latest.json', JSON.stringify(payload, null, 2));
  }

  return payload;
}
