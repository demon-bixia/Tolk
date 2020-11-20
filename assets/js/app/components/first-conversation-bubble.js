export let template =
`<ul class="nav discussion" role="tablist">
    <% if (conversation.type === 'couple'){ %> <% for(let participant of conversation.participants){ %> <% if (participant.id !== authenticated_contact.id){ %>
    <li><a href="#conversation_<%= conversation.id %>" class="filter direct" data-id="<%= conversation.id %>"
           data-name="<%= conversation.name %>" data-user="<%= participant.user %>" data-toggle="tab" data-chat="open"
           role="tab" aria-controls="<%= conversation.data %>" aria-selected="true">
            <div class="status online">
                <div class="circle-status"><img src="<%= participant.contact_pic %>" alt="avatar"></div>
            </div>
            <div class="content">
                <div class="headline"><h5><%= participant.first_name %> <%= participant.last_name %></h5> <span>
                        <% if (conversation.last_message_date){ %>
                        <%= conversation.last_message_data %>
                        <% } %>
                    </span></div>
                <p>
                    <% if (conversation.last_message){ %>
                    <%= conversation.last_message.slice(0, 20) %>...
                    <% } %>
                </p></div>
        </a></li><% } %> <% } %>
    <% } %>
    <% if (conversation.type === 'group'){ %>
    <li><a href="#conversation_<%= conversation.id %>" class="filter direct" data-id="<%= conversation.id %>"
           data-name="<%= conversation.name %>" data-toggle="tab" data-chat="open" role="tab"
           aria-controls="<%= conversation.name %>" aria-selected="true">
            <div class="status online">
                <div class="circle-status"><img src="<%= conversation.header %>" alt="avatar"></div>
            </div>
            <div class="content">
                <div class="headline"><h5><%= conversation.name %></h5> <span>
                        <% if (conversation.last_message_date){ %>
                        <%= conversation.last_message_data %>
                        <% } %>
                    </span></div>
                <p>
                    <% if (conversation.last_message){ %>
                    <%= conversation.last_message.slice(0, 20) %>...
                    <% } %>
                </p></div>
        </a></li>
    <% } %>
</ul>
`