# 🚀 Plinko Game 部署指南

本文檔提供多種部署方式，選擇最適合你的平台。

## 📦 構建準備

所有部署方式都需要先構建生產版本：

```bash
# 1. 安裝依賴
npm install

# 2. 構建生產版本
npm run build

# 3. 驗證構建結果
npm run preview
```

構建完成後，`dist/` 目錄包含所有靜態文件。

---

## 🌐 部署選項

### 選項 1: Vercel (最簡單，推薦)

**優點**：
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 零配置
- ✅ 自動部署（連接 Git）

**步驟**：

```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入（首次使用）
vercel login

# 3. 部署
vercel

# 4. 生產部署
vercel --prod
```

**或使用 Vercel Dashboard**：
1. 訪問 [vercel.com](https://vercel.com)
2. Import Git Repository
3. 自動檢測 Vite 項目
4. 點擊 Deploy

**配置文件** (可選 `vercel.json`)：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### 選項 2: Netlify

**優點**：
- ✅ 免費額度慷慨
- ✅ 拖放部署
- ✅ 自動 HTTPS

**步驟**：

#### 方法 A: Netlify CLI
```bash
# 1. 安裝 Netlify CLI
npm install -g netlify-cli

# 2. 登入
netlify login

# 3. 初始化
netlify init

# 4. 部署
netlify deploy --prod
```

#### 方法 B: 拖放部署
1. 構建項目：`npm run build`
2. 訪問 [netlify.com](https://netlify.com)
3. 拖放 `dist/` 目錄到部署區域

#### 方法 C: Git 整合
1. 連接 Git repository
2. 設置構建命令：`npm run build`
3. 設置發布目錄：`dist`
4. 自動部署

**配置文件** (`netlify.toml`)：
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 選項 3: GitHub Pages

**優點**：
- ✅ 完全免費
- ✅ 與 GitHub 深度整合

**步驟**：

```bash
# 1. 安裝 gh-pages
npm install -D gh-pages

# 2. 添加部署腳本到 package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 3. 部署
npm run deploy
```

**GitHub 設置**：
1. 進入 repository Settings
2. Pages → Source → gh-pages branch
3. 訪問 `https://[username].github.io/plinko`

**注意**：如果不是在根路徑，需要修改 `vite.config.ts`：
```typescript
export default defineConfig({
  base: '/plinko/', // 替換為你的 repo 名稱
})
```

---

### 選項 4: Cloudflare Pages

**優點**：
- ✅ 超快的全球 CDN
- ✅ 無限頻寬（免費版）
- ✅ 自動 HTTPS

**步驟**：

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages → Create a project
3. 連接 Git repository
4. 構建設置：
   - Build command: `npm run build`
   - Build output: `dist`
5. 點擊 Deploy

**使用 Wrangler CLI**：
```bash
# 1. 安裝 Wrangler
npm install -g wrangler

# 2. 登入
wrangler login

# 3. 部署
wrangler pages deploy dist
```

---

### 選項 5: Firebase Hosting

**優點**：
- ✅ Google 基礎設施
- ✅ 免費 SSL
- ✅ 快速 CDN

**步驟**：

```bash
# 1. 安裝 Firebase CLI
npm install -g firebase-tools

# 2. 登入
firebase login

# 3. 初始化
firebase init hosting

# 選擇設置：
# - Public directory: dist
# - Single-page app: Yes
# - GitHub auto-deploy: Optional

# 4. 部署
npm run build
firebase deploy
```

**配置文件** (`firebase.json`)：
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

### 選項 6: AWS S3 + CloudFront

**優點**：
- ✅ 企業級可靠性
- ✅ 極高擴展性

**步驟**：

```bash
# 1. 安裝 AWS CLI
# 參考：https://aws.amazon.com/cli/

# 2. 配置 AWS 憑證
aws configure

# 3. 創建 S3 bucket
aws s3 mb s3://plinko-game

# 4. 上傳文件
npm run build
aws s3 sync dist/ s3://plinko-game --acl public-read

# 5. 啟用靜態網站託管
aws s3 website s3://plinko-game --index-document index.html
```

**使用 CloudFront（可選，推薦）**：
1. 在 AWS Console 創建 CloudFront distribution
2. Origin: S3 bucket
3. 啟用 HTTPS
4. 配置快取策略

---

## 🔒 環境變數（如需要）

目前項目不需要環境變數，但如果未來添加 API，可以使用：

```bash
# .env.local (不要提交到 Git)
VITE_API_URL=https://your-api.com
```

在代碼中使用：
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## ⚡ 性能優化建議

### 1. 代碼分割（可選）

如果需要減小初始包大小，可以使用動態導入：

```typescript
// 懶加載 Rapier
const RAPIER = await import('@dimforge/rapier3d-compat');
```

### 2. CDN 加速

在 `vite.config.ts` 中配置：
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'babylon': ['@babylonjs/core'],
          'rapier': ['@dimforge/rapier3d-compat']
        }
      }
    }
  }
})
```

### 3. 壓縮優化

大多數平台自動啟用 gzip/brotli，但也可以手動配置。

---

## 🧪 部署前檢查清單

- [ ] 本地構建成功：`npm run build`
- [ ] 本地預覽正常：`npm run preview`
- [ ] 沒有 TypeScript 錯誤
- [ ] 沒有 console 錯誤
- [ ] 移動端測試通過
- [ ] 音效正常工作
- [ ] FPS 穩定（>30 FPS）

---

## 🐛 常見問題

### Q: 音效在移動端不工作？
A: 移動瀏覽器需要用戶互動才能啟動音頻。我們已在首次點擊時調用 `resumeAudioContext()`。

### Q: 構建包太大？
A: BabylonJS 是一個完整的 3D 引擎。gzipped 後約 1.9MB，對現代網路來說可接受。如需優化可考慮只導入需要的模組。

### Q: GitHub Pages 顯示 404？
A: 確保在 `vite.config.ts` 中設置正確的 `base` 路徑。

### Q: 移動端性能不佳？
A: 可以降低球的 segments、減少同時活躍球數、或降低物理步進頻率。

---

## 📞 支援

如有問題，請查看：
1. Git 提交歷史（每個功能都有詳細說明）
2. `docs/PRD.md`（產品需求文檔）
3. 代碼註釋

---

**祝部署順利！** 🎉

