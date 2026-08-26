import { NextResponse } from 'next/server';
import { processDueJobs } from '@/lib/jobQueue';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authKey = req.headers.get('authorization') || searchParams.get('key');
    const secret = process.env.CRON_SECRET || 'zappi_cron_secret_2026';

    if (process.env.NODE_ENV === 'production' && authKey !== `Bearer ${secret}` && authKey !== secret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await processDueJobs(30);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}