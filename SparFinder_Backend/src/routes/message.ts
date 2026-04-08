import { Elysia, t } from 'elysia';
import { eq, and, or } from 'drizzle-orm';
import { db } from '../db/database';
import { message } from '../models';
import { verifyToken } from '../utils/auth';

const authenticate = (headers: Record<string, string | undefined>) => {
  const token = headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
};

const messageRoute = new Elysia({ prefix: '/messages' })
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(message);
  })
  .get('/conversation/:user1Id/:user2Id', async ({ params: { user1Id, user2Id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const id1 = Number(user1Id);
    const id2 = Number(user2Id);
    
    if (payload.id !== id1 && payload.id !== id2) return { error: 'Forbidden' };
    
    return await db.select().from(message).where(
      or(
        and(eq(message.senderId, id1), eq(message.receiverId, id2)),
        and(eq(message.senderId, id2), eq(message.receiverId, id1))
      )
    );
  })
  .post('/', async ({ body, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };

    const { senderId, receiverId, content } = body as {
      senderId: number;
      receiverId: number;
      content: string;
    };

    if (payload.id !== senderId) return { error: 'Forbidden' };

    const createdAt = new Date().toISOString();
    return { success: true, data: await db.insert(message).values({ senderId, receiverId, content, createdAt }) };
  }, {
    body: t.Object({
      senderId: t.Number(),
      receiverId: t.Number(),
      content: t.String(),
    })
  });

export default messageRoute;
