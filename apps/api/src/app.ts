// import express from 'express';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cors from 'cors';
// import usersRouter from './routes/users';
// import privateRoutes from './routes/private.routes';
// import authUser from "./auth/auth.routes";

// import dotenv from 'dotenv';

// dotenv.config()
// const app: express.Express = express();

// app.use(helmet());
// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());

// app.get('/', (_req, res) => res.send({ status: 'ok', service: 'api' }));
// app.use('/users', usersRouter);
// app.use('/auth', authUser );
// app.use('/private', privateRoutes)

// export default app;

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import privateRoutes from './routes/private.routes'
import userRoutes from './routes/users'
import authRoutes from './routes/auth.routes'

dotenv.config()
const app: express.Express = express()

app.use(cors())
app.use(express.json())

app.use('/private', privateRoutes)

app.use('/auth', authRoutes)

app.use('/user', userRoutes)

export default app

