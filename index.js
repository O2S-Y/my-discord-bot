require("dotenv").config(); // Load vars from .env into process.env

const {
    Client,
    GatewayIntentBits,
    PermissionFlagsBits,
    ChannelType,
} = require("discord.js");
const express = require("express");

// Express setup for uptime
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Discord Role Bot is running! 🤖");
});

app.listen(port, () => {
    console.log(`Web server is running on port ${port}`);
});

// Bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Map of invitation codes to role names
const ROLE_CODES = {
    "SECOND123@": "Second_Brain",
    "CREATOR123@": "Creator_Brain",
    "STUDENT123@": "Student_Brain",
    "FINANCE123@": "Finance_Brain",
    "GAME123@": "Game_Mode",
};

// On ready, build server structure
client.once("ready", async () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (guild) await setupServerStructure(guild);
});

// Handle incoming messages
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();

    if (content.startsWith("!role ")) {
        const code = content.slice(6).toUpperCase();
        if (ROLE_CODES[code]) await assignRole(message, code);
        else
            await message.reply(
                "❌ Invalid code! Please check your code and try again.",
            );
    }

    if (content === "!help") {
        const helpEmbed = {
            color: 0x0099ff,
            title: "🤖 Role Assignment Bot",
            description:
                "Use `!role <CODE>` to get access to exclusive channels!",
            fields: [
                {
                    name: "Commands",
                    value: "`!role <CODE>` - Assign role using code\n`!help` - Show this help message",
                },
                { name: "Example", value: "`!role ALPHA2024`" },
            ],
            footer: { text: "Contact an admin if you need a code!" },
        };
        await message.reply({ embeds: [helpEmbed] });
    }
});

// Assign a role based on code
async function assignRole(message, code) {
    try {
        const guild = message.guild;
        const member = message.member;
        const roleName = ROLE_CODES[code];

        let role = guild.roles.cache.find((r) => r.name === roleName);
        if (!role)
            return message.reply(
                "❌ Role not found! Please contact an administrator.",
            );

        if (member.roles.cache.has(role.id)) {
            return message.reply(
                `✅ You already have the **${roleName}** role!`,
            );
        }

        await member.roles.add(role);

        const successEmbed = {
            color: 0x00ff00,
            title: "🎉 Role Assigned Successfully!",
            description: `You now have the **${roleName}** role!`,
            fields: [
                {
                    name: "What's Next?",
                    value: `You can now access your exclusive **${roleName}** channels and category.`,
                },
            ],
        };

        await message.reply({ embeds: [successEmbed] });
        setTimeout(() => message.delete().catch(() => {}), 5000);
    } catch (err) {
        console.error("Error assigning role:", err);
        await message.reply(
            "❌ An error occurred while assigning the role. Please contact an administrator.",
        );
    }
}

// Build server structure: roles, categories, channels
async function setupServerStructure(guild) {
    try {
        for (const roleName of Object.values(ROLE_CODES)) {
            let role = guild.roles.cache.find((r) => r.name === roleName);
            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: getRandomColor(),
                    reason: "Bot setup",
                });
            }

            let category = guild.channels.cache.find(
                (c) =>
                    c.name === roleName && c.type === ChannelType.GuildCategory,
            );
            if (!category) {
                category = await guild.channels.create({
                    name: roleName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: role.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                        },
                    ],
                });
            }

            const channels = [
                `${roleName.toLowerCase().replace(/\s+/g, "-")}-general`,
                `${roleName.toLowerCase().replace(/\s+/g, "-")}-announcements`,
            ];

            for (const chanName of channels) {
                let chan = guild.channels.cache.find(
                    (c) => c.name === chanName && c.parentId === category.id,
                );
                if (!chan) {
                    const perms = chanName.includes("announcements")
                        ? [
                              PermissionFlagsBits.ViewChannel,
                              PermissionFlagsBits.ReadMessageHistory,
                          ]
                        : [
                              PermissionFlagsBits.ViewChannel,
                              PermissionFlagsBits.SendMessages,
                              PermissionFlagsBits.ReadMessageHistory,
                          ];

                    await guild.channels.create({
                        name: chanName,
                        type: ChannelType.GuildText,
                        parent: category,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            { id: role.id, allow: perms },
                        ],
                    });
                }
            }
        }
        console.log("Server structure setup complete!");
    } catch (err) {
        console.error("Error setting up server structure:", err);
    }
}

// Random hex color generator
function getRandomColor() {
    return Math.floor(Math.random() * 0xffffff);
}

// Handle client errors\ nclient.on('error', console.error);

// Login the bot
client.login(process.env.DISCORD_TOKEN);

module.exports = client;
