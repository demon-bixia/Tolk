export let template = `<li class="notifications-mode">
    <div class="headline"><h5>Turn On Notifications</h5> <label class="switch"> <input type="checkbox"
                                                                                       name="notifications"
                                                                                       <% if (settings.notifications) { %>checked
                    <% } else { %>
                    <% } %>
            > <span class="slider round"></span> </label></div>
    <p>get notifications from conversations and accounts.</p></li>`;