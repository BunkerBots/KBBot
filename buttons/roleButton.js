

module.exports = async(client, btn) => {
    const roleID = btn.id.split('_')[1];
    if (!roleID) return client.emit('log',`No roles found - ${roleID}`);
    const role = await btn.guild.roles.fetch(roleID);

    await btn.clicker.fetch()
    const clickerMember = btn.clicker.member;
    if (clickerMember.roles.cache.has(role.id)) {
        clickerMember.roles.remove(role);
        return btn.reply.send(`${role} was removed from you`, true);
    } else {
        clickerMember.roles.add(role);
        return btn.reply.send(`${role} was added to you`, true);
    }
    
}