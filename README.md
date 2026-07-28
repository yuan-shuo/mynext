[![CI](https://github.com/yuan-shuo/mynext/actions/workflows/ci.yml/badge.svg)](https://github.com/yuan-shuo/mynext/actions/workflows/ci.yml)

# 端到端测试

## auth

### 登录前

- [x] 注册
- [x] 登录
- [ ] 未验证邮箱时登录
- [ ] 忘记密码

### 登录后

- [ ] 修改密码
- [ ] 换绑邮箱

# 杂项

```bash
pnpm add -D @playwright/test
npx playwright install
pnpm add -D dotenv dotenv-cli @types/dotenv
pnpm dotenv -e .env.test -- prisma db push

pnpm test tests/env-check.spec.ts
pnpm test tests/auth-flow.spec.ts
```
