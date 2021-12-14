module.exports = async(client, btn) => {
    const roleID = btn.customId.split('_')[1];
    if (!roleID) return client.emit('log',`No role found: ${roleID}`);
    const role = await btn.guild.roles.fetch(roleID);

    const clickerMember = await btn.member.fetch();
    if (clickerMember.roles.cache.has(role.id)) {
        clickerMember.roles.remove(role);
        return btn.reply({ content: `${role} was **removed** from you`, ephemeral: true });
    } else {
        clickerMember.roles.add(role);
        return btn.reply({ content: `${role} was **added** to you`, ephemeral: true });
    }
}