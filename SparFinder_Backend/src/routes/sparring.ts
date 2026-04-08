import { Elysia, t } from 'elysia';
import { eq, and, or } from 'drizzle-orm';
import { db } from '../db/database';
import { sparringRequest, user, sport } from '../models';
import { verifyToken } from '../utils/auth';

const authenticate = (headers: Record<string, string | undefined>) => {
  const token = headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
};

const sparringRoute = new Elysia({ prefix: '/sparring' })
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(sparringRequest);
  })
  .get('/received/:userId', async ({ params: { userId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(userId)) return { error: 'Forbidden' };
    
    const numericId = Number(userId);
    const requests = await db.select().from(sparringRequest).where(eq(sparringRequest.receiverId, numericId));
    return Promise.all(requests.map(async (r) => {
      const sender = await db.select().from(user).where(eq(user.id, r.senderId));
      const sportData = await db.select().from(sport).where(eq(sport.id, r.sportId));
      return { ...r, sender: sender[0], sport: sportData[0] };
    }));
  })
  .get('/sent/:userId', async ({ params: { userId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(userId)) return { error: 'Forbidden' };
    
    const numericId = Number(userId);
    const requests = await db.select().from(sparringRequest).where(eq(sparringRequest.senderId, numericId));
    return Promise.all(requests.map(async (r) => {
      const receiver = await db.select().from(user).where(eq(user.id, r.receiverId));
      const sportData = await db.select().from(sport).where(eq(sport.id, r.sportId));
      return { ...r, receiver: receiver[0], sport: sportData[0] };
    }));
  })
  .post('/', async ({ body, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };

    const { senderId, receiverId, sportId, message } = body as {
      senderId: number;
      receiverId: number;
      sportId: number;
      message?: string;
    };

    if (payload.id !== senderId) return { error: 'Forbidden' };

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
  .put('/:id/accept', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const request = await db.select().from(sparringRequest).where(eq(sparringRequest.id, Number(id)));
    if (request.length === 0) return { error: 'Not found' };
    if (request[0].receiverId !== payload.id) return { error: 'Forbidden' };
    
    const numericId = Number(id);
    return { success: true, data: await db.update(sparringRequest).set({ status: 'accepted' }).where(eq(sparringRequest.id, numericId)) };
  })
  .put('/:id/reject', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const request = await db.select().from(sparringRequest).where(eq(sparringRequest.id, Number(id)));
    if (request.length === 0) return { error: 'Not found' };
    if (request[0].receiverId !== payload.id) return { error: 'Forbidden' };
    
    const numericId = Number(id);
    return { success: true, data: await db.update(sparringRequest).set({ status: 'rejected' }).where(eq(sparringRequest.id, numericId)) };
  })
  .delete('/:id', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const request = await db.select().from(sparringRequest).where(eq(sparringRequest.id, Number(id)));
    if (request.length === 0) return { error: 'Not found' };
    if (request[0].senderId !== payload.id && request[0].receiverId !== payload.id) return { error: 'Forbidden' };
    
    const numericId = Number(id);
    return { success: true, data: await db.delete(sparringRequest).where(eq(sparringRequest.id, numericId)) };
  });

export default sparringRoute;
