import { BrowserProvider, Contract, keccak256 } from "https://cdn.jsdelivr.net/npm/ethers@6.13.5/+esm";

const BOT_CHAIN = { chainId: "0x2a5", chainName: "BOT Chain Mainnet", nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 }, rpcUrls: ["https://rpc.botchain.ai"], blockExplorerUrls: ["https://scan.botchain.ai"] };
const CONTRACT_ADDRESS = ""; // Deploy contracts/TraceRegistry.sol and paste its address here.
const ABI = ["function workCount() view returns (uint256)", "function works(uint256) view returns (address creator,bytes32 assetHash,bytes32 parentHash,string metadataURI,uint64 createdAt)", "function registerWork(bytes32 assetHash,bytes32 parentHash,string metadataURI) returns (uint256)"];
const demoWorks = [
  { id: 24, title: "城市呼吸 · 海报系列", creator: "MORI", type: "视觉设计" },
  { id: 23, title: "江岸夜航 · 动态字体", creator: "LIN", type: "动态设计" },
  { id: 22, title: "未完成的椅子 03", creator: "YU", type: "产品设计" }
];
let provider, signer, account, currentAssetHash = "";
const $ = s => document.querySelector(s);
const shorten = v => v ? `${v.slice(0, 6)}…${v.slice(-4)}` : "—";
const toast = message => { const el = $("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(window.__toast); window.__toast = setTimeout(() => el.classList.remove("show"), 3200); };

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab, .panel").forEach(el => el.classList.remove("active"));
  tab.classList.add("active"); $(`#${tab.dataset.tab}`).classList.add("active");
}));

async function connectWallet() {
  if (!window.ethereum) return toast("请安装 MetaMask，或使用支持 EVM 的钱包打开。");
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() !== BOT_CHAIN.chainId) {
      try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BOT_CHAIN.chainId }] }); }
      catch (e) { if (e.code !== 4902) throw e; await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BOT_CHAIN] }); }
    }
    provider = new BrowserProvider(window.ethereum); signer = await provider.getSigner(); account = await signer.getAddress();
    $("#connectWallet").textContent = shorten(account); toast("已连接 BOT Chain"); await loadWorks();
  } catch (e) { toast(e.shortMessage || e.message || "连接失败"); }
}

function contract(write = false) {
  if (!CONTRACT_ADDRESS) throw new Error("演示模式：部署合约后填写 CONTRACT_ADDRESS 即可上链");
  if (!provider) throw new Error("请先连接钱包");
  return new Contract(CONTRACT_ADDRESS, ABI, write ? signer : provider);
}

function renderWorks(items, demo = false) {
  $("#workList").innerHTML = items.length ? items.map(w => `<article class="task"><div class="task-id">#${w.id}</div><div><h3>${w.title}</h3><p>${w.creator} · ${w.type}${demo ? " · DEMO" : ""}</p></div><span class="status verified">已留痕</span></article>`).join("") : '<div class="empty">还没有作品。登记第一段创作过程吧。</div>';
}

async function loadWorks() {
  if (!CONTRACT_ADDRESS || !provider) return renderWorks(demoWorks, true);
  try {
    const c = contract(), count = Number(await c.workCount());
    const ids = Array.from({ length: Math.min(count, 20) }, (_, i) => count - i);
    const works = await Promise.all(ids.map(async id => {
      const w = await c.works(id); let meta = {};
      try { meta = JSON.parse(decodeURIComponent(w.metadataURI.split(",")[1] || "")); } catch {}
      return { id, title: meta.title || shorten(w.assetHash), creator: meta.creator || shorten(w.creator), type: "链上作品" };
    }));
    renderWorks(works);
  } catch (e) { toast(e.shortMessage || "读取作品失败"); }
}

$("#assetFile").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  currentAssetHash = keccak256(new Uint8Array(await file.arrayBuffer()));
  $("#assetHash").textContent = currentAssetHash;
});

$("#registerWorkForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    if (!currentAssetHash) throw new Error("请先选择作品文件");
    if (!account) await connectWallet();
    const parent = $("#parentHash").value.trim() || "0x" + "0".repeat(64);
    const metadata = { title: $("#workTitle").value.trim(), creator: $("#creatorName").value.trim(), note: $("#designNote").value.trim(), aiDisclosure: $("#aiDisclosure").value.trim() || "未使用 AI" };
    const uri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
    const tx = await contract(true).registerWork(currentAssetHash, parent, uri);
    toast("作品登记已提交，等待确认…"); await tx.wait(); toast("这段创作已经留在 BOT Chain");
    e.target.reset(); currentAssetHash = ""; $("#assetHash").textContent = "选择文件后在本地计算；原文件不会上传"; await loadWorks(); document.querySelector('[data-tab="market"]').click();
  } catch (e) { toast(e.shortMessage || e.message || "登记失败"); }
});

$("#verifyForm").addEventListener("submit", async e => {
  e.preventDefault(); const id = Number($("#verifyWorkId").value), result = $("#verifyResult");
  if (!CONTRACT_ADDRESS || !provider) {
    const w = demoWorks.find(x => x.id === id);
    result.innerHTML = w ? `<div class="proof-result"><p class="eyebrow">CREATIVE TRACE</p><h2>#${id} · 已留痕</h2><dl><div><dt>作品</dt><dd>${w.title}</dd></div><div><dt>创作者</dt><dd>${w.creator}</dd></div><div><dt>网络</dt><dd>BOT Chain · 677</dd></div><div><dt>类型</dt><dd>${w.type}</dd></div></dl></div>` : "<p>没有找到该作品。演示编号可输入 22、23 或 24。</p>"; return;
  }
  try {
    const w = await contract().works(id); if (w.creator === "0x0000000000000000000000000000000000000000") throw new Error("作品不存在");
    result.innerHTML = `<div class="proof-result"><p class="eyebrow">ON-CHAIN TRACE</p><h2>#${id} · 已留痕</h2><dl><div><dt>创作者</dt><dd>${w.creator}</dd></div><div><dt>登记时间</dt><dd>${new Date(Number(w.createdAt) * 1000).toLocaleString()}</dd></div><div><dt>File hash</dt><dd>${w.assetHash}</dd></div><div><dt>Parent version hash</dt><dd>${w.parentHash}</dd></div></dl><p><a href="https://scan.botchain.ai/address/${CONTRACT_ADDRESS}" target="_blank">在区块浏览器中核验</a></p></div>`;
  } catch (e) { result.innerHTML = `<p>${e.shortMessage || e.message || "查询失败"}</p>`; }
});

$("#connectWallet").addEventListener("click", connectWallet);
$("#refreshTasks").addEventListener("click", loadWorks);
window.ethereum?.on?.("accountsChanged", () => location.reload());
window.ethereum?.on?.("chainChanged", () => location.reload());
loadWorks();
