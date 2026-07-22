type DiscordLogOptions = {
  title: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
};

export async function sendDiscordLog({
  title,
  description,
  color = 0x5865f2,
  fields = [],
}: DiscordLogOptions) {
  const webhookUrl =
    process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "DISCORD_WEBHOOK_URL belum diatur"
    );
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "VexdHub Logs",
        embeds: [
          {
            title,
            description,
            color,
            fields,
            timestamp: new Date().toISOString(),
            footer: {
              text: "VexdHub License System",
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "Discord webhook gagal:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error(
      "Discord webhook error:",
      error
    );
  }
}