import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json(
        { message: 'Código de invitación requerido' },
        { status: 400 }
      )
    }

    // Conectar con el backend de Express
    const response = await axios.post(
      `http://localhost:5000/api/parties/${params.id}/join`,
      { inviteCode },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error uniéndose a fiesta:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al unirse a la fiesta' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}