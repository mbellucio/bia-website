# PostgreSQL + Prisma no Next.js 16

## VS Code Extension

Instala a extensão **[Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)** (`Prisma.prisma`) — ela oferece:

- Syntax highlighting no `schema.prisma`
- Autocompletar para modelos, tipos e relações
- Formatação automática ao salvar
- Linting e validação do schema em tempo real

---

## 1. Instalação das dependências

```bash
npm install prisma --save-dev
npm install @prisma/client
```

Inicializa o Prisma (cria `prisma/schema.prisma` e `.env`):

```bash
npx prisma init --datasource-provider postgresql
```

---

## 2. Variável de ambiente

No `.env` gerado, configura a connection string do Postgres:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
```

> **Nunca commita o `.env`** — confirma que está no `.gitignore`.

Para produção (Vercel, Railway, etc.), define `DATABASE_URL` nas variáveis de ambiente da plataforma.

---

## 3. Definindo o Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

---

## 4. Migrations

Sempre que alterar o schema, roda uma migration:

```bash
# Cria e aplica a migration (dev)
npx prisma migrate dev --name nome_da_migration

# Aplica migrations pendentes (produção)
npx prisma migrate deploy

# Visualiza o banco no browser (Prisma Studio)
npx prisma studio
```

---

## 5. Singleton do Prisma Client no Next.js

O Next.js em desenvolvimento faz hot-reload e isso pode criar múltiplas instâncias do client. Cria o arquivo `src/lib/prisma.ts`:

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 6. Usando no Next.js 16 (App Router)

### Data Access Layer (recomendado)

O Next.js 16 recomenda criar uma **Data Access Layer (DAL)** — funções server-side isoladas que controlam o acesso ao banco:

```ts
// src/lib/dal/users.ts
import { prisma } from "@/lib/prisma";
import { cache } from "react";

// cache() memoiza durante o request
export const getUserById = cache(async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
});

export async function createUser(email: string, name?: string) {
  return prisma.user.create({ data: { email, name } });
}
```

### Server Component (leitura)

```tsx
// src/app/users/page.tsx
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
}
```

### Server Action (escrita via formulário)

```tsx
// src/app/users/new/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function NewUserPage() {
  async function createUser(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    if (!email) throw new Error("Email obrigatório");

    await prisma.user.create({ data: { email, name } });
    redirect("/users");
  }

  return (
    <form action={createUser}>
      <input name="email" type="email" required placeholder="Email" />
      <input name="name" type="text" placeholder="Nome" />
      <button type="submit">Criar usuário</button>
    </form>
  );
}
```

### Route Handler (API REST)

```ts
// src/app/api/users/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name },
  });
  return NextResponse.json(user, { status: 201 });
}
```

---

## 7. Checklist de segurança

- [ ] `DATABASE_URL` nunca exposta no client (só usada em Server Components, Server Actions e Route Handlers)
- [ ] Validar e sanitizar inputs antes de passar ao Prisma
- [ ] Nunca passar dados de formulário diretamente para `prisma.create()` sem validação
- [ ] Usar autenticação/autorização dentro de cada Server Action (ver guia de auth do Next.js)
- [ ] Em produção, usar `prisma migrate deploy` (não `migrate dev`)

---

## Referências

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma + Next.js guide](https://www.prisma.io/nextjs)
- [Next.js Data Security guide](https://nextjs.org/docs/app/guides/data-security)
