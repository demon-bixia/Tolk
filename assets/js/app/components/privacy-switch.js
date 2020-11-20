export let template = `<li class="privacy-mode">
    <div class='headline'><h5>Privacy Mode</h5> <label class='switch'> <input autocomplete='off' type='checkbox'
                                                                              <% if (settings.private_mode) { %>checked
                    <% } else { %>
                    <% } %>
                                                                              name="private_mode"> <span
                    class='slider round'></span> </label></div>
    <p>let other contacts add you into a conversation or group.</p></li>`;