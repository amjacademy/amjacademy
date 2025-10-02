const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple test function to log initialization
const testSupabaseConnection = () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log('✅ Supabase client initialized successfully!');
  } else {
    console.error('❌ Supabase URL or ANON key missing!');
  }
};
// Export both supabase client and test function
module.exports = { supabase, testSupabaseConnection };
