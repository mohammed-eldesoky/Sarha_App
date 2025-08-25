import { connectDB } from "./DB/connection.js";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import cors from "cors";
import { globalErorrHandler } from "./utils/error/index.js";
import { startExpiredTokensCron } from "./utils/jobs/index.js";
import { rateLimit } from "express-rate-limit";

function bootstrap(app, express) {
  // HANDLE RATE LIMIT

  const limiter = rateLimit({
    windowMs: 60 * 100, // 1miniut
    limit: 5,
    handler: (req, res, next, options) => {
      throw new Error(options.message, { cause: options.statusCode });
    },

    skipSuccessfulRequests:true,
  }); //if send morethan 5 will be error

  app.use(limiter);
  //parse req body [raw json]
  app.use(express.json());

  //2-app.use(express.static())

  //cors
  app.use(
    cors({
      origin: "*",
      //origin // who connect to my project
    })
  );
  //route handlers
  app.use("/auth", authRouter);
  app.use("/message", messageRouter);
  app.use("/user", userRouter);

  //global error handler
  app.use(globalErorrHandler);

  //connectDB  : >> operation buffering
  connectDB();

  startExpiredTokensCron();
}
export default bootstrap;
