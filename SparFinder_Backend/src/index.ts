import 'dotenv/config';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { testConnection } from './db/database';

import userRoute from './routes/user';
import sparringRoute from './routes/sparring';
import messageRoute from './routes/message';

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .group('/api', (app) => app
    .use(userRoute)
    .use(sparringRoute)
    .use(messageRoute)
  )
  .listen(3000, async () => {
    await testConnection();
  });

console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`Swagger: http://localhost:3000/swagger`);
