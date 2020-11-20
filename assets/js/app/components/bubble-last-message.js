export let template = `
<p>
    <% if (!message.is_file) { %>  <%= message.content.slice(0, 40) %>
    <% } else { %> <%= message.attachments[0].file_name.slice(0, 20) %>
    <% } %>
    ...</p>
`;