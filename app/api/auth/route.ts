import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY! // keep this secret!
);

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Missing token', { status: 401 });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
}
