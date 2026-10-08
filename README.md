# TRACE · Design Provenance on BOT Chain

TRACE 是面向设计师的作品溯源与 AI 共创披露工具。设计师不只交付最终图片，也需要讲清设计判断、AI 参与范围和版本脉络。TRACE 在浏览器本地计算作品文件的 Keccak-256 **file hash**，把它与创作者的声明、前一版本的 file hash 一起登记到 BOT Chain；作品原文件不上传。

**在线体验：** [TRACE 网站](https://trace-design-botchain.yxy09050929.chatgpt.site/) · [BOT Chain 主网合约](https://scan.botchain.ai/address/0x3692fffc944ADBa17E611FC43FaF8BA84EBaf528) · [主网部署交易](https://scan.botchain.ai/tx/0xc60f8dbdc539434bcdf4ed0f8f63fe0e1162fbe935309771ec6230c820efbe09)

> **当前状态（2026-10-08）：** `TraceRegistry` 已部署到 BOT Chain Mainnet，网页已接入主网合约，作品档案从主网读取。主网部署交易已核验；作品登记交易仍待创作者通过网页提交。

## 为谁解决什么问题

- **目标用户：** 使用 AI 辅助创作的视觉、交互和产品设计师。
- **问题：** 最终成品难以清楚呈现作者声明、AI 参与范围和连续迭代的来源。
- **设计取向：** 让创作者主动解释过程，而不是把链上时间戳误当作版权或原创性的自动证明。

## 产品流程

1. 选择本地作品文件；浏览器计算 Keccak-256 file hash，文件本身不会传到网站或合约。
2. 填写作品名称、署名、设计说明及 AI 使用说明。
3. 如是迭代版本，填写前一版本的 file hash；合约要求该版本已登记，且登记钱包相同。
4. 钱包确认登记交易后，合约保存 file hash、前一版本 file hash、公开声明、登记钱包和时间，并发出 `WorkRegistered` 事件。
5. 通过记录编号和区块浏览器核对链上记录。公开查询无需连接钱包；写入需要 MetaMask 确认交易。

同一个 file hash 只可登记一次。这条记录证明某钱包在某时间提交了特定 file hash 和声明，**不自动证明法律上的著作权、真实身份或 AI 披露的真实性**。

## 本届活动期间完成

TRACE 的交互设计与前端页面、浏览器本地 file hash 计算、MetaMask 连接、`TraceRegistry` 合约及版本归属规则、测试网与主网部署、可核验的合约部署交易，以及接入主网合约的公开档案查询。主网作品登记需要创作者选择作品文件并确认交易。

## 本地运行

无需安装 Node.js 或构建前端；需要 Python 3、现代浏览器和网络连接（网页从 CDN 加载 ethers.js 与字体）。链上操作另需 MetaMask 或兼容 EVM 的钱包。

```bash
git clone https://github.com/hisnyaoyang-web/trace-botchain.git
cd trace-botchain/dist
python3 -m http.server 4173
```

打开 `http://localhost:4173/`。首页读取 BOT Chain Mainnet 上的真实记录；没有记录时显示空状态。选择作品文件可在本地计算 file hash，登记时需在 MetaMask 中确认主网交易。请勿用 `file://` 直接打开，因为浏览器模块及资源加载可能受限。

## 合约与网络

合约源码在 [`contracts/TraceRegistry.sol`](contracts/TraceRegistry.sol)，网页在 [`dist/`](dist/)。合约由 Solidity 0.8.24 编译，optimizer 开启、runs 为 200；仓库附带用于部署页的创建字节码 `dist/contracts_TraceRegistry_sol_TraceRegistry.bin`。前端为原生 HTML/CSS/JavaScript，使用 ethers.js 6.13.5。

| 网络 | Chain ID | RPC | 区块浏览器 | 本项目状态 |
| --- | ---: | --- | --- | --- |
| Bohr Testnet | 968 | `https://rpc.bohr.life` | `https://scan.bohr.life` | 合约已部署，供测试与 Gas 申请证明 |
| BOT Chain Mainnet | 677 | `https://rpc.botchain.ai` | `https://scan.botchain.ai` | 合约已部署，首页已接入 |

**主网合约：** [`0x3692fffc944ADBa17E611FC43FaF8BA84EBaf528`](https://scan.botchain.ai/address/0x3692fffc944ADBa17E611FC43FaF8BA84EBaf528)

**主网部署交易：** [`0xc60f8dbdc539434bcdf4ed0f8f63fe0e1162fbe935309771ec6230c820efbe09`](https://scan.botchain.ai/tx/0xc60f8dbdc539434bcdf4ed0f8f63fe0e1162fbe935309771ec6230c820efbe09)

**测试网合约：** [`0x3692fffc944ADBa17E611FC43FaF8BA84EBaf528`](https://scan.bohr.life/address/0x3692fffc944ADBa17E611FC43FaF8BA84EBaf528)

**测试网部署交易：** [`0x7cf36ae4017c83fab575567583902793619691723c02e3db70e95f3835502e5d`](https://scan.bohr.life/tx/0x7cf36ae4017c83fab575567583902793619691723c02e3db70e95f3835502e5d)

## 部署说明

**测试网：** 在装有 MetaMask 的 Chrome 中打开网站的 [`/deploy-testnet.html`](https://trace-design-botchain.yxy09050929.chatgpt.site/deploy-testnet.html)，连接 Bohr Testnet。可从[官方 Faucet](https://faucet.botchain.ai/zh/basic)领取 test BOT。页面会显示钱包余额和预计 Gas；只有钱包确认后才发送部署交易。成功后保存测试网合约地址与交易链接。

**主网：** 合约已经部署并接入网页。打开[首页](https://trace-design-botchain.yxy09050929.chatgpt.site/)的 REGISTER，连接 BOT Chain Mainnet 钱包，选择作品文件并填写声明。核对 MetaMask 的网络与费用后确认登记，保存交易链接作为作品上链证明。`/deploy.html` 是部署新合约的工具页；已有合约时无需重复部署。测试网 Faucet 的代币不能支付主网 Gas。

部署交易由用户自己的钱包签署；本仓库及网页不需要、也不应接收助记词或私钥。

## 数据与隐私边界

- 作品文件只在浏览器内计算 file hash，不上传原文件。
- 登记表单中的作品名称、署名、设计说明和 AI 使用说明会编码到交易传入的 `metadataURI`，属于**公开且难以删除的链上内容**；不要填写个人隐私、未获授权的客户资料或保密项目内容。
- 当前实现没有独立的身份认证、版权判断或 AI 使用鉴定；这些声明由提交钱包自行负责。

## 第三方依赖与资源

- [ethers.js 6.13.5](https://docs.ethers.org/v6/)：通过 jsDelivr ESM CDN 加载，用于钱包、file hash、合约调用和部署。
- [Google Fonts](https://fonts.google.com/)：Inter、DM Mono、Noto Sans SC；页面排版使用。
- [BOT Chain 开发文档](https://dev-docs.botchain.ai/docs/Developers/quick-guide/)：网络参数、区块浏览器及开发参考。

其余页面结构、样式、交互和 `TraceRegistry` 合约源码在本仓库中。没有前端构建步骤或后端服务。
