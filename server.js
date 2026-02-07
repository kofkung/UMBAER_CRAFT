require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, AttachmentBuilder, ChannelType } = require('discord.js');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

const PORT = 3000;
const GUILD_ID = process.env.GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CATEGORY_ID = '1430525989104123975'; // 🟢 Category ID from user

// Serve Static Files from 'dist' (Vite Build)
app.use(express.static(path.join(__dirname, 'dist'))); // 🟢 Added this line


// Order Endpoint
// Order Endpoint
app.post('/api/order', upload.any(), async (req, res) => {
    console.log('📥 Received Order Request');
    try {
        if (!GUILD_ID || !BOT_TOKEN) {
            throw new Error('Missing Discord Configuration');
        }

        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const { name, discordId, scale, part, price, paymentMethod } = req.body;
        const files = req.files || [];

        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) throw new Error(`Guild not found: ${GUILD_ID}`);
        console.log(`✅ Guild Found: ${guild.name}`);

        // Create Ticket Channel
        // Clean name for channel (lowercase, alphanumeric + dashes)
        const safeName = name ? name.replace(/[^a-zA-Z0-9ก-๙]/g, '-').toLowerCase() : 'unknown';
        const channelName = `ticket-${safeName}-website`;

        console.log(`🔨 Creating Channel: ${channelName} in Category: ${CATEGORY_ID}`);

        // Try to fetch user to tag them
        let userTag = `@here`;
        let targetUser = null;
        try {
            // Remove possible extra spaces or format issues
            const cleanDiscordId = discordId.trim();
            // Check if it's a snowflake ID (numbers only)
            if (/^\d+$/.test(cleanDiscordId)) {
                targetUser = await client.users.fetch(cleanDiscordId);
                if (targetUser) {
                    userTag = `<@${targetUser.id}>`;
                    console.log(`✅ User Found: ${targetUser.tag}`);
                }
            } else {
                console.log(`⚠️ Invalid Discord ID format: ${cleanDiscordId}`);
            }
        } catch (err) {
            console.error(`⚠️ Could not fetch user: ${err.message}`);
        }

        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID, // 🟢 Create under this category
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: client.user.id, // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                ...(targetUser ? [{
                    id: targetUser.id, // The Customer
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                }] : [])
            ],
        });

        console.log(`✅ Channel Created: ${channel.id}`);

        // Prepare Attachments
        const attachments = files.map(file => {
            return new AttachmentBuilder(file.path, { name: file.originalname });
        });

        // Create Embed
        const embed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle('🛍️ New Order Ticket')
            .setDescription(`Channel for order: **${name}**`)
            .addFields(
                { name: '👤 Customer', value: `${name} (${targetUser ? targetUser.username : discordId})`, inline: true },
                { name: '💰 Price', value: price, inline: true },
                { name: '💳 Payment', value: paymentMethod, inline: true },
                { name: '📦 Service', value: scale, inline: true },
                { name: '🧩 Part', value: part, inline: true },
                { name: '🆔 Channel', value: `<#${channel.id}>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Umbaer Craft System' });

        // Send to Channel
        await channel.send({
            content: `สวัสดีครับ ${userTag} ! ขอบคุณที่สั่งซื้อสินค้ากับเรา Admin จะรีบติดต่อกลับให้เร็วที่สุดครับ`,
            embeds: [embed],
            files: attachments
        });

        console.log('✅ Message Sent to Channel');

        // Cleanup files
        files.forEach(file => fs.unlinkSync(file.path));

        res.json({ success: true, channelId: channel.id, message: 'Ticket created successfully' });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

// Start Server
client.once('ready', () => {
    console.log(`🤖 Discord Bot logged in as ${client.user.tag}`);
});

client.login(BOT_TOKEN);

// Serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
