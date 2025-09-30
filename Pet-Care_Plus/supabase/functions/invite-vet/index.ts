// supabase/functions/NOME_DA_SUA_FUNCAO/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req ) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { vet_email, pet_id, tutor_id } = await req.json();

    if (!vet_email || !pet_id || !tutor_id) {
      throw new Error('Os campos vet_email, pet_id e tutor_id são obrigatórios.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: vetProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', vet_email)
      .maybeSingle();

    if (profileError) throw profileError;

    if (vetProfile) {
      const { error: accessError } = await supabaseAdmin.from('vet_access').insert({
        pet_id: pet_id,
        vet_id: vetProfile.id,
        tutor_id: tutor_id,
        permissions: ['consultas', 'vacinas', 'medicamentos', 'alimentacao', 'peso', 'galeria'],
        vet_email: vet_email,
      });
      if (accessError) throw accessError;
      return new Response(JSON.stringify({ status: 'access_granted', message: 'Acesso concedido.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    } else {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(vet_email, {
        redirectTo: 'https://cdceac676b01.ngrok-free.app ', 
      } );
      if (inviteError) throw inviteError;
      return new Response(JSON.stringify({ status: 'invitation_sent', message: 'Convite enviado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
