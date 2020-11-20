export let template = `
<% if (conversations.length === 0){ %>
    <div class="tab-content">
        <div class="empty-chat"><span>click on conversation to start chatting</span></div>
    </div><% }else{ %>
    <div class="tab-content">
        <% for (let conversation of conversations){ %> <% if (conversation.type === 'couple'){ %> <% for (let participant of conversation.participants){ %> <% if (participant.id !== authenticated_contact.id){ %> <% let friend_contact = participant %>
        <div class="tab-pane fade" id="conversation_<%= conversation.id %>" data-id="<%= conversation.id %>"
             role="tabpanel" data-user='<%= friend_contact.user %>'>
            <div class="item">
                <div class="content">
                    <div class="container">
                        <div class="top">
                            <div class="headline" data-conversation='<%= conversation.id %>'><img
                                        src="<%= friend_contact.contact_pic %>" alt="avatar">
                                <div><h5><%= friend_contact.first_name %> <%= friend_contact.last_name %></h5> <span>Offline</span>
                                </div>
                            </div>
                            <ul>
                                <li>
                                    <button type="button" data-conversation="conversation_<%= conversation.id %>"
                                            data-utility="open"><i class="flaticon-connections"></i></button>
                                </li>
                                <li>
                                    <button type="button" class="button round close-chat" data-chat="open"><i
                                                class="flaticon-left-arrow"></i></button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="middle scroll">
                        <div class="container">
                            <ul>
                                <% for (let message of conversation.messages){ %>
                                <li class="<%= message['sender']['user']===friend_contact['user'] ? 'odd' : 'self' %>">
                                    <img src="<%= message.sender.contact_pic %>" alt="avatar">
                                    <div class="content">
                                        <% if (message.is_file){ %>
                                            <div class="message downloadable"
                                                 data-url="<%= message.attachments[0].file %>">
                                                <div class="bubble"><p><span><i
                                                                    data-eva="arrow-downward-outline"></i></span> <%= message.attachments[0].file_name.slice(0, 10) %>
                                                    </p></div>
                                            </div><span> <%= message.time_sent %> </span>
                                        <% }else{ %>
                                        <div class="message">
                                            <div class="bubble"><p> <%= message.content %> </p></div>
                                        </div>
                                        <span> <%= message.time_sent %> </span>
                                        <% } %>
                                    </div>
                                </li>
                                <% } %>
                            </ul>
                        </div>
                    </div>
                    <div class="container">
                        <div class="bottom">
                            <form onsubmit="return false"><textarea class="form-control" name="message"
                                                                    data-conversation='<%= conversation.id %>'
                                                                    placeholder="Type a message..." rows="1"></textarea>
                                <button type="submit" class="send btn prepend"
                                        data-conversation="conversation_<%= conversation.id %>"><i
                                            class="flaticon-paper-plane"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="utility">
                    <div class="container">
                        <button type="button" class="close" data-conversation="conversation_<%= conversation.id %>"
                                data-utility="open"><i data-eva="close"></i></button>
                        <div class="profile"><p>Profile Info</p><img src="<%= friend_contact.contact_pic %>" alt="">
                            <h4> <%= friend_contact.first_name %> <%= friend_contact.last_name %></h4>
                            <span>Offline</span></div>
                        <div class="attachment">
                            <div class="headline"><span>Attachment</span> <label class="button" for="attachments"> <i
                                            class="flaticon-folders"></i> </label> <input type="file"
                                                                                          class="attachments"
                                                                                          data-conversation="<%= conversation.id %>">
                            </div>
                            <div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_2.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_3.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_4.jpg" alt="food">
                                <div class="file-media"><i class="flaticon-high-volume"></i></div>
                                <div class="file-media"><i class="flaticon-note"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div><% } %> <% } %> <% } %> <% if (conversation.type === 'group'){ %>
        <div class="tab-pane fade" id="conversation_<%= conversation.id %>" data-id="<%= conversation.id %>"
             role="tabpanel">
            <div class="item">
                <div class="content">
                    <div class="container">
                        <div class="top">
                            <div class="headline" data-conversation="<%= conversation.id %>"><img
                                        src="<%= conversation.header %>" alt="avatar">
                                <div><h5><%= conversation.name %></h5></div>
                            </div>
                            <ul>
                                <li>
                                    <button type="button" data-conversation="conversation_<%= conversation.id %>"
                                            data-utility="open"><i class="flaticon-connections"></i></button>
                                </li>
                                <li>
                                    <button type="button" class="button round close-chat" data-chat="open"><i
                                                class="flaticon-left-arrow"></i></button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="middle scroll">
                        <div class="container">
                            <ul>
                                <% for (let message of conversation.messages){ %>
                                <li class="<%= message['sender']['user']===authenticated_contact['user'] ? 'self' : 'odd' %>">
                                    <img src="<%= message.sender.contact_pic %>" alt="avatar">
                                    <div class="content">
                                        <% if (message.is_file){ %>
                                            <div class="message downloadable"
                                                 data-url="<%= message.attachments[0].file %>">
                                                <div class="bubble"><p><span><i
                                                                    data-eva="arrow-downward-outline"></i></span> <%= message.attachments[0].file_name.slice(0, 10) %>
                                                    </p></div>
                                            </div><span> <%= message.time_sent %> </span>
                                        <% }else{ %>
                                        <div class="message">
                                            <div class="bubble"><p> <%= message.content %> </p></div>
                                        </div>
                                        <span> <%= message.time_sent %> </span>
                                        <% } %>
                                    </div>
                                </li>
                                <% } %>
                            </ul>
                        </div>
                    </div>
                    <div class="container">
                        <div class="bottom">
                            <form onsubmit="return false"><textarea class="form-control" name="message"
                                                                    data-conversation='<%= conversation.id %>'
                                                                    placeholder="Type a message..." rows="1"></textarea>
                                <button type="submit" class="send btn prepend"
                                        data-conversation="conversation_<%= conversation.id %>"><i
                                            class="flaticon-paper-plane"></i></button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="utility">
                    <div class="container">
                        <button type="button" class="close" data-conversation="conversation_<%= conversation.id %>"
                                data-utility="open"><i data-eva="close"></i></button>
                        <div class="profile"><p>Profile Info</p><img src="<%= conversation.header %>" alt="">
                            <h4> <%= conversation.name %></h4></div>
                        <div class="attachment">
                            <div class="headline"><span>Attachment</span> <label class="button" for="attachments"> <i
                                            class="flaticon-folders"></i> </label> <input type="file"
                                                                                          class="attachments"
                                                                                          data-conversation="<%= conversation.id %>">
                            </div>
                            <div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_2.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_3.jpg" alt="food"> <img
                                        src="/static/images/pictures/stock_4.jpg" alt="food">
                                <div class="file-media"><i class="flaticon-high-volume"></i></div>
                                <div class="file-media"><i class="flaticon-note"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div><% } %>
        <% } %>
    </div><% } %>
`;