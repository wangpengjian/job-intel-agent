export const cityNames = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '天津', '西安', '重庆', '长沙', '郑州', '青岛', '厦门', '合肥'];
export const fundingStages = ['未融资', '天使轮', 'A轮', 'B轮', 'C轮', 'D轮', '上市', '不需要融资', '已上市'];
export const ownershipTypes = ['国企', '外企', '民企', '合资', '央企', '事业单位', '上市公司'];
export const skillKeywords = ['RAG', 'Agent', 'Prompt', 'AI', 'AIGC', 'LLM', 'NLP', 'Python', 'Java', 'React', 'SaaS', 'B端', 'C端', '数据治理', '知识库', '模型评测', '工作流', '智能客服', '私有化', '交付'];
export const industryNames = ['互联网', '人工智能', '计算机软件', '金融科技', '智能制造', '教育科技', '电子商务', '企业服务', '数据服务', '汽车', '医疗健康', '政企数字化'];

function pickFirst(text, patterns, fallback = '待补充') {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
    if (match?.[0]) return match[0].trim();
  }
  return fallback;
}

function detectSource(text) {
  if (/boss|BOSS|直聘/.test(text)) return 'BOSS直聘';
  if (/智联|zhaopin/i.test(text)) return '智联招聘';
  if (/猎聘|liepin/i.test(text)) return '猎聘';
  return '手动导入';
}

function detectFromList(text, candidates, fallback) {
  return candidates.find((item) => text.includes(item)) || fallback;
}

function detectIndustry(text) {
  const rules = [
    [/金融|投研|风控|银行|证券/, '金融科技'],
    [/制造|工厂|工业|质检|设备/, '智能制造'],
    [/教育|学习|题库|课程/, '教育科技'],
    [/政企|政府|智慧城市|国资|数据治理/, '政企数字化'],
    [/云|开发者|SDK|API|运维/, '开发者工具 / 云计算'],
    [/医疗|医药|诊疗|医院/, '医疗健康'],
    [/电商|零售|交易|供应链/, '电商 / 零售'],
    [/大模型|AI|人工智能|Agent|RAG|知识库/, '人工智能'],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || '行业待确认';
}

function detectTitle(lines, text) {
  const labeled = pickFirst(text, [
    /岗位名称[:：]\s*([^\n]+)/,
    /职位名称[:：]\s*([^\n]+)/,
    /招聘职位[:：]\s*([^\n]+)/,
  ], '');
  if (labeled) return labeled;

  return lines.find((line) => /经理|产品|工程师|算法|运营|顾问|分析师|开发|设计师|助理/.test(line) && !/职责|要求|经验|学历|薪资/.test(line)) || '未命名岗位';
}

function detectCompany(lines, text) {
  const labeled = pickFirst(text, [
    /公司名称[:：]\s*([^\n]+)/,
    /招聘公司[:：]\s*([^\n]+)/,
    /企业名称[:：]\s*([^\n]+)/,
  ], '');
  if (labeled) return labeled;

  return lines.find((line) => /公司|集团|科技|智能|数据|信息|网络|软件|数科|有限|股份/.test(line) && !/岗位|职位|职责|要求|融资|规模/.test(line)) || '公司待识别';
}

function extractTags(text) {
  const tags = skillKeywords.filter((keyword) => new RegExp(keyword.replace('+', '\\+'), 'i').test(text));
  if (/大模型|LLM|AIGC|生成式/.test(text) && !tags.includes('大模型')) tags.unshift('大模型');
  if (/产品/.test(text) && !tags.includes('产品')) tags.push('产品');
  return [...new Set(tags)].slice(0, 8);
}

function extractSalary(text) {
  return pickFirst(text, [
    /\d{1,3}\s*-\s*\d{1,3}\s*[kK](?:\s*[·xX*]\s*\d{1,2}薪?)?/,
    /\d{1,3}\s*[kK]\s*-\s*\d{1,3}\s*[kK]/,
    /\d{1,3}\s*万\s*-\s*\d{1,3}\s*万/,
  ], '薪资待确认').replace(/\s+/g, '');
}

function extractExperience(text) {
  return pickFirst(text, [
    /(?:经验|工作年限)[:：]?\s*([^\n，,；;]{2,12})/,
    /(?:应届|在校|无需经验|\d+\s*-\s*\d+年|\d+年以上|\d+年以内)/,
  ], '经验待确认');
}

function extractEducation(text) {
  return pickFirst(text, [
    /(?:学历|教育背景)[:：]?\s*(博士|硕士|本科|大专|不限)/,
    /(博士|硕士|本科|大专|学历不限|统招本科)/,
  ], '学历待确认').replace('统招本科', '本科');
}

function extractScale(text) {
  return pickFirst(text, [
    /(?:规模|公司规模)[:：]?\s*([^\n，,；;]*?(?:人|以上))/,
    /\d{1,5}\s*-\s*\d{1,5}人/,
    /\d{1,5}人以上/,
  ], '规模待确认').replace(/\s+/g, '');
}

function normalizeFunding(value) {
  return value.replace('已上市', '上市').replace('融资未公开', '融资待确认');
}

function cleanupCompanyName(company) {
  return company
    .replace(/(互联网|人工智能|计算机软件|金融科技|智能制造|教育科技|电子商务|企业服务|数据服务|汽车|医疗健康|政企数字化)(已)?$/, '')
    .replace(/已$/, '')
    .trim() || company;
}

export function parsePastedJob(rawText) {
  const text = rawText.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').trim();
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (text.length < 20) {
    throw new Error('内容太短了，至少粘贴岗位名称、公司和一段 JD。');
  }

  const company = detectCompany(lines, text);
  const title = detectTitle(lines, text);
  const city = pickFirst(text, [
    /工作地点[:：]\s*([^\n\s，,]+)/,
    /城市[:：]\s*([^\n\s，,]+)/,
  ], detectFromList(text, cityNames, '地点待确认'));
  const salary = extractSalary(text);
  const experience = extractExperience(text);
  const education = extractEducation(text);
  const scale = extractScale(text);
  const funding = normalizeFunding(detectFromList(text, fundingStages.concat('融资未公开'), '融资待确认'));
  const ownership = detectFromList(text, ownershipTypes, /外资|欧美|外商/.test(text) ? '外企' : '性质待确认').replace('央企', '国企').replace('上市公司', '民企');
  const tags = extractTags(text);
  const industry = detectIndustry(text);
  const jd = text.length > 520 ? `${text.slice(0, 520)}...` : text;

  return {
    id: `import-${Date.now()}`,
    source: detectSource(text),
    title,
    company: cleanupCompanyName(company),
    city,
    salary,
    experience,
    education,
    scale,
    funding,
    ownership,
    industry,
    companySummary: `${cleanupCompanyName(company)} 的公司信息来自本次粘贴内容，已解析出 ${scale}、${funding}、${ownership} 等字段；后续可接企业信息源补全工商、融资和业务信息。`,
    tags: tags.length ? tags : ['待分析'],
    jd,
  };
}

export function normalizeMcpJob(rawJob, index = 0, params = {}) {
  const rawText = [rawJob.content, rawJob.title, rawJob.company, rawJob.address, rawJob.salary, Array.isArray(rawJob.tags) ? rawJob.tags.join(' ') : '']
    .filter(Boolean)
    .join('\n')
    .trim();
  const compact = rawText.replace(/\s+/g, ' ').trim();
  const bracketCity = compact.match(/【([^】]+)】/)?.[1]?.split('-')[0];
  const city = rawJob.city || rawJob.address?.split('-')?.[0] || bracketCity || detectFromList(compact, cityNames, params.city || '地点待确认');
  const title = rawJob.title || compact.split('【')[0]?.trim() || '未命名岗位';
  const salary = rawJob.salary || extractSalary(compact);
  const experience = extractExperience(compact);
  const education = extractEducation(compact);
  const scale = extractScale(compact);
  const funding = normalizeFunding(detectFromList(compact, fundingStages.concat('融资未公开'), '融资待确认'));
  const ownership = detectFromList(compact, ownershipTypes, /外资|欧美|外商/.test(compact) ? '外企' : '性质待确认').replace('央企', '国企').replace('上市公司', '民企');
  const industry = detectFromList(compact, industryNames, detectIndustry(compact));
  const tags = [...new Set([...(Array.isArray(rawJob.tags) ? rawJob.tags : []), ...extractTags(compact)])].filter(Boolean).slice(0, 8);

  let company = rawJob.company || '公司待识别';
  if (company === '公司待识别') {
    const afterEducation = compact.split(/博士|硕士|本科|大专|学历不限|统招本科/).slice(1).join(' ');
    const beforeFunding = afterEducation.split(/未融资|天使轮|A轮|B轮|C轮|D轮|上市|融资未公开|\d{1,5}\s*-\s*\d{1,5}人|\d{1,5}人以上/)[0]?.trim();
    company = beforeFunding || compact.match(/[\u4e00-\u9fa5A-Za-z0-9（）()·]{2,30}(?:公司|集团|科技|智能|数据|信息|网络|软件|数科|有限|股份)/)?.[0] || '公司待识别';
  }
  company = cleanupCompanyName(company);

  return {
    id: `mcp-${Date.now()}-${index}`,
    source: rawJob.source || 'MCP真实搜索',
    title,
    company,
    city,
    salary,
    experience,
    education,
    scale,
    funding,
    ownership,
    industry,
    companySummary: `${company} 来自 mcp-jobs 真实搜索结果；字段已由招聘平台返回内容标准化，建议点击详情或粘贴完整 JD 进一步补全。`,
    tags: tags.length ? tags : ['真实搜索'],
    jd: rawJob.jobDescription || rawJob.description || compact,
    jobDetail: rawJob.jobDetail,
  };
}
