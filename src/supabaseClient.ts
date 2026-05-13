import { createClient } from '@supabase/supabase-js'

// ✅ COPY THESE EXACTLY FROM YOUR SUPABASE → PROJECT → SETTINGS → API
const supabaseUrl = 'https://ydetbyvqcugmpxekgtrd.supabase.co'  // ← CHANGE THIS
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZXRieXZxY3VnbXB4ZWtndHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDUxMzUsImV4cCI6MjA5Mzg4MTEzNX0.VMx8NR0uN_BMOFPxOEvBnK-7bEqOU-P5I4BNWSucN9k'                     // ← CHANGE THIS

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})