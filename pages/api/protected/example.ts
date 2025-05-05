import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // Example: Get user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          return res.status(500).json({ error: 'Error fetching profile' });
        }

        return res.status(200).json({ profile });

      case 'POST':
        // Example: Create a new project
        const { name, description } = req.body;
        
        if (!name || !description) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert([
            {
              name,
              description,
              created_by: user.id,
            },
          ])
          .select()
          .single();

        if (projectError) {
          return res.status(500).json({ error: 'Error creating project' });
        }

        return res.status(201).json({ project });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 