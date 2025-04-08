import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface SimulationActivity {
  date: string;
  user: string;
  case: string;
  result: string;
}

interface SimulationStats {
  totalSimulations: number;
  averageCompletionTime: number;
  successRate: number;
  recentActivity: SimulationActivity[];
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Get stats from cookies
    const totalSimulations = parseInt(cookieStore.get('total_simulations')?.value || '0');
    const totalCompletionTime = parseInt(cookieStore.get('total_completion_time')?.value || '0');
    const totalSuccessfulSimulations = parseInt(cookieStore.get('total_successful_simulations')?.value || '0');
    const recentActivityJson = cookieStore.get('recent_activity')?.value || '[]';
    
    // Calculate derived stats
    const averageCompletionTime = totalSimulations > 0 ? Math.round(totalCompletionTime / totalSimulations) : 0;
    const successRate = totalSimulations > 0 ? Math.round((totalSuccessfulSimulations / totalSimulations) * 100) : 0;
    
    // Parse recent activity
    const recentActivity: SimulationActivity[] = JSON.parse(recentActivityJson);
    
    const stats: SimulationStats = {
      totalSimulations,
      averageCompletionTime,
      successRate,
      recentActivity,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { completionTime, isSuccessful, caseTitle } = body;
    
    const cookieStore = await cookies();
    
    // Update total simulations
    const totalSimulations = parseInt(cookieStore.get('total_simulations')?.value || '0') + 1;
    cookieStore.set('total_simulations', totalSimulations.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    // Update total completion time
    const totalCompletionTime = parseInt(cookieStore.get('total_completion_time')?.value || '0') + completionTime;
    cookieStore.set('total_completion_time', totalCompletionTime.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    // Update total successful simulations
    if (isSuccessful) {
      const totalSuccessfulSimulations = parseInt(cookieStore.get('total_successful_simulations')?.value || '0') + 1;
      cookieStore.set('total_successful_simulations', totalSuccessfulSimulations.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    }
    
    // Update recent activity
    const recentActivityJson = cookieStore.get('recent_activity')?.value || '[]';
    const recentActivity: SimulationActivity[] = JSON.parse(recentActivityJson);
    
    // Add new activity
    recentActivity.unshift({
      date: new Date().toISOString(),
      user: 'Anonymous', // In a real app, this would come from authentication
      case: caseTitle,
      result: isSuccessful ? 'Successful' : 'Failed',
    });
    
    // Keep only the last 10 activities
    const trimmedActivity = recentActivity.slice(0, 10);
    
    cookieStore.set('recent_activity', JSON.stringify(trimmedActivity), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    );
  }
} 