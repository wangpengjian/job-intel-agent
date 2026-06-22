import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  Factory,
  Filter,
  GraduationCap,
  LineChart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Wifi,
} from 'lucide-react';
import { parsePastedJob } from './jobParser.js';
import './styles.css';

const jobs = [
  {
    id: 'boss-001',
    source: 'BOSS直聘',
    title: 'AI 产品经理',
    company: '云启智能科技',
    city: '北京',
    salary: '25-40K·14薪',
    experience: '3-5年',
    education: '本科',
    scale: '100-499人',
    funding: 'B轮',
    ownership: '民企',
    industry: '人工智能 / SaaS',
    companySummary: '面向企业知识管理场景提供大模型应用平台，核心产品覆盖智能问答、知识库、流程 Agent 和私有化部署。',
    tags: ['RAG', 'Agent', 'Prompt', 'SaaS', 'B端产品'],
    jd: '负责大模型企业知识库产品规划，设计 RAG 检索增强、智能问答、Prompt 模板和效果评测能力；与算法、后端、交付团队协作推动私有化项目落地；根据客户反馈建立指标体系并持续优化召回率、准确率和用户满意度。',
  },
  {
    id: 'liepin-001',
    source: '猎聘',
    title: '大模型应用产品经理',
    company: '明曜数据',
    city: '上海',
    salary: '30-50K',
    experience: '5-10年',
    education: '本科',
    scale: '500-999人',
    funding: 'C轮',
    ownership: '民企',
    industry: '数据智能 / 金融科技',
    companySummary: '专注金融行业数据中台和智能投研系统，正在把大模型能力接入研报分析、风控问答和自动化办公场景。',
    tags: ['金融科技', '工作流', '模型评测', '数据产品'],
    jd: '负责金融大模型应用从 0 到 1 的产品设计，拆解投研、风控、合规等业务场景，建设模型效果评估流程；需要理解数据权限、知识库治理、产品商业化和项目制交付。',
  },
  {
    id: 'zhaopin-001',
    source: '智联招聘',
    title: 'AI 项目型产品经理',
    company: '华北数科集团',
    city: '天津',
    salary: '18-30K',
    experience: '3-5年',
    education: '本科',
    scale: '1000-9999人',
    funding: '未融资',
    ownership: '国企',
    industry: '政企数字化',
    companySummary: '地方数字产业集团，承接政企数字化、智慧城市、数据治理和行业大模型项目。',
    tags: ['政企', '项目交付', '需求调研', '数据治理'],
    jd: '负责政企 AI 项目需求调研、方案设计和交付推进，输出原型、PRD、验收文档；协调客户、研发、算法和实施团队，推动智能客服、文档问答、知识管理等场景落地。',
  },
  {
    id: 'boss-002',
    source: 'BOSS直聘',
    title: 'Agent 平台产品经理',
    company: '星河云原生',
    city: '深圳',
    salary: '28-45K',
    experience: '3-5年',
    education: '本科',
    scale: '100-499人',
    funding: 'A轮',
    ownership: '外企',
    industry: '开发者工具 / 云计算',
    companySummary: '面向海外开发者提供云端自动化运维和 AI Agent 编排平台，团队有北美产品和工程背景。',
    tags: ['Agent Builder', '工作流编排', '开发者产品', '海外'],
    jd: '负责 Agent 编排平台的核心体验，包括工具调用、记忆、工作流、权限和运行监控；需要有开发者产品经验，能和工程团队讨论 API、SDK、日志、调试体验。',
  },
  {
    id: 'liepin-002',
    source: '猎聘',
    title: 'AI 解决方案顾问',
    company: '长风工业智能',
    city: '苏州',
    salary: '20-35K',
    experience: '5-10年',
    education: '本科',
    scale: '1000-9999人',
    funding: '上市',
    ownership: '民企',
    industry: '智能制造',
    companySummary: '制造业数字化上市公司，产品覆盖 MES、工业视觉、设备预测维护和工厂知识助手。',
    tags: ['智能制造', '售前', '方案', '行业大模型'],
    jd: '面向制造业客户设计 AI 解决方案，识别设备维护、质检、知识问答和排产优化场景；需要理解制造业流程，能输出方案、Demo 和 ROI 测算。',
  },
  {
    id: 'zhaopin-002',
    source: '智联招聘',
    title: '初级 AI 产品助理',
    company: '轻舟教育科技',
    city: '杭州',
    salary: '12-18K',
    experience: '1-3年',
    education: '本科',
    scale: '20-99人',
    funding: '天使轮',
    ownership: '民企',
    industry: '教育科技',
    companySummary: '创业公司，做面向职业教育的 AI 题库、学习助手和练习反馈系统。',
    tags: ['教育科技', 'C端', '内容产品', '用户反馈'],
    jd: '协助负责 AI 学习助手功能迭代，整理用户反馈、设计题库生成和练习讲解流程；需要基础产品能力，了解大模型应用，有较强执行和数据意识。',
  },
];

const platforms = ['全部', 'BOSS直聘', '智联招聘', '猎聘'];
const ownerships = ['全部', '国企', '外企', '民企'];
function normalize(text) {
  return text.trim().toLowerCase();
}

function scoreJob(job, query) {
  const q = normalize(query);
  const haystack = normalize(`${job.title} ${job.company} ${job.city} ${job.industry} ${job.tags.join(' ')} ${job.jd}`);
  const base = q ? q.split(/\s+/).filter(Boolean).reduce((sum, word) => sum + (haystack.includes(word) ? 12 : 0), 0) : 24;
  const aiBonus = /ai|大模型|agent|rag|产品/.test(haystack) ? 22 : 8;
  const seniorityFit = /1-3年|3-5年/.test(job.experience) ? 12 : 6;
  const salaryBonus = Number(job.salary.match(/\d+/)?.[0] || 10) > 20 ? 10 : 6;
  return Math.min(96, 42 + base + aiBonus + seniorityFit + salaryBonus);
}

function analyzeJob(job) {
  const keywords = [...new Set(job.tags.concat(job.jd.match(/[A-Za-z][A-Za-z0-9+.#-]*/g) || []))].slice(0, 9);
  const isDelivery = /交付|客户|政企|方案|项目|验收|私有化/.test(job.jd);
  const isTechnical = /RAG|Agent|API|SDK|模型|Prompt|检索|评测|工具调用/.test(job.jd);
  const isBusiness = /商业化|ROI|金融|制造|教育|业务|场景/.test(job.jd);

  const focus = [
    isTechnical ? '准备一个完整的大模型应用案例：目标、数据来源、模型能力边界、效果指标和迭代过程。' : '准备一个能体现产品基本功的项目案例：用户问题、方案设计、上线结果和复盘。',
    isDelivery ? '梳理你推动跨团队或客户项目落地的经历，重点讲清需求澄清、冲突处理、验收标准和排期控制。' : '准备需求优先级判断方法，说明你如何从用户反馈、数据和业务目标里确定版本范围。',
    isBusiness ? '提前了解该行业的典型业务流程和成本收益逻辑，面试中要能把 AI 能力翻译成业务价值。' : '准备产品指标体系，尤其是使用率、留存、任务完成率、准确率、满意度等指标如何定义。',
    '把简历中的泛泛表述改成量化结果，例如效率提升、成本下降、准确率提升、覆盖用户数或项目收入。',
  ];

  const interview = [
    '你做过的 AI 产品里，模型效果不好时怎么定位问题？',
    '如何设计一个 RAG 知识库产品的评测指标？',
    '算法、后端、客户/业务方意见冲突时，你如何推进决策？',
    '如果上线后用户反馈答案不可信，你会怎么改产品？',
  ];

  return {
    keywords,
    focus,
    interview,
    roleType: isTechnical ? '偏技术型 AI 产品 / 平台产品' : isDelivery ? '偏项目交付型 AI 产品' : '偏业务应用型 AI 产品',
    risk: isDelivery ? '该岗位可能包含较多客户沟通、驻场或项目交付压力，需要提前确认工作节奏。' : '该岗位对大模型应用理解要求较高，简历中需要体现具体 AI 项目而不是只写“了解”。',
  };
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function JobCard({ job, selected, onSelect, score }) {
  return (
    <button className={`job-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(job)} type="button">
      <div className="job-card-top">
        <div>
          <div className="source-row">
            <Badge tone={job.source === 'BOSS直聘' ? 'green' : job.source === '猎聘' ? 'blue' : 'orange'}>{job.source}</Badge>
            <span>{job.city}</span>
          </div>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
        <div className="score">
          <strong>{score}</strong>
          <span>推荐</span>
        </div>
      </div>
      <div className="job-meta">
        <span>{job.salary}</span>
        <span>{job.experience}</span>
        <span>{job.education}</span>
      </div>
      <div className="company-line">
        <span>{job.scale}</span>
        <span>{job.funding}</span>
        <span>{job.ownership}</span>
      </div>
      <p className="jd-snippet">{job.jd}</p>
    </button>
  );
}

function DetailPanel({ job }) {
  const analysis = useMemo(() => analyzeJob(job), [job]);

  return (
    <section className="detail-panel">
      <div className="detail-head">
        <div>
          <div className="source-row">
            <Badge tone="green">{job.source}</Badge>
            <span>{job.industry}</span>
          </div>
          <h2>{job.company}</h2>
          <p>{job.companySummary}</p>
        </div>
        <button className="icon-button" title="打开原平台岗位" type="button">
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="stat-grid">
        <Stat icon={Building2} label="规模" value={job.scale} />
        <Stat icon={LineChart} label="融资" value={job.funding} />
        <Stat icon={Factory} label="性质" value={job.ownership} />
        <Stat icon={CircleDollarSign} label="薪资" value={job.salary} />
      </div>

      <div className="section-row">
        <div className="panel-section">
          <div className="section-title">
            <Target size={18} />
            <h3>岗位判断</h3>
          </div>
          <p className="role-type">{analysis.roleType}</p>
          <p>{job.jd}</p>
          <div className="keyword-row">
            {analysis.keywords.map((keyword) => (
              <Badge key={keyword} tone="blue">{keyword}</Badge>
            ))}
          </div>
        </div>

        <div className="panel-section">
          <div className="section-title">
            <ShieldCheck size={18} />
            <h3>风险提示</h3>
          </div>
          <p>{analysis.risk}</p>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">
          <ClipboardList size={18} />
          <h3>你需要重点准备</h3>
        </div>
        <ul className="prepare-list">
          {analysis.focus.map((item) => (
            <li key={item}>
              <CheckCircle2 size={17} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-section">
        <div className="section-title">
          <Sparkles size={18} />
          <h3>高概率面试题</h3>
        </div>
        <div className="question-list">
          {analysis.interview.map((item, index) => (
            <div key={item} className="question-item">
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImportBox({ onImport }) {
  const [rawText, setRawText] = useState('');
  const [message, setMessage] = useState('');

  function handleImport() {
    try {
      const parsed = parsePastedJob(rawText);
      onImport(parsed);
      setRawText('');
      setMessage(`已导入：${parsed.company} · ${parsed.title}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <aside className="import-box">
      <div className="section-title">
        <Upload size={18} />
        <h3>采集入口</h3>
      </div>
      <p>粘贴 Boss / 智联 / 猎聘页面文本或 JD，系统会抽取岗位、公司、薪资、地点、规模、融资和性质，并加入列表。</p>
      <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="示例：&#10;BOSS直聘&#10;AI 产品经理&#10;云启智能科技&#10;北京 25-40K·14薪 3-5年 本科&#10;100-499人 B轮 民企&#10;负责大模型知识库产品规划..." />
      <button disabled={!rawText.trim()} onClick={handleImport} type="button">
        <Sparkles size={17} />
        解析粘贴内容
      </button>
      {message && <p className={message.startsWith('已导入') ? 'import-message success' : 'import-message error'}>{message}</p>}
      <div className="parser-hints">
        <span>可识别：薪资</span>
        <span>城市</span>
        <span>经验</span>
        <span>学历</span>
        <span>融资</span>
        <span>性质</span>
      </div>
    </aside>
  );
}

function LiveSearchBox({ onLoad }) {
  const [liveKeyword, setLiveKeyword] = useState('AI 产品经理');
  const [liveCity, setLiveCity] = useState('北京');
  const [livePage, setLivePage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setStatus('正在通过 MCP 真实搜索招聘平台，通常需要 5-20 秒...');
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: liveKeyword,
          city: liveCity,
          page: Number(livePage) || 1,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || '真实搜索失败。');
      if (!Array.isArray(payload.jobs) || payload.jobs.length === 0) throw new Error('本次搜索没有拿到岗位，换个关键词或城市试试。');
      onLoad(payload.jobs);
      setStatus(`已抓取 ${payload.jobs.length} 条真实岗位，来源：mcp-jobs`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadLatest() {
    setLoading(true);
    setStatus('正在读取本地真实搜索结果...');
    try {
      const response = await fetch(`/data/jobs/latest.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('没有找到真实搜索结果，请先运行 npm run jobs:search。');
      const payload = await response.json();
      if (!Array.isArray(payload.jobs) || payload.jobs.length === 0) throw new Error('结果文件存在，但没有岗位数据。');
      onLoad(payload.jobs);
      setStatus(`已加载 ${payload.jobs.length} 条真实岗位，抓取时间 ${new Date(payload.fetchedAt).toLocaleString()}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="live-box">
      <div className="section-title">
        <Wifi size={18} />
        <h3>MCP 真实搜索</h3>
      </div>
      <p>直接从前端触发本地 MCP 抓取，拿到真实岗位后自动加入列表。</p>
      <div className="live-form">
        <label>
          <span>关键词</span>
          <input value={liveKeyword} onChange={(event) => setLiveKeyword(event.target.value)} />
        </label>
        <label>
          <span>城市</span>
          <input value={liveCity} onChange={(event) => setLiveCity(event.target.value)} />
        </label>
        <label>
          <span>页码</span>
          <input min="1" type="number" value={livePage} onChange={(event) => setLivePage(event.target.value)} />
        </label>
      </div>
      <button disabled={loading || !liveKeyword.trim()} onClick={handleSearch} type="button">
        <Sparkles size={17} />
        {loading ? '搜索中...' : '开始真实搜索'}
      </button>
      <button className="secondary-button" disabled={loading} onClick={handleLoadLatest} type="button">
        加载最近一次结果
      </button>
      {status && <p className={status.startsWith('已') ? 'import-message success' : 'import-message error'}>{status}</p>}
    </aside>
  );
}

function App() {
  const [jobItems, setJobItems] = useState(jobs);
  const [query, setQuery] = useState('大模型 产品');
  const [platform, setPlatform] = useState('全部');
  const [ownership, setOwnership] = useState('全部');
  const [selected, setSelected] = useState(jobs[0]);

  const enrichedJobs = useMemo(() => {
    return jobItems
      .map((job) => ({ ...job, score: scoreJob(job, query) }))
      .filter((job) => platform === '全部' || job.source === platform)
      .filter((job) => ownership === '全部' || job.ownership === ownership)
      .filter((job) => {
        const q = normalize(query);
        if (!q) return true;
        return q.split(/\s+/).every((word) => normalize(`${job.title} ${job.company} ${job.industry} ${job.tags.join(' ')} ${job.jd}`).includes(word));
      })
      .sort((a, b) => b.score - a.score);
  }, [jobItems, query, platform, ownership]);

  const activeJob = enrichedJobs.find((job) => job.id === selected.id) || enrichedJobs[0] || selected;

  function handleImport(job) {
    setJobItems((current) => [job, ...current]);
    setSelected(job);
    setQuery('');
    setPlatform('全部');
    setOwnership('全部');
  }

  function handleLoadLiveJobs(liveJobs) {
    setJobItems((current) => {
      const seen = new Set();
      return [...liveJobs, ...current].filter((job) => {
        const key = `${job.company}-${job.title}-${job.salary}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    setSelected(liveJobs[0]);
    setQuery('');
    setPlatform('全部');
    setOwnership('全部');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h1>求职情报 Agent</h1>
            <p>抓岗位、看公司、拆 JD、列准备清单</p>
          </div>
        </div>
        <div className="top-actions">
          <Badge tone="green">MVP 原型</Badge>
          <Badge>Boss / 智联 / 猎聘</Badge>
        </div>
      </header>

      <section className="search-band">
        <div className="search-box">
          <Search size={20} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入方向、岗位、城市或技能，例如：上海 AI 产品 RAG" />
        </div>
        <div className="filters">
          <Filter size={18} />
          <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {platforms.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={ownership} onChange={(event) => setOwnership(event.target.value)}>
            {ownerships.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="summary-strip">
        <Stat icon={BriefcaseBusiness} label="岗位" value={`${enrichedJobs.length} 个`} />
        <Stat icon={Building2} label="公司" value={`${new Set(enrichedJobs.map((job) => job.company)).size} 家`} />
        <Stat icon={MapPin} label="城市" value={`${new Set(enrichedJobs.map((job) => job.city)).size} 个`} />
        <Stat icon={GraduationCap} label="主流要求" value="本科 / 3-5年" />
      </section>

      <div className="workspace">
        <section className="left-rail">
          <div className="rail-title">
            <h2>岗位列表</h2>
            <span>按推荐度排序</span>
          </div>
          <div className="job-list">
            {enrichedJobs.map((job) => (
              <JobCard key={job.id} job={job} selected={activeJob.id === job.id} score={job.score} onSelect={setSelected} />
            ))}
            {!enrichedJobs.length && (
              <div className="empty-state">
                <p>没有匹配结果，换一个关键词试试。</p>
              </div>
            )}
          </div>
        </section>

        <section className="main-content">
          <div className="detail-title">
            <div>
              <h2>{activeJob.title}</h2>
              <p>{activeJob.city} · {activeJob.experience} · {activeJob.education}</p>
            </div>
            <button type="button">
              保存到投递池
              <ChevronRight size={17} />
            </button>
          </div>
          <DetailPanel job={activeJob} />
        </section>

        <div className="right-rail">
          <LiveSearchBox onLoad={handleLoadLiveJobs} />
          <ImportBox onImport={handleImport} />
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
