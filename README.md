# TRACE

面向设计师的 AI 共创过程与作品版本链上档案。设计师在浏览器本地计算 Keccak-256 file hash，主动披露 AI 的参与方式，并把 hash、版本关系和创作声明登记到 BOT Chain。

## 核心流程

1. 连接 BOT Chain 钱包。
2. 选择作品文件；文件不会上传，只在本地计算哈希。
3. 填写灵感、设计判断与 AI 参与方式。
4. 可填写上一版本 hash，合约会验证该版本由同一钱包登记。
5. 将 file hash 和声明写入 BOT Chain，并通过区块浏览器核验。

## 本地运行

```bash
cd dist
python3 -m http.server 4173
```

打开 `http://localhost:4173`。未配置合约地址时使用演示数据。

## 测试网部署与 Gas 申请

在 Chrome 打开站点的 `/deploy-testnet.html`，连接 Bohr Testnet（Chain ID `968`，RPC `https://rpc.bohr.life`）。从[官方 Faucet](https://faucet.botchain.ai/zh/basic)领取测试 BOT 后，部署 `TraceRegistry` 合约。成功页面会显示 `https://scan.bohr.life` 上的合约及交易链接，可用于 Gas 申请表。测试网记录不等于主网部署。

## 主网部署

1. 使用 Chrome 和 MetaMask 打开站点的 `/deploy.html`，连接 BOT Chain Mainnet。Chain ID 为 `677`，RPC 为 `https://rpc.botchain.ai`，代币为 `BOT`。
2. 确认钱包有 BOT Gas，检查预估费用，在 MetaMask 中签署部署交易。
3. 保存成功页面上的合约地址及部署交易链接。将合约地址填入 `dist/app.js` 的 `CONTRACT_ADDRESS` 并重新发布站点。
4. 登记一件作品和一个迭代版本，保存登记交易链接，作为主网核验材料。

`dist/contracts_TraceRegistry_sol_TraceRegistry.bin` 由 Solidity 0.8.24、optimizer enabled、runs 200 编译 `contracts/TraceRegistry.sol` 得到。`deploy.html` 读取该文件并通过 MetaMask 发送合约创建交易。

作品原文件只在浏览器本地计算 hash，不会上传。登记表单中填写的作品名称、署名、设计说明和 AI 使用说明会作为公开链上数据，提交前请勿填写隐私信息。

## 比赛介绍

- 项目名称：TRACE
- 目标用户：使用 AI 辅助创作的平面、视觉、产品及交互设计师
- 解决问题：AI 共创缺乏清晰的作者声明、过程证据和版本来源
- 核心功能：本地文件指纹、AI 参与披露、版本关系、BOT Chain 登记与核验
- 技术栈：Solidity、ethers.js、原生 HTML/CSS/JavaScript
