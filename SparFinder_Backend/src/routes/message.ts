import { Elysia, t } from 'elysia';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/database';
import { message } from '../models';

const messageRoute = new Elysia({ prefix: '/messages' })
  .get('/', async () => {
    return await db.select().from(message);
  })
  .get('/conversation/:user1Id/:user2Id', async ({ params: { user1Id, user2Id } }) => {
    const id1 = Number(user1Id);
    const id2 = Number(user2Id);
    return await db.select().from(message).where(
      or(
        eq(message.senderId, id1),
        eq(message.receiverId, id2)
      )
    );
  })
  .post('/', async ({ body }) => {
    const { senderId, receiverId, content } = body as {
      senderId: number;
      receiverId: number;
      content: string;
    };

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
