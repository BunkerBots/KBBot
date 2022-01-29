module.exports = async (client, i) => {
    const roleID = i.values[0];
    if (!roleID) return client.emit('log', `No role found: ${roleID}`);
    const role = await i.guild.roles.fetch(roleID);

    const clickerMember = await i.member.fetch();
    if (clickerMember.roles.cache.has(role.id)) {
        clickerMember.roles.remove(role);
        return i.reply({ content: `${role} was **removed** from you`, ephemeral: true });
    } else {
        clickerMember.roles.add(role);
        return i.reply({ content: `${role} was **added** to you`, ephemeral: true });
    }
}