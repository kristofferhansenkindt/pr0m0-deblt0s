import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest) {
  try {
    const { cpf, reason } = await request.json()

    if (!cpf || !reason) {
      return NextResponse.json({ error: "CPF e motivo são obrigatórios" }, { status: 400 })
    }

    // Busca dados do usuário antes de excluir (para auditoria)
    const userData = await sql`
      SELECT u.*, 
             COUNT(DISTINCT s.id) as total_sessions,
             COUNT(DISTINCT v.id) as total_vehicles,
             COUNT(DISTINCT d.id) as total_debitos,
             COUNT(DISTINCT e.id) as total_events
      FROM users u
      LEFT JOIN sessions s ON u.cpf = s.cpf
      LEFT JOIN vehicles v ON u.cpf = v.cpf
      LEFT JOIN debitos d ON u.cpf = d.cpf
      LEFT JOIN events e ON u.cpf = e.cpf
      WHERE u.cpf = ${cpf}
      GROUP BY u.id, u.cpf, u.nome, u.email, u.telefone, u.created_at, u.updated_at
    `

    if (userData.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = userData[0]

    // Inicia transação para exclusão em cascata
    await sql`BEGIN`

    try {
      // 1. Exclui eventos
      const deletedEvents = await sql`
        DELETE FROM events WHERE cpf = ${cpf}
      `

      // 2. Exclui débitos
      const deletedDebitos = await sql`
        DELETE FROM debitos WHERE cpf = ${cpf}
      `

      // 3. Exclui veículos
      const deletedVehicles = await sql`
        DELETE FROM vehicles WHERE cpf = ${cpf}
      `

      // 4. Exclui sessões
      const deletedSessions = await sql`
        DELETE FROM sessions WHERE cpf = ${cpf}
      `

      // 5. Exclui usuário
      const deletedUser = await sql`
        DELETE FROM users WHERE cpf = ${cpf}
      `

      // 6. Registra ação de auditoria
      await sql`
        INSERT INTO admin_actions (action_type, target_data, reason)
        VALUES (
          'DELETE_USER',
          ${JSON.stringify({
            user: user,
            deleted_counts: {
              events: deletedEvents.length,
              debitos: deletedDebitos.length,
              vehicles: deletedVehicles.length,
              sessions: deletedSessions.length,
              user: deletedUser.length,
            },
          })},
          ${reason}
        )
      `

      await sql`COMMIT`

      return NextResponse.json({
        success: true,
        message: `Usuário ${user.nome} excluído permanentemente`,
        deleted: {
          user: deletedUser.length,
          sessions: deletedSessions.length,
          vehicles: deletedVehicles.length,
          debitos: deletedDebitos.length,
          events: deletedEvents.length,
        },
      })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
