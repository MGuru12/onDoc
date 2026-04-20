if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod') {
    try {
        require("./env/env");
    } catch (err) {
        console.log("Local env.js not found, using system environment variables.");
    }
}
// require("./env/env");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("./db/configDB");
console.log(`Accessed ${process.env.NODE_ENV} mode env variables`);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'https://on-doc-beta.vercel.app'];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    exposedHeaders: ['x-access-token', 'cookie']
}));
app.use(cookieParser());
const port = process.env.PORT || 3001;

const authRoute = require("./Routes/auth");
const projectRoute = require("./Routes/project");
const docsRoute = require("./Routes/docs");
const fileRoutes = require("./Routes/storage");
const member = require("./Routes/member");
const profile = require("./Routes/profile");
const admin = require("./Routes/admin");
const kb = require("./Routes/kb");
const razorpay = require("./Routes/razorpay");

const router = express.Router();

router.get('/', (req, res) => { res.json({ message: `Welcome to onDoc server and running mode: ${process.env.MODE}` }) });

router.use('/file', fileRoutes);
router.use('/auth', authRoute);
router.use('/project', projectRoute);
router.use('/docs', docsRoute);
router.use('/member', member);
router.use('/profile', profile);
router.use('/admin', admin);
router.use('/kb', kb);
router.use('/razorpay', razorpay);

app.use('/api', router);
app.use('/', router);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

module.exports = app;