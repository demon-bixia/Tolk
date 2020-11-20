export let template = `<li class="night-mode">
    <div class='headline'><h5>Night Mode</h5> <label class='switch'> <input type='checkbox'
                                                                            <% if (settings.night_mode) { %>checked
                    <% } else { %>
                    <% } %>
                                                                            name="night_mode"> <span
                    class='slider round mode'></span> </label></div>
    <p>A Dark theme.</p></li>`;