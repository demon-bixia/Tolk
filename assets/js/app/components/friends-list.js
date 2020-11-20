export let template =
`<% if (contacts.length === 1){ %> <p class="empty-section">to add new contacts click the <i
            class="flaticon-add-button"></i> button</p><% }else{ %>
    <ul class="users" role="tablist">
        <% let counter = 0; %>
        <% for(let contact of contacts){ %> <% if (contact.id !== authenticated_contact.id){ %>
        <li><a href='#' class='contact' data-authenticated-contact="<%= authenticated_contact.id %>" data-contact="<%= contact.id %>" data-user="<%= contact.user %>">
                <div class='status online'><img src='<%= contact.contact_pic %>' alt='avatar'></div>
                <div class='content'><h5><%= contact.first_name %> <%= contact.last_name %></h5>
                    <span><%= contact.location %></span></div>
                <div class='icon'><i class='flaticon-user'></i></div>
            </a></li><% } %>
        <% } %>
    </ul><% } %>
`;