import { NextResponse } from 'next/server';
import prisma, { checkDatabaseConnection } from '../../../lib/prisma';
import { getSession } from '../../../lib/session';

// GET /api/orders - Get all orders (with different behavior for admin vs regular users)
export async function GET(request) {
  try {
    console.log('GET /api/orders - Request received');
    
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const session = await getSession(request);
    console.log('Session:', session);
    
    // Check authentication
    if (!session?.user) {
      console.log('No user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    console.log('User:', { id: userId, role: userRole });
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1;
    const skip = (page - 1) * limit;
    console.log('Query params:', { status, limit, page, skip });

    // Build query filter based on user role and query parameters
    const filter = {};
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Regular users can only see their own orders
    if (userRole !== 'ADMIN') {
      filter.userId = userId;
    }
    
    console.log('Query filter:', filter);
    
    try {
      // Fetch orders with pagination
      const orders = await prisma.order.findMany({
        where: filter,
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });
      
      console.log('Orders found:', orders.length);

      // Get total count for pagination
      const totalOrders = await prisma.order.count({
        where: filter,
      });
      
      console.log('Total orders count:', totalOrders);

      return NextResponse.json({
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          pages: Math.ceil(totalOrders / limit),
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request) {
  try {
    console.log('POST /api/orders - Request received');
    
    const session = await getSession(request);
    console.log('Session:', session);
    
    // Check authentication
    if (!session?.user) {
      console.log('No user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('User ID:', userId);
    
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody));
    
    const { items } = requestBody;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Missing or invalid items array');
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Extract menu item IDs to fetch their prices
    const menuItemIds = items.map(item => item.menuItemId);
    console.log('Menu item IDs:', menuItemIds);

    // Fetch menu items to get their prices
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
    });
    
    console.log('Menu items found:', menuItems.length);
    
    if (menuItems.length === 0) {
      console.log('No menu items found');
      return NextResponse.json(
        { error: 'No valid menu items found' },
        { status: 400 }
      );
    }

    // Calculate order total and create items array
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      
      if (!menuItem) {
        console.log(`Menu item with ID ${item.menuItemId} not found`);
        return NextResponse.json(
          { error: `Menu item with ID ${item.menuItemId} not found` },
          { status: 400 }
        );
      }

      const quantity = item.quantity || 1;
      const subtotal = menuItem.price * quantity;
      
      total += subtotal;
      
      orderItems.push({
        menuItemId: menuItem.id,
        quantity: quantity,
        price: menuItem.price,
      });
    }
    
    console.log('Total calculated:', total);
    console.log('Order items:', orderItems);

    try {
      // Create the order in the database
      console.log('Creating order with data:', {
        userId,
        totalPrice: total,
        status: 'PENDING',
        items: orderItems.length
      });
      
      const order = await prisma.order.create({
        data: {
          userId,
          totalPrice: total,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      console.log('Order created successfully, order ID:', order.id);
      return NextResponse.json(order, { status: 201 });
    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  }
} 
