[![CI](https://github.com/yuan-shuo/mynext/actions/workflows/ci.yml/badge.svg)](https://github.com/yuan-shuo/mynext/actions/workflows/ci.yml)

# 端到端测试

## auth

### 登录前

- [x] 注册
- [x] 登录
- [x] 未验证邮箱时登录
- [x] 忘记密码

### 登录后

- [x] 修改密码
- [x] 换绑邮箱

# 现有问题

## 登录密码错误会打印过量信息而非正常日志

问题应该在 lib/auth.ts 里，后续排查吧

```Shell
[auth][error] CredentialsSignin: Read more at https://errors.authjs.dev#credentialssignin
    at Module.callback (C:\Users\yuanShuo\db\code\codeBase\TS_code\my-fullstack-app\.next\dev\server\chunks\ssr\0fm__@auth_core_0j1t088._.js:4314:30)
```

# 杂项

```bash
pnpm add -D @playwright/test
npx playwright install
pnpm add -D dotenv dotenv-cli @types/dotenv
pnpm dotenv -e .env.test -- prisma db push

pnpm test tests/env-check.spec.ts
pnpm test tests/auth-flow.spec.ts
```
