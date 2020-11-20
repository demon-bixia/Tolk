export let template = `<div class="modal fade" id="create">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header"><h5>Compose</h5>
                <button type="button" class="button round" ><i
                            data-eva="close"></i></button>
            </div>
            <div class="modal-body">
                <ul class="nav" role="tablist">
                    <li><a href="#contact" class="active tab-link">contact </a></li>
                    <li><a href="#couple" class="tab-link" >conversation </a>
                    </li>
                    <li><a href="#group"  class="tab-link"> Group </a></li>
                </ul>
                <div class="tab-content">
                    <div class="details tab-pane fade show active" id="contact" role="tabpanel">
                        <form id="contact-form" data-contact="<%= authenticated_contact.id %>">
                            <div class="form-group"><label>Email</label> <input type="email" placeholder="Email Address"
                                                                                name="email" class="form-control">
                                <div class="error_container"></div>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="button btn-primary">Compose</button>
                            </div>
                        </form>
                    </div>
                    <div class="participants tab-pane fade" id="group" role="tabpanel">
                        <form action="" id="group-create" data-contact="<%= authenticated_contact.id %>"
                              enctype="multipart/form-data">
                            <div class="form-group"><label for="">Name</label> <input type="text" placeholder="Name"
                                                                                      name="group_name"
                                                                                      class="form-control">
                                <div class="error_container"></div>
                            </div>
                            <div class="form-group"><label for="">Header</label>
                                <div class="custom-file"><input type="file" class="custom-file-input" id="customFile"
                                                                name="group_header"> <label class="custom-file-label"
                                                                                            for="customFile">Choose
                                        Header file</label></div>
                                <div class="error_container"></div>
                            </div>
                            <h4>Contacts</h4>
                            <hr>
                            <ul class="users">
                                <% for (let contact of contacts){ %> <% if (contact.id !== authenticated_contact.id && contact.private_mode !== true){ %>
                                <li>
                                    <div class="status"><img src="<%= contact.contact_pic %>" alt="avatar"></div>
                                    <div class="content">
                                        <h5><%= contact.first_name[0].toUpperCase() %> <%= contact.last_name[0].toUpperCase() %></h5>
                                        <span><%= contact.location %></span></div>
                                    <div class="custom-control custom-checkbox"><input type="checkbox"
                                                                                       class="custom-control-input"
                                                                                       name="contact_<%= contact.id %>"
                                                                                       id="contact_<%= contact.id %>"
                                                                                       data-contact="<%= contact.id %>">
                                        <label class="custom-control-label" for="contact_<%= contact.id %>"></label>
                                    </div>
                                </li><% } %>
                                <% } %>
                            </ul>
                            <div class="form-group">
                                <button type="submit" class="button btn-primary">Compose</button>
                            </div>
                        </form>
                    </div>
                    <div class="conversation tab-pane fade" id="couple" role="tabpanel">
                        <div class="contacts list-group scrollbar">
                            <% for (let contact of contacts){ %> <% if (contact.id !== authenticated_contact.id && contact.private_mode !== true){ %>
                                <a class="contact list-group-item list-group-item-action"
                                   data-authenticated-contact="<%= authenticated_contact.id %>"
                                   data-contact="<%= contact.id %>" data-user="<%= contact.user %>">
                                    <div class="status"><img src="<%= contact.contact_pic %>" alt="avatar"></div>
                                    <div class="content">
                                        <h5><%= contact.first_name[0].toUpperCase() %> <%= contact.last_name[0].toUpperCase() %></h5>
                                        <span><%= contact.location %></span></div>
                                </a> <% } %>
                            <% } %>
                        </div>
                        <div class="contacts-footer"><a href="#contact">ADD CONTACT</a> <a href="#" data-dismiss="modal"
                                                                                           aria-label="close">CLOSE</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;