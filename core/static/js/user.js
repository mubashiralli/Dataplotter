// Create Selectize Global Variable for groups 
var select1 = $('#groups').selectize({
    plugins: ['remove_button'],
    onItemRemove: function () {

        this.open();
    },
    maxItems: 50
});
let projects_selectize = select1[0].selectize;

$(document).ready(function () {
    $('.admin_rights').removeClass('d-none');  
    $('.users_list').removeClass('mm-active');
});
// Check User is Admin then Show Add New Project and Users List from sidebar,right_btns and list of charts
function is_admin()
{
    show_spinner();
    fetch('/isadmin')
    .then(response => response.json())
    .then(data => {
      if(data.status === true)
      {
          $('.display-options').removeClass('d-none');
          $('.right_btns').removeClass('d-none');
          $('.admin_rights').removeClass('d-none');
          hide_spinner();
      }
  })
}
// Check User is a viewer then show edit view slider
function is_viewer()
{
    show_spinner();
    fetch('/isviewer')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("is_viewer", data.status);  
        if(data.status === false)
        {
            $('#edit_view').removeClass('d-none');
            hide_spinner();
        }
    })
}
// Enable Spinner
function show_spinner()
{
    $('.user_spinner').removeClass('d-none');
}
// Disable Spinner
function hide_spinner()
{
    $('.user_spinner').addClass('d-none');
}
// Create a new User in DB and show a new user at runtime if get successfull response from backend
function create_user(event)
{
    event.preventDefault();
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let first_name = document.getElementById('first_name').value;
    let last_name = document.getElementById('last_name').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let groups = select1[0].selectize.getValue();;
    if(first_name && last_name && username && password && groups.length > 0) {
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                username: username,
                password:password,
                first_name: first_name,
                last_name:last_name,
                groups:groups,
            })
        };
        $('.user_spinner').removeClass('d-none');
        fetch('/users/',requestOptions)
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
            throw new Error(response.status);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            if(data.status === 200) {
                append_update_row_in_table('insert',data.user_id,first_name,last_name,username,password,groups)
                $('.error_message_username').addClass('d-none');
            }
            else{
                $('.error_message_username').text('Username already in use')
                $('.error_message_username').removeClass('d-none');
            }
            $('.user_spinner').addClass('d-none');
        })
    }
}
// Show User Details on Edit Form
function show_edit_user_details(id,fname,lname,username,password,projects) {
    let splitting_projects = projects.trim().split(',');
    splitting_projects = splitting_projects.map(element => {
        return element.trim();
    });
    document.getElementById('first_name').value = fname;
    document.getElementById('last_name').value = lname;
    document.getElementById('username').value = username;
    document.getElementById('password').value = '';
    if(projects_selectize.items.length > 0)
    {
        projects_selectize.clear()
    }
    for (var key in projects_selectize.options)
    {
        if (projects_selectize.options.hasOwnProperty(key)) {
            var option = projects_selectize.options[key];
            var value = option.value;
            if(splitting_projects.includes(value))
            {
                projects_selectize.addItem(value);
            }
        }
    }
    var form = document.getElementById('add_user');
    form.method = 'PUT';
    form.onsubmit = function(event) {
        update_user(event,id);
    }
    var submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update User';
    $('.heading').text('Update User');
    $('.cancel').removeClass('d-none');
    
}
//Update user with new details
function update_user(event,id) {
    event.preventDefault();
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let first_name = document.getElementById('first_name').value;
    let last_name = document.getElementById('last_name').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let groups = select1[0].selectize.getValue();;
    if(first_name && last_name && username && password && groups.length > 0) {
        let requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                username: username,
                password:password,
                first_name: first_name,
                last_name:last_name,
                groups:groups,
            })
        };
        $('.user_spinner').removeClass('d-none');
        fetch('/users/'+id,requestOptions)
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
            throw new Error(response.status);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {

            if(data.status === 200) {
                $('.error_message_username').addClass('d-none');
                append_update_row_in_table('update',id,first_name,last_name,username,password,groups)
            }
            else{
                $('.error_message_username').text('Username already in use')
                $('.error_message_username').removeClass('d-none');
            }            
            $('.user_spinner').addClass('d-none');
        })  
    }
}
//Delete User
function delete_user(id){
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let result = confirm('Do you want to delete this user');
    if(result)
    {
        $('.user_spinner').removeClass('d-none');
        let requestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        };
        fetch('/users/'+id,requestOptions)
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
            throw new Error(response.status);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            let deleted_row = document.getElementById(id);
            deleted_row.remove();
            $('.user_spinner').addClass('d-none');
        });
    }
}
//If User change mind and cancel edit user then this function will work.
//Click on Cancel Button and Change Text from Edit User -> New User
function cancel_changes()
{
    const form = document.querySelector('#add_user'); 
    var submitButton = form.querySelector('button[type="submit"]');
    form.reset();
    submitButton.textContent = 'Add User';
    $('.heading').text('Create User');
    $('.cancel').addClass('d-none');
    select1[0].selectize.clear();
    form.method = 'POST';
    form.onsubmit = function(event) {
        create_user(event);
    }

}
//If creating a new user or update user then table add or update row
function append_update_row_in_table(operation, id, first_name, last_name, username,password,groups) {
    if (!Array.isArray(groups)) {
        groups = [groups]; // Convert to an array if it's not already
    }
    const newRow = document.createElement('tr');
    newRow.id = id;
    newRow.innerHTML = `
        <td>${id}</td>
        <td>${first_name}</td>
        <td>${last_name}</td>
        <td>${username}</td>
        <td>${groups.join(', ')}</td>
        <td><button class="edit-button" style="color: #00589e;" onclick="show_edit_user_details('${id}', '${first_name}', '${last_name}','${username}','${password}', '${groups.join(', ')}')">EDIT</button></td>
        <td><button class="delete-button" style="color: red;" onclick="delete_user('${id}')">DELETE</button></td>
    `;
    const tbody = document.querySelector('#userlistTable tbody');
    if (operation === 'update') {
        const existingRow = document.getElementById(id);
        tbody.replaceChild(newRow, existingRow);
    } else {
        tbody.appendChild(newRow);
    }
    cancel_changes();
}
