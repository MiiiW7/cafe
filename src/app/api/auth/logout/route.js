import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response
    const response = NextResponse.json({
      message: 'Logged out successfully'
    }, { status: 200 });
    
    // Clear the userId cookie
    response.cookies.set({
      name: 'userId',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Error during logout' },
      { status: 500 }
    );
  }
} 