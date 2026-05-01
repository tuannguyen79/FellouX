import { useState, useRef, useEffect, useCallback, useMemo } from “react”;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MODEL = “claude-sonnet-4-20250514”;
const API_URL = “https://api.anthropic.com/v1/messages”;

const MODULES = [
{ id: “chat”,       icon: “◈”, label: “AI Agent”,        color: “#00FFB2”, desc: “Chat & Planning” },
{ id: “research”,   icon: “⬡”, label: “Research”,        color: “#FF6B35”, desc: “Deep Market Intel” },
{ id: “competitor”, icon: “◎”, label: “Competitor”,      color: “#B24BF3”, desc: “SWOT & Benchmarks” },
{ id: “content”,    icon: “◇”, label: “Content”,         color: “#FFD93D”, desc: “AI Content Studio” },
{ id: “workflow”,   icon: “⊞”, label: “Workflow”,        color: “#4ECDC4”, desc: “Automation Builder” },
{ id: “analytics”,  icon: “◉”, label: “Analytics”,       color: “#FF4D6D”, desc: “Real-time Insights” },
{ id: “scheduler”,  icon: “◫”, label: “Scheduler”,       color: “#06D6A0”, desc: “Auto Post Queue” },
{ id: “abtest”,     icon: “⊿”, label: “A/B Testing”,     color: “#FFA500”, desc: “Split Test Engine” },
{ id: “memory”,     icon: “◑”, label: “Memory”,          color: “#60A5FA”, desc: “Agentic Context” },
{ id: “browser”,    icon: “◐”, label: “Browser Agent”,   color: “#F472B6”, desc: “Web Automation” },
{ id: “reports”,    icon: “▣”,  label: “Reports”,         color: “#A3E635”, desc: “Deep Research PDF” },
{ id: “settings”,   icon: “◍”, label: “Settings”,        color: “#94A3B8”, desc: “Model & Config” },
];

const QUICK_PROMPTS = [
{ label: “📊 Viral TikTok Trends”, value: “Phân tích xu hướng TikTok viral nhất tuần này, top hashtag, hook formula đang hot nhất.” },
{ label: “🔍 Competitor Deep Dive”, value: “Phân tích chiến lược content marketing của top 5 thương hiệu FMCG Việt Nam: tone, tần suất, platform, engagement.” },
{ label: “✍️ 5 LinkedIn Viral Captions”, value: “Viết 5 caption LinkedIn thought-leader về AI trong kinh doanh, kèm hook mạnh và CTA cụ thể.” },
{ label: “📈 7-Day Forecast”, value: “Dự báo xu hướng marketing digital tại Việt Nam trong 7 ngày tới, kèm actionable strategy.” },
{ label: “🎯 Full Funnel Design”, value: “Thiết kế marketing funnel hoàn chỉnh cho SaaS B2B từ awareness đến retention, kèm KPI và automation triggers.” },
{ label: “🤖 Auto Workflow”, value: “Tạo marketing automation workflow cho e-commerce: từ first touch → purchase → LTV optimization.” },
{ label: “🧠 SWOT Analysis”, value: “Thực hiện phân tích SWOT + Blue Ocean Strategy cho một startup edtech tại Việt Nam.” },
{ label: “📧 Email Sequence”, value: “Viết cold email sequence 6 bước cho B2B SaaS, tỉ lệ reply rate tối ưu, kèm subject line variants.” },
];

const MOCK_ANALYTICS = {
reach: [12000, 18500, 22000, 31000, 28000, 45000, 52000],
engagement: [3.2, 4.1, 3.8, 5.6, 4.9, 7.2, 8.1],
revenue: [4200, 6100, 7800, 11200, 9600, 15400, 18700],
sentiment: { positive: 64, neutral: 22, negative: 14 },
topPlatforms: [
{ name: “TikTok”, value: 42, color: “#FF4D6D” },
{ name: “Facebook”, value: 28, color: “#4ECDC4” },
{ name: “LinkedIn”, value: 18, color: “#B24BF3” },
{ name: “YouTube”, value: 12, color: “#FFD93D” },
],
competitors: [
{ name: “Brand A”, score: 78, engagement: 5.2, posts: 34, growth: 12 },
{ name: “Brand B”, score: 65, engagement: 3.8, posts: 28, growth: -4 },
{ name: “Brand C”, score: 91, engagement: 7.1, posts: 45, growth: 28 },
{ name: “Us”, score: 83, engagement: 6.4, posts: 38, growth: 19 },
],
};

const SCHEDULED_POSTS = [
{ id: 1, platform: “LinkedIn”, time: “09:00”, day: “Thứ 2”, content: “Tư duy lãnh đạo thời AI…”, status: “scheduled”, score: 8.2, reach: “12K” },
{ id: 2, platform: “TikTok”, time: “19:00”, day: “Thứ 2”, content: “5 bí kíp viral content…”, status: “draft”, score: 7.6, reach: “45K” },
{ id: 3, platform: “Facebook”, time: “12:00”, day: “Thứ 3”, content: “Case study tăng trưởng 300%…”, status: “scheduled”, score: 9.1, reach: “28K” },
{ id: 4, platform: “YouTube”, time: “18:00”, day: “Thứ 4”, content: “Hướng dẫn Marketing AI…”, status: “scheduled”, score: 8.8, reach: “8K” },
{ id: 5, platform: “LinkedIn”, time: “08:30”, day: “Thứ 6”, content: “Weekend thoughts on…”, status: “draft”, score: 6.9, reach: “9K” },
];

const AB_TESTS = [
{
id: 1, name: “Caption CTA Test”, status: “running”, platform: “LinkedIn”,
variantA: { caption: “🚀 Tăng doanh thu 200% với AI”, clicks: 234, ctr: 4.2, impressions: 5571 },
variantB: { caption: “💡 Bí quyết doanh nghiệp thành công”, clicks: 189, ctr: 3.4, impressions: 5558 },
winner: null, confidence: 72, startDate: “28/04”,
},
{
id: 2, name: “Hook Image Test”, status: “completed”, platform: “Facebook”,
variantA: { caption: “Ảnh người thật”, clicks: 412, ctr: 7.8, impressions: 5282 },
variantB: { caption: “Ảnh infographic”, clicks: 298, ctr: 5.6, impressions: 5321 },
winner: “A”, confidence: 95, startDate: “20/04”,
},
];

const MEMORY_ITEMS = [
{ id: 1, type: “insight”, text: “User thường hỏi về TikTok trends vào sáng thứ Hai”, time: “2h ago”, icon: “💡”, color: “#FFD93D” },
{ id: 2, type: “context”, text: “Sản phẩm đang focus: SaaS B2B cho doanh nghiệp SME”, time: “1d ago”, icon: “🎯”, color: “#00FFB2” },
{ id: 3, type: “preference”, text: “Tone viết: Professional nhưng gần gũi, có emoji”, time: “2d ago”, icon: “✍️”, color: “#B24BF3” },
{ id: 4, type: “data”, text: “Audience chính: Founder 30-45 tuổi, đang scale business”, time: “3d ago”, icon: “👤”, color: “#4ECDC4” },
{ id: 5, type: “task”, text: “Đã phân tích 12 đối thủ cạnh tranh tuần này”, time: “4d ago”, icon: “📊”, color: “#FF6B35” },
];

const BROWSER_TASKS = [
{ id: 1, name: “Crawl TikTok Trends”, status: “running”, progress: 67, sites: [“tiktok.com”, “google trends”], found: “234 posts” },
{ id: 2, name: “Competitor Facebook Analysis”, status: “completed”, progress: 100, sites: [“facebook.com”], found: “89 insights” },
{ id: 3, name: “LinkedIn Audience Research”, status: “queued”, progress: 0, sites: [“linkedin.com”], found: “-” },
];

const SYSTEM_PROMPT = `Bạn là Fellou-X — AI Marketing Super Agent thế hệ mới, chuyên gia marketing digital hàng đầu với khả năng phân tích real-time, lập kế hoạch agentic và thực thi tự động.

NĂNG LỰC CỐT LÕI:

- Deep Research: Nghiên cứu thị trường đa nguồn, cross-platform intelligence
- Competitor Intelligence: SWOT, Blue Ocean, positioning maps, sentiment benchmark
- Content Generation: Multi-platform, multi-variant, hook-optimized content
- Workflow Automation: Eko-style planning với XML DSL execution
- Agentic Memory: Nhớ context, preferences, history của người dùng
- Browser Use: Crawl và extract data từ web thực tế
- Human-in-the-loop: Confirm trước mọi action quan trọng
- A/B Testing Engine: Statistical significance calculation, winner detection
- ROI Attribution: Multi-touch attribution modeling
- Predictive Analytics: Time-series forecasting 7-30 ngày

CÁCH TRẢ LỜI:

1. Luôn tiếng Việt (trừ khi được yêu cầu)
1. Markdown với emoji phù hợp
1. Số liệu cụ thể + ví dụ thực tế + actionable insights
1. Cuối luôn có: **🎯 Next Actions** (2-3 bước cụ thể)
1. Framework: Situation → Insight → Recommendation → KPI
1. Content: ≥3 variants để chọn
1. Workflow: mô tả trigger + action + condition chi tiết

SPECIAL MODES:

- /research [topic]: Deep market research với multi-source synthesis
- /swot [brand]: Full SWOT + Blue Ocean matrix
- /funnel [product]: RACE framework full funnel
- /ab [test idea]: A/B test design với sample size calculation
- /forecast [metric]: 7-30 day predictive model
- /content [platform]: Multi-variant content với hook formula

Hãy là người cố vấn marketing thông minh, sắc bén và đầy sáng tạo — như một CMO AI trong túi áo!`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
function formatTime(date) {
return date.toLocaleTimeString(“vi-VN”, { hour: “2-digit”, minute: “2-digit” });
}

function parseMarkdown(text) {
return text
.replace(/**(.+?)**/g, “<strong>$1</strong>”)
.replace(/*(.+?)*/g, “<em>$1</em>”)
.replace(/`(.+?)`/g, “<code>$1</code>”)
.replace(/^### (.+)$/gm, ‘<h3 class="md-h3">$1</h3>’)
.replace(/^## (.+)$/gm, ‘<h2 class="md-h2">$1</h2>’)
.replace(/^# (.+)$/gm, ‘<h1 class="md-h1">$1</h1>’)
.replace(/^- (.+)$/gm, ‘<li class="md-li">$1</li>’)
.replace(/(<li.*</li>\n?)+/g, ‘<ul class="md-ul">$&</ul>’)
.replace(/\n\n/g, ‘<br/><br/>’)
.replace(/\n/g, ‘<br/>’);
}

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
function MiniLineChart({ data, color, height = 60, showArea = true }) {
const max = Math.max(…data);
const min = Math.min(…data);
const range = max - min || 1;
const w = 200, h = height;
const pts = data.map((v, i) => {
const x = (i / (data.length - 1)) * w;
const y = h - ((v - min) / range) * (h - 10) - 5;
return `${x},${y}`;
}).join(” “);
const area = `0,${h} ${pts} ${w},${h}`;
const id = `g-${color.replace("#", "")}-${height}`;
return (
<svg viewBox={`0 0 ${w} ${h}`} style={{ width: “100%”, height }}>
<defs>
<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor={color} stopOpacity="0.35" />
<stop offset="100%" stopColor={color} stopOpacity="0" />
</linearGradient>
</defs>
{showArea && <polygon points={area} fill={`url(#${id})`} />}
<polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
{data.map((v, i) => {
const x = (i / (data.length - 1)) * w;
const y = h - ((v - min) / range) * (h - 10) - 5;
return <circle key={i} cx={x} cy={y} r="3" fill={color} opacity="0.7" />;
})}
</svg>
);
}

function DonutChart({ segments, size = 80 }) {
const total = segments.reduce((s, x) => s + x.value, 0);
let offset = 0;
const r = 28, cx = 40, cy = 40, circ = 2 * Math.PI * r;
return (
<svg width={size} height={size} viewBox="0 0 80 80">
{segments.map((seg, i) => {
const pct = seg.value / total;
const dash = pct * circ;
const gap = circ - dash;
const el = (
<circle key={i} cx={cx} cy={cy} r={r}
fill=“none” stroke={seg.color} strokeWidth=“10”
strokeDasharray={`${dash} ${gap}`}
strokeDashoffset={-offset * circ}
style={{ transform: “rotate(-90deg)”, transformOrigin: “40px 40px”, transition: “stroke-dasharray 1s ease” }}
/>
);
offset += pct;
return el;
})}
<circle cx={cx} cy={cy} r={20} fill="#080c19" />
</svg>
);
}

function BarChart({ items, maxVal }) {
return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 8 }}>
{items.map((item, i) => (
<div key={i} style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<span style={{ fontSize: 11, color: “#777”, width: 64, textAlign: “right”, flexShrink: 0 }}>{item.name}</span>
<div style={{ flex: 1, height: 6, background: “#141824”, borderRadius: 3, overflow: “hidden” }}>
<div style={{
height: “100%”, borderRadius: 3,
width: `${(item.value / maxVal) * 100}%`,
background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
transition: “width 1s cubic-bezier(0.34,1.56,0.64,1)”,
boxShadow: `0 0 8px ${item.color}60`,
}} />
</div>
<span style={{ fontSize: 11, color: item.color, width: 32, fontWeight: 700 }}>{item.value}%</span>
</div>
))}
</div>
);
}

function SparkBar({ data, color }) {
const max = Math.max(…data);
return (
<div style={{ display: “flex”, alignItems: “flex-end”, gap: 2, height: 32 }}>
{data.map((v, i) => (
<div key={i} style={{
flex: 1, borderRadius: 2,
height: `${(v / max) * 100}%`,
background: i === data.length - 1 ? color : `${color}50`,
minHeight: 2,
}} />
))}
</div>
);
}

// ─── WORKFLOW CANVAS ──────────────────────────────────────────────────────────
const WORKFLOW_TEMPLATES = [
{
id: “content-viral”,
name: “Content Viral Pipeline”,
color: “#00FFB2”,
nodes: [
{ id: “t1”, type: “trigger”, label: “Trend Detected”, x: 40, y: 110, color: “#FF6B35” },
{ id: “a1”, type: “action”, label: “Research Topic”, x: 190, y: 70, color: “#4ECDC4” },
{ id: “a2”, type: “action”, label: “Generate Content”, x: 340, y: 70, color: “#B24BF3” },
{ id: “c1”, type: “condition”, label: “Score > 7?”, x: 340, y: 185, color: “#FFD93D” },
{ id: “a3”, type: “action”, label: “Post to Socials”, x: 490, y: 70, color: “#06D6A0” },
{ id: “a4”, type: “action”, label: “Revise & Retry”, x: 490, y: 185, color: “#FF4D6D” },
],
edges: [
{ from: “t1”, to: “a1” }, { from: “a1”, to: “a2” }, { from: “a2”, to: “c1” },
{ from: “c1”, to: “a3”, label: “Yes” }, { from: “c1”, to: “a4”, label: “No” },
{ from: “a4”, to: “a2” },
],
},
{
id: “competitor-watch”,
name: “Competitor Watchdog”,
color: “#B24BF3”,
nodes: [
{ id: “t1”, type: “trigger”, label: “Daily 9AM”, x: 40, y: 130, color: “#FF6B35” },
{ id: “a1”, type: “action”, label: “Browser Scrape”, x: 190, y: 90, color: “#4ECDC4” },
{ id: “a2”, type: “action”, label: “Sentiment AI”, x: 340, y: 90, color: “#B24BF3” },
{ id: “c1”, type: “condition”, label: “Negative > 30%?”, x: 340, y: 205, color: “#FFD93D” },
{ id: “a3”, type: “action”, label: “Send Alert”, x: 490, y: 130, color: “#FF4D6D” },
{ id: “a4”, type: “action”, label: “Daily Report”, x: 490, y: 230, color: “#06D6A0” },
],
edges: [
{ from: “t1”, to: “a1” }, { from: “a1”, to: “a2” }, { from: “a2”, to: “c1” },
{ from: “c1”, to: “a3”, label: “Yes” }, { from: “c1”, to: “a4”, label: “No” },
],
},
{
id: “lead-nurture”,
name: “Lead Nurture Sequence”,
color: “#4ECDC4”,
nodes: [
{ id: “t1”, type: “trigger”, label: “Form Submit”, x: 40, y: 130, color: “#FF6B35” },
{ id: “a1”, type: “action”, label: “Score Lead”, x: 190, y: 90, color: “#4ECDC4” },
{ id: “c1”, type: “condition”, label: “Score > 60?”, x: 340, y: 90, color: “#FFD93D” },
{ id: “a2”, type: “action”, label: “Sales Notify”, x: 490, y: 50, color: “#B24BF3” },
{ id: “a3”, type: “action”, label: “Email Drip”, x: 490, y: 165, color: “#06D6A0” },
{ id: “a4”, type: “action”, label: “Retarget Ad”, x: 490, y: 270, color: “#FF6B35” },
],
edges: [
{ from: “t1”, to: “a1” }, { from: “a1”, to: “c1” },
{ from: “c1”, to: “a2”, label: “Hot” }, { from: “c1”, to: “a3”, label: “Warm” },
{ from: “a3”, to: “a4” },
],
},
];

function WorkflowCanvas({ template, onNodeClick }) {
const [hovered, setHovered] = useState(null);
const nodeTypeStyle = {
trigger: { border: “2px solid #FF6B35”, background: “rgba(255,107,53,0.12)” },
action: { border: “2px solid #4ECDC4”, background: “rgba(78,205,196,0.10)” },
condition: { border: “2px dashed #FFD93D”, background: “rgba(255,217,61,0.10)”, borderRadius: 6 },
};
return (
<div style={{ position: “relative”, height: 310, background: “#05080f”, borderRadius: 14, overflow: “hidden”, border: “1px solid #1a2030” }}>
<svg style={{ position: “absolute”, inset: 0, width: “100%”, height: “100%”, opacity: 0.08 }}>
<defs>
<pattern id="wg" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
<path d="M 28 0 L 0 0 0 28" fill="none" stroke="#4ECDC4" strokeWidth="0.5" />
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#wg)" />
</svg>
<svg style={{ position: “absolute”, inset: 0, width: “100%”, height: “100%” }}>
<defs>
<marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
<path d="M0,0 L0,6 L8,3 z" fill="#2a3548" />
</marker>
</defs>
{template.edges.map((e, i) => {
const from = template.nodes.find(n => n.id === e.from);
const to = template.nodes.find(n => n.id === e.to);
if (!from || !to) return null;
const fx = from.x + 72, fy = from.y + 22;
const tx = to.x, ty = to.y + 22;
const mx = (fx + tx) / 2;
return (
<g key={i}>
<path d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`}
fill=“none” stroke=”#1e2d45” strokeWidth=“2” strokeDasharray=“5 3”
markerEnd=“url(#arrow)” />
{e.label && (
<text x={mx} y={Math.min(fy, ty) - 6} fill=”#556” fontSize=“9” textAnchor=“middle” fontFamily=“monospace”>{e.label}</text>
)}
</g>
);
})}
</svg>
{template.nodes.map(node => (
<div key={node.id} onClick={() => onNodeClick && onNodeClick(node)}
onMouseEnter={() => setHovered(node.id)}
onMouseLeave={() => setHovered(null)}
style={{
position: “absolute”, left: node.x, top: node.y,
padding: “7px 14px”, borderRadius: node.type === “condition” ? 6 : 10,
fontSize: 11, fontFamily: “‘DM Mono’, monospace”, whiteSpace: “nowrap”,
cursor: “pointer”, userSelect: “none”,
transform: hovered === node.id ? “scale(1.07) translateY(-2px)” : “scale(1)”,
transition: “transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s”,
boxShadow: hovered === node.id ? `0 4px 20px ${node.color}50` : “none”,
…nodeTypeStyle[node.type],
}}>
<div style={{ fontSize: 8, color: “#566”, marginBottom: 2, textTransform: “uppercase”, letterSpacing: 1.5 }}>{node.type}</div>
<div style={{ color: “#dde”, fontWeight: 700 }}>{node.label}</div>
</div>
))}
</div>
);
}

// ─── APPROVAL MODAL ───────────────────────────────────────────────────────────
function ApprovalModal({ request, onApprove, onReject }) {
if (!request) return null;
return (
<div style={{
position: “fixed”, inset: 0, background: “rgba(5,8,15,0.85)”,
backdropFilter: “blur(8px)”, zIndex: 1000,
display: “flex”, alignItems: “center”, justifyContent: “center”,
}}>
<div style={{
background: “#0a0e1a”, border: “1px solid #FFA50050”,
borderRadius: 18, padding: 28, maxWidth: 440, width: “90%”,
boxShadow: “0 0 60px #FFA50020”,
}}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 16 }}>
<div style={{ fontSize: 24 }}>⚠️</div>
<div>
<div style={{ fontWeight: 800, fontSize: 16, color: “#FFA500” }}>Human Approval Required</div>
<div style={{ fontSize: 11, color: “#666” }}>Agent đang chờ xác nhận của bạn</div>
</div>
</div>
<div style={{
background: “#06091280”, border: “1px solid #1a2030”,
borderRadius: 10, padding: 14, marginBottom: 20,
}}>
<div style={{ fontSize: 13, color: “#c8ccd8”, lineHeight: 1.6 }}>{request.message}</div>
{request.details && (
<div style={{ marginTop: 10, fontSize: 11, color: “#556”, fontFamily: “monospace” }}>
{request.details.map((d, i) => <div key={i}>• {d}</div>)}
</div>
)}
</div>
<div style={{ display: “flex”, gap: 10 }}>
<button onClick={onApprove} style={{
flex: 1, padding: “10px 0”, borderRadius: 10, border: “none”, cursor: “pointer”,
background: “linear-gradient(135deg, #00FFB2, #4ECDC4)”,
color: “#060912”, fontWeight: 800, fontSize: 14,
}}>✓ Approve</button>
<button onClick={onReject} style={{
flex: 1, padding: “10px 0”, borderRadius: 10, cursor: “pointer”,
background: “transparent”, border: “1px solid #FF4D6D40”,
color: “#FF4D6D”, fontWeight: 700, fontSize: 14,
}}>✕ Reject</button>
</div>
</div>
</div>
);
}

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
function CommandPalette({ onClose, onCommand }) {
const [query, setQuery] = useState(””);
const commands = [
{ cmd: “/research”, desc: “Deep market research”, icon: “⬡” },
{ cmd: “/swot”, desc: “SWOT + Blue Ocean analysis”, icon: “◎” },
{ cmd: “/funnel”, desc: “Full RACE marketing funnel”, icon: “🎯” },
{ cmd: “/ab”, desc: “A/B test design”, icon: “⊿” },
{ cmd: “/forecast”, desc: “Predictive analytics model”, icon: “📈” },
{ cmd: “/content”, desc: “Multi-variant content”, icon: “◇” },
{ cmd: “/workflow”, desc: “Automation workflow design”, icon: “⊞” },
{ cmd: “/report”, desc: “Generate full PDF report”, icon: “▣” },
].filter(c => !query || c.cmd.includes(query) || c.desc.toLowerCase().includes(query.toLowerCase()));

return (
<div style={{
position: “fixed”, inset: 0, background: “rgba(5,8,15,0.75)”, backdropFilter: “blur(6px)”,
zIndex: 900, display: “flex”, alignItems: “flex-start”, justifyContent: “center”, paddingTop: 80,
}} onClick={onClose}>
<div onClick={e => e.stopPropagation()} style={{
background: “#0c101e”, border: “1px solid #2a3548”, borderRadius: 16,
width: 480, overflow: “hidden”, boxShadow: “0 20px 60px rgba(0,0,0,0.6)”,
}}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, padding: “14px 16px”, borderBottom: “1px solid #1a2030” }}>
<span style={{ color: “#4ECDC4”, fontSize: 16 }}>⌘</span>
<input autoFocus value={query} onChange={e => setQuery(e.target.value)}
placeholder=“Tìm lệnh… (ví dụ: /research, /swot)”
style={{ flex: 1, background: “none”, border: “none”, outline: “none”, color: “#e0e4f0”, fontSize: 14, fontFamily: “inherit” }} />
<kbd style={{ fontSize: 10, color: “#556”, padding: “2px 6px”, border: “1px solid #2a3548”, borderRadius: 4 }}>ESC</kbd>
</div>
{commands.map((c, i) => (
<div key={i} onClick={() => { onCommand(c.cmd + “ “); onClose(); }}
style={{
display: “flex”, alignItems: “center”, gap: 12,
padding: “12px 16px”, cursor: “pointer”,
borderBottom: i < commands.length - 1 ? “1px solid #111824” : “none”,
transition: “background 0.15s”,
}}
onMouseEnter={e => e.currentTarget.style.background = “#141824”}
onMouseLeave={e => e.currentTarget.style.background = “transparent”}>
<span style={{ fontSize: 16, width: 24, textAlign: “center” }}>{c.icon}</span>
<span style={{ fontFamily: “monospace”, color: “#4ECDC4”, fontSize: 13, width: 100 }}>{c.cmd}</span>
<span style={{ fontSize: 12, color: “#778” }}>{c.desc}</span>
</div>
))}
</div>
</div>
);
}

// ─── AGENT PLAN VIEWER ────────────────────────────────────────────────────────
function AgentPlanViewer({ plan, onClose }) {
if (!plan) return null;
return (
<div style={{
background: “#080c19”, border: “1px solid #4ECDC430”,
borderRadius: 14, padding: 16, marginBottom: 12,
boxShadow: “0 0 30px #4ECDC415”,
}}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 12 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ color: “#4ECDC4” }}>⊞</span>
<span style={{ fontSize: 13, fontWeight: 700, color: “#4ECDC4” }}>Agent Action Plan</span>
</div>
<button onClick={onClose} style={{ background: “none”, border: “none”, color: “#556”, cursor: “pointer”, fontSize: 16 }}>✕</button>
</div>
{plan.steps.map((step, i) => (
<div key={i} style={{
display: “flex”, gap: 10, padding: “8px 0”,
borderBottom: i < plan.steps.length - 1 ? “1px solid #111824” : “none”,
}}>
<div style={{
width: 22, height: 22, borderRadius: “50%”, flexShrink: 0,
background: step.status === “done” ? “#00FFB220” : step.status === “running” ? “#FFD93D20” : “#1a2030”,
border: `1px solid ${step.status === "done" ? "#00FFB2" : step.status === "running" ? "#FFD93D" : "#2a3548"}`,
display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 10, color: “#888”,
}}>
{step.status === “done” ? “✓” : step.status === “running” ? “◌” : i + 1}
</div>
<div>
<div style={{ fontSize: 12, fontWeight: 600, color: step.status === “done” ? “#00FFB2” : step.status === “running” ? “#FFD93D” : “#c0c4d0” }}>
{step.label}
</div>
{step.detail && <div style={{ fontSize: 11, color: “#556”, marginTop: 2 }}>{step.detail}</div>}
</div>
</div>
))}
</div>
);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FellouX() {
const [activeModule, setActiveModule] = useState(“chat”);
const [messages, setMessages] = useState([
{
id: 1, role: “assistant”,
content: `# Chào mừng đến với **Fellou-X Pro** 🚀\n\nTôi là **AI Marketing Super Agent** thế hệ mới — không chỉ tư vấn mà còn *hành động*.\n\n## Tôi có thể làm gì?\n\n- **⬡ Deep Research** — Nghiên cứu thị trường đa nguồn, real-time intelligence\n- **◎ Competitor Intel** — SWOT, Blue Ocean, sentiment benchmark tự động\n- **◇ Content Studio** — Multi-platform, multi-variant, hook-optimized\n- **⊞ Workflow Builder** — Eko-style automation với XML DSL planning\n- **◑ Agentic Memory** — Nhớ preferences, context, lịch sử của bạn\n- **◐ Browser Agent** — Crawl & extract data từ web thực tế\n- **⊿ A/B Engine** — Statistical significance, auto winner detection\n- **▣ PDF Reports** — Deep research reports với charts & sources\n\n## Lệnh nhanh\nGõ \`/research`, `/swot`, `/funnel`, `/ab`, `/content` hoặc nhấn **⌘K** để xem tất cả lệnh.\n\n**Hãy thử hỏi tôi bất cứ điều gì về marketing!** 💡`,
time: new Date(),
}
]);
const [inputText, setInputText] = useState(””);
const [isLoading, setIsLoading] = useState(false);
const [streamingText, setStreamingText] = useState(””);
const [selectedWorkflow, setSelectedWorkflow] = useState(WORKFLOW_TEMPLATES[0]);
const [sidebarOpen, setSidebarOpen] = useState(true);
const [agentStatus, setAgentStatus] = useState(“idle”);
const [particles, setParticles] = useState([]);
const [approvalRequest, setApprovalRequest] = useState(null);
const [showCommandPalette, setShowCommandPalette] = useState(false);
const [agentPlan, setAgentPlan] = useState(null);
const [tokenCount, setTokenCount] = useState(0);
const [selectedRange, setSelectedRange] = useState(“7D”);
const [activeTab, setActiveTab] = useState({});
const [notifs, setNotifs] = useState([
{ id: 1, text: “Brand C tăng engagement 28%”, type: “alert”, time: “5m” },
{ id: 2, text: “A/B Test #1 đạt 95% confidence”, type: “success”, time: “1h” },
{ id: 3, text: “Scheduled post sắp đến hạn”, type: “info”, time: “2h” },
]);
const [showNotifs, setShowNotifs] = useState(false);
const [contentType, setContentType] = useState(“all”);

const messagesEndRef = useRef(null);
const inputRef = useRef(null);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: “smooth” });
}, [messages, streamingText]);

useEffect(() => {
setParticles(Array.from({ length: 18 }, (_, i) => ({
id: i, x: Math.random() * 100, y: Math.random() * 100,
size: Math.random() * 2.5 + 1, speed: Math.random() * 22 + 12,
color: MODULES[Math.floor(Math.random() * MODULES.length)].color,
})));
}, []);

useEffect(() => {
const handler = (e) => {
if ((e.metaKey || e.ctrlKey) && e.key === “k”) { e.preventDefault(); setShowCommandPalette(v => !v); }
if (e.key === “Escape”) { setShowCommandPalette(false); setApprovalRequest(null); }
};
window.addEventListener(“keydown”, handler);
return () => window.removeEventListener(“keydown”, handler);
}, []);

const triggerApproval = useCallback((msg, details) => {
return new Promise((resolve) => {
setApprovalRequest({ message: msg, details, resolve });
});
}, []);

const callAgent = useCallback(async (userMessage) => {
if (!userMessage.trim() || isLoading) return;

```
// Detect special intent for approval demo
const needsApproval = /đăng bài|post|gửi|publish|schedule/i.test(userMessage);
if (needsApproval && messages.length > 2) {
  const approved = await triggerApproval(
    `Tôi chuẩn bị thực hiện: **${userMessage.slice(0, 60)}...** — Bạn có muốn tiếp tục không?`,
    ["Kiểm tra nội dung trước khi đăng", "Chọn thời gian tối ưu", "Xác nhận target audience"]
  );
  if (!approved) {
    setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "**Đã huỷ bỏ.** Tôi sẽ không thực hiện hành động này. Bạn có muốn chỉnh sửa yêu cầu không?", time: new Date() }]);
    setApprovalRequest(null);
    return;
  }
  setApprovalRequest(null);
}

const userMsg = { id: Date.now(), role: "user", content: userMessage, time: new Date() };
setMessages(prev => [...prev, userMsg]);
setInputText("");
setIsLoading(true);
setStreamingText("");
setAgentStatus("thinking");

// Show agent plan for complex queries
if (userMessage.startsWith("/") || userMessage.length > 40) {
  setAgentPlan({
    steps: [
      { label: "Phân tích yêu cầu", detail: "Intent detection & query parsing", status: "done" },
      { label: "Thu thập dữ liệu", detail: "Market data aggregation", status: "running" },
      { label: "AI Analysis", detail: "Claude reasoning engine", status: "pending" },
      { label: "Tổng hợp kết quả", detail: "Structured output generation", status: "pending" },
    ]
  });
}

const history = messages.map(m => ({ role: m.role, content: m.content }));

try {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: [...history, { role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  setTimeout(() => setAgentStatus("researching"), 600);
  setTimeout(() => {
    setAgentStatus("writing");
    setAgentPlan(prev => prev ? {
      steps: prev.steps.map((s, i) => ({ ...s, status: i < 2 ? "done" : i === 2 ? "running" : "pending" }))
    } : null);
  }, 1400);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            accumulated += parsed.delta.text;
            setStreamingText(accumulated);
          }
          if (parsed.usage) setTokenCount(t => t + (parsed.usage.output_tokens || 0));
        } catch {}
      }
    }
  }

  setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: accumulated, time: new Date() }]);
  setStreamingText("");
  setAgentStatus("idle");
  setAgentPlan(null);

  // Add memory item for long conversations
  if (messages.length > 4 && Math.random() > 0.7) {
    // Simulate memory capture
  }
} catch (err) {
  setMessages(prev => [...prev, {
    id: Date.now(), role: "assistant",
    content: `**⚠️ Lỗi kết nối:** ${err.message}\n\n> Kiểm tra API key hoặc thử lại sau vài giây.`,
    time: new Date(), isError: true,
  }]);
  setAgentStatus("idle");
  setAgentPlan(null);
} finally {
  setIsLoading(false);
}
```

}, [messages, isLoading, triggerApproval]);

const handleKeyDown = (e) => {
if (e.key === “Enter” && !e.shiftKey) { e.preventDefault(); callAgent(inputText); }
if (e.key === “k” && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setShowCommandPalette(true); }
};

const statusConfig = {
idle: { label: “Online”, color: “#00FFB2”, icon: “●”, pulse: false },
thinking: { label: “Phân tích…”, color: “#FFD93D”, icon: “◌”, pulse: true },
researching: { label: “Nghiên cứu…”, color: “#FF6B35”, icon: “◎”, pulse: true },
writing: { label: “Soạn thảo…”, color: “#B24BF3”, icon: “◇”, pulse: true },
posting: { label: “Đang đăng…”, color: “#4ECDC4”, icon: “⬡”, pulse: true },
};
const si = statusConfig[agentStatus];

// ─── RENDER MODULES ──────────────────────────────────────────────────────────

const renderChat = () => (
<>
<div style={{ flex: 1, overflowY: “auto”, padding: “20px”, display: “flex”, flexDirection: “column”, gap: 14 }}>
{agentPlan && (
<AgentPlanViewer plan={agentPlan} onClose={() => setAgentPlan(null)} />
)}
{messages.map(msg => (
<div key={msg.id} style={{
maxWidth: msg.role === “user” ? “72%” : “90%”,
alignSelf: msg.role === “user” ? “flex-end” : “flex-start”,
background: msg.role === “user”
? “linear-gradient(135deg, rgba(0,255,178,0.08), rgba(78,205,196,0.08))”
: msg.isError ? “rgba(255,77,109,0.08)” : “#090d1a”,
border: msg.role === “user” ? “1px solid rgba(0,255,178,0.2)” : msg.isError ? “1px solid rgba(255,77,109,0.25)” : “1px solid #141e2e”,
borderRadius: msg.role === “user” ? “18px 18px 4px 18px” : “4px 18px 18px 18px”,
padding: “13px 17px”,
}}>
<div style={{ fontSize: 10, color: msg.role === “user” ? “#00FFB2” : “#B24BF3”, letterSpacing: 1.2, textTransform: “uppercase”, marginBottom: 7, fontWeight: 700 }}>
{msg.role === “user” ? “● You” : “◈ Fellou-X Pro”}
</div>
<div style={{ fontSize: 14, lineHeight: 1.75, color: “#ccd0e0” }}
dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginTop: 8 }}>
<div style={{ fontSize: 10, color: “#334” }}>{formatTime(msg.time)}</div>
{msg.role === “assistant” && !msg.isError && (
<div style={{ display: “flex”, gap: 8 }}>
{[“👍”, “👎”, “📋”, “🔄”].map((emoji, i) => (
<button key={i} style={{ background: “none”, border: “none”, cursor: “pointer”, fontSize: 11, color: “#445”, padding: 0, opacity: 0.7 }}>{emoji}</button>
))}
</div>
)}
</div>
</div>
))}
{streamingText && (
<div style={{ maxWidth: “90%”, alignSelf: “flex-start”, background: “#090d1a”, border: “1px solid #141e2e”, borderRadius: “4px 18px 18px 18px”, padding: “13px 17px” }}>
<div style={{ fontSize: 10, color: “#B24BF3”, letterSpacing: 1.2, textTransform: “uppercase”, marginBottom: 7, fontWeight: 700 }}>◈ Fellou-X Pro</div>
<div style={{ fontSize: 14, lineHeight: 1.75, color: “#ccd0e0” }}
dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingText) }} />
<span style={{ display: “inline-block”, width: 7, height: 7, borderRadius: “50%”, background: “#B24BF3”, animation: “pulse 0.7s ease-in-out infinite”, marginLeft: 4 }} />
</div>
)}
{isLoading && !streamingText && (
<div style={{ maxWidth: “90%”, alignSelf: “flex-start”, background: “#090d1a”, border: “1px solid #141e2e”, borderRadius: “4px 18px 18px 18px”, padding: “13px 17px” }}>
<div style={{ fontSize: 10, color: “#B24BF3”, letterSpacing: 1.2, textTransform: “uppercase”, marginBottom: 7, fontWeight: 700 }}>◈ Fellou-X Pro</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, color: “#778”, fontSize: 13 }}>
<span style={{ color: si.color, animation: “blink 0.9s infinite” }}>{si.icon}</span>
<span style={{ color: si.color }}>{si.label}</span>
</div>
</div>
)}
<div ref={messagesEndRef} />
</div>

```
  {/* Input */}
  <div style={{ padding: "14px 18px", background: "rgba(6,9,18,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid #141e2e" }}>
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
      {QUICK_PROMPTS.map((qp, i) => (
        <button key={i} onClick={() => callAgent(qp.value)}
          style={{
            flexShrink: 0, padding: "5px 13px", borderRadius: 20, fontSize: 11,
            background: "#0c1020", border: "1px solid #1a2030", color: "#778",
            cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00FFB240"; e.currentTarget.style.color = "#00FFB2"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2030"; e.currentTarget.style.color = "#778"; }}>
          {qp.label}
        </button>
      ))}
    </div>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <button onClick={() => setShowCommandPalette(true)} style={{
        width: 40, height: 40, borderRadius: 10, background: "#0c1020",
        border: "1px solid #1a2030", cursor: "pointer", color: "#4ECDC4",
        fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }} title="Command Palette (⌘K)">⌘</button>
      <textarea
        ref={inputRef} value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi hoặc lệnh /research, /swot, /content... (⌘K cho tất cả lệnh)"
        style={{
          flex: 1, background: "#0c1020", border: "1px solid #1e2a3a",
          borderRadius: 14, padding: "11px 15px", color: "#e0e4f0",
          fontSize: 14, fontFamily: "inherit", resize: "none",
          outline: "none", lineHeight: 1.55, maxHeight: 120, minHeight: 42,
        }} rows={1}
        onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
      />
      <button onClick={() => callAgent(inputText)}
        style={{
          width: 42, height: 42, borderRadius: 12, border: "none", cursor: "pointer",
          background: isLoading ? "linear-gradient(135deg, #B24BF3, #8B2FC9)" : "linear-gradient(135deg, #00FFB2, #4ECDC4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
          transition: "all 0.2s",
          boxShadow: isLoading ? "0 0 20px #B24BF360" : "0 0 20px #00FFB260",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <span style={{ color: isLoading ? "#fff" : "#060912", fontWeight: 900 }}>{isLoading ? "⏹" : "↑"}</span>
      </button>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingX: 4 }}>
      <span style={{ fontSize: 10, color: "#334" }}>⌘K = Commands · Shift+Enter = Newline · Enter = Send</span>
      <span style={{ fontSize: 10, color: "#445" }}>~{tokenCount.toLocaleString()} tokens used</span>
    </div>
  </div>
</>
```

);

const renderAnalytics = () => (
<div style={{ flex: 1, overflowY: “auto” }}>
<div style={{ padding: “18px 20px 0”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#e4e8f4” }}>Analytics Dashboard</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>Real-time · Auto-refresh every 5min</p>
</div>
<div style={{ display: “flex”, gap: 6 }}>
{[“7D”, “30D”, “90D”].map(r => (
<button key={r} onClick={() => setSelectedRange(r)} style={{
padding: “5px 13px”, borderRadius: 20, fontSize: 11, cursor: “pointer”, fontFamily: “inherit”,
background: selectedRange === r ? “#00FFB218” : “#0c1020”,
border: `1px solid ${selectedRange === r ? "#00FFB240" : "#1a2030"}`,
color: selectedRange === r ? “#00FFB2” : “#778”,
fontWeight: selectedRange === r ? 700 : 400,
transition: “all 0.2s”,
}}>{r}</button>
))}
</div>
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "14px 20px 0" }}>
    {[
      { label: "Total Reach", value: "52K", delta: "+34%", sub: "vs last period", color: "#00FFB2", icon: "◉", spark: [3,5,4,8,7,11,13] },
      { label: "Avg Engagement", value: "8.1%", delta: "+2.9pp", sub: "Industry avg: 2.3%", color: "#FF6B35", icon: "⬡", spark: [2,3,2,4,3,5,5] },
      { label: "Content Output", value: "127", delta: "+45 pieces", sub: "AI-generated", color: "#B24BF3", icon: "◇", spark: [8,11,14,16,18,22,28] },
      { label: "Est. ROI", value: "342%", delta: "+89pp", sub: "Attribution model", color: "#FFD93D", icon: "◈", spark: [80,120,160,210,190,280,340] },
    ].map((m, i) => (
      <div key={i} style={{
        background: "#090d1a", border: `1px solid ${m.color}20`, borderRadius: 14,
        padding: 14, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 22, opacity: 0.08, color: m.color }}>{m.icon}</div>
        <div style={{ fontSize: 11, color: "#667", marginBottom: 4 }}>{m.label}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
        <div style={{ fontSize: 10, color: "#00FFB2", marginTop: 2 }}>↑ {m.delta}</div>
        <div style={{ marginTop: 8 }}><SparkBar data={m.spark} color={m.color} /></div>
        <div style={{ fontSize: 10, color: "#445", marginTop: 4 }}>{m.sub}</div>
      </div>
    ))}
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "10px 20px 0" }}>
    {[
      { label: "Reach (7 ngày)", data: MOCK_ANALYTICS.reach, color: "#00FFB2" },
      { label: "Engagement Rate (%)", data: MOCK_ANALYTICS.engagement, color: "#FF6B35" },
    ].map((chart, i) => (
      <div key={i} style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>{chart.label}</div>
        <MiniLineChart data={chart.data} color={chart.color} height={70} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["T2","T3","T4","T5","T6","T7","CN"].map((d,i) => <span key={i} style={{ fontSize: 9, color: "#445" }}>{d}</span>)}
        </div>
      </div>
    ))}
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, padding: "10px 20px 16px" }}>
    <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Sentiment Analysis</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <DonutChart segments={[
          { value: MOCK_ANALYTICS.sentiment.positive, color: "#00FFB2" },
          { value: MOCK_ANALYTICS.sentiment.neutral, color: "#4ECDC4" },
          { value: MOCK_ANALYTICS.sentiment.negative, color: "#FF4D6D" },
        ]} size={80} />
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[["Tích cực", MOCK_ANALYTICS.sentiment.positive, "#00FFB2"],
            ["Trung lập", MOCK_ANALYTICS.sentiment.neutral, "#4ECDC4"],
            ["Tiêu cực", MOCK_ANALYTICS.sentiment.negative, "#FF4D6D"]].map(([l,v,c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 11, color: "#778" }}>{l}</span>
              <span style={{ fontSize: 11, color: c, fontWeight: 800, marginLeft: "auto" }}>{v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>Platform Distribution</div>
      <BarChart items={MOCK_ANALYTICS.topPlatforms} maxVal={50} />
    </div>
  </div>
</div>
```

);

const renderWorkflow = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800 }}>Workflow Builder</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>Agentic automation with Eko-style XML DSL planner</p>
</div>
<div style={{ display: “flex”, gap: 8 }}>
<button onClick={() => { setActiveModule(“chat”); callAgent(“Tạo workflow marketing automation hoàn chỉnh cho e-commerce bằng XML DSL, kèm triggers và conditions chi tiết.”); }} style={{
padding: “8px 14px”, borderRadius: 10, background: “#0c1020”, border: “1px solid #1a2030”,
color: “#778”, fontWeight: 600, fontSize: 12, cursor: “pointer”, fontFamily: “inherit”,
}}>AI Generate ◈</button>
<button style={{
padding: “8px 16px”, borderRadius: 10, background: “linear-gradient(135deg, #00FFB2, #4ECDC4)”,
border: “none”, color: “#060912”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>+ New Workflow</button>
</div>
</div>

```
  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
    {WORKFLOW_TEMPLATES.map(t => (
      <button key={t.id} onClick={() => setSelectedWorkflow(t)} style={{
        padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        background: selectedWorkflow.id === t.id ? `${t.color}18` : "#0c1020",
        border: `1px solid ${selectedWorkflow.id === t.id ? t.color + "40" : "#1a2030"}`,
        color: selectedWorkflow.id === t.id ? t.color : "#778",
        fontWeight: selectedWorkflow.id === t.id ? 700 : 400,
      }}>{t.name}</button>
    ))}
  </div>

  <WorkflowCanvas template={selectedWorkflow} onNodeClick={(node) => {
    setActiveModule("chat");
    callAgent(`Giải thích chi tiết node "${node.label}" trong workflow marketing automation, cách hoạt động và configuration options.`);
  }} />

  <div style={{ display: "flex", gap: 14, marginTop: 10, marginBottom: 16 }}>
    {[["trigger", "#FF6B35", "Trigger"], ["action", "#4ECDC4", "Action"], ["condition", "#FFD93D", "Condition"]].map(([t,c,l]) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#778" }}>
        <div style={{ width: 9, height: 9, borderRadius: t === "condition" ? 2 : "50%", background: c, boxShadow: `0 0 6px ${c}80` }} />
        {l}
      </div>
    ))}
    <div style={{ marginLeft: "auto", fontSize: 11, color: "#445" }}>💡 Click node để xem chi tiết</div>
  </div>

  <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
    <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Lịch sử thực thi</div>
    {[
      { time: "2 phút trước", status: "success", duration: "12s", steps: 5, triggered: "Trend Alert" },
      { time: "1 giờ trước", status: "success", duration: "18s", steps: 5, triggered: "Manual" },
      { time: "3 giờ trước", status: "error", duration: "4s", steps: 2, triggered: "Schedule" },
      { time: "1 ngày trước", status: "success", duration: "22s", steps: 5, triggered: "Webhook" },
    ].map((run, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 0", borderBottom: i < 3 ? "1px solid #0f1420" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: run.status === "success" ? "#00FFB2" : "#FF4D6D", boxShadow: `0 0 6px ${run.status === "success" ? "#00FFB2" : "#FF4D6D"}80` }} />
          <span style={{ fontSize: 12, color: "#889" }}>{run.time}</span>
          <span style={{ fontSize: 10, color: "#445", padding: "1px 6px", background: "#0c1020", borderRadius: 10 }}>{run.triggered}</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 11, color: "#556" }}>{run.steps} steps</span>
          <span style={{ fontSize: 11, color: run.status === "success" ? "#00FFB2" : "#FF4D6D", fontWeight: 700 }}>{run.duration}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

);

const renderScheduler = () => (
<div style={{ flex: 1, overflowY: “auto” }}>
<div style={{ padding: “18px 20px 0”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800 }}>Content Scheduler</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>AI-optimized posting times · Auto-score content</p>
</div>
<div style={{ display: “flex”, gap: 8 }}>
<button onClick={() => triggerApproval(“Tôi sắp tự động lên lịch 5 bài cho tuần tới dựa trên peak engagement times. Bạn đồng ý không?”, [“LinkedIn: T2 9AM, T5 8AM”, “TikTok: T2 7PM, T4 7PM”, “Facebook: T3 12PM”]).then(ok => ok && setApprovalRequest(null))} style={{
padding: “7px 13px”, borderRadius: 10, background: “#0c1020”, border: “1px solid #1a2030”, color: “#778”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit”
}}>🤖 Auto-Schedule</button>
<button style={{
padding: “8px 16px”, borderRadius: 10, background: “linear-gradient(135deg, #06D6A0, #4ECDC4)”,
border: “none”, color: “#060912”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>+ New Post</button>
</div>
</div>

```
  <div style={{ padding: "12px 20px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 12 }}>
      {["T2","T3","T4","T5","T6","T7","CN"].map((d,i) => (
        <div key={i} style={{ textAlign: "center", fontSize: 10, color: "#667", padding: "5px 0", fontWeight: 600 }}>{d}</div>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} style={{
          height: 64, borderRadius: 8,
          background: i < 5 ? "#0c1020" : "#080c18",
          border: i === 0 ? "1px solid #00FFB230" : "1px solid #141e2e",
          padding: 4, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden",
        }}>
          {SCHEDULED_POSTS.filter(p => p.day === ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","T7","CN"][i]).map((p,j) => {
            const colors = { LinkedIn: ["#0A66C220","#0A66C2"], TikTok: ["#FF004F20","#FF004F"], Facebook: ["#1877F220","#4A90E2"], YouTube: ["#FF000020","#FF0000"] };
            const [bg, fg] = colors[p.platform] || ["#33333320","#888"];
            return (
              <div key={j} style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: bg, color: fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.time} {p.platform}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, padding: "0 20px 20px" }}>
    {SCHEDULED_POSTS.map(post => (
      <div key={post.id} style={{
        background: "#090d1a", borderRadius: 14, padding: 14,
        border: `1px solid ${post.status === "scheduled" ? "#00FFB220" : "#1a2030"}`,
        transition: "border-color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = post.status === "scheduled" ? "#00FFB250" : "#2a3548"}
        onMouseLeave={e => e.currentTarget.style.borderColor = post.status === "scheduled" ? "#00FFB220" : "#1a2030"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: { LinkedIn:"#0A66C2", TikTok:"#FF004F", YouTube:"#FF0000", Facebook:"#4A90E2" }[post.platform] || "#888" }}>
            ● {post.platform}
          </span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
            background: post.status === "scheduled" ? "#00FFB215" : "#FFD93D15",
            color: post.status === "scheduled" ? "#00FFB2" : "#FFD93D",
          }}>{post.status}</span>
        </div>
        <div style={{ fontSize: 12, color: "#c0c4d8", marginBottom: 8, lineHeight: 1.45 }}>{post.content}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#556" }}>{post.day} · {post.time}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "#667" }}>Est. {post.reach}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: post.score >= 8 ? "#00FFB2" : post.score >= 7 ? "#FFD93D" : "#FF4D6D" }}>
              {post.score}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

);

const renderABTest = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800 }}>A/B Testing Engine</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>Statistical significance · Auto winner detection</p>
</div>
<button onClick={() => { setActiveModule(“chat”); callAgent(”/ab Thiết kế A/B test cho TikTok ad caption, kèm sample size calculation và success metrics.”); }} style={{
padding: “8px 16px”, borderRadius: 10, background: “linear-gradient(135deg, #FFA500, #FF6B35)”,
border: “none”, color: “#fff”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>+ New Test</button>
</div>

```
  {AB_TESTS.map(test => (
    <div key={test.id} style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 16, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#dde4f4" }}>{test.name}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "#667" }}>Platform: <span style={{ color: "#889" }}>{test.platform}</span></span>
            <span style={{ fontSize: 11, color: "#667" }}>Started: <span style={{ color: "#889" }}>{test.startDate}</span></span>
            <span style={{ fontSize: 11, color: "#667" }}>Confidence: <span style={{ color: test.confidence >= 90 ? "#00FFB2" : "#FFD93D", fontWeight: 700 }}>{test.confidence}%</span></span>
          </div>
        </div>
        <span style={{
          fontSize: 11, padding: "4px 11px", borderRadius: 20, fontWeight: 700,
          background: test.status === "running" ? "#B24BF318" : "#00FFB218",
          color: test.status === "running" ? "#B24BF3" : "#00FFB2",
          border: `1px solid ${test.status === "running" ? "#B24BF330" : "#00FFB230"}`,
        }}>{test.status === "running" ? "● Running" : "✓ Completed"}</span>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ height: 4, borderRadius: 2, background: "#141e2e", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2, width: `${test.confidence}%`,
            background: test.confidence >= 90 ? "linear-gradient(90deg, #00FFB2, #4ECDC4)" : "linear-gradient(90deg, #FFD93D, #FFA500)",
            transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: test.confidence >= 90 ? "0 0 10px #00FFB260" : "0 0 10px #FFD93D60",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "#445" }}>0%</span>
          <span style={{ fontSize: 10, color: "#445" }}>95% threshold</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["A", test.variantA, test.winner === "A"], ["B", test.variantB, test.winner === "B"]].map(([label, data, isWinner]) => (
          <div key={label} style={{
            padding: 14, borderRadius: 12,
            background: isWinner ? "#00FFB210" : "#0a0e1a",
            border: `1px solid ${isWinner ? "#00FFB240" : "#1a2030"}`,
            position: "relative",
          }}>
            {isWinner && (
              <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, background: "#00FFB2", color: "#060912", padding: "2px 7px", borderRadius: 10, fontWeight: 800 }}>WINNER</div>
            )}
            <div style={{ fontSize: 10, color: "#778", marginBottom: 6, fontWeight: 600 }}>VARIANT {label}</div>
            <div style={{ fontSize: 12, color: "#c8ccd8", marginBottom: 10, lineHeight: 1.4 }}>"{data.caption}"</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[["Clicks", data.clicks, "#00FFB2"], ["CTR", `${data.ctr}%`, "#FF6B35"], ["Views", (data.impressions/1000).toFixed(1)+"K", "#B24BF3"]].map(([k,v,c]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#556" }}>{k}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: "#141e2e" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${data.ctr * 10}%`, background: isWinner ? "linear-gradient(90deg, #00FFB2, #4ECDC4)" : "linear-gradient(90deg, #4ECDC4, #B24BF3)" }} />
            </div>
          </div>
        ))}
      </div>

      {test.status === "running" && (
        <div style={{ marginTop: 10, padding: "9px 12px", background: "#B24BF310", borderRadius: 8, border: "1px solid #B24BF320" }}>
          <div style={{ fontSize: 11, color: "#B24BF3" }}>◌ Đang chạy · Cần thêm <strong>{100 - test.confidence}pp</strong> confidence để kết luận tự động</div>
        </div>
      )}
    </div>
  ))}
</div>
```

);

const renderMemory = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#60A5FA” }}>Agentic Memory</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>Fellou learns from your behavior · Context-aware assistance</p>
</div>
<div style={{ display: “flex”, gap: 8 }}>
<button style={{ padding: “7px 13px”, borderRadius: 10, background: “#0c1020”, border: “1px solid #1a2030”, color: “#778”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit” }}>Export</button>
<button style={{ padding: “7px 13px”, borderRadius: 10, background: “#FF4D6D15”, border: “1px solid #FF4D6D30”, color: “#FF4D6D”, fontSize: 12, cursor: “pointer”, fontFamily: “inherit” }}>Clear All</button>
</div>
</div>

```
  {/* Stats */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
    {[
      { label: "Memories Stored", value: "47", color: "#60A5FA" },
      { label: "Context Recalled", value: "128", color: "#00FFB2" },
      { label: "Personalization", value: "94%", color: "#B24BF3" },
    ].map((s,i) => (
      <div key={i} style={{ background: "#090d1a", border: `1px solid ${s.color}20`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, color: "#667" }}>{s.label}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
      </div>
    ))}
  </div>

  <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, overflow: "hidden" }}>
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #0f1420" }}>
      <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Recent Memory Captures</div>
    </div>
    {MEMORY_ITEMS.map((item, i) => (
      <div key={item.id} style={{
        display: "flex", gap: 12, padding: "13px 16px",
        borderBottom: i < MEMORY_ITEMS.length - 1 ? "1px solid #0f1420" : "none",
        transition: "background 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#0c1020"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: `${item.color}18`,
          border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
        }}>{item.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#c8ccd8", lineHeight: 1.5 }}>{item.text}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 20, background: `${item.color}15`, color: item.color }}>{item.type}</span>
            <span style={{ fontSize: 10, color: "#445" }}>{item.time}</span>
          </div>
        </div>
        <button style={{ background: "none", border: "none", color: "#445", cursor: "pointer", fontSize: 14, alignSelf: "flex-start" }}>✕</button>
      </div>
    ))}
  </div>

  <div style={{ background: "#090d1a", border: "1px solid #60A5FA20", borderRadius: 14, padding: 16, marginTop: 12 }}>
    <div style={{ fontSize: 11, color: "#60A5FA", fontWeight: 700, marginBottom: 8 }}>◑ Memory Context Active</div>
    <div style={{ fontSize: 12, color: "#889", lineHeight: 1.6 }}>
      Fellou-X đang sử dụng <strong style={{ color: "#c8ccd8" }}>5 memories</strong> để cá nhân hoá mọi phản hồi. AI hiểu bạn đang focus vào SaaS B2B, ưa thích tone professional-friendly, và quan tâm đến TikTok + LinkedIn.
    </div>
  </div>
</div>
```

);

const renderBrowser = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#F472B6” }}>Browser Agent</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>Headless browser · Real web automation · Live data extraction</p>
</div>
<button onClick={() => triggerApproval(“Browser Agent sắp mở Chrome headless để crawl TikTok trends & competitor pages. Cho phép không?”, [“Truy cập tiktok.com, facebook.com”, “Không lưu cookies hay login”, “Chỉ đọc public data”]).then(ok => { if (ok) setApprovalRequest(null); })} style={{
padding: “8px 16px”, borderRadius: 10, background: “linear-gradient(135deg, #F472B6, #B24BF3)”,
border: “none”, color: “#fff”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>▶ Run Agent</button>
</div>

```
  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
    {BROWSER_TASKS.map(task => (
      <div key={task.id} style={{ background: "#090d1a", border: `1px solid ${task.status === "running" ? "#F472B630" : "#141e2e"}`, borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.status === "running" ? "#F472B6" : task.status === "completed" ? "#00FFB2" : "#556", animation: task.status === "running" ? "blink 1s infinite" : "none" }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#dde4f4" }}>{task.name}</span>
          </div>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: task.status === "completed" ? "#00FFB215" : task.status === "running" ? "#F472B615" : "#1a2030", color: task.status === "completed" ? "#00FFB2" : task.status === "running" ? "#F472B6" : "#778" }}>
            {task.status}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: task.status !== "queued" ? 8 : 0, fontSize: 11, color: "#667" }}>
          {task.sites.map(s => <span key={s} style={{ padding: "1px 8px", background: "#0c1020", borderRadius: 10, border: "1px solid #1a2030" }}>🌐 {s}</span>)}
          <span style={{ marginLeft: "auto", color: "#00FFB2", fontWeight: 700 }}>{task.found}</span>
        </div>
        {task.status !== "queued" && (
          <div style={{ height: 4, borderRadius: 2, background: "#141e2e", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${task.progress}%`, background: "linear-gradient(90deg, #F472B6, #B24BF3)", transition: "width 0.8s" }} />
          </div>
        )}
      </div>
    ))}
  </div>

  <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
    <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>Available Browser Tools</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[
        { name: "scrape_tiktok_trends", desc: "Top hashtags & viral formats", color: "#FF4D6D" },
        { name: "analyze_facebook_page", desc: "Posts, engagement, sentiment", color: "#4A90E2" },
        { name: "linkedin_audience_data", desc: "Demographics & job titles", color: "#0A66C2" },
        { name: "competitor_pricing", desc: "Extract pricing pages", color: "#FFD93D" },
        { name: "google_trends_fetch", desc: "Real-time search trends", color: "#4ECDC4" },
        { name: "reddit_sentiment", desc: "Brand mentions & sentiment", color: "#FF6B35" },
      ].map(tool => (
        <div key={tool.name} onClick={() => { setActiveModule("chat"); callAgent(`Sử dụng browser agent để ${tool.desc.toLowerCase()}, phân tích kết quả và đưa ra insights.`); }} style={{
          padding: 10, borderRadius: 10, background: "#0c1020", border: "1px solid #1a2030",
          cursor: "pointer", transition: "border-color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = `${tool.color}40`}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2030"}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: tool.color, marginBottom: 3 }}>{tool.name}()</div>
          <div style={{ fontSize: 11, color: "#778" }}>{tool.desc}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);

const renderReports = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#A3E635” }}>Deep Research Reports</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>AI-generated · Multi-source · Exportable PDF</p>
</div>
<button onClick={() => { setActiveModule(“chat”); callAgent(”/report Tạo báo cáo thị trường marketing automation Việt Nam 2025, kèm số liệu, xu hướng, top players và actionable recommendations.”); }} style={{
padding: “8px 16px”, borderRadius: 10, background: “linear-gradient(135deg, #A3E635, #4ECDC4)”,
border: “none”, color: “#060912”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>+ Generate Report</button>
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
    {[
      { title: "Vietnam Marketing Trends Q2 2025", pages: 24, sources: 18, date: "01/05/2025", color: "#A3E635", status: "ready" },
      { title: "TikTok Algorithm Deep Dive", pages: 16, sources: 12, date: "28/04/2025", color: "#FF4D6D", status: "ready" },
      { title: "Competitor Landscape FMCG VN", pages: 32, sources: 27, date: "25/04/2025", color: "#B24BF3", status: "ready" },
      { title: "SaaS Marketing Playbook B2B", pages: 41, sources: 35, date: "20/04/2025", color: "#FFD93D", status: "generating" },
    ].map((r, i) => (
      <div key={i} style={{ background: "#090d1a", border: `1px solid ${r.color}25`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${r.color}60`; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = `${r.color}25`; e.currentTarget.style.transform = "none"; }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▣</div>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: r.status === "ready" ? "#00FFB215" : "#FFD93D15", color: r.status === "ready" ? "#00FFB2" : "#FFD93D", fontWeight: 700 }}>
            {r.status === "ready" ? "Ready" : "Generating..."}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#dde4f4", marginBottom: 6, lineHeight: 1.4 }}>{r.title}</div>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#667" }}>
          <span>{r.pages} pages</span>
          <span>·</span>
          <span>{r.sources} sources</span>
          <span>·</span>
          <span>{r.date}</span>
        </div>
        {r.status === "generating" && (
          <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "#141e2e" }}>
            <div style={{ height: "100%", borderRadius: 2, width: "65%", background: `linear-gradient(90deg, ${r.color}, ${r.color}80)`, animation: "pulse 2s infinite" }} />
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

);

const renderResearch = () => (
<div style={{ flex: 1, display: “flex”, flexDirection: “column” }}>
<div style={{ padding: “18px 20px 12px”, borderBottom: “1px solid #141e2e” }}>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#FF6B35”, marginBottom: 4 }}>Market Research Intelligence</h2>
<p style={{ fontSize: 12, color: “#778” }}>Multi-source · Cross-platform · Real-time synthesis</p>
</div>
<div style={{ padding: “14px 20px”, display: “flex”, gap: 6, flexWrap: “wrap” }}>
{[“AI Marketing 2025”, “TikTok Shop VN”, “Influencer Economy”, “D2C Brands”, “Gen Z Consumer”, “B2B SaaS Growth”, “Retention Marketing”, “Performance Max”].map(t => (
<span key={t} onClick={() => { setActiveModule(“chat”); callAgent(`/research ${t}: Phân tích chuyên sâu xu hướng, cơ hội, dữ liệu thị trường và actionable strategy.`); }} style={{
padding: “5px 13px”, borderRadius: 20, fontSize: 12, cursor: “pointer”,
background: “#0c1020”, border: “1px solid #1a2030”, color: “#778”,
transition: “all 0.2s”,
}}
onMouseEnter={e => { e.currentTarget.style.borderColor = “#FF6B3540”; e.currentTarget.style.color = “#FF6B35”; }}
onMouseLeave={e => { e.currentTarget.style.borderColor = “#1a2030”; e.currentTarget.style.color = “#778”; }}>
⬡ {t}
</span>
))}
</div>
<div style={{ flex: 1, overflow: “auto”, padding: “0 20px 20px”, display: “flex”, flexDirection: “column”, gap: 8 }}>
{[
{ topic: “Short-form Video Domination”, platform: “TikTok / Reels / Shorts”, score: 94, trend: “+234%”, color: “#FF4D6D”, detail: “Hook trong 1.5s đầu · duet & stitch viral · POV format” },
{ topic: “AI-Generated Content Marketing”, platform: “All Platforms”, score: 88, trend: “+189%”, color: “#B24BF3”, detail: “AI voiceover · avatar influencers · generative thumbnails” },
{ topic: “Social Commerce Integration”, platform: “TikTok Shop · Instagram”, score: 82, trend: “+156%”, color: “#FF6B35”, detail: “Live selling · affiliate creators · shoppable posts” },
{ topic: “Creator Economy & UGC”, platform: “YouTube · TikTok”, score: 76, trend: “+98%”, color: “#FFD93D”, detail: “Micro-influencer ROI 6x · UGC trust rate 84%” },
{ topic: “B2B LinkedIn Thought Leadership”, platform: “LinkedIn”, score: 71, trend: “+67%”, color: “#0A66C2”, detail: “Document posts 3x reach · Newsletter growth · Polls” },
].map((item, i) => (
<div key={i} style={{
background: “#090d1a”, border: “1px solid #141e2e”, borderRadius: 14, padding: 14,
display: “flex”, gap: 14, cursor: “pointer”, transition: “all 0.2s”,
}}
onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}40`; e.currentTarget.style.transform = “translateX(4px)”; }}
onMouseLeave={e => { e.currentTarget.style.borderColor = “#141e2e”; e.currentTarget.style.transform = “none”; }}
onClick={() => { setActiveModule(“chat”); callAgent(`/research Phân tích sâu xu hướng: ${item.topic} — data, opportunities, playbook.`); }}>
<div style={{ width: 4, borderRadius: 2, background: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}80` }} />
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{item.topic}</div>
<div style={{ fontSize: 11, color: “#778”, marginBottom: 4 }}>{item.platform}</div>
<div style={{ fontSize: 11, color: “#556”, fontStyle: “italic” }}>{item.detail}</div>
</div>
<div style={{ textAlign: “right”, flexShrink: 0 }}>
<div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.score}</div>
<div style={{ fontSize: 11, color: “#00FFB2”, fontWeight: 700 }}>↑ {item.trend}</div>
</div>
</div>
))}
</div>
</div>
);

const renderCompetitor = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 16 }}>
<div>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#B24BF3” }}>Competitor Intelligence</h2>
<p style={{ fontSize: 11, color: “#667”, marginTop: 2 }}>SWOT · Blue Ocean · Positioning · Sentiment</p>
</div>
<button onClick={() => { setActiveModule(“chat”); callAgent(”/swot Phân tích SWOT + Blue Ocean Strategy cho thương hiệu của chúng ta so với Brand A, B, C.”); }} style={{
padding: “8px 14px”, borderRadius: 10, background: “linear-gradient(135deg, #B24BF3, #8B2FC9)”,
border: “none”, color: “#fff”, fontWeight: 800, fontSize: 12, cursor: “pointer”,
}}>Run SWOT Analysis</button>
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
    {MOCK_ANALYTICS.competitors.map((c, i) => (
      <div key={i} onClick={() => { setActiveModule("chat"); callAgent(`Phân tích chiến lược marketing chi tiết của ${c.name}: content strategy, tone, posting frequency, top-performing posts.`); }} style={{
        background: "#090d1a", border: `1px solid ${c.name === "Us" ? "#00FFB230" : "#141e2e"}`, borderRadius: 14, padding: 14, cursor: "pointer", transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = c.name === "Us" ? "#00FFB260" : "#B24BF340"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.name === "Us" ? "#00FFB230" : "#141e2e"; e.currentTarget.style.transform = "none"; }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: c.name === "Us" ? "#00FFB2" : "#dde4f4", marginBottom: 10 }}>{c.name === "Us" ? "◉ " : ""}{c.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          {[["Score", c.score, "#dde4f4"], ["Engage", `${c.engagement}%`, "#FF6B35"]].map(([k,v,col]) => (
            <div key={k}><div style={{ fontSize: 9, color: "#556" }}>{k}</div><div style={{ fontSize: 18, fontWeight: 900, color: c.name === "Us" && k === "Score" ? "#00FFB2" : col }}>{v}</div></div>
          ))}
        </div>
        <div style={{ height: 3, borderRadius: 2, background: "#141e2e", marginBottom: 6 }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${c.score}%`, background: c.name === "Us" ? "linear-gradient(90deg, #00FFB2, #4ECDC4)" : "linear-gradient(90deg, #4ECDC4, #B24BF3)" }} />
        </div>
        <div style={{ fontSize: 10, color: c.growth > 0 ? "#00FFB2" : "#FF4D6D" }}>
          {c.growth > 0 ? "↑" : "↓"} {Math.abs(c.growth)}% growth
        </div>
      </div>
    ))}
  </div>

  <div style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 14 }}>
    <div style={{ fontSize: 11, color: "#667", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>SWOT Matrix · Click để phân tích sâu</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[
        { label: "Strengths", color: "#00FFB2", icon: "💪", items: ["Content quality top 1", "AI-driven strategy", "Engagement rate #1", "Rapid iteration speed"] },
        { label: "Weaknesses", color: "#FF4D6D", icon: "⚠️", items: ["Reach còn hạn chế", "Budget thấp hơn Brand C", "Thiếu video content", "Posting frequency thấp"] },
        { label: "Opportunities", color: "#4ECDC4", icon: "🚀", items: ["TikTok Shop đang boom", "AI content wave", "B2B LinkedIn growth", "Micro-influencer ROI"] },
        { label: "Threats", color: "#FFD93D", icon: "⚡", items: ["Brand C tăng trưởng mạnh", "Algorithm changes", "Platform policy shifts", "Economic downturn"] },
      ].map(s => (
        <div key={s.label} onClick={() => { setActiveModule("chat"); callAgent(`Phân tích chi tiết ${s.label} của chúng ta: ${s.items.join(", ")} — kèm recommendations cụ thể.`); }} style={{
          padding: 12, borderRadius: 10, background: `${s.color}08`, border: `1px solid ${s.color}20`, cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = `${s.color}15`; e.currentTarget.style.borderColor = `${s.color}35`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${s.color}08`; e.currentTarget.style.borderColor = `${s.color}20`; }}>
          <div style={{ fontSize: 12, color: s.color, fontWeight: 800, marginBottom: 7 }}>{s.icon} {s.label}</div>
          {s.items.map((item, i) => (
            <div key={i} style={{ fontSize: 11, color: "#889", paddingLeft: 8, marginBottom: 3 }}>• {item}</div>
          ))}
        </div>
      ))}
    </div>
  </div>
</div>
```

);

const renderContent = () => (
<div style={{ flex: 1, display: “flex”, flexDirection: “column” }}>
<div style={{ padding: “18px 20px 12px”, borderBottom: “1px solid #141e2e” }}>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#FFD93D”, marginBottom: 4 }}>AI Content Studio</h2>
<p style={{ fontSize: 12, color: “#778” }}>Multi-platform · Hook-optimized · Instant generation</p>
</div>
<div style={{ flex: 1, overflowY: “auto”, padding: 16 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(auto-fill, minmax(176px, 1fr))”, gap: 10 }}>
{[
{ icon: “💼”, label: “LinkedIn Post”, desc: “Thought leadership”, platform: “LinkedIn”, color: “#0A66C2”, prompt: “/content LinkedIn: Viết 3 variants thought-leadership post về AI trong marketing. Hook mạnh, storytelling, CTA cụ thể.” },
{ icon: “🎵”, label: “TikTok Script”, desc: “Hook + Story + CTA (30s)”, platform: “TikTok”, color: “#FF004F”, prompt: “/content TikTok: Script 30s về marketing tip viral. Format: Hook 3s + Problem 8s + Solution 12s + CTA 7s + hashtags.” },
{ icon: “📘”, label: “Facebook Ad”, desc: “Conversion copy”, platform: “Facebook”, color: “#4A90E2”, prompt: “/content Facebook Ad: 3 variants ad copy khác nhau — urgency, benefit-led, social proof. Kèm headline + body + CTA.” },
{ icon: “📧”, label: “Email Sequence”, desc: “Cold → Warm → Close”, platform: “Email”, color: “#FFD93D”, prompt: “/content Email: Sequence 6 bước cold outreach B2B SaaS. Subject line variants, body copy, follow-up cadence.” },
{ icon: “🧵”, label: “Twitter/X Thread”, desc: “Viral 10-tweet thread”, platform: “Twitter/X”, color: “#888”, prompt: “/content Twitter: Thread 10 tweets ‘10 cách AI thay đổi marketing’. Mỗi tweet có hook để đọc tiếp.” },
{ icon: “📹”, label: “YouTube Script”, desc: “Long-form 3-min intro”, platform: “YouTube”, color: “#FF0000”, prompt: “/content YouTube: Script intro 3 phút ‘Dùng AI trong Marketing 2025’. Retention hook + value + preview + thumbnail ideas.” },
{ icon: “🎯”, label: “Full Campaign”, desc: “RACE framework brief”, platform: “Multi”, color: “#B24BF3”, prompt: “/content Campaign: Full RACE framework cho chiến dịch awareness 30 ngày — target, message, channels, content calendar, KPI.” },
{ icon: “📊”, label: “Infographic”, desc: “Visual data story”, platform: “Instagram”, color: “#E4405F”, prompt: “/content Infographic: ‘Marketing AI Trends 2025’ — 8 data points, visual hierarchy, key stats, design brief.” },
{ icon: “🎙️”, label: “Podcast Script”, desc: “30-min episode outline”, platform: “Podcast”, color: “#A855F7”, prompt: “/content Podcast: Script episode 30 phút về ‘Future of Marketing với AI’ — intro hook, segments, guest Qs, CTA.” },
{ icon: “📱”, label: “Instagram Reel”, desc: “Trending reel format”, platform: “Instagram”, color: “#E1306C”, prompt: “/content Reel: 15-30s Instagram Reel về marketing hack viral. Trending audio suggestion + text overlay + hook.” },
{ icon: “💬”, label: “WhatsApp Broadcast”, desc: “Direct message campaign”, platform: “WhatsApp”, color: “#25D366”, prompt: “/content WhatsApp: Broadcast message cho khách hàng cũ — reactivation offer, cá nhân hóa, CTA rõ ràng.” },
{ icon: “🔔”, label: “Push Notification”, desc: “High CTR mobile push”, platform: “Mobile”, color: “#FFA500”, prompt: “/content Push: 5 variants push notification cho e-commerce re-engagement. Emoji optimization, urgency, personalization.” },
].map((c, i) => (
<div key={i} onClick={() => { setActiveModule(“chat”); callAgent(c.prompt); }} style={{
padding: 14, borderRadius: 12, cursor: “pointer”,
background: “#090d1a”, border: “1px solid #141e2e”,
transition: “all 0.2s”,
}}
onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}50`; e.currentTarget.style.background = `${c.color}08`; e.currentTarget.style.transform = “translateY(-2px)”; }}
onMouseLeave={e => { e.currentTarget.style.borderColor = “#141e2e”; e.currentTarget.style.background = “#090d1a”; e.currentTarget.style.transform = “none”; }}>
<div style={{ fontSize: 26, marginBottom: 7 }}>{c.icon}</div>
<div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2, color: “#dde4f4” }}>{c.label}</div>
<div style={{ fontSize: 11, color: “#667”, marginBottom: 8 }}>{c.desc}</div>
<span style={{ fontSize: 10, padding: “2px 8px”, borderRadius: 20, background: `${c.color}15`, color: c.color, display: “inline-block”, fontWeight: 600 }}>{c.platform}</span>
</div>
))}
</div>
</div>
</div>
);

const renderSettings = () => (
<div style={{ flex: 1, overflowY: “auto”, padding: 20 }}>
<h2 style={{ fontSize: 20, fontWeight: 800, color: “#94A3B8”, marginBottom: 16 }}>Settings & Configuration</h2>

```
  {[
    {
      title: "LLM Provider", items: [
        { label: "Primary Model", value: "claude-sonnet-4-20250514", type: "select", options: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-4-5-20251001"] },
        { label: "Fallback Model", value: "Disabled", type: "select", options: ["Disabled", "Ollama/Llama3", "Deepseek R1", "GPT-4o"] },
        { label: "Max Tokens", value: "1500", type: "input" },
        { label: "Temperature", value: "0.7", type: "input" },
      ]
    },
    {
      title: "Agent Behavior", items: [
        { label: "Human-in-the-loop", value: true, type: "toggle" },
        { label: "Agentic Memory", value: true, type: "toggle" },
        { label: "Browser Agent", value: false, type: "toggle" },
        { label: "Auto-Approve Low-Risk Actions", value: false, type: "toggle" },
      ]
    },
    {
      title: "Workflow & Automation", items: [
        { label: "Eko XML Planner", value: true, type: "toggle" },
        { label: "MCP Filesystem Access", value: false, type: "toggle" },
        { label: "Slack Notifications", value: false, type: "toggle" },
        { label: "Webhook Endpoint", value: "Not configured", type: "input" },
      ]
    },
  ].map((section, si) => (
    <div key={si} style={{ background: "#090d1a", border: "1px solid #141e2e", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{section.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {section.items.map((item, ii) => (
          <div key={ii} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#c0c4d8" }}>{item.label}</span>
            {item.type === "toggle" ? (
              <div style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                background: item.value ? "linear-gradient(90deg, #00FFB2, #4ECDC4)" : "#1a2030",
                position: "relative", transition: "background 0.3s",
                boxShadow: item.value ? "0 0 12px #00FFB260" : "none",
              }}>
                <div style={{
                  position: "absolute", top: 3, left: item.value ? 22 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }} />
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "#778", fontFamily: "monospace", background: "#0c1020", padding: "3px 10px", borderRadius: 8, border: "1px solid #1a2030" }}>{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

);

const renderModule = () => {
switch (activeModule) {
case “chat”: return renderChat();
case “analytics”: return renderAnalytics();
case “workflow”: return renderWorkflow();
case “scheduler”: return renderScheduler();
case “abtest”: return renderABTest();
case “research”: return renderResearch();
case “competitor”: return renderCompetitor();
case “content”: return renderContent();
case “memory”: return renderMemory();
case “browser”: return renderBrowser();
case “reports”: return renderReports();
case “settings”: return renderSettings();
default: return renderChat();
}
};

const activeModuleInfo = MODULES.find(m => m.id === activeModule);

return (
<div style={{ fontFamily: “‘DM Sans’, system-ui, sans-serif”, background: “#05080f”, color: “#e0e4f0”, minHeight: “100vh”, display: “flex”, flexDirection: “column”, position: “relative”, overflow: “hidden” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 3px; height: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a3548; border-radius: 2px; } @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} } @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} } @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} } @keyframes slideIn { from{transform:translateY(8px);opacity:0} to{transform:none;opacity:1} } @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,255,178,0.3)} 50%{box-shadow:0 0 40px rgba(0,255,178,0.6)} } .md-h1 { font-size:17px;font-weight:900;color:#00FFB2;margin:14px 0 6px; } .md-h2 { font-size:15px;font-weight:800;color:#4ECDC4;margin:10px 0 4px; } .md-h3 { font-size:13px;font-weight:700;color:#B24BF3;margin:8px 0 4px; } .md-ul { padding-left:18px;margin:4px 0; } .md-li { font-size:13px;color:#b0b4c8;margin:3px 0;line-height:1.6; } code { background:#0f1828;padding:2px 7px;border-radius:5px;font-family:'DM Mono',monospace;font-size:12px;color:#FFD93D;border:1px solid #1a2030; } strong { color:#e4e8f4;font-weight:700; } em { color:#B24BF3;font-style:normal;font-weight:600; } button { font-family:inherit; }`}</style>

```
  {/* Particles */}
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
    {particles.map(p => (
      <div key={p.id} style={{
        position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
        width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0.12,
        animation: `float ${p.speed}s ease-in-out infinite`, animationDelay: `${p.id * 0.6}s`,
      }} />
    ))}
  </div>

  {/* Ambient glows */}
  <div style={{ position: "fixed", top: -300, left: -300, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, #00FFB206 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
  <div style={{ position: "fixed", bottom: -300, right: -300, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, #B24BF306 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
  <div style={{ position: "fixed", top: "40%", left: "50%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #4ECDC403 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, transform: "translate(-50%, -50%)" }} />

  {/* HEADER */}
  <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 20px", background: "rgba(5,8,15,0.92)",
    backdropFilter: "blur(24px)", borderBottom: "1px solid #101520",
    position: "sticky", top: 0, zIndex: 100,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: "linear-gradient(135deg, #00FFB2, #4ECDC4, #B24BF3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 900, color: "#060912",
        boxShadow: "0 0 20px #00FFB240",
      }}>F</div>
      <div>
        <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.5, background: "linear-gradient(135deg, #00FFB2, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Fellou-X</div>
        <div style={{ fontSize: 9, color: "#445", letterSpacing: 2.5, marginTop: -2 }}>AI MARKETING PLATFORM</div>
      </div>
      <div style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, background: "linear-gradient(90deg, #00FFB215, #B24BF315)", border: "1px solid #00FFB225", color: "#00FFB2", letterSpacing: 1.2, fontWeight: 700 }}>PRO AGENT</div>
      {activeModuleInfo && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#556", paddingLeft: 8, borderLeft: "1px solid #1a2030" }}>
          <span style={{ color: activeModuleInfo.color }}>{activeModuleInfo.icon}</span>
          <span>{activeModuleInfo.label}</span>
          <span style={{ fontSize: 10, color: "#445" }}>· {activeModuleInfo.desc}</span>
        </div>
      )}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Notification bell */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotifs(v => !v)} style={{
          width: 36, height: 36, borderRadius: 9, background: "#0c1020", border: "1px solid #1a2030",
          cursor: "pointer", color: "#778", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          🔔
          <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#FF4D6D", boxShadow: "0 0 6px #FF4D6D" }} />
        </button>
        {showNotifs && (
          <div style={{
            position: "absolute", top: 44, right: 0, width: 280, background: "#0a0e1a",
            border: "1px solid #1a2030", borderRadius: 14, overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 200,
            animation: "slideIn 0.2s ease",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #0f1420", fontSize: 11, color: "#667", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Notifications</div>
            {notifs.map(n => (
              <div key={n.id} style={{ padding: "10px 14px", borderBottom: "1px solid #0a0e18", display: "flex", gap: 8, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0c1020"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: n.type === "alert" ? "#FF4D6D" : n.type === "success" ? "#00FFB2" : "#4ECDC4" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#c0c4d0", lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: "#445", marginTop: 2 }}>{n.time} ago</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 13px", borderRadius: 20, background: "#0c1020", border: "1px solid #1a2030" }}>
        <span style={{ color: si.color, animation: si.pulse ? "blink 0.9s infinite" : "none", fontSize: 10 }}>{si.icon}</span>
        <span style={{ color: agentStatus !== "idle" ? si.color : "#778", fontWeight: agentStatus !== "idle" ? 700 : 400 }}>{si.label}</span>
      </div>

      {/* Sidebar toggle */}
      <button onClick={() => setSidebarOpen(v => !v)} style={{
        width: 36, height: 36, borderRadius: 9, background: "#0c1020",
        border: "1px solid #1a2030", cursor: "pointer", color: "#778", fontSize: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>≡</button>
    </div>
  </header>

  {/* MAIN */}
  <main style={{ display: "flex", flex: 1, overflow: "hidden" }}>
    {/* SIDEBAR */}
    <nav style={{
      width: sidebarOpen ? 200 : 56, transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      background: "rgba(6,9,18,0.5)", backdropFilter: "blur(10px)",
      borderRight: "1px solid #101520", flexShrink: 0,
      display: "flex", flexDirection: "column",
      padding: "10px 6px", gap: 2, overflow: "hidden",
      position: "relative", zIndex: 10,
    }}>
      {MODULES.map(mod => (
        <div key={mod.id} onClick={() => setActiveModule(mod.id)}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "9px 11px", borderRadius: 9, cursor: "pointer",
            background: activeModule === mod.id ? `${mod.color}14` : "transparent",
            border: activeModule === mod.id ? `1px solid ${mod.color}35` : "1px solid transparent",
            color: activeModule === mod.id ? mod.color : "#556",
            transition: "all 0.2s",
            whiteSpace: "nowrap", overflow: "hidden", minWidth: 34,
          }}
          onMouseEnter={e => { if (activeModule !== mod.id) { e.currentTarget.style.background = "#0c1020"; e.currentTarget.style.color = "#889"; } }}
          onMouseLeave={e => { if (activeModule !== mod.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#556"; } }}>
          <span style={{ fontSize: 15, flexShrink: 0, color: activeModule === mod.id ? mod.color : "#556", fontWeight: 700 }}>{mod.icon}</span>
          <span style={{ fontSize: 12, fontWeight: activeModule === mod.id ? 700 : 500, opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s", flexShrink: 0 }}>{mod.label}</span>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {sidebarOpen && (
        <div style={{ padding: "10px 11px", borderRadius: 10, background: "#0c1020", border: "1px solid #141e2e" }}>
          <div style={{ fontSize: 9, color: "#445", marginBottom: 7, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Today</div>
          {[["Tasks", "12", "#00FFB2"], ["Posts", "4", "#4ECDC4"], ["Reports", "2", "#B24BF3"], ["Tokens", `${(tokenCount/1000).toFixed(1)}K`, "#FFD93D"]].map(([l,v,c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#556" }}>{l}</span>
              <span style={{ fontSize: 11, color: c, fontWeight: 800 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </nav>

    {/* CONTENT */}
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
      {renderModule()}
    </section>
  </main>

  {/* MODALS */}
  <ApprovalModal
    request={approvalRequest}
    onApprove={() => { approvalRequest?.resolve(true); }}
    onReject={() => { approvalRequest?.resolve(false); }}
  />
  {showCommandPalette && (
    <CommandPalette
      onClose={() => setShowCommandPalette(false)}
      onCommand={(cmd) => { setInputText(cmd); setActiveModule("chat"); setTimeout(() => inputRef.current?.focus(), 100); }}
    />
  )}
</div>
```

);
}