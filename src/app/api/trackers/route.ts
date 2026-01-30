import { NextResponse } from 'next/server';

// In-memory store for the demo (Note: In production with Lambda this resets, 
// but for a dev session or with a DB like DynamoDB it persists).
// For the demo, we will also mirror this to a global object if possible.
let globalTrackers: Record<string, any> = {};

export async function GET() {
    return NextResponse.json(globalTrackers);
}

export async function POST(request: Request) {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    globalTrackers[data.id] = {
        ...data,
        lastSeen: Date.now()
    };

    return NextResponse.json({ success: true });
}
