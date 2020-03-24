import {AbstractComponentFactory} from './renderer.js'

export class ComponentFactory extends AbstractComponentFactory {
    static getComponent(component_name) {
        // returns a component model from the ComponentModels object below
        let componentModel = ComponentsModels[component_name];

        if (!componentModel) {
            throw new Error('No component model with the name ' + component_name)
        } else {
            return componentModel
        }
    }

    static template(template, data) {
        // uses ejs template engine to template a template string
        // returns a templated js string
        try {
            return ejs.render(template, data);
        } catch (e) {
            throw new Error('Template Error' + e.message)
        }
    }

    static strToHTML(str_element) {
        // converts strings to html using DOMParser object
        // if no browser support for DOMParser simply
        // renders html element inside div

        // check for browser support
        let support = (function () {
            if (!window.DOMParser) return false;

            let parser = new DOMParser();
            try {
                parser.parseFromString('x', 'text/html');
            } catch (err) {
                return false;
            }
            return true;
        })();

        if (support) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(str_element, 'text/html');
            return doc.body.children[0];
        } else {
            // Otherwise, fallback to old-school method
            let dom = document.createElement('div');
            dom.innerHTML = str_element;
            return dom;
        }
    }

    create(kwargs = {'component_name': null, 'data': null}) {
        /*
            templates components and renders it to html
        */
        let component_name = kwargs['component_name'];
        let data = kwargs['data'];

        if (!component_name) {
            throw new Error("Expected args not provided!");
        } else {
            // get component model using the component name
            let componentModel = ComponentFactory.getComponent(component_name);
            // render the template inside the component
            let htmlString = ComponentFactory.template(componentModel['template'], data);
            // parse html string to an html element
            let element = ComponentFactory.strToHTML(htmlString);
            // return new component
            return {
                'container': componentModel['container'],
                'selector': componentModel['selector'],
                'element': element,
                'render_mode': componentModel['render_mode'],
            }
        }
    }
}

let ComponentsModels = {
    'contact-picture': {
        container: "circle-status",
        selector: ".navigation .nav .profile-picture",
        render_mode: "replaceOrAppend",
        template: `<img src="<%= contact.contact_pic %>" data-user="<%= contact.user %>" class="profile-picture" alt="avatar">`,
    },

    'privacy-switch': {
        container: "#privacy-settings #privacy .options",
        selector: "#privacy-settings #privacy .options .privacy-mode",
        render_mode: "replaceOrAppend",
        template: `<li class="privacy-mode"><div class='headline'><h5>Privacy Mode</h5> <label class='switch'> <input autocomplete='off' type='checkbox' <% if (settings.private_mode) { %>checked<% } else { %><% } %> name="private_mode"> <span class='slider round'></span> </label></div><p>let other contacts add you into a conversation or group.</p></li>`,
    },

    'history-switch': {
        container: "#privacy-settings #privacy .options",
        selector: "#privacy-settings #privacy .options .history-mode",
        render_mode: "replaceOrAppend",
        template: `<li class="history-mode"><div class='headline'><h5>History</h5> <label class='switch'> <input autocomplete='off' type='checkbox' <% if (settings.history_mode) { %>checked<% } else { %><% } %> name="history_mode"> <span class='slider round'></span> </label></div><p>save chat history.</p></li>`,
    },

    'theme-switch': {
        container: "#appearance-settings #appearance",
        selector: "#appearance-settings #appearance .night-mode",
        render_mode: "replaceOrAppend",
        template: `<li class="night-mode"><div class='headline'><h5>Night Mode</h5> <label class='switch'> <input type='checkbox' <% if (settings.night_mode) { %>checked<% } else { %><% } %>  name="night_mode"> <span class='slider round mode'></span> </label></div><p>A Dark theme.</p></li>`,
    },

    'notifications-switch': {
        container: '#notifications-settings #alerts',
        selector: '#notifications-settings #alerts .notifications-mode',
        render_mode: 'replaceOrAppend',
        template: `<li class="notifications-mode"> <div class="headline"> <h5>Turn On Notifications</h5> <label class="switch"> <input type="checkbox" name="notifications" <% if (settings.notifications) { %>checked<% } else { %><% } %> > <span class="slider round"></span> </label> </div><p>get notifications from conversations and accounts.</p></li>`,
    },

    'contact-update-form': {
        container: '#account .inside',
        selector: '#account form.account',
        render_mode: "replaceOrAppend",
        template: `<form class="account" action="" method="post" id="account-form" data-contact="<%=contact.id %>"> <div class="form-row"> <div class="col-sm-6"> <div class="form-group"><label>First Name</label> <input name="first_name" autocomplete="off" type="text" class="form-control" placeholder="First name" value="<%=contact.first_name %>"> <div class="error_container"></div></div></div><div class="col-sm-6"> <div class="form-group"><label>Last Name</label> <input name="last_name" autocomplete="off" type="text" class="form-control" placeholder="Last name" value="<%=contact.last_name %>"> <div class="error_container"></div></div></div></div><div class="form-group"><label>Location</label> <input name="location" autocomplete="off" type="text" class="form-control" placeholder="Location" value="<%=contact.location %>"> <div class="error_container"></div></div><div class="form-group"> <label>Profile Picture</label> <div class="custom-file"> <input type="file" class="custom-file-input" name="contact_pic" id="id_contact_pic"> <label class="custom-file-label" for="customFile">Choose contact picture file</label> </div><div class="error_container"></div></div><button type="submit" class="btn btn-block btn-primary primary">Save settings</button></form>`,
    },

    'conversation-create-form': {
        container: 'body .layout',
        selector: '#create',
        render_mode: 'replaceOrAppend',
        template: `<div class="modal fade" id="create" tabindex="-1" role="dialog" aria-label="create" aria-hidden="true"> <div class="modal-dialog modal-dialog-centered" role="document"> <div class="modal-content"> <div class="modal-header"> <h5>Add a conversation</h5> <button type="button" class="button round" data-dismiss="modal" aria-label="close"> <i data-eva="close"></i> </button> </div><div class="modal-body"> <ul class="nav" role="tablist"> <li> <a href="#couple" class="active" data-toggle="tab" aria-controls="details" aria-selected="true">couple </a> </li><li> <a href="#group" data-toggle="tab" role="tab" aria-controls="participants" aria-selected="false"> Group </a> </li></ul> <div class="tab-content"> <div class="details tab-pane fade show active" id="couple" role="tabpanel"> <form id="group-form" data-contact="<%=authenticated_contact.id %>"> <div class="form-group"> <label>Email</label> <input type="email" placeholder="Email Address" name="email" class="form-control"> <div class="error_container"></div></div></form> </div><div class="participants tab-pane fade" id="group" role="tabpanel"> <form action="" id="group-create" data-contact="<%=authenticated_contact.id %>" enctype="multipart/form-data"> <div class="form-group"> <label for="">Name</label> <input type="text" placeholder="Name" name="group_name" class="form-control"> <div class="error_container"></div></div><div class="form-group"> <label for="">Header</label> <div class="custom-file"> <input type="file" class="custom-file-input" id="customFile" name="group_header"> <label class="custom-file-label" for="customFile">Choose Header file</label> </div><div class="error_container"></div></div><h4>Contacts</h4> <hr> <ul class="users"> <% for (let contact of contacts){%> <% if (contact.id !== authenticated_contact.id && contact.private_mode !== true) { %> <li> <div class="status"> <img src="<%=contact.contact_pic %>" alt="avatar"> </div><div class="content"> <h5><%=contact.first_name[0].toUpperCase() %> <%=contact.last_name[0].toUpperCase() %></h5> <span><%=contact.location %></span> </div><div class="custom-control custom-checkbox"> <input type="checkbox" class="custom-control-input" name="contact_<%=contact.id%>" id="contact_<%=contact.id %>" data-contact="<%=contact.id%>"> <label class="custom-control-label" for="contact_<%=contact.id %>"></label> </div></li><%}%> <%}%> </ul> </form> </div></div></div><div class="modal-footer"> <button type="submit" class="button btn-primary">Compose</button> </div></div></div></div>`,
    },

    'conversations-list': {
        container: '.sidebar .middle #conversations .container',
        selector: '.sidebar .middle .nav',
        render_mode: 'replaceOrAppend',
        template: `<% if (conversations.length===0){%> <p class="empty-section">to start a conversation press the <i class="flaticon-add-button"></i> button</p><%}else{%><ul class="nav discussion" role="tablist"> <% for(let conversation of conversations){%> <% if (conversation.type==='couple'){%> <% for(let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-user="<%=participant.user %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.data %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=participant.contact_pic %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=participant.first_name %> <%=participant.last_name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><%}%> <%}%> <%}%> <% if (conversation.type==='group'){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.name %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=conversation.header %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=conversation.name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><%}%> <%}%></ul><%}%>`,
    },

    'conversation-bubble': {
        render_mode: 'append',
        template: `<% if (conversation.type==='couple'){%> <% for(let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-user="<%=participant.user %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.data %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=participant.contact_pic %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=participant.first_name %> <%=participant.last_name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><%}%> <%}%> <%}%> <% if (conversation.type==='group'){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.name %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=conversation.header %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=conversation.name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><% } %>`
    },

    'first-conversation-bubble': {
        container: '.sidebar .middle #conversations .container',
        selector: '.sidebar .middle .empty-section',
        render_mode: 'replaceOrAppend',
        template: `<ul class="nav discussion" role="tablist"> <% if (conversation.type==='couple'){%> <% for(let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-user="<%=participant.user %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.data %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=participant.contact_pic %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=participant.first_name %> <%=participant.last_name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><%}%> <%}%> <%}%> <% if (conversation.type==='group'){%> <li> <a href="#conversation_<%=conversation.id %>" class="filter direct" data-id="<%= conversation.id %>" data-name="<%=conversation.name %>" data-toggle="tab" data-chat="open" role="tab" aria-controls="<%=conversation.name %>" aria-selected="true"> <div class="status online"> <div class="circle-status"> <img src="<%=conversation.header %>" alt="avatar"> </div></div><div class="content"> <div class="headline"><h5><%=conversation.name %></h5> <span> <% if (conversation.last_message_date){%> <%=conversation.last_message_data %> <%}%> </span> </div><p><% if (conversation.last_message){%> <%=conversation.last_message.slice(0, 40) %>... <%}%></p></div></a> </li><%}%></ul>`,
    },

    'friends-list': {
        container: '.sidebar .middle #friends .container',
        selector: '.sidebar .middle #friends .users',
        render_mode: 'replaceOrAppend',
        template: `<% if (contacts.length===1){%> <p class="empty-section">to add new contacts click the <i class="flaticon-add-button"></i> button</p><%}else{%> <ul class="users" role="tablist"> <% let counter=0; %> <% for(let contact of contacts){%> <% if (contact.id !==authenticated_contact.id){%><li> <a href='#'><div class='status online'><img src='<%=contact.contact_pic %>' alt='avatar'></div><div class='content'><h5><%=contact.first_name %> <%=contact.last_name %></h5> <span><%=contact.location %></span></div><div class='icon'><i class='flaticon-user'></i></div></a></li><%}%> <%}%></ul><%}%>`,
    },

    'notifications-list': {
        container: '.sidebar .middle #notifications .container',
        selector: '.sidebar .middle #notifications .notifications',
        render_mode: 'replaceOrPrepend',
        template: `<% if (notifications.length===0){%> <p class="empty-section">no new notifications right now <i class="flaticon-notification"></i> </p><%}else{%> <ul class="notifications" role="tablist"> <% for(let count = notifications.length - 1; count >= 0 ;--count){%> <% if (notifications[count].type==='authentication'){%><li><div class='round'><i data-eva="lock"></i></div><p><strong><%=notifications[count].type %></strong> <%=notifications[count].content %></p></li><%}else if (notifications[count].type==='accounts'){%><li><div class='round'><i data-eva="people"></i></div><p><strong><%=notifications[count].type %></strong> <%=notifications[count].content %></p></li><%}else if (notifications[count].type==='chat'){%><li><div class='round'><i data-eva="message-circle"></i></div><p><strong><%=notifications[count].type %></strong> <%=notifications[count].content %></p></li><%}else if (notifications[count].type==='default'){%><li><div class='round'><i data-eva="checkmark-circle"></i></div><p><strong><%=notifications[count].type %></strong> <%=notifications[count].content %></p></li><%}%> <%}%></ul><%}%>`,
    },

    'chats-list': {
        container: '.chat',
        selector: '.chat .tab-content',
        render_mode: 'replaceOrAppend',
        template: `<% if (conversations.length===0){%> <div class="tab-content"> <div class="empty-chat"> <span>click on conversation to start chatting</span> </div></div><%}else{%> <div class="tab-content"> <% for (let conversation of conversations){%> <% if (conversation.type==='couple'){%> <% for (let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <% let friend_contact=participant %> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel" data-user='<%= friend_contact.user %>'> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation='<%= conversation.id %>'><img src="<%=friend_contact.contact_pic %>" alt="avatar"> <div> <h5><%=friend_contact.first_name %> <%=friend_contact.last_name %></h5> <span>Offline</span> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===friend_contact['user'] ? 'odd' : 'self'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=friend_contact.contact_pic %>" alt=""><h4> <%=friend_contact.first_name %> <%=friend_contact.last_name %></h4> <span>Offline</span></div><div class="attachment"> <div class="headline" ><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div><%}%> <%}%> <%}%> <% if (conversation.type==='group'){%> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel"> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation="<%= conversation.id %>" ><img src="<%=conversation.header %>" alt="avatar"> <div> <h5><%=conversation.name %></h5> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===authenticated_contact['user'] ? 'self' : 'odd'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=conversation.header %>" alt=""><h4> <%=conversation.name %></h4></div><div class="attachment"> <div class="headline"><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div><%}%> <%}%></div><%}%>`,
    },

    'first-chat': {
        container: '.chat',
        selector: '.chat .tab-content',
        render_mode: 'replaceOrAppend',
        template: `<div class="tab-content"><% if (conversation.type==='couple'){%> <% for (let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <% let friend_contact=participant %> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel" data-user='<%= friend_contact.user %>'> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation='<%= conversation.id %>'><img src="<%=friend_contact.contact_pic %>" alt="avatar"> <div> <h5><%=friend_contact.first_name %> <%=friend_contact.last_name %></h5> <span>Offline</span> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===friend_contact['user'] ? 'odd' : 'self'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=friend_contact.contact_pic %>" alt=""><h4> <%=friend_contact.first_name %> <%=friend_contact.last_name %></h4> <span>Offline</span></div><div class="attachment"> <div class="headline" ><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div><%}%> <%}%> <%}%> <% if (conversation.type==='group'){%> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel"> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation="<%= conversation.id %>" ><img src="<%=conversation.header %>" alt="avatar"> <div> <h5><%=conversation.name %></h5> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===authenticated_contact['user'] ? 'self' : 'odd'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=conversation.header %>" alt=""><h4> <%=conversation.name %></h4></div><div class="attachment"> <div class="headline"><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div><%}%></div>`,
    },

    'chat': {
        render_mode: 'append',
        template: `<% if (conversation.type==='couple') { %><% for (let participant of conversation.participants){%> <% if (participant.id !== authenticated_contact.id){%> <% let friend_contact=participant %> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel" data-user='<%= friend_contact.user %>'> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation='<%= conversation.id %>'><img src="<%=friend_contact.contact_pic %>" alt="avatar"> <div> <h5><%=friend_contact.first_name %> <%=friend_contact.last_name %></h5> <span>Offline</span> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===friend_contact['user'] ? 'odd' : 'self'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=friend_contact.contact_pic %>" alt=""><h4> <%=friend_contact.first_name %> <%=friend_contact.last_name %></h4> <span>Offline</span></div><div class="attachment"> <div class="headline" ><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div><%}%><%}%><%}%> <% if (conversation.type==='group'){%> <div class="tab-pane fade show" id="conversation_<%=conversation.id %>" data-id="<%= conversation.id %>" role="tabpanel"> <div class="item"> <div class="content"> <div class="container"> <div class="top"> <div class="headline" data-conversation="<%= conversation.id %>" ><img src="<%=conversation.header %>" alt="avatar"> <div> <h5><%=conversation.name %></h5> </div></div><ul> <li> <button type="button" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i class="flaticon-connections"></i></button> </li><li> <button type="button" class="button round close-chat" data-chat="open"><i class="flaticon-left-arrow"></i></button> </li></ul> </div></div><div class="middle scroll"> <div class="container"> <ul> <% for (let message of conversation.messages){%> <li class="<%=message['sender']['user']===authenticated_contact['user'] ? 'self' : 'odd'%>"><img src="<%=message.sender.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%=message.content %></p></div></div><span><%=message.time_sent%></span></div></li><%}%> </ul> </div></div><div class="container"> <div class="bottom"> <form onsubmit="return false"><textarea class="form-control" name="message" data-conversation='<%= conversation.id %>' placeholder="Type a message..." rows="1"></textarea> <button type="submit" class="send btn prepend" data-conversation="conversation_<%=conversation.id %>"><i class="flaticon-paper-plane"></i></button> </form> </div></div></div><div class="utility"> <div class="container"> <button type="button" class="close" data-conversation="conversation_<%=conversation.id %>" data-utility="open"><i data-eva="close"></i></button> <div class="profile"><p>Profile Info</p><img src="<%=conversation.header %>" alt=""><h4> <%=conversation.name %></h4></div><div class="attachment"> <div class="headline"><span>Attachment</span> <label class="button" for="upload"> <i class="flaticon-folders"></i> </label> <input type="file" id="upload"></div><div class="media"><img src="/static/images/pictures/stock_1.jpg" alt="food"> <img src="/static/images/pictures/stock_2.jpg" alt="food"> <img src="/static/images/pictures/stock_3.jpg" alt="food"> <img src="/static/images/pictures/stock_4.jpg" alt="food"> <div class="file-media"><i class="flaticon-high-volume"></i></div><div class="file-media"><i class="flaticon-note"></i></div></div></div></div></div></div></div> <%}%>`,
    },

    'message': {
        render_mode: 'append',
        template: `<li class="<% if (message.sender == authenticated_user) { %>  self  <% } else { %>  odd  <% } %> "><img src="<%=message.contact_pic %>" alt="avatar"> <div class="content"> <div class="message"> <div class="bubble"><p><%= message.content %></p></div></div><span><%=message.time_sent%></span></div></li>`
    },

    'bubble-last-message': {
        render_mode: 'replaceOrAppend',
        template: `<p><%= message.content.slice(0, 40) %>...</p>`,
    },

    'notification-bubble': {
        render_mode: 'prepend',
        container: '.sidebar .middle #notifications .container .notifications',
        template: `<% if (notification.type==='authentication'){%><li><div class='round'><i data-eva="lock"></i></div><p><strong><%=notification.type %></strong> <%=notification.content %></p></li><%}else if (notification.type==='accounts'){%><li><div class='round'><i data-eva="people"></i></div><p><strong><%=notification.type %></strong> <%=notification.content %></p></li><%}else if (notification.type==='chat'){%><li><div class='round'><i data-eva="message-circle"></i></div><p><strong><%=notification.type %></strong> <%=notification.content %></p></li><%}else if (notification.type==='default'){%><li><div class='round'><i data-eva="checkmark-circle"></i></div><p><strong><%=notification.type %></strong> <%=notification.content %></p></li><%}%>`,
    }
};
