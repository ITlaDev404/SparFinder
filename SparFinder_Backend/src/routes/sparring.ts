import { Elysia, t } from 'elysia';
import { eq, and, or } from 'drizzle-orm';
import { db } from '../db/database';
import { sparringRequest, user } from '../models';

const sparringRoute = new Elysia({ prefix: '/sparring' })
  .get('/', async () => {
    return await db.select().from(sparringRequest);
  })
  .get('/received/:userId', async ({ params: { userId } }) => {
    const numericId = Number(userId);
    return await db.select().from(sparringRequest).where(eq(sparringRequest.receiverId, numericId));
  })
  .get('/sent/:userId', async ({ params: { userId } }) => {
    const numericId = Number(userId);
    return await db.select().from(sparringRequest).where(eq(sparringRequest.senderId, numericId));
  })
  .post('/', async ({ body }) => {
    const { senderId, receiverId, sportId, message } = body as {
      senderId: number;
      receiverId: number;
      sportId: number;
      message?: string;
    };

    const existing = await db.select().from(sparringRequest).where(
      and(
        eq(sparringRequest.senderId, senderId),
        eq(sparringRequest.receiverId, receiverId),
        eq(sparringRequest.status, 'pending')
      )
    );

    if (existing.length > 0) {
      return { success: false, error: 'Request already exists' };
    }

    return { success: true, data: await db.insert(sparringRequest).values({ senderId, receiverId, sportId, message, status: 'pending' }) };
  }, {
    body: t.Object({
      senderId: t.Number(),
      receiverId: t.Number(),
      sportId: t.Number(),
      message: t.Optional(t.String()),
    })
  })
  .put('/:id/accept', async ({ params: { id } }) => {
    const numericId = Number(id);
    return { success: true, data: await db.update(sparringRequest).set({ status: 'accepted' }).where(eq(sparringRequest.id, numericId)) };
  })
  .put('/:id/reject', async ({ params: { id } }) => {
    const numericId = Number(id);
    return { success: true, data: await db.update(sparringRequest).set({ status: 'rejected' }).where(eq(sparringRequest.id, numericId)) };
  })
  .delete('/:id', async ({ params: { id } }) => {
    const numericId = Number(id);
    return { success: true, data: await db.delete(sparringRequest).where(eq(sparringRequest.id, numericId)) };
  });

export default sparringRoute;
