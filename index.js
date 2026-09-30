 const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } =
  require('discord.js');
  const express = require('express');
  const app = express();

  // --- UYANDIRMA SİSTEMİ (Keep-Alive) ---
  app.get('/', (req, res) => {
    res.send('RealMC Botu Aktif ve Uyanık! 🛡️');
  });
  app.listen(3000, () => console.log('Uyandırma sunucusu 3000 portunda aktif.'));

  // --- BOT YAPILANDIRMASI ---
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  const TOKEN = 'BURAYA_BOT_TOKENINI_YAZ';
  const CLIENT_ID = 'BURAYA_BOT_IDSINI_YAZ';

  // Renk Paleti
  const COLOR = 0x0099FF; // Koyu Mavi (Altın sarısı istersen 0xFFD700 yap)

  client.on('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı! RealMC için hazır! ⚔️`);
    client.user.setActivity('/yardim | Klan Yönetimi', { type: 3 });
  });

  // --- KOMUT YÖNETİMİ ---
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user, guild } = interaction;

    // 🛡️ YETKİLİ KOMUTLARI
    if (commandName === 'ban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkin yok!', ephemeral: true });

      const target = options.getUser('kullanıcı');
      const reason = options.getString('sebep') || 'Belirtilmedi';
      await guild.members.ban(target, { reason });

      const embed = new EmbedBuilder()
        .setTitle('🛡️ Kullanıcı Yasaklandı')
        .setDescription(`**Kullanıcı:** ${target}\n**Sebep:** ${reason}\n**Yetkili:** ${user}`)
        .setColor(COLOR)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'sil') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return interaction.reply({ content: '❌ Mesaj silme yetkin yok!', ephemeral: true });

      const amount = options.getInteger('miktar');
      await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({ content: `✅ ${amount} adet mesaj başarıyla temizlendi.`, ephemeral: true });
    }

    if (commandName === 'duyuru') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: '❌ Sadece Üst Yönetim duyuru yapabilir!', ephemeral: true });

      const msg = options.getString('mesaj');
      const embed = new EmbedBuilder()
        .setTitle('📢 RealMC Resmi Duyuru')
        .setDescription(msg)
        .setColor(COLOR)
        .setFooter({ text: 'RealMC Yönetimi' })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      return interaction.reply({ content: '✅ Duyuru başarıyla paylaşıldı!', ephemeral: true });
    }

    // 📊 GENEL KOMUTLAR
    if (commandName === 'ip') {
      const embed = new EmbedBuilder()
        .setTitle('🎮 RealMC Sunucu Bilgileri')
        .setDescription('**Sunucu Adresi:** `play.realmc.net` \n**Durum:** 🟢 Aktif \n**Aktif Oyuncular:** 👥 42/100')
        .setColor(COLOR)
        .setThumbnail(guild.iconURL());

      return interaction.reply({ embeds: [embed] });
    }

    // ⚔️ KLAN SİSTEMLERİ
    if (commandName === 'klan-basvuru') {
      const isim = options.getString('isim');
      const yas = options.getString('yaş');
      const aktiflik = options.getString('aktiflik');
      const deneyim = options.getString('deneyim');

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Yeni Klan Başvurusu!')
        .addFields(
          { name: '👤 İsim', value: isim, inline: true },
          { name: '🎂 Yaş', value: yas, inline: true },
          { name: '🕒 Aktiflik', value: aktiflik, inline: true },
          { name: '📜 Deneyim', value: deneyim }
        )
        .setColor(COLOR)
        .setFooter({ text: 'Onay bekliyor...' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('onay').setLabel('Onayla').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ret').setLabel('Reddet').setEmoji('❌').setStyle(ButtonStyle.Danger)
      );

      // Başvuruları göndereceğin kanal ID'sini buraya yaz
      const basvuruKanal = guild.channels.cache.get('BASVURU_KANAL_ID');
      if (basvuruKanal) {
        await basvuruKanal.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '✅ Başvurunuz iletildi, lütfen yetkililerin onayını bekleyin.', ephemeral:
  true });
      } else {
        return interaction.reply({ content: '❌ Başvuru kanalı bulunamadı, lütfen yöneticiye bildirin.', ephemeral: true
  });
      }
    }
  });

  // Buton etkileşimleri (Onay/Red)
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'onay') {
      await interaction.reply({ content: '✅ Başvuru onaylandı!', ephemeral: true });
      await interaction.message.edit({ content: '✅ **Bu başvuru ONAYLANDI.**', components: [] });
    } else if (interaction.customId === 'ret') {
      await interaction.reply({ content: '❌ Başvuru reddedildi!', ephemeral: true });
      await interaction.message.edit({ content: '❌ **Bu başvuru REDDEDİLDİ.**', components: [] });
    }
  });

  client.login TOKEN
