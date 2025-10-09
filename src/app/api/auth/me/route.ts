import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Conectar con el backend de Express
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error obteniendo perfil:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al obtener perfil' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}