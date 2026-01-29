import { NextResponse } from 'next/server';

// ⚠️ INSTRUCCIÓN: Pega aquí tu URL de Webhook de Discord
// 1. Ve a tu servidor de Discord -> Editar Canal -> Integraciones -> Webhooks -> Nuevo Webhook
// 2. Copia el "Webhook URL" y pégalo abajo dentro de las comillas.
const DISCORD_WEBHOOK_URL = "";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, surname, role, phone, sessionId } = body;

        console.log("📝 Nuevo Ingreso Registrado:", body);

        // Si no hay Webhook configurado, solo guardamos en log servidor (simulado)
        if (!DISCORD_WEBHOOK_URL) {
            return NextResponse.json({
                success: true,
                message: "Registro local exitoso (Alerta no enviada: Falta Webhook URL)"
            });
        }

        // Enviar a Discord
        const discordPayload = {
            embeds: [
                {
                    title: "🚨 Nuevo Acceso Detectado (MVP)",
                    color: 0xff0000, // Rojo Redondos
                    fields: [
                        { name: "👤 Nombre", value: `${name} ${surname}`, inline: true },
                        { name: "💼 Cargo", value: role, inline: true },
                        { name: "📱 Celular", value: phone, inline: false },
                        { name: "🆔 Sesión", value: sessionId || "N/A", inline: true },
                        { name: "⏰ Hora", value: new Date().toLocaleString(), inline: true }
                    ],
                    footer: { text: "Vanguard Digital Twin System" }
                }
            ]
        };

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error notification API:", error);
        return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 });
    }
}
