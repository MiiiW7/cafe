import { NextResponse } from 'next/server';
import prisma, { checkDatabaseConnection } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('GET /api/test - Request received');
    
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    console.log('Database connection test:', isConnected);
    
    // Try a simple query
    try {
      const userCount = await prisma.user.count();
      console.log('User count:', userCount);
      
      return NextResponse.json({
        status: 'success',
        databaseConnection: isConnected,
        userCount
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: dbError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test API failed',
      error: error.message
    }, { status: 500 });
  }
} 