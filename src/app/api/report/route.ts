import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  try {
    // 1. Verificar autenticación del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error de sesión de Supabase:', sessionError.message);
      return NextResponse.json({ message: 'Error al verificar la sesión.' }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ message: 'No autenticado. Debes iniciar sesión para reportar.' }, { status: 401 });
    }

    const user = session.user;

    // 2. Parsear el cuerpo de la solicitud
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json({ message: 'Cuerpo de la solicitud inválido (no es JSON).' }, { status: 400 });
    }

    const { postId, reason, commentId } = requestData;
    
    // Validar que al menos tenemos un ID de post o comentario
    if (!postId && !commentId) {
      return NextResponse.json({ 
        message: 'Debes especificar al menos el ID de una publicación o un comentario para reportar.'
      }, { status: 400 });
    }

    // No permitir reportar ambos a la vez (esto también está asegurado por la constraint en la DB)
    if (postId && commentId) {
      return NextResponse.json({ 
        message: 'Solo puedes reportar una publicación o un comentario, no ambos a la vez.'
      }, { status: 400 });
    }

    // 3. Validar la razón del reporte
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json({ message: 'Falta la razón del reporte o está vacía.' }, { status: 400 });
    }

    // Lista de razones válidas (ajustar según tu aplicación)
    const validReasons = ['spam', 'harmful', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ 
        message: `Razón inválida: ${reason}. Razones válidas: ${validReasons.join(', ')}`
      }, { status: 400 });
    }

    // 4. Obtener el ID del fandom (requerido según SUPABASE.md)
    let fandomId;
    
    if (postId) {
      // Obtener el fandom_id de la publicación
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('fandom_id')
        .eq('id', postId)
        .single();

      if (postError || !postData) {
        console.error('Error al obtener datos del post:', postError?.message || 'Post no encontrado');
        return NextResponse.json({ 
          message: postId ? `La publicación con ID ${postId} no existe.` : 'Datos de publicación no encontrados.'
        }, { status: 404 });
      }
      
      fandomId = postData.fandom_id;
    } else if (commentId) {
      // Para comentarios, necesitamos primero obtener el post_id y luego el fandom_id
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .single();

      if (commentError || !commentData) {
        console.error('Error al obtener datos del comentario:', commentError?.message || 'Comentario no encontrado');
        return NextResponse.json({ 
          message: `El comentario con ID ${commentId} no existe.`
        }, { status: 404 });
      }

      // Ahora obtenemos el fandom_id del post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('fandom_id')
        .eq('id', commentData.post_id)
        .single();

      if (postError || !postData) {
        console.error('Error al obtener fandom del post:', postError?.message);
        return NextResponse.json({ 
          message: 'No se pudo determinar el fandom asociado a este comentario.'
        }, { status: 500 });
      }
      
      fandomId = postData.fandom_id;
    }

    if (!fandomId) {
      return NextResponse.json({ 
        message: 'No se pudo determinar el fandom del contenido reportado.'
      }, { status: 400 });
    }

    // 5. Insertar el reporte en la base de datos
    const { data: reportData, error: insertError } = await supabase
      .from('reports')
      .insert([
        {
          reporter_id: user.id,
          reason: reason,
          post_id: postId || null,
          comment_id: commentId || null,
          fandom_id: fandomId,
          status: 'pending'
        }
      ])
      .select();

    if (insertError) {
      console.error('Error al insertar reporte:', insertError);
      
      // Manejo específico de errores comunes
      if (insertError.code === '23505') { // Violación de unique constraint
        return NextResponse.json({ 
          message: 'Ya has reportado este contenido anteriormente.'
        }, { status: 409 }); // Conflict
      }
      
      return NextResponse.json({ 
        message: `Error al guardar el reporte: ${insertError.message}`
      }, { status: 500 });
    }

    // 6. Opcionalmente: Generar notificación para moderadores
    // Esto podría implementarse si se requiere

    // 7. Responder con éxito
    return NextResponse.json({ 
      message: 'Reporte enviado con éxito. Un moderador lo revisará pronto.',
      report: reportData?.[0] || null
    }, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error('Error inesperado en API /api/report:', error);
    return NextResponse.json({ 
      message: `Error interno del servidor: ${error.message || 'Error desconocido'}`
    }, { status: 500 });
  }
} 