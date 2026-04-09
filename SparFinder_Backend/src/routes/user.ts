import { Elysia, t } from 'elysia';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/database';
import { user, userSport, sport } from '../models';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/auth';

const authenticate = (headers: Record<string, string | undefined>) => {
  const token = headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
};

const userRoute = new Elysia({ prefix: '/users' })
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(user);
  })
  .get('/:id', async ({ params: { id } }) => {
    const numericId = Number(id);
    return await db.select().from(user).where(eq(user.id, numericId));
  })
  .post('/', async ({ body }) => {
    const { email, password, firstName, lastName } = body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      return { success: false, error: 'Email already exists' };
    }

    const hashedPassword = hashPassword(password);
    const result = await db.insert(user).values({ email, password: hashedPassword, firstName, lastName });
    return { success: true, data: result };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
    })
  })
  .post('/login', async ({ body }) => {
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const result = await db.select().from(user).where(eq(user.email, email));

    if (result.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const foundUser = result[0];
    if (!comparePassword(password, foundUser.password)) {
      return { success: false, error: 'Invalid password' };
    }

    const token = generateToken({ id: foundUser.id, email: foundUser.email });
    return { success: true, token, user: { id: foundUser.id, email: foundUser.email, firstName: foundUser.firstName } };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .put('/:id', async ({ params: { id }, headers, body }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    const { firstName, lastName, height, weight, level, country, region } = body as {
      firstName?: string;
      lastName?: string;
      height?: number;
      weight?: number;
      level?: string;
      country?: string;
      region?: string;
    };

    return { success: true, data: await db.update(user).set({ firstName, lastName, height, weight, level, country, region }).where(eq(user.id, numericId)) };
  }, {
    body: t.Object({
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      height: t.Optional(t.Number()),
      weight: t.Optional(t.Number()),
      level: t.Optional(t.String()),
      country: t.Optional(t.String()),
      region: t.Optional(t.String()),
    })
  })
  .delete('/:id', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    return { success: true, data: await db.delete(user).where(eq(user.id, numericId)) };
  })
  .post('/:id/sports', async ({ params: { id }, headers, body }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    const { sportId } = body as { sportId: number };

    return { success: true, data: await db.insert(userSport).values({ userId: numericId, sportId }) };
  }, {
    body: t.Object({
      sportId: t.Number(),
    })
  })
  .delete('/:id/sports/:sportId', async ({ params: { id, sportId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    const numericSportId = Number(sportId);

    return { success: true, data: await db.delete(userSport).where(and(eq(userSport.userId, numericId), eq(userSport.sportId, numericSportId))) };
  })
  .get('/:id/sports', async ({ params: { id } }) => {
    const numericId = Number(id);
    const userSports = await db.select().from(userSport).where(eq(userSport.userId, numericId));
    const sports = await Promise.all(
      userSports.map(async (us) => {
        const sportData = await db.select().from(sport).where(eq(sport.id, us.sportId));
        return sportData[0];
      })
    );
    return sports;
  })
  .get('/sports', async () => {
    return await db.select().from(sport);
  });

export default userRoute;