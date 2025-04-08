import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/utils/encryption';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, model, temperature, maxTokens } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(apiKey);

    // Store settings in cookies
    const cookieStore = await cookies();
    cookieStore.set('openai_api_key', encryptedApiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    cookieStore.set('openai_model', model, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    cookieStore.set('openai_temperature', temperature.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    cookieStore.set('openai_max_tokens', maxTokens.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const encryptedApiKey = cookieStore.get('openai_api_key')?.value;
    const model = cookieStore.get('openai_model')?.value || 'gpt-4o-mini';
    const temperature = parseFloat(cookieStore.get('openai_temperature')?.value || '0.8');
    const maxTokens = parseInt(cookieStore.get('openai_max_tokens')?.value || '4000');

    // Decrypt the API key if it exists
    const apiKey = encryptedApiKey ? decrypt(encryptedApiKey) : '';

    return NextResponse.json({
      apiKey,
      model,
      temperature,
      maxTokens,
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
} 