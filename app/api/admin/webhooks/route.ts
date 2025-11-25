import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_H5ztya4WPQTY@ep-cool-tree-acu3e9gi-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
const sql = neon(DATABASE_URL)

export async function GET() {
  try {
    console.log("📊 Buscando webhooks...")

    const webhooks = await sql`
      SELECT 
        id,
        transaction_id,
        status,
        event_type,
        headers,
        body,
        client_ip,
        user_agent,
        processed,
        error_message,
        created_at,
        updated_at
      FROM webhooks 
      ORDER BY created_at DESC 
      LIMIT 100
    `

    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN processed = true THEN 1 END) as processed,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as errors
      FROM webhooks
    `

    return NextResponse.json({
      success: true,
      webhooks,
      stats: stats[0],
    })
  } catch (error) {
    console.error("❌ Erro ao buscar webhooks:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar webhooks" }, { status: 500 })
  }
}
