import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axavdsrihemzsamnwgcf.supabase.co'; // Substitua pela URL do seu projeto Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4YXZkc3JpaGVtenNhbW53Z2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTU5MzgsImV4cCI6MjA3MzI3MTkzOH0.X1xxTTVQfBqMjj_a4JuEQVpJHH33ufzi18STsxYUpMw'; // Substitua pela chave anon do seu projeto

export const supabase = createClient(supabaseUrl, supabaseAnonKey);