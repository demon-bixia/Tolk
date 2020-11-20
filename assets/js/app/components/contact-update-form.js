export let template = `<form class="account" action="" method="post" id="account-form" data-contact="<%= contact.id %>">
    <div class="form-row">
        <div class="col-sm-6">
            <div class="form-group"><label>First Name</label> <input name="first_name" autocomplete="off" type="text"
                                                                     class="form-control" placeholder="First name"
                                                                     value="<%= contact.first_name %>">
                <div class="error_container"></div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-group"><label>Last Name</label> <input name="last_name" autocomplete="off" type="text"
                                                                    class="form-control" placeholder="Last name"
                                                                    value="<%= contact.last_name %>">
                <div class="error_container"></div>
            </div>
        </div>
    </div>
    <div class="form-group"><label>Location</label> <input name="location" autocomplete="off" type="text"
                                                           class="form-control" placeholder="Location"
                                                           value="<%= contact.location %>">
        <div class="error_container"></div>
    </div>
    <div class="form-group"><label>Profile Picture</label>
        <div class="custom-file"><input type="file" class="custom-file-input" name="contact_pic" id="id_contact_pic">
            <label class="custom-file-label" for="customFile">Choose contact picture file</label></div>
        <div class="error_container"></div>
    </div>
    <button type="submit" class="btn btn-block btn-primary primary">Save settings</button>
</form>
`;