# 🎨 Textures 紋理資料夾

## 如何添加背板圖片

### 步驟 1: 準備圖片

建議尺寸：

- 寬度：1024-2048 px
- 高度：1024-2048 px
- 格式：JPG 或 PNG
- 檔案大小：< 500 KB（優化後）

### 步驟 2: 命名並放置

將你的圖片命名為 `board-texture.jpg` 並放在這個資料夾：

```
public/textures/board-texture.jpg
```

### 步驟 3: 重新構建

```bash
npm run build
```

### 支援的格式

- ✅ JPG/JPEG（推薦，檔案小）
- ✅ PNG（支援透明）
- ✅ WebP（最佳壓縮）
- ✅ BMP
- ✅ TGA

### 圖片建議

**好的背板圖片**：

- 木紋紋理
- 深色背景
- 低對比度（不要太亮）
- 重複性紋理（seamless）

**範例**：

- 深色木紋
- 碳纖維紋理
- 金屬拉絲
- 布料紋理
- 皮革紋理

### 如果要使用不同檔名

編輯 `src/visual/MaterialManager.ts`：

```typescript
const texture = new Texture("/textures/your-image.jpg", scene);
```

### 紋理設置選項

```typescript
// 在 MaterialManager.ts 中可以調整：
texture.uScale = 2; // 水平重複次數
texture.vScale = 2; // 垂直重複次數
texture.wrapU = Texture.WRAP_ADDRESSMODE; // 重複模式
texture.wrapV = Texture.WRAP_ADDRESSMODE;
```

### 沒有圖片？

程式會自動 fallback 到深色材質，不會報錯。

### 線上資源

免費紋理資源：

- [Poly Haven](https://polyhaven.com/textures)
- [Textures.com](https://www.textures.com/)
- [FreePBR](https://freepbr.com/)

選擇 "Wood" 或 "Metal" 類別的深色紋理。
