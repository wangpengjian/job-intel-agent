import assert from 'node:assert/strict';
import { parsePastedJob } from '../src/jobParser.js';

const sample = `
BOSS直聘
岗位名称：AI 产品经理
公司名称：云启智能科技有限公司
工作地点：北京
25-40K·14薪
经验：3-5年
学历：本科
公司规模：100-499人
B轮 民企
负责大模型知识库产品规划，设计 RAG 检索增强、Agent 工作流、Prompt 模板和模型评测能力。
`;

const parsed = parsePastedJob(sample);

assert.equal(parsed.source, 'BOSS直聘');
assert.equal(parsed.title, 'AI 产品经理');
assert.equal(parsed.company, '云启智能科技有限公司');
assert.equal(parsed.city, '北京');
assert.equal(parsed.salary, '25-40K·14薪');
assert.equal(parsed.experience, '3-5年');
assert.equal(parsed.education, '本科');
assert.equal(parsed.scale, '100-499人');
assert.equal(parsed.funding, 'B轮');
assert.equal(parsed.ownership, '民企');
assert.ok(parsed.tags.includes('RAG'));
assert.ok(parsed.tags.includes('Agent'));

console.log('parser ok');
