import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// GET - Obtener una fiesta específica
export async function GET(
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

    // Conectar con el backend de Express
    const response = await axios.get(`http://localhost:5000/api/parties/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error obteniendo fiesta:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al obtener fiesta' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una fiesta
export async function PUT(
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

    // Conectar con el backend de Express
    const response = await axios.put(`http://localhost:5000/api/parties/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error actualizando fiesta:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al actualizar fiesta' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una fiesta
export async function DELETE(
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

    // Conectar con el backend de Express
    const response = await axios.delete(`http://localhost:5000/api/parties/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return NextResponse.json(response.data, { status: 200 })

  } catch (error: any) {
    console.error('Error eliminando fiesta:', error)
    
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'Error al eliminar fiesta' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}