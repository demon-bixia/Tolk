export let template = `<% if (notifications.length === 0){ %> <p class="empty-section">no new notifications right now <i
            class="flaticon-notification"></i></p><% }else{ %>
    <ul class="notifications" role="tablist">
        <% for(let count = notifications.length - 1; count >= 0 ;--count){ %> <% if (notifications[count].type === 'authentication'){ %>
        <li>
            <div class='round'><i data-eva="lock"></i></div>
            <p><strong><%= notifications[count].type %></strong> <%= notifications[count].content %></p>
        </li><% }else if (notifications[count].type === 'accounts'){ %>
        <li>
            <div class='round'><i data-eva="people"></i></div>
            <p><strong><%= notifications[count].type %></strong> <%= notifications[count].content %></p>
        </li><% }else if (notifications[count].type === 'chat'){ %>
        <li>
            <div class='round'><i data-eva="message-circle"></i></div>
            <p><strong><%= notifications[count].type %></strong> <%= notifications[count].content %></p>
        </li><% }else if (notifications[count].type === 'default'){ %>
        <li>
            <div class='round'><i data-eva="checkmark-circle"></i></div>
            <p><strong><%= notifications[count].type %></strong> <%= notifications[count].content %></p></li><% } %>
        <% } %>
    </ul><% } %>
`