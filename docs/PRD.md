# PRD: Plinko Web Game (TypeScript + BabylonJS + Rapier3D)

**Purpose:**  
建立一個行動裝置優先（mobile-first）的 Plinko 網頁遊戲，用來學習 BabylonJS 與 Rapier 物理整合。  
此版本為 **單機 / 無伺服器** Prototype。

---

## 🎯 1. 目標與範圍

### 1.1 目標

- 在行動瀏覽器中實現一個可玩的 **Plinko 掉球遊戲**。
- 使用 **BabylonJS** 做 3D 渲染（球、釘板、底盤）。
- 使用 **Rapier 3D (WASM)** 做物理模擬。
- 玩家可點擊螢幕上方投球，球會彈跳穿越釘子並落入底部分數格。
- 支援簡易 UI（得分顯示、重置按鈕、FPS 顯示）。

### 1.2 不包含

- 無需伺服器或多人連線。
- 不需排行榜或金幣機制。
- 無內購、登入系統。

---

## 📱 2. 使用情境（User Flow）

1. 玩家開啟網頁，看到一個直立的 **Plinko 釘板**。
2. 點擊螢幕上方任意位置 → 掉下一顆球。
3. 球在 Rapier 物理世界中彈跳、碰撞，最終落入底部某一格。
4. 落格依位置獲得分數（例如中間 100、邊緣 10）。
5. 當畫面上球數太多，舊球會被回收或重置。
6. 玩家可按「重置」清除所有球，重新開始。

---

## 🧱 3. 遊戲要素

| 元件          | 說明                                                              |
| ------------- | ----------------------------------------------------------------- |
| 球 (Ball)     | Rapier 動態剛體 (Sphere)。半徑 0.2。                              |
| 釘子 (Peg)    | 固定剛體 (Rapier Fixed Body)。小球形狀 (radius 0.1)。以三角排列。 |
| 板邊          | 固定牆壁。限制球不飛出。                                          |
| 底部槽格      | 固定牆壁排列成分格，每格對應一個分數。                            |
| 地面 (Ground) | 平面剛體，防止球掉出世界。                                        |
| 相機          | ArcRotateCamera / UniversalCamera。預設垂直俯視。                 |
| 光源          | HemisphericLight。                                                |
| 材質          | 簡單色塊或漸層（行動裝置效能優先）。                              |
| UI            | HTML Overlay 顯示「得分」「投球按鈕」「重置」。                   |

---

## ⚙️ 4. 技術架構

**技術棧：**

- TypeScript
- Vite 開發環境
- BabylonJS (for rendering)
- @dimforge/rapier3d-compat (for physics)
- React 或簡單 HTML（視 Cursor 自動生成而定）

**運作原理：**

1. 初始化 Babylon 引擎與 Rapier 物理世界。
2. 每一幀：
   - 呼叫 `world.step()`（Rapier 模擬）。
   - 將每個 Rapier 剛體的座標同步到 Babylon Mesh。
3. 玩家觸控事件觸發：
   - 建立一顆球剛體 + Mesh，丟入場景。
4. 偵測球落入某區域 → 加分。

---

## 🧠 5. 核心邏輯與流程

```ts
initialize() {
  initBabylonScene();
  await RAPIER.init();
  world = new RAPIER.World(gravity);
  createWallsAndPegs(world);
}

onFrame() {
  world.step();
  syncMeshesWithBodies();
  render();
}

onTap(x, y) {
  spawnBall(world, x);
}

checkBallLanded(ball) {
  if (ball.position.y < bottomY) {
    assignScore(ball);
    recycle(ball);
  }
}
```

---

## 📐 6. 場景設計（正三角交錯 12 排 pins）

### 6.1 釘板幾何

- **列數（rows）**：`R = 12`
- **每列釘數**：第 `r` 列有 `r+1` 顆 pin（頂部 1 顆，往下每列 +1）
- **水平間距（s）**：`0.8`
- **垂直間距（v）**：`s * sqrt(3) / 2`
- **列偏移（stagger）**：每列相對上一列水平位移 `s/2`（形成蜂巢結構）
- **pin 半徑**：`0.1`
- **第一列（r=0）**：置於 `y = topY`，`x = 0`
- **第 r 列的座標公式**：
  - `y_r = topY - r * v`
  - `offset_r = (r % 2 === 0 ? 0 : 0.5) * s`
  - `x_{r,i} = offset_r + (i - r/2) * s`
  - `i = 0..r`
- 此排列形成 **等邊三角形交錯格**，整體輪廓為正三角形。

### 6.2 板寬與高度

- **最底列寬**：`W_bottom ≈ (R-1) * s + 2 * pinR`
- **場地寬度**：`W = W_bottom + 2 * wallMargin`（`wallMargin ≈ 0.6`）
- **板高**：`H ≈ (R-1) * v + topMargin + bottomMargin`
  - `topMargin ≈ 2.0`
  - `bottomMargin ≈ 2.0`
- **重力**：`(0, -9.81, 0)`

### 6.3 落槽（bins）

- **槽數**：`R + 1 = 13`
- **槽寬**：`binWidth = s`
- **槽位置**：中心線與最底列 pin 間隙對齊
  - 每個隔板放在 `x = x_{R-1,i} + s/2`（i=0..R-2）
- **底線 y**：`binsY = y_{R-1} - v`
- **計分**：中心高分，向外遞減，例如：  
  `[10,20,30,50,80,100,150,100,80,50,30,20,10]`

### 6.4 牆與地板

- **左右牆**：`x = ±(W/2)`，高度覆蓋整板。
- **底地板**：略低於 `binsY - 0.5`。
- **隔板**：在每個 bin 邊界建立薄牆。

### 6.5 相機

- **ArcRotateCamera**，固定距離與俯視角度，使整個三角釘板置中。
- **自適應**：根據螢幕比例略調整半徑。

---

### 6.6 生成演算法

```ts
type Pin = { x: number; y: number };

export function generateTrianglePins(params?: {
  rows?: number;
  s?: number;
  topY?: number;
}) {
  const R = params?.rows ?? 12;
  const s = params?.s ?? 0.8;
  const v = (s * Math.sqrt(3)) / 2;
  const topY = params?.topY ?? 10;

  const pins: Pin[] = [];

  for (let r = 0; r < R; r++) {
    const y = topY - r * v;
    const offset = (r % 2 === 0 ? 0 : 0.5) * s;
    for (let i = 0; i <= r; i++) {
      const x = offset + (i - r / 2) * s;
      pins.push({ x, y });
    }
  }

  const bottomRowCount = R;
  const bottomWidth = (bottomRowCount - 1) * s;
  const binsY = topY - (R - 1) * v - v;
  return { pins, s, v, topY, binsY, bottomWidth, rows: R };
}
```

---

### 6.7 落槽（bins）位置生成

```ts
export function generateBins(info: {
  rows: number;
  s: number;
  topY: number;
  v: number;
}) {
  const { rows: R, s, topY, v } = info;
  const bottomY = topY - (R - 1) * v;
  const binsY = bottomY - v;

  const gapXs: number[] = [];
  for (let i = 0; i < R; i++) {
    const xi = (i - (R - 1) / 2) * s;
    const nextXi = (i + 1 - (R - 1) / 2) * s;
    const gap = (xi + nextXi) / 2;
    gapXs.push(gap);
  }

  const binBoundaries = [-Infinity, ...gapXs, Infinity];

  const bins = Array.from({ length: R + 1 }, (_, k) => ({
    idx: k,
    x0: binBoundaries[k],
    x1: binBoundaries[k + 1],
    y: binsY,
    score: scoreFor(k, R),
  }));

  return { bins, binsY, gapXs };
}

function scoreFor(k: number, R: number) {
  const center = R / 2;
  const dist = Math.abs(k - center);
  const base = 150;
  const step = 15;
  return Math.max(10, Math.round(base - dist * step));
}
```

---

## 💡 7. UI 元素（HTML Overlay）

| 元件        | 功能             | 備註                    |
| ----------- | ---------------- | ----------------------- |
| 🎯 分數顯示 | 顯示目前總分     | 固定右上角              |
| ⚪ 投球按鈕 | 產生一顆新球     | 可長按連發（冷卻 0.3s） |
| 🔁 重置按鈕 | 清除所有球       | 清空分數                |
| 🧭 FPS 顯示 | Babylon 內部回報 | debug 模式可關閉        |

---

## 🧰 8. 核心功能需求

| 模組         | 功能描述                                            |
| ------------ | --------------------------------------------------- |
| SceneSetup   | 建立 Babylon 引擎、相機、燈光。                     |
| PhysicsSetup | 初始化 Rapier 世界，設定重力、牆壁、地面。          |
| PegGrid      | 產生釘子固定體與 Mesh。                             |
| BallPool     | 球的物件池（避免過多 create/destroy）。             |
| GameLoop     | requestAnimationFrame → Rapier.step() → Mesh 同步。 |
| Scoring      | 判定球落格位置並加分。                              |
| UIManager    | HTML overlay 控制投球與重置。                       |

---

## 🔧 9. 技術細節

- **物理世界固定步長**：`dt = 1/60`
- **球體碰撞屬性**：restitution = 0.4，friction = 0.3，density = 1.0
- **Peg 固定剛體**：restitution = 0.2，friction = 0.6
- **底部偵測**：若球中心 `y < -1` → 判定落地，依 `x` 位置決定得分
- **移除機制**：超過底部 2m → 從 world 移除；回收 Mesh

---

## 🧩 10. 專案結構建議

```
/src
 ├── main.ts
 ├── scene/createScene.ts
 ├── physics/rapierWorld.ts
 ├── entities/PegGrid.ts
 ├── entities/Ball.ts
 ├── systems/GameLoop.ts
 ├── ui/HUD.tsx
 └── styles.css
```

---

## 🧪 11. 測試與驗證

- 點擊上方 → 球落下並彈跳。
- 球掉入不同區域 → 顯示分數。
- FPS ≥ 30。
- 不會穿透牆壁。
- 「重置」恢復初始狀態。

---

## 📈 12. 優化與擴充（未來可選）

- 硬幣材質 / 光影效果。
- 球顏色依分數改變。
- 每次投球播放音效。
- 支援橫屏模式。
- 場景動態縮放（自適應螢幕比例）。

---

## ✅ 13. Plan Mode 任務分解

1. 初始化專案
   - 使用 `Vite + TypeScript`。
   - 安裝：`@babylonjs/core`、`@babylonjs/loaders`、`@dimforge/rapier3d-compat`。
2. 建立渲染場景
   - `createScene(canvas)`：引擎、相機、燈光、render loop。
3. 整合 Rapier 物理引擎
   - `RAPIER.init()` 後建立 `World`，創建牆、地板、釘子、底槽。
4. 同步 Mesh ↔ Body
   - 每幀更新位置與旋轉。
5. 投球機制
   - 點擊螢幕上方 → 新增球剛體。
6. 得分與 UI
   - 落入槽格範圍 → 加分；UI 顯示分數與按鈕。
7. 效能優化
   - 限制最大球數（如 50 顆），行動端禁陰影。

---

## 🏁 14. 完成條件（MVP）

- 玩家可互動投球。
- 物理穩定。
- 分數正確。
- 可重置。
- 行動裝置流暢可玩。

---
