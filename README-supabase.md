# Supabase Setup for Flappy Heaven Scores

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

## 2. Create the Scores Table

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script

This will create:
- `scores` table with columns: `id`, `name`, `score`, `created_at`
- Row Level Security (RLS) enabled
- Anonymous insert/select policies
- Performance indexes

## 3. Get Your Configuration

1. Go to Settings → API in your Supabase dashboard
2. Copy your **Project URL** (looks like: `https://your-project-id.supabase.co`)
3. Copy your **anon public** key

## 4. Update Configuration

Edit `config.js` and replace the placeholders:

```javascript
const SUPABASE_CONFIG = {
    REST_URL: 'https://your-actual-project-id.supabase.co',
    ANON_KEY: 'your-actual-anon-key-here'
};
```

## 5. Test the Setup

You can test the API endpoints:

**Insert a score:**
```bash
curl -X POST 'https://your-project-id.supabase.co/rest/v1/scores' \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Player1", "score": 100}'
```

**Get top scores:**
```bash
curl 'https://your-project-id.supabase.co/rest/v1/scores?select=*&order=score.desc&limit=10' \
  -H "apikey: your-anon-key"
```

## Security Note

The current setup allows anonymous access for development. Before going to production, you should:
- Implement proper authentication
- Add rate limiting
- Restrict access based on your requirements
