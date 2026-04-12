# 🛒 E-Commerce Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green.svg)](https://spring.io/projects/spring-boot)
[![Vue.js](https://img.shields.io/badge/Vue.js-2.x-brightgreen.svg)](https://vuejs.org/)
[![JDK](https://img.shields.io/badge/JDK-21-orange.svg)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 一个功能完善的电商全栈应用，包含用户管理、商品管理、订单处理、折扣策略等核心业务模块。

---

## 📋 项目简介

本项目是一个前后端分离的电商平台，采用现代化的技术栈构建，具有良好的可扩展性和维护性。

### ✨ 核心功能

- 👤 **用户管理** - 用户注册、登录、角色管理、余额管理
- 📦 **商品管理** - 商品CRUD、库存管理、分类管理
- 🛍️ **订单系统** - 订单创建、支付、发货、完成全流程
- 💰 **折扣策略** - 支持百分比折扣、固定金额折扣、会员折扣、批量折扣
- 📊 **数据统计** - 订单统计、营收分析、热销商品

---

## 🏗️ 技术架构

### 后端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.5 | 核心框架 |
| JDK | 21 | Java版本 |
| Spring Data JPA | 3.2.5 | 数据持久层 |
| Spring Security | 3.2.5 | 安全认证 |
| H2 Database | 2.x | 开发数据库 |
| Lombok | 1.18.30 | 代码简化 |
| Maven | 3.x | 构建工具 |

### 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue.js | 2.x | 前端框架 |
| Vue CLI | 5.x | 脚手架 |
| Vuex | 4.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |
| Element Plus | 2.x | UI组件库 |
| Axios | 1.x | HTTP客户端 |

---

## 🚀 快速开始

### 环境要求

- JDK 21+
- Node.js 18+
- Maven 3.8+

### 后端启动

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务将运行在 http://localhost:8080

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端应用将运行在 http://localhost:3000

---

## 📁 项目结构

```
ecommerce-platform/
├── backend/                          # 后端项目
│   ├── src/main/java/com/example/ecommerce/
│   │   ├── config/                   # 配置类
│   │   ├── controller/               # REST API控制器
│   │   ├── dto/                      # 数据传输对象
│   │   ├── entity/                   # 实体类
│   │   ├── exception/                # 异常处理
│   │   ├── repository/               # 数据访问层
│   │   ├── service/                  # 业务逻辑层
│   │   └── strategy/                 # 折扣策略模式
│   └── src/main/resources/
│       └── application.yml           # 配置文件
│
├── frontend/                         # 前端项目
│   ├── src/
│   │   ├── api/                      # API接口
│   │   ├── router/                   # 路由配置
│   │   ├── store/                    # Vuex状态管理
│   │   ├── views/                    # 页面组件
│   │   ├── App.vue                   # 根组件
│   │   └── main.js                   # 入口文件
│   └── package.json
│
└── README.md
```

---

## 🔌 API 接口文档

### 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users | 获取所有用户 |
| GET | /api/users/{id} | 获取用户详情 |
| POST | /api/users | 创建用户 |
| PUT | /api/users/{id} | 更新用户 |
| DELETE | /api/users/{id} | 删除用户 |
| GET | /api/users/active/count | 获取活跃用户数量 |

### 商品接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 获取所有商品 |
| GET | /api/products/{id} | 获取商品详情 |
| POST | /api/products | 创建商品 |
| PUT | /api/products/{id} | 更新商品 |
| DELETE | /api/products/{id} | 删除商品 |
| GET | /api/products/best-selling | 获取热销商品 |

### 订单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/orders | 获取所有订单 |
| GET | /api/orders/{id} | 获取订单详情 |
| GET | /api/orders/statistics | 获取订单统计 |
| POST | /api/orders/{id}/pay | 支付订单 |
| POST | /api/orders/{id}/ship | 发货 |
| POST | /api/orders/{id}/complete | 完成订单 |

---

## 🧪 测试

### 后端测试

```bash
cd backend
mvn test
```

### 前端测试

```bash
cd frontend
npm run test
```

---

## 🎯 核心设计亮点

### 1. 折扣策略模式

采用策略模式实现多种折扣方式，易于扩展新的折扣类型：

- `PercentageDiscountStrategy` - 百分比折扣
- `FixedAmountDiscountStrategy` - 固定金额折扣
- `LoyaltyDiscountStrategy` - 会员积分折扣
- `VolumeDiscountStrategy` - 批量折扣

### 2. 订单状态机

订单状态流转：PENDING → PAID → SHIPPED → DELIVERED → COMPLETED

### 3. 数据校验

使用 Bean Validation 对 DTO 进行参数校验，确保数据完整性。

### 4. 全局异常处理

统一的异常处理机制，返回标准化的错误响应。

---

## 📈 未来规划

- [ ] 集成 Redis 缓存
- [ ] 引入 RabbitMQ 消息队列
- [ ] 添加 Elasticsearch 搜索引擎
- [ ] 实现分布式事务
- [ ] 完善单元测试覆盖

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

- **Your Name** - *Initial work* - [YourGithub](https://github.com/yourusername)

---

<p align="center">⭐ Star 本项目如果它对你有帮助!</p>
