const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');
const express = require('express');

// Create Express app for Replit hosting
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord Role Bot is running! 🤖');
});

app.listen(port, () => {
    console.log(`Web server is running on port ${port}`);
});

// Bot configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Role and code configuration
const ROLE_CODES = {
    'SECOND123@': 'Second_Brain',
    'CREATOR123@': 'Creator_Brain', 
    'STUDENT123@': 'Student_Brain',
    'FINANCE123@': 'Finance_Brain',
    'GAME123@': 'Game_Mode'
};

// Bot ready event
client.once('ready', async () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);

    // Setup server structure on bot startup
    const guild = client.guilds.cache.first(); // Gets the first guild the bot is in
    if (guild) {
        await setupServerStructure(guild);
    }
});

// Message event handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if message starts with !role command
    if (message.content.startsWith('!role ')) {
        const code = message.content.slice(6).trim().toUpperCase();

        if (ROLE_CODES[code]) {
            await assignRole(message, code);
        } else {
            await message.reply('❌ Invalid code! Please check your code and try again.');
        }
    }

    // Help command
    if (message.content === '!help') {
        const helpEmbed = {
            color: 0x0099ff,
            title: '🤖 Role Assignment Bot',
            description: 'Use `!role <CODE>` to get access to exclusive channels!',
            fields: [
                {
                    name: 'Commands',
                    value: '`!role <CODE>` - Assign role using code\n`!help` - Show this help message'
                },
                {
                    name: 'Example',
                    value: '`!role ALPHA2024`'
                }
            ],
            footer: {
                text: 'Contact an admin if you need a code!'
            }
        };

        await message.reply({ embeds: [helpEmbed] });
    }
});

// Function to assign roles
async function assignRole(message, code) {
    try {
        const guild = message.guild;
        const member = message.member;
        const roleName = ROLE_CODES[code];

        // Find the role
        let role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            await message.reply('❌ Role not found! Please contact an administrator.');
            return;
        }

        // Check if user already has the role
        if (member.roles.cache.has(role.id)) {
            await message.reply(`✅ You already have the ${roleName} role!`);
            return;
        }

        // Assign the role
        await member.roles.add(role);

        // Success message
        const successEmbed = {
            color: 0x00ff00,
            title: '🎉 Role Assigned Successfully!',
            description: `You now have the **${roleName}** role!`,
            fields: [
                {
                    name: 'What\'s Next?',
                    value: `You can now access your exclusive **${roleName}** channels and category.`
                }
            ]
        };

        await message.reply({ embeds: [successEmbed] });

        // Delete the original message for security
        setTimeout(() => {
            message.delete().catch(console.error);
        }, 5000);

    } catch (error) {
        console.error('Error assigning role:', error);
        await message.reply('❌ An error occurred while assigning the role. Please contact an administrator.');
    }
}

// Function to setup server structure
async function setupServerStructure(guild) {
    try {
        console.log('Setting up server structure...');

        // Create roles if they don't exist
        for (const roleName of Object.values(ROLE_CODES)) {
            let role = guild.roles.cache.find(r => r.name === roleName);

            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: getRandomColor(),
                    reason: 'Role assignment bot setup'
                });
                console.log(`Created role: ${roleName}`);
            }

            // Create category for this role
            let category = guild.channels.cache.find(c => c.name === roleName && c.type === ChannelType.GuildCategory);

            if (!category) {
                category = await guild.channels.create({
                    name: roleName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: role.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });
                console.log(`Created category: ${roleName}`);
            }

            // Create general channel in category
            let generalChannel = guild.channels.cache.find(c => 
                c.name === `${roleName.toLowerCase().replace(' ', '-')}-general` && 
                c.parentId === category.id
            );

            if (!generalChannel) {
                generalChannel = await guild.channels.create({
                    name: `${roleName.toLowerCase().replace(' ', '-')}-general`,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: role.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });
                console.log(`Created channel: ${generalChannel.name}`);
            }

            // Create announcements channel in category
            let announcementsChannel = guild.channels.cache.find(c => 
                c.name === `${roleName.toLowerCase().replace(' ', '-')}-announcements` && 
                c.parentId === category.id
            );

            if (!announcementsChannel) {
                announcementsChannel = await guild.channels.create({
                    name: `${roleName.toLowerCase().replace(' ', '-')}-announcements`,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: role.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ReadMessageHistory
                            ],
                            deny: [PermissionFlagsBits.SendMessages] // Read-only for regular members
                        }
                    ]
                });
                console.log(`Created channel: ${announcementsChannel.name}`);
            }
        }

        console.log('Server structure setup complete!');

    } catch (error) {
        console.error('Error setting up server structure:', error);
    }
}

// Helper function to generate random colors for roles
function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
}

// Error handling
client.on('error', console.error);

// Login with your bot token from environment variables
client.login(process.env.DISCORD_TOKEN);

// Export for modular usage
module.exports = client;