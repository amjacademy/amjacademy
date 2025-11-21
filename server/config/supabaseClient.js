// config/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
// ❗ Use SERVICE ROLE key on the backend, not the anon key
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing!");
} else {
  console.log("✅ Supabase server client initialized with service role key.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Optional: simple test
const testSupabaseConnection = () => {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    console.log("✅ Supabase client ready (service role).");
  } else {
    console.error("❌ Supabase env vars missing!");
  }
};

module.exports = { supabase, testSupabaseConnection };
