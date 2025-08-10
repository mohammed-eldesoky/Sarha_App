import { connectDB } from "./DB/connection.js";
import{authRouter,messageRouter,userRouter} from "./modules/index.js";
import cors from "cors";

function bootstrap(app,express){
//parse req body [raw json]
app.use(express.json());


//2-app.use(express.static())


//cors
app.use(cors({
    origin:"*"
//origin // who connect to my project 
}))
//route handlers
app.use("/auth",authRouter);
app.use("/message",messageRouter);
app.use("/user",userRouter);


//global error handler
app.use((err,req,res,next)=>{
res.status(err.cause||500).json({message:err.message,success:false,stack:err.stack})
})

//connectDB  : >> operation buffering
connectDB();

}
export default bootstrap;