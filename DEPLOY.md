# 部署到 Vercel 指南

## 1. 准备代码

确保代码已推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/wedding-seats.git
git push -u origin main
```

## 2. Vercel 部署步骤

### 方法一：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 方法二：Vercel Dashboard (推荐)

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 `wedding-seats`
4. 配置项目：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 添加环境变量（见第3步）
6. 点击 "Deploy"

## 3. 环境变量配置

在 Vercel Dashboard 的 Project Settings → Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | https://your-project.supabase.co | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your-anon-key | Production, Preview, Development |

获取方式：
- 登录 [Supabase Dashboard](https://app.supabase.com)
- 进入你的项目 → Settings → API
- `URL` 对应 `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` 对应 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. 构建配置

项目已配置 `next.config.js`：

```js
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};
```

`package.json` 构建脚本：

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

## 5. Supabase 配置

### 启用 Realtime

在 Supabase Dashboard → Database → Replication 中：
1. 确保 `tables`, `guests`, `conflicts` 表已启用 realtime
2. 检查 `supabase_realtime` publication 包含这些表

### 添加初始数据

在 SQL 编辑器中执行：

```sql
-- 添加示例桌子
INSERT INTO tables (name, type, capacity, position_x, position_y, relation_type) VALUES
('主桌', 'round', 10, 0, 0, '新人'),
('亲戚桌1', 'round', 10, 100, 100, '亲戚'),
('亲戚桌2', 'round', 10, 300, 100, '亲戚'),
('同事桌', 'long', 12, 100, 300, '同事'),
('同学桌', 'round', 10, 300, 300, '同学');
```

## 6. 域名配置（可选）

1. Vercel Dashboard → Project Settings → Domains
2. 添加自定义域名
3. 按提示配置 DNS 记录

## 7. 自动部署

连接 GitHub 后，每次推送到 `main` 分支会自动触发部署。

---

**祝部署顺利！** 如有问题，请检查：
- 环境变量是否正确配置
- Supabase 数据库表是否已创建
- Realtime 是否已启用
