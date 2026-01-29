
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static'; // Required for 'output: export' build


const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'infrastructure.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function GET() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
            const data = JSON.parse(fileContent);
            return NextResponse.json(data);
        } else {
            return NextResponse.json(null, { status: 404 });
        }
    } catch (error) {
        console.error('Error reading infrastructure data:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

/*
export async function POST(request: Request) {
    console.log('API: POST /api/infrastructure received');
    try {
        const body = await request.json();
        console.log('API: Body parsed, type:', body?.type);

        // Basic validation
        if (!body || !body.type || body.type !== 'FeatureCollection') {
            return NextResponse.json({ error: 'Invalid GeoJSON' }, { status: 400 });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Infrastructure saved' });

    } catch (error) {
        console.error('Error saving infrastructure data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
*/
