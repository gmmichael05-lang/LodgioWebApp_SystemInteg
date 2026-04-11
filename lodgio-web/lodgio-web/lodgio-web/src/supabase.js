import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzigcwfyyfezvhdffprk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aWdjd2Z5eWZlenZoZGZmcHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTk1MzEsImV4cCI6MjA4ODM5NTUzMX0.DQW95WwTQS-20MVb3BT573Mg42TTm1LZDoQzRmmZjHQ';

export const supabase = createClient(supabaseUrl, supabaseKey);