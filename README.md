# 婚礼座位管理系统 (Wedding Seats)

一个基于 Next.js 14 + Supabase + shadcn/ui 的婚礼座位管理系统，支持实时协作、拖拽排座、自动分组和冲突检测。

## 功能特性

- 宾客管理：添加、删除、分类管理宾客信息
- 座位图：可视化圆桌/长桌，拖拽分配座位
- 实时同步：多设备实时协作，显示在线人数
- 自动排座：按关系自动分组分配到对应桌子
- 冲突检测：标记不能坐在一起的宾客，拖拽时红色警告
- 导出功能：座位图导出 PNG，宾客名单导出 CSV
- 婚礼主题：红金配色，书法字体，撒花动画
- 移动端适配：支持长按拖拽，简化视图

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (数据库 + 实时订阅)
- @dnd-kit/core (拖拽)
- html2canvas (截图导出)
- Framer Motion (动画)

## 快速开始

### 1. 安装依赖

```bash
cd wedding-seats
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入你的 Supabase 项目信息：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 创建数据库表

在 Supabase SQL 编辑器中执行 `supabase/migrations/001_initial_schema.sql` 中的 SQL。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

见 [DEPLOY.md](DEPLOY.md)

## 数据库结构

### guests 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 姓名 |
| side | enum | bride/groom/both |
| relation | text | 关系 |
| table_id | uuid | 所属桌子（nullable） |
| seat_number | int | 座位号（nullable） |
| special_needs | text | 特殊需求 |
| created_at | timestamp | 创建时间 |

### tables 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 桌号 |
| type | enum | round/long |
| capacity | int | 容量 |
| position_x | int | X坐标 |
| position_y | int | Y坐标 |
| relation_type | text | 关系类型标记 |
| created_at | timestamp | 创建时间 |

### conflicts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| guest_a_id | uuid | 宾客A |
| guest_b_id | uuid | 宾客B |
| reason | text | 原因 |
| created_at | timestamp | 创建时间 |

## 许可证

MIT
