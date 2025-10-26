# 🎮 Plinko Web Game

一個使用 **BabylonJS** 和 **Rapier3D** 打造的現代化 Plinko 掉球遊戲。

![Plinko Game](https://img.shields.io/badge/Game-Plinko-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![BabylonJS](https://img.shields.io/badge/BabylonJS-7.x-orange)
![Rapier3D](https://img.shields.io/badge/Rapier3D-0.x-red)

## ✨ 特色功能

### 🎯 核心玩法

- **點擊投球**：點擊螢幕任意位置投下彩色球
- **物理模擬**：真實的碰撞、彈跳和重力效果
- **分數系統**：根據落點獲得不同分數（中間高分，邊緣低分）
- **自動回收**：智能球池管理，最多 10 個球同時在場

### 🎨 視覺效果

- **8 種彩色球**：紅、藍、黃、綠、粉、紫、橙、青
- **發光材質**：球和分數槽都有發光效果
- **分數色碼**：
  - 🥇 金色 = 高分區（≥80%）
  - 🥈 銀色 = 中分區（50-80%）
  - 🥉 銅色 = 中低分區（30-50%）
  - 💙 藍色 = 低分區（<30%）
- **金屬質感**：專業的高光和反射效果

### 🔊 音效系統

- **碰撞音效**：球撞擊釘子時的音效（音調隨速度變化）
- **得分音效**：球落地時的和弦音效（音調隨分數變化）
- **投球音效**：投球時的上升音效
- **重置音效**：重置遊戲時的下降音效
- 所有音效都是程序化生成，無需外部音頻文件

### ⚡ 性能優化

- **物件池**：預先分配 50 個球，避免記憶體洩漏
- **智能回收**：非活躍球停用物理模擬
- **CCD 碰撞檢測**：防止高速穿透
- **FPS 監控**：實時性能監控（按 F 鍵）

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:5173`

### 生產構建

```bash
npm run build
```

構建文件會輸出到 `dist/` 目錄。

### 預覽生產構建

```bash
npm run preview
```

## 🎮 遊戲操作

### 滑鼠/觸控

- **點擊螢幕**：在點擊位置投下球
- **點擊重置按鈕**：清除所有球和分數

### 鍵盤快捷鍵

- **F 鍵**：顯示/隱藏 FPS 計數器
- **R 鍵**：重置遊戲
- **M 鍵**：開啟/關閉音效

## 🏗️ 技術架構

### 技術棧

- **TypeScript** - 類型安全的開發
- **Vite** - 快速的開發和構建工具
- **BabylonJS 7.x** - 3D 渲染引擎
- **Rapier3D** - WASM 物理引擎

### 項目結構

```
plinko/
├── src/
│   ├── audio/              # 音效系統
│   │   └── AudioManager.ts
│   ├── entities/           # 遊戲實體
│   │   ├── Ball.ts         # 球實體和球池
│   │   ├── PegGrid.ts      # 釘子網格
│   │   └── ScoringBins.ts  # 分數槽
│   ├── physics/            # 物理系統
│   │   ├── rapierWorld.ts  # Rapier 世界初始化
│   │   └── staticBodies.ts # 靜態物體（牆、地面）
│   ├── scene/              # 3D 場景
│   │   └── createScene.ts  # BabylonJS 場景設置
│   ├── systems/            # 遊戲系統
│   │   ├── GameLoop.ts     # 主遊戲循環
│   │   ├── ScoringSystem.ts # 計分系統
│   │   ├── GameManager.ts  # 遊戲管理器
│   │   └── FPSCounter.ts   # FPS 監控
│   ├── ui/                 # UI 系統
│   │   ├── InputHandler.ts # 輸入處理
│   │   └── UIManager.ts    # UI 管理
│   ├── visual/             # 視覺效果
│   │   └── MaterialManager.ts # 材質管理
│   ├── main.ts             # 入口文件
│   └── styles.css          # 樣式
├── docs/
│   └── PRD.md              # 產品需求文檔
├── index.html              # HTML 模板
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 核心系統

#### 物理系統

- **Rapier3D WASM**：高性能物理模擬
- **重力**：9.81 m/s²
- **CCD**：連續碰撞檢測防止穿透
- **事件系統**：碰撞事件驅動的音效和力

#### 球池系統

- **預分配**：50 個球預先創建
- **並發限制**：最多 10 個球同時活躍
- **自動回收**：達到限制時回收最舊的球
- **狀態重置**：完整重置位置、速度、旋轉、力

#### 計分系統

- **動態計分**：根據落點位置計分
- **歷史記錄**：保存最近 100 次得分
- **實時統計**：投球數、落地數、總分

## 📱 移動端優化

- **Mobile-first 設計**：優先針對移動設備優化
- **觸控友好**：大按鈕、易於點擊
- **響應式布局**：自適應不同螢幕尺寸
- **性能優化**：針對移動設備的渲染優化

## 🎯 遊戲規則

1. **投球**：點擊螢幕上方投下球
2. **彈跳**：球會隨機彈跳穿過釘子
3. **落地**：球最終落入底部分數槽
4. **得分**：
   - 中間槽位：高分（100-150 分）
   - 邊緣槽位：低分（10-50 分）
5. **限制**：最多 10 個球同時在場
6. **重置**：隨時可以重置遊戲重新開始

## 🔧 開發說明

### 關鍵實現細節

#### 物件池模式

由於 Rapier3D 不支持動態移除剛體，使用物件池模式：

- 預先創建所有球的物理體
- 回收時使用 `setEnabled(false)` 停用物理模擬
- 重用時使用 `setEnabled(true)` 重新啟用

#### 碰撞處理

使用 Rapier 的事件隊列處理碰撞：

```typescript
eventQueue.drainCollisionEvents((handle1, handle2, started) => {
  // 碰撞時施加隨機水平力，防止球卡住
  ball.body.applyImpulse({ x: randomForceX, y: 0, z: 0 }, true);
});
```

#### 狀態同步

每幀同步物理體和渲染網格：

```typescript
ball.mesh.position = ball.body.translation();
ball.mesh.rotationQuaternion = ball.body.rotation();
```

## 🚀 部署

### Vercel (推薦)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Netlify

```bash
# 構建
npm run build

# 上傳 dist/ 目錄到 Netlify
```

### GitHub Pages

```bash
# 1. 構建
npm run build

# 2. 安裝 gh-pages
npm install -D gh-pages

# 3. 添加到 package.json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# 4. 部署
npm run deploy
```

### 其他平台

- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

所有平台只需上傳 `dist/` 目錄即可。

## 📊 性能指標

- **初始加載**：~2MB (gzipped)
- **FPS**：60 FPS（桌面）/ 30-60 FPS（移動）
- **記憶體**：穩定（無洩漏）
- **物理計算**：< 2ms/frame

## 🛠️ 技術亮點

1. **WASM 物理引擎**：使用 Rapier3D 的高性能 WASM 實現
2. **物件池模式**：避免 GC 壓力和記憶體洩漏
3. **事件驅動架構**：清晰的系統間通訊
4. **程序化音效**：Web Audio API 實時生成
5. **類型安全**：完整的 TypeScript 類型定義
6. **模塊化設計**：清晰的關注點分離

## 📝 開發日誌

完整的開發過程記錄在 Git 提交歷史中，每個功能都有獨立的提交。

### 主要里程碑

- ✅ Step 1-3: 項目設置和基礎結構
- ✅ Step 4-9: BabylonJS 和 Rapier3D 整合
- ✅ Step 10-12: 輸入處理和球池系統
- ✅ Step 13-15: UI、重置和 FPS 計數器
- ✅ Step 16A: 視覺增強
- ✅ Step 16B: 音效系統

## 🤝 貢獻

這是一個學習項目，歡迎提出建議和改進！

## 📄 許可證

MIT License

## 🙏 致謝

- [BabylonJS](https://www.babylonjs.com/) - 強大的 3D 引擎
- [Rapier](https://rapier.rs/) - 高性能物理引擎
- [Vite](https://vitejs.dev/) - 快速的構建工具

---

**享受遊戲！** 🎉
