/**
 * The executable to connect to the database
 */

import express from "express"; 
import cors from "cors";
import { connectDB } from './db.js';

import routes from './routes/routes.js'

const app = express();
const port = 5000;

connectDB();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static("views"));

// route to the user api keys
app.use("/api/users", routes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Ctrl + C to stop server.');
});