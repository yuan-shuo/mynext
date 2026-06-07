import prisma from '@/lib/prisma'

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div>
      <h1>
        Superblog
      </h1>
      <ol>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
          </li>
        ))}
      </ol>
    </div>
  );
}