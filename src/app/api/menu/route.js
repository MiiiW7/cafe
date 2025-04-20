import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET all menu items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let menuItems;
    if (category) {
      menuItems = await prisma.menuItem.findMany({
        where: {
          category: category,
          isAvailable: true
        }
      });
    } else {
      menuItems = await prisma.menuItem.findMany({
        where: {
          isAvailable: true
        }
      });
    }
    
    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Error fetching menu items' },
      { status: 500 }
    );
  }
}

// POST a new menu item (admin only)
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.price || !data.category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }
    
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl || null,
        category: data.category,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
      }
    });
    
    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Error creating menu item' },
      { status: 500 }
    );
  }
} 