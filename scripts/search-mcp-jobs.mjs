import { searchMcpJobs } from '../src/mcpJobsClient.js';

const [, , keywordArg = 'AI 产品经理', cityArg = '', pageArg = '1'] = process.argv;

const searchParams = {
  keyword: keywordArg,
  city: cityArg || undefined,
  page: Number(pageArg) || 1,
};

const payload = await searchMcpJobs(searchParams);
console.log(JSON.stringify({ total: payload.total, output: 'public/data/jobs/latest.json', sample: payload.jobs.slice(0, 3) }, null, 2));
