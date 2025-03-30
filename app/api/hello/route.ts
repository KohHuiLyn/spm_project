import { NextResponse } from 'next/server'

/**
 * To test if running, you can use the following command in your terminal:
 * curl -X GET http://localhost:3000/api/hello
 * 
 * You can also test it in your browser or Postman:
 * http://localhost:3000/api/hello
 */
export async function GET() {
  return NextResponse.json({ message: 'Hello from App Router API route!' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
