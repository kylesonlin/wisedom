import { NextRequest, NextResponse } from 'next/server';
import { ContactsService } from '@/services/contacts';
import { z } from 'zod';

const idSchema = z.object({
  id: z.string().uuid('Invalid contact ID'),
});

const updateContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  imageUrl: z.string().url().optional(),
  source: z.string().optional(),
  rawData: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await idSchema.parseAsync({ id });
    const contact = await ContactsService.getContactById(id);
    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await idSchema.parseAsync({ id });
    const data = await request.json();
    await updateContactSchema.parseAsync(data);
    const contact = await ContactsService.updateContact({
      id,
      ...data,
    });
    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await idSchema.parseAsync({ id });
    await ContactsService.deleteContact(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
} 