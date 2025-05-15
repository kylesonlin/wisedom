import { NextApiRequest, NextApiResponse } from 'next';
import { openApiConfig } from '@/lib/openapi';
import { createApiHandler } from './_base';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  return res.status(200).json(openApiConfig);
};

export default createApiHandler(handler, {
  requireAuth: false,
}); 