if(process.env.NODE_ENV!=='prod') {
    require("./env/env");
}
// require("./env/env");
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("./db/configDB");
console.log(`Accessed ${process.env.NODE_ENV} mode env variables`);

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors({origin:'http://localhost:5173', credentials: true, exposedHeaders: ['x-access-token', 'cookie']}));
app.use(cookieParser());
const port = process.env.PORT || 3001;

const authRoute = require("./Routes/auth");
const projectRoute = require("./Routes/project");
const docsRoute = require("./Routes/docs");
const fileRoutes = require("./Routes/storage");
const member = require("./Routes/member");

app.get('/', (req,res)=>{res.json({message: `Welcome to onDoc server and running mode: ${process.env.MODE}`})});

app.use('/file', fileRoutes);

app.use('/auth', authRoute);
app.use('/project', projectRoute);
app.use('/docs', docsRoute);
app.use('/member', member);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});