export let template = `<li class="<% if (message.sender.user == authenticated_user) { %>  self  <% } else { %>  odd  <% } %> "><img
            src="<%= message.sender.contact_pic %>" alt="avatar">
    <div class="content">
        <% if (message.is_file){ %>
            <div class="message downloadable" data-url="<%= message.attachments[0].file %>">
                <div class="bubble"><p><span><i
                                    data-eva="arrow-downward-outline"></i></span> <%= message.attachments[0].file_name.slice(0, 10) %>
                    </p></div>
            </div><span> <%= message.time_sent %> </span>
        <% } else { %>
            <div class="message">
                <div class="bubble"><p> <%= message.content %> </p></div>
            </div><span> <%= message.time_sent %> </span>
        <% } %>
    </div>
</li>`;
