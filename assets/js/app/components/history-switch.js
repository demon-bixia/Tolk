export let template = `<li class="history-mode">
    <div class='headline'><h5>History</h5> <label class='switch'> <input autocomplete='off' type='checkbox'
                                                                         <% if (settings.history_mode) { %>checked
                    <% } else { %>
                    <% } %>
                                                                         name="history_mode"> <span
                    class='slider round'></span> </label></div>
    <p>save chat history.</p></li>`;