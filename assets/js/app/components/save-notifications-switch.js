export let template  = `<li class="save-notifications-mode">
    <div class="headline"><h5>Save Notifications</h5> <label class="switch"> <input type="checkbox"
                                                                                    name="save_notifications"
                                                                                    <% if (settings.save_notifications) { %>checked
                    <% } else { %>
                    <% } %>
            > <span class="slider round"></span> </label></div>
    <p>don't delete notifications after they are viewed.</p></li>`;