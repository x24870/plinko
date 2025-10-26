# ⚡ 快速開始指南

## 🎮 5 分鐘上手 Plinko

### 1️⃣ 安裝 (30 秒)

```bash
npm install
```

### 2️⃣ 啟動 (10 秒)

```bash
npm run dev
```

打開瀏覽器訪問：`http://localhost:5173`

### 3️⃣ 開始玩！

- **點擊螢幕** → 投下彩色球
- **觀察球彈跳** → 穿過釘子網格
- **獲得分數** → 球落入不同分數槽

---

## 🎯 基本操作

| 操作              | 說明             |
| ----------------- | ---------------- |
| **點擊/觸控螢幕** | 在點擊位置投下球 |
| **Reset 按鈕**    | 清除所有球和分數 |
| **F 鍵**          | 顯示/隱藏 FPS    |
| **R 鍵**          | 重置遊戲         |
| **M 鍵**          | 開關音效         |

---

## 📱 移動端測試

```bash
# 在相同網路下的設備訪問
npm run dev -- --host
```

會顯示網路地址，例如：

```
Local:   http://localhost:5173
Network: http://192.168.1.100:5173
```

用手機瀏覽器訪問 Network 地址即可。

---

## 🏗️ 生產構建

```bash
# 構建
npm run build

# 本地預覽構建結果
npm run preview
```

---

## 🎨 自定義配置

### 調整球數限制

編輯 `src/main.ts`：

```typescript
const ballPool = createBallPool(
  world,
  scene,
  50, // 總球池大小（減少可提升移動端性能）
  10 // 同時活躍球數（減少可減輕負擔）
);
```

### 調整物理參數

編輯 `src/entities/PegGrid.ts`：

```typescript
pinColliderDesc.setRestitution(0.5); // 彈性（0-1，越高越彈）
pinColliderDesc.setFriction(0.3); // 摩擦力（0-1，越高越慢）
```

### 調整釘子佈局

編輯 `src/main.ts`：

```typescript
const pinGrid = generateRectanglePins(
  12, // 行數（增加可讓遊戲更長）
  10, // 列數（增加可讓遊戲更寬）
  0.8, // 水平間距
  0.8 // 垂直間距
);
```

### 調整分數分布

編輯 `src/entities/ScoringBins.ts` 中的 `scoreAtPosition()` 函數。

---

## 🐛 常見問題

### 球不掉落？

- 檢查 console 是否有錯誤
- 確認 Rapier WASM 已加載
- 重新整理頁面

### 性能不佳？

- 按 F 鍵查看 FPS
- 減少同時活躍球數
- 降低球的 segments

### 音效不工作？

- 按 M 鍵確認音效已開啟
- 確認瀏覽器允許音頻播放
- 在移動端需要點擊螢幕才能啟動音頻

### 觸控不靈敏？

- 確認在移動設備上測試
- 檢查是否有其他事件監聽器衝突

---

## 📚 進階學習

想深入了解？查看：

1. **`docs/PRD.md`** - 完整的產品需求文檔
2. **`docs/DEPLOYMENT.md`** - 詳細部署指南
3. **Git 提交歷史** - 每個功能的實現過程
4. **代碼註釋** - 詳細的實現說明

---

## 🎓 學習路徑

### 第 1 天：理解基礎

- 閱讀 `src/main.ts` 了解初始化流程
- 查看 `src/scene/createScene.ts` 了解 BabylonJS
- 查看 `src/physics/rapierWorld.ts` 了解 Rapier

### 第 2 天：實體系統

- 研究 `src/entities/Ball.ts` 的物件池模式
- 了解 `src/entities/PegGrid.ts` 的幾何生成
- 探索 `src/entities/ScoringBins.ts` 的分數邏輯

### 第 3 天：遊戲循環

- 深入 `src/systems/GameLoop.ts` 的同步機制
- 理解碰撞事件處理
- 學習狀態管理

### 第 4 天：UI 和音效

- 探索 `src/ui/` 目錄的 UI 管理
- 研究 `src/audio/AudioManager.ts` 的程序化音效
- 了解 `src/visual/MaterialManager.ts` 的材質系統

---

**開始你的 Plinko 之旅！** 🚀
