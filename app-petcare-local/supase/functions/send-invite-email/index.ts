import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Force redeploy - updated timestamp: 2025-01-05T18:14:30Z
const resendApiKey = Deno.env.get("RESEND_API_KEY");
console.log("=== RESEND API KEY DEBUG ===");
console.log("Key exists:", !!resendApiKey);
console.log("Key length:", resendApiKey?.length || 0);
console.log("Key prefix:", resendApiKey?.substring(0, 10) || "N/A");
console.log("===========================");

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  veterinarioEmail: string;
  tutorNome: string;
  petNome: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { veterinarioEmail, tutorNome, petNome }: InviteEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PetCare+ <noreply@resend.dev>",
      to: [veterinarioEmail],
      subject: "Convite para acessar PetCare+ - Plataforma de Cuidados Veterinários",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PetCare+</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Plataforma de Cuidados Veterinários</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin-top: 0;">Você foi convidado!</h2>
            <p style="color: #475569; line-height: 1.6;">
              <strong>${tutorNome}</strong> gostaria de compartilhar os dados de saúde do pet <strong>${petNome}</strong> com você através da plataforma PetCare+.
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #1e293b;">O que é o PetCare+?</h3>
            <ul style="color: #475569; line-height: 1.8;">
              <li>📋 Histórico completo de consultas e tratamentos</li>
              <li>💉 Controle de vacinas e medicamentos</li>
              <li>📊 Acompanhamento de peso e desenvolvimento</li>
              <li>📸 Galeria de imagens e documentos</li>
              <li>🔒 Acesso seguro e controlado pelo tutor</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://petcare-plus.com'}/auth?mode=signup&role=veterinario" 
               style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Criar Conta Veterinário
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 25px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>💡 Importante:</strong> Certifique-se de usar este mesmo email (${veterinarioEmail}) ao criar sua conta para que o acesso seja automaticamente concedido.
            </p>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p>Este é um convite automático da plataforma PetCare+</p>
            <p>Se você não esperava este email, pode ignorá-lo com segurança.</p>
          </div>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);