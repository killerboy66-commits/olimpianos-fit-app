import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://olimpianos-fit-app.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("VITE_SUPABASE_URL carregada?", !!supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY carregada?", !!supabaseServiceRoleKey);

if (!supabaseUrl) {
  throw new Error("Falta VITE_SUPABASE_URL no .env");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY no .env");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);