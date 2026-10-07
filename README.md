# TRACE

面向设计师的 AI 共创过程与作品版本链上档案。设计师在浏览器本地计算 Keccak-256 file hash，主动披露 AI 的参与方式，并把 hash、版本关系和创作声明登记到 BOT Chain。

## 核心流程

1. 连接 BOT Chain 钱包。
2. 选择作品文件；文件不会上传，只在本地计算哈希。
3. 填写灵感、设计判断与 AI 参与方式。
4. 可填写上一版本哈希，建立可验证的版本关系。
5. 将 file hash 和声明写入 BOT Chain，并通过区块浏览器核验。

## 本地运行

```bash
cd dist
python3 -m http.server 4173
```

打开 `http://localhost:4173`。未配置合约地址时使用演示数据。

## 主网部署

1. 在 Remix 用 Solidity 0.8.24 编译 `contracts/TraceRegistry.sol`。
2. 添加 BOT Chain Mainnet：Chain ID `677`，RPC `https://rpc.botchain.ai`，代币 `BOT`，浏览器 `https://scan.botchain.ai`。
3. Remix 选择 Injected Provider，部署 `TraceRegistry`。
4. 将合约地址填入 `dist/app.js` 的 `CONTRACT_ADDRESS`。
5. 登记一件作品和一个迭代版本，保存合约、部署交易和登记交易的浏览器链接。

## 比赛介绍

- 项目名称：TRACE
- 目标用户：使用 AI 辅助创作的平面、视觉、产品及交互设计师
- 解决问题：AI 共创缺乏清晰的作者声明、过程证据和版本来源
- 核心功能：本地文件指纹、AI 参与披露、版本关系、BOT Chain 登记与核验
- 技术栈：Solidity、ethers.js、原生 HTML/CSS/JavaScript
