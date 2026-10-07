import { BrowserProvider, ContractFactory, formatEther } from "https://cdn.jsdelivr.net/npm/ethers@6.13.5/+esm";

const chain = {
  chainId: "0x2a5",
  chainName: "BOT Chain Mainnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: ["https://rpc.botchain.ai"],
  blockExplorerUrls: ["https://scan.botchain.ai"]
};
const $ = id => document.getElementById(id);
let provider, signer, bytecode, estimatedGas;

function show(message) { $("deployOutput").textContent = message; }
function errorMessage(error) { return error.shortMessage || error.reason || error.message || "Unknown error"; }

async function connect() {
  if (!window.ethereum) return show("未检测到 MetaMask。请在安装了 MetaMask 的 Chrome 中打开此页面。");
  try {
    show("Connecting to MetaMask…");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const current = await window.ethereum.request({ method: "eth_chainId" });
    if (current.toLowerCase() !== chain.chainId) {
      try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] }); }
      catch (error) {
        if (error.code !== 4902) throw error;
        await window.ethereum.request({ method: "wallet_addEthereumChain", params: [chain] });
      }
    }
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    $("walletAddress").textContent = address;
    $("walletBalance").textContent = `${Number(formatEther(balance)).toFixed(5)} BOT`;
    const response = await fetch("./contracts_TraceRegistry_sol_TraceRegistry.bin", { cache: "no-store" });
    if (!response.ok) throw new Error("无法载入已编译合约");
    bytecode = `0x${(await response.text()).trim()}`;
    if (!/^0x[0-9a-fA-F]+$/.test(bytecode)) throw new Error("合约字节码无效");
    const factory = new ContractFactory([], bytecode, signer);
    estimatedGas = await signer.estimateGas(await factory.getDeployTransaction());
    const feeData = await provider.getFeeData();
    const unitPrice = feeData.maxFeePerGas ?? feeData.gasPrice;
    if (!unitPrice) throw new Error("无法估算当前 Gas 价格");
    const fee = estimatedGas * 12n / 10n * unitPrice;
    $("estimatedFee").textContent = `≤ ${Number(formatEther(fee)).toFixed(5)} BOT`;
    if (balance < fee) throw new Error("BOT 余额不足以支付预计 Gas，请联系赛事工作人员领取主网 Gas");
    $("deployButton").disabled = false;
    show("合约已准备好。点击 Deploy 后，请在 MetaMask 中检查并确认交易。");
  } catch (error) { $("deployButton").disabled = true; show(errorMessage(error)); }
}

async function deploy() {
  if (!signer || !bytecode || !estimatedGas) return;
  $("deployButton").disabled = true;
  try {
    show("等待 MetaMask 确认部署交易…");
    const factory = new ContractFactory([], bytecode, signer);
    const contract = await factory.deploy({ gasLimit: estimatedGas * 12n / 10n });
    const tx = contract.deploymentTransaction();
    const txUrl = `https://scan.botchain.ai/tx/${tx.hash}`;
    const link = document.createElement("a"); link.href = txUrl; link.target = "_blank"; link.rel = "noreferrer"; link.textContent = "查看部署交易";
    $("deployOutput").replaceChildren(document.createTextNode("交易已发送，等待主网确认。 "), link);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    const addressLink = document.createElement("a"); addressLink.href = `https://scan.botchain.ai/address/${address}`; addressLink.target = "_blank"; addressLink.rel = "noreferrer"; addressLink.textContent = address;
    $("deployOutput").replaceChildren(document.createTextNode("部署成功。合约地址："), addressLink, document.createElement("br"), document.createTextNode("交易："), link, document.createElement("br"), document.createTextNode("请把合约地址和交易链接发给我。"));
  } catch (error) { show(errorMessage(error)); $("deployButton").disabled = false; }
}

$("connectWallet").addEventListener("click", connect);
$("deployButton").addEventListener("click", deploy);
window.ethereum?.on?.("chainChanged", () => location.reload());
window.ethereum?.on?.("accountsChanged", () => location.reload());
