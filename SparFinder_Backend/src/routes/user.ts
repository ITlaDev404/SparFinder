import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from '../db/database';
import { user, userSport, sport } from '../models';

const userRoute = new Elysia({ prefix: '/users' })
  .get('/', async () => {
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

    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      return { success: false, error: 'Email already exists' };
    }

    const result = await db.insert(user).values({ email, password, firstName, lastName });
    return { success: true, data: result };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
    })
  })
  .post('/login', async ({ body }) => {
    const { email, password } = body as { email: string; password: string };

    const result = await db.select().from(user).where(eq(user.email, email));

    if (result.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const foundUser = result[0];
    if (foundUser.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    return { success: true, user: { id: foundUser.id, email: foundUser.email, firstName: foundUser.firstName } };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .put('/:id', async ({ params: { id }, body }) => {
    const numericId = Number(id);
    const { firstName, lastName, height, weight, level, location } = body as {
      firstName?: string;
      lastName?: string;
      height?: number;
      weight?: number;
      level?: string;
      location?: string;
    };

    return { success: true, data: await db.update(user).set({ firstName, lastName, height, weight, level, location }).where(eq(user.id, numericId)) };
  }, {
    body: t.Object({
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      height: t.Optional(t.Number()),
      weight: t.Optional(t.Number()),
      level: t.Optional(t.String()),
      location: t.Optional(t.String()),
    })
  })
  .delete('/:id', async ({ params: { id } }) => {
    const numericId = Number(id);
    return { success: true, data: await db.delete(user).where(eq(user.id, numericId)) };
  })
  .post('/:id/sports', async ({ params: { id }, body }) => {
    const numericId = Number(id);
    const { sportId } = body as { sportId: number };

    return { success: true, data: await db.insert(userSport).values({ userId: numericId, sportId }) };
  }, {
    body: t.Object({
      sportId: t.Number(),
    })
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
  });

export default userRoute;
