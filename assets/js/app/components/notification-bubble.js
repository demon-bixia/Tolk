export let template = `<% if (notification.type === 'authentication'){ %>
<li>
    <div class='round'><i data-eva="lock"></i></div>
    <p><strong><%= notification.type %></strong> <%= notification.content %></p>
</li><% }else if (notification.type === 'accounts'){ %>
<li>
    <div class='round'><i data-eva="people"></i></div>
    <p><strong><%= notification.type %></strong> <%= notification.content %></p>
</li><% }else if (notification.type === 'chat'){ %>
<li>
    <div class='round'><i data-eva="message-circle"></i></div>
    <p><strong><%= notification.type %></strong> <%= notification.content %></p>
</li><% }else if (notification.type === 'default'){ %>
<li>
    <div class='round'><i data-eva="checkmark-circle"></i></div>
    <p><strong><%= notification.type %></strong> <%= notification.content %></p></li><% } %>`;