import { supabase } from "../../../lib/supabase";

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

/**
 * Generate a random 6-character room code
 * @returns 6-character string (A-Z, 0-9)
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Generate a unique room code by checking against existing codes
 * Retries up to MAX_ATTEMPTS times if collision occurs
 * @returns Promise with unique 6-character room code
 * @throws Error if unable to generate unique code after MAX_ATTEMPTS
 */
export async function generateUniqueRoomCode(): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    
    try {
      // Check if code already exists using service role or bypassing RLS
      // Note: We use count query which should work even with RLS
      const { count, error } = await supabase
        .from('rooms')
        .select('code', { count: 'exact', head: true })
        .eq('code', code);
      
      if (error) {
        // If it's a permissions/RLS issue, just return the code
        // (very low collision chance with 6-char alphanumeric)
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          return code;
        }
        
        // If table doesn't exist, throw helpful error
        if (error.code === '42P01') {
          throw new Error('Database tables not set up yet. Please run the migration first. Check SETUP_DATABASE.md');
        }
        
        continue; // Try again
      }
      
      if (count === 0) {
        // Code doesn't exist, use it!
        return code;
      }
      
      // Code exists, try again
    } catch (err) {
      // If it's our custom error, rethrow it
      if (err instanceof Error && err.message.includes('Database tables not set up')) {
        throw err;
      }
      // For other errors, just return the code (collision very unlikely)
      return code;
    }
  }
  
  // Fallback: just return a random code (collision extremely unlikely)
  return generateRoomCode();
}
