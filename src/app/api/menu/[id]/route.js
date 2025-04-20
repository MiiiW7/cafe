import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET a specific menu item by ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(menuItem, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Error fetching menu item' },
      { status: 500 }
    );
  }
}

// UPDATE a menu item (admin only)
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Check if the menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    // Update the menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : menuItem.name,
        description: data.description !== undefined ? data.description : menuItem.description,
        price: data.price !== undefined ? parseFloat(data.price) : menuItem.price,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : menuItem.imageUrl,
        category: data.category !== undefined ? data.category : menuItem.category,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : menuItem.isAvailable
      }
    });
    
    return NextResponse.json(updatedMenuItem, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Error updating menu item' },
      { status: 500 }
    );
  }
}

// DELETE a menu item (admin only)
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Check if the menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Error deleting menu item' },
      { status: 500 }
    );
  }
} 