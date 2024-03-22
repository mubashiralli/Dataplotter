$(document).ready(function() {
    // document.addEventListener("DOMContentLoaded", function () {
    //     // Get the "Users" menu item
    //     const usersMenuItem = document.querySelector('.users_list');
    //     // Get the "Projects" submenu
    //     const projectsSubmenu = document.querySelector('#projects');
    //     // Add a click event listener to the "Users" menu item
    //     usersMenuItem.addEventListener("click", function (e) {
    //         // Prevent the default behavior of the link
    //         e.preventDefault();
            
    //         // Toggle the display property of the "Projects" submenu
    //         if (projectsSubmenu.style.display === "block") {
    //             projectsSubmenu.style.display = "none";
    //         } else {
    //             projectsSubmenu.style.display = "block";
    //         }
    //     });
    // });

    //Show All Projects in Sidebar
    $('.spinner').removeClass('d-none');
    fetch('/sidebar')
    .then(response => response.json())
    .then(data => {
        SideBar(data);
        $('.spinner').addClass('d-none');
    })

    //If User press Enter button to create a dashboard then Dashboard should be added
    var dashboard_name = document.getElementById('dashboard_name');
    dashboard_name.addEventListener('keypress', function(event) {
        // Check if the Enter key was pressed (key code 13)
        if (event.keyCode === 13 || event.which === 13) {
          // Prevent the default form submission behavior
          event.preventDefault();
          // Call the function to perform the GET request
          add_dashboard();
        }
    });

    //If User press Enter button to update a dashboard then Dashboard should be updated
    var edit_dashboard_name = document.getElementById('edit_dashboard_name');
    edit_dashboard_name.addEventListener('keypress', function(event) {
        // Check if the Enter key was pressed (key code 13)
        if (event.keyCode === 13 || event.which === 13) {
          // Prevent the default form submission behavior
          event.preventDefault();
      
          // Call the function to perform the GET request
          update_dashboard();
        }
    });

    //If user click on specific delete dashboard then from this click function will find target dashboard which
    // he wants to delete from the dashboard.
    // Open Modal and Change text inside the modal

    $(document).on('click', '.delete_icons', function(e) {
        const listItem = $(this).closest('li');
        // Find the anchor tag within the <li> element
        const anchor = listItem.find('a');
        // Retrieve the data-id attribute of the anchor tag
        const dataId = anchor.attr('dashboard-id');
        // Get the modal element
        var modal = document.getElementById("confirmdeletedashboardModal");

        // Get the modal body element
        var modalBody = modal.querySelector(".modal-body");

        // Create the input element
        var inputElement = document.createElement("input");

        // Set the attributes of the input element
        inputElement.setAttribute("type", "hidden");
        inputElement.setAttribute("id", "delete_dashboard_element");
        inputElement.setAttribute("value", dataId);

        modalBody.textContent = 'Are you sure you want to delete a "' + anchor.text() + '" dasboard';

        // Append the input element to the modal body
        modalBody.appendChild(inputElement);

        $('#confirmdeletedashboardModal').modal('show');
    });

    //Find Target Edit Dashboard li.
    //Open Edit Dashboard Modal, change text
    //Create Hidden Input Element for updating dashboard current value
    $(document).on('click', '.edit_page', function(e) {
        
        const listItem = $(this).closest('li');
        // Find the anchor tag within the <li> element
        const anchor = listItem.find('a');
        const anchorText = anchor.attr('title');
        const dataId = anchor.attr('dashboard-id');
        let errorMessage = document.querySelector('#edit_dashboard_modal .error-message');
        let is_default =  $(this).attr('data-id');
        let edit_is_default_dashboard = document.getElementById('edit_is_default_dashboard');
        if(is_default == 'true')
        {
            edit_is_default_dashboard.checked = true;
        }
        else{
            edit_is_default_dashboard.checked = false;
        }
        $('#edit_dashboard_modal').modal('show');
        $('#edit_dashboard_name').val(anchorText);
        errorMessage.style.display = 'none';
        errorMessage.style.color = 'grey';
        $('#edit_dashboard_name').css('border','1px solid grey');
        var modal = document.getElementById('edit_dashboard_modal');
        let delete_filter_modal = document.getElementById('edit_dashboard_modal')
        var closeButtons = delete_filter_modal.querySelectorAll("button.close");
        // Check if there are more than one close buttons
        if (closeButtons.length > 1) {
        // Keep the first close button
            var firstCloseButton = closeButtons[0];
            // Loop through the remaining close buttons starting from the second one
            for (var i = 1; i < closeButtons.length; i++) {
                // Get the current close button
                var closeButton = closeButtons[i];
                // Remove the current close button from its parent node
                closeButton.parentNode.removeChild(closeButton);
            }
        }
        var inputField = document.createElement('input');
        inputField.type = 'hidden';
        inputField.name = 'edit_dashboard_id';
        inputField.id = 'edit_dashboard_id';
        inputField.value = dataId;
        // Get the modal body element
        var modalBody = modal.querySelector('.modal-body');
        // Find the form element inside the modal body
        var form = modalBody.querySelector('form');
        // Append the input field to the form
        form.appendChild(inputField);
    });

    //Show the modal for creating a new dashboard
    $(document).on('click', '#add_dashboard', function(e) {
        var project_id = this.getAttribute('data-id');
        dashboardModal(project_id)
    });

});
// $(".new_page_name").keyup(function() {
//     if($(this).val().length >= 20) {
//         $('.text_validate').remove();
//         $(this).after('<div class="text_validate" style="color:red;">20 char limit.</div>');
//     } else{
//         $('.text_validate').remove();
//     }
// });


// Create Projects menu ands its dashboards which will come from backend as a list and in each project have multiple or single dashboard.
function SideBar(response){
    let default_dashboard = false;
    let dashboard_value = 0;
    unordered_list = document.getElementById("projects")
    for (var i=0; i<response.projects.length; i++) {
        project = response.projects[i];
        if(project.project_name)
        {
            var li = document.createElement("li");
            var a = document.createElement("a");
                a.classList.add("has-arrow", "waves-effect");
                a.textContent = project.project_name;
                    var ul = document.createElement("ul");
                        ul.classList.add("sub", "mm-collapse")//,"mm-collapse")
                        if(get_slider_value() == 'Edit'){
                            subli = document.createElement("li");

                            //Add New Dashboard Button inside Each Project
                            sub_add_dashboard_button = document.createElement('i');
                            sub_add_dashboard_button.title = 'Add Dashboard';
                            sub_add_dashboard_button.className = 'fa fa-plus fa-1x add_dashboard';
                            sub_add_dashboard_button.setAttribute('data-id', project.project_id);
                            sub_add_dashboard_button.id = 'add_dashboard';
                            sub_add_dashboard_button.style.cursor = 'pointer';
                            sub_add_dashboard_button.style.color = '#157eab';
                            sub_add_dashboard_button.addEventListener('click', function() {
                                var project_id = this.getAttribute('data-id');
                                dashboardModal(project_id)
                            });
                            
                            // Add Li in Project List
                            subli.appendChild(sub_add_dashboard_button)
                            ul.appendChild(subli);
                        
                        // ADD CSS of Add Dashboard button 
                        var style = document.createElement('style');

                            var cssRule = '#'+sub_add_dashboard_button.id+'::before { content: ""; width: 0; height: 3em; border-radius: 30em; position: absolute; top: 0; left: 0; background-image: linear-gradient(to right, #157eab 0%, #157eab 100%); transition: .5s ease; display: block; z-index: -1; }';
                            cssRule += ' #'+sub_add_dashboard_button.id+':hover::before { width: 9em; }';
                            style.appendChild(document.createTextNode(cssRule));
                            document.head.appendChild(style);
                        }
                        // Show all Dashboards which is created inside project
                        if(response.projects[i].hasOwnProperty('Dashboard')){
                            for(var dashboard = 0; dashboard < response.projects[i].Dashboard.length; dashboard++)
                            {
                                subli = document.createElement("li");
                                suba = document.createElement("a");
                                suba.href="/board/dashboard/"+response.projects[i].Dashboard[dashboard].dashboard_id;
                                suba.style.margin = 0
                                suba.style.padding = '0px 0px 10px 0px'
                                suba.style.fontSize = '11px'
                                if(response.projects[i].Dashboard[dashboard].dashboard_name.length > 18)
                                {
                                    var firstPart = response.projects[i].Dashboard[dashboard].dashboard_name.slice(0, 18);
                                    var remainingPart = response.projects[i].Dashboard[dashboard].dashboard_name.slice(18);
                                    suba.textContent = firstPart;
                                    suba.title = response.projects[i].Dashboard[dashboard].dashboard_name;
                                    suba.appendChild(document.createElement("br"));
                                    suba.appendChild(document.createTextNode(remainingPart));
                                    // console.log('Remaing part length: '+ remainingPart.length);
                                    // suba.textContent = response.projects[i].Dashboard[dashboard].dashboard_name.slice(0,10)+'...';
                                    // suba.title = response.projects[i].Dashboard[dashboard].dashboard_name;
                                }
                                else{
                                    suba.textContent = response.projects[i].Dashboard[dashboard].dashboard_name;
                                    suba.title = response.projects[i].Dashboard[dashboard].dashboard_name;
                                }
                                // suba.textContent = response.projects[i].Dashboard[dashboard].dashboard_name;
                                suba.setAttribute('data-id', response.projects[i].Dashboard[dashboard].project_id_id);
                                suba.setAttribute('dashboard-id', response.projects[i].Dashboard[dashboard].dashboard_id);
                                subli.appendChild(suba);
                                
                                //Check If User has viewer then Hide Add New Project and User li
                                if(get_slider_value() == 'Edit'){
                                    let edit_icon = document.createElement('i');
                                    edit_icon.title = 'Edit Page'
                                    edit_icon.className = 'fas fa-edit edit_page'
                                    edit_icon.setAttribute('data-id', response.projects[i].Dashboard[dashboard].is_default);
                                    edit_icon.style.cursor = 'pointer'
                                    subli.appendChild(edit_icon);
                                    
                                    subi = document.createElement("i");
                                    subi.title = "Delete Page"
                                    subi.classList.add('fa','fa-trash','delete_icon','delete_icons');
                                    subi.style.cursor = 'pointer';
                                    subi.onclick = function()
                                    {
                                        //alert('call delete page')
                                    }
                                    subli.appendChild(subi);
                                }
                                ul.appendChild(subli);
                            }
                        }
            li.appendChild(a);
            li.appendChild(ul)
            unordered_list.appendChild(li);
        }
    }
}

// Show Dashboard Modal when user click on new dashboard button
function dashboardModal(project_id) {
// Code to be executed when the element is clicked
    var modal = document.getElementById('add_dashboard_modal');
    $("#add_dashboard_modal").modal('show');
    let delete_filter_modal = document.getElementById('add_dashboard_modal')
    var closeButtons = delete_filter_modal.querySelectorAll("button.close");
    var dashboard_name = document.getElementById('dashboard_name');
    dashboard_name.value = ''
    $('.error-message').css('display', 'none');
    $('#dashboard_name').css('border', '1px solid grey');
    // Check if there are more than one close buttons
    if (closeButtons.length > 1) {
    // Keep the first close button
        var firstCloseButton = closeButtons[0];
        // Loop through the remaining close buttons starting from the second one
        for (var i = 1; i < closeButtons.length; i++) {
            // Get the current close button
            var closeButton = closeButtons[i];
            // Remove the current close button from its parent node
            closeButton.parentNode.removeChild(closeButton);
        }
    }

    var inputField = document.createElement('input');
    inputField.type = 'hidden';
    inputField.name = 'project_id';
    inputField.id = 'project_id';
    inputField.value = project_id;
    // Get the modal body element
    var modalBody = modal.querySelector('.modal-body');
    // Find the form element inside the modal body
    var form = modalBody.querySelector('form');
    // Append the input field to the form
    form.appendChild(inputField);
}
//Send Parameters from Frontend to Backend to add a new dashboard in a target table and 
//append DOM if its successfully created from backend.
function add_dashboard()
{
    var form = document.getElementById('dashboard_form');
    let errorMessageElement = document.querySelector('.error-message');
    // Get the CSRF token from the form
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    var dashboard_name = document.getElementById('dashboard_name');
    var default_dashboard = document.getElementById('is_default_dashboard');
    const projectInputs = document.querySelectorAll('input[name="project_id"]');
    const lastProjectInput = projectInputs[projectInputs.length - 1];
    let project_id = lastProjectInput.value;
    all_anchor_tags = document.querySelectorAll('a[data-id="' + project_id + '"]');
    var anchor_texts = [];
    // Loop through each anchor tag and retrieve its text content
    for (var i = 0; i < all_anchor_tags.length; i++) {
        var anchor_text = all_anchor_tags[i].textContent;
        anchor_texts.push(anchor_text);
    }
    if(anchor_texts.indexOf(dashboard_name.value) !== -1) {
        dashboard_name.classList.add('is-invalid');
        dashboard_name.style.border = '1px solid red';
        // dashboard_name.style.borderColor = 'red';
        errorMessageElement.textContent = 'This dashboard name is already exist.'
        errorMessageElement.style.display = 'block';
        errorMessageElement.style.color = 'red';
    }
    else{
        if(dashboard_name.value)
        {
            
            if(default_dashboard.checked)
            {
                is_default = true;
            }
            else
            {
                is_default = false;
            }
            $('.delete_chart_spinner').removeClass('d-none');
            fetch('/board/dashboard/'+project_id,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    dashboard_name: dashboard_name.value,
                    is_default: is_default,
                    project_id:Number(project_id),
            })
            })
            .then(response => response.json())
            .then(data => {
                let inputTag = document.querySelector(`svg[data-id="${project_id}"]`);
                let parentUl = inputTag.parentNode.parentNode;
                subli = document.createElement("li");
                suba = document.createElement("a");
                suba.href="/board/dashboard/"+data.id; //response.dashboard_id
                suba.style.margin = 0
                suba.style.padding = '0px 0px 10px 0px'
                suba.style.fontSize = '11px'
                if(dashboard_name.value.length > 18)
                {
                    var firstPart = dashboard_name.value.slice(0, 18);
                    var remainingPart = dashboard_name.value.slice(18);
                    suba.textContent = firstPart;
                    suba.title = dashboard_name.value;
                    suba.appendChild(document.createElement("br"));
                    suba.appendChild(document.createTextNode(remainingPart));
                    // suba.textContent = dashboard_name.value.slice(0,10)+'...';
                    // suba.title = dashboard_name.value;
                }
                else{
                    suba.textContent = dashboard_name.value;
                    suba.title = dashboard_name.value;
                }
                
                // suba.textContent = dashboard_name.value;
                suba.setAttribute('data-id', project_id);
                suba.setAttribute('dashboard-id', data.id);
                subli.appendChild(suba);
                let edit_icon = document.createElement('i');
                    edit_icon.title = 'Edit Page'
                    edit_icon.setAttribute('data-id', is_default);
                    edit_icon.className = 'fas fa-edit edit_page'
                    edit_icon.style.cursor = 'pointer'
                    
                    subli.appendChild(edit_icon);
                subi = document.createElement("i");
                subi.title = "Delete Page"
                subi.classList.add('fa','fa-trash','delete_icon','delete_icons');
                subi.style.cursor = 'pointer';
                subi.setAttribute('data-id',data.id);
                subi.onclick = function()
                {
                    //alert('call delete page')
                    //delete_page()
                }
                //<i onclick="deletepage('Santandar Car',1,'container1','{{page.page_name}}',this)" style="cursor: pointer;"></i>
                subli.appendChild(subi);
                parentUl.appendChild(subli);
                $("#add_dashboard_modal").modal('hide');
                $('.delete_chart_spinner').addClass('d-none');
            })
            
        }
        else{
            dashboard_name.classList.add('is-invalid');
            dashboard_name.style.border = '1px solid red';
            // dashboard_name.style.borderColor = 'red';
            errorMessageElement.style.display = 'block';
            errorMessageElement.style.color = 'red';
        }
    }
    

}
//Update Dashboard in Db
function update_dashboard()
{
    const edit_dashboard_id = document.querySelectorAll('input[name="edit_dashboard_id"]');
    const lastdashboardInput = edit_dashboard_id[edit_dashboard_id.length - 1];
    let dashboard_id = lastdashboardInput.value;
    let project_id = document.getElementById('project_id').value;
    let current_dashboard = document.getElementById('dashID').value;
    var form = document.getElementById('dashboard_form');
    let errorMessage = document.querySelector('#edit_dashboard_modal .error-message');
    // Get the CSRF token from the form
    let csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let dashboard_name = document.getElementById('edit_dashboard_name');
    let edit_is_default_dashboard = document.getElementById('edit_is_default_dashboard');

    if(edit_is_default_dashboard.checked)
    {
        is_default = true;
    }
    else
    {
        is_default = false;
    }
    all_anchor_tags = document.querySelectorAll('a[data-id="' + project_id + '"]');
    var anchor_texts = [];
    // Loop through each anchor tag and retrieve its text content
    for (var i = 0; i < all_anchor_tags.length; i++) {
        var anchor_text = all_anchor_tags[i].textContent;
        anchor_texts.push(anchor_text);
    }
    if(anchor_texts.indexOf(dashboard_name.value) !== -1) {
        dashboard_name.classList.add('is-invalid');
        dashboard_name.style.border = '1px solid red';
        // dashboard_name.style.borderColor = 'red';
        errorMessage.textContent = 'This dashboard name is already exist.'
        errorMessage.style.display = 'block';
        errorMessage.style.color = 'red';
    }
    else{
        if(dashboard_name.value)
        {
            if(current_dashboard == dashboard_id)
            {
                $('.mb-sm-0').text(dashboard_name.value);
                document.title = dashboard_name.value;
            }
            $('.delete_chart_spinner').removeClass('d-none');
            fetch('/board/edit/',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    did:dashboard_id,
                    dashboard_name: dashboard_name.value,
                    is_default:is_default
            })
            })
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                
                dashboard_name.classList.add('is-invalid');
                dashboard_name.style.border = '1px solid grey';
                // dashboard_name.style.borderColor = 'red';
                // errorMessage.textContent = 'This dashboard name is already exist.'
                errorMessage.style.display = 'none';
                errorMessage.style.color = 'grey';
                let anchorTag = document.querySelector(`a[dashboard-id="${dashboard_id}"]`);
                let editPageElement = anchorTag.nextElementSibling;
                if (editPageElement && editPageElement.classList.contains("edit_page")) {
                    editPageElement.setAttribute("data-id", is_default);
                } 
                if(data.dashboard_name.length > 18)
                {
                    var firstPart = data.dashboard_name.slice(0, 18);
                    var remainingPart = data.dashboard_name.slice(18);
                    anchorTag.textContent = firstPart;
                    anchorTag.title = data.dashboard_name;
                    anchorTag.appendChild(document.createElement("br"));
                    anchorTag.appendChild(document.createTextNode(remainingPart));

                    // anchorTag.textContent = data.dashboard_name.slice(0,10)+'...';
                    // anchorTag.title = data.dashboard_name;
                }
                else{
                    anchorTag.textContent = data.dashboard_name;
                    anchorTag.title = data.dashboard_name;
                }
                
                // anchorTag.textContent = data.dashboard_name;
                $("#edit_dashboard_modal").modal('hide');
                $('.delete_chart_spinner').addClass('d-none');
            }).catch(error => {
                // Handle the error
                console.error('Error:', error.message);
                
                $('#failureModal').modal('show');
                const h4Element = document.querySelector('#failureModal .modal-body h4');
                if (h4Element) {
                // Update the text content of the h4 element
                h4Element.textContent = error.message;
                }
            });
            
        }
        else{
            dashboard_name.classList.add('is-invalid');
            dashboard_name.style.border = '1px solid red';
            // dashboard_name.style.borderColor = 'red';
            errorMessageElement.style.display = 'block';
            errorMessageElement.style.color = 'red';
        }
    }
    
}
//Delete Dashboard from Db and update DOM
function delete_dashboard()
{
    let current_dashboard = document.getElementById('dashID').value;
    var form = document.getElementById('dashboard_form');
    // var dashboard_id = document.getElementById('delete_dashboard_element').value;
    const deletedashboardInputs = document.querySelectorAll('input[id="delete_dashboard_element"]');
    const lastdeletedashboardInput = deletedashboardInputs[deletedashboardInputs.length - 1];
    let dashboard_id = lastdeletedashboardInput.value;
    // Get the CSRF token from the form
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    // Use the retrieved dataId as needed
    // console.log('dashboard-id:', dashboard_id);
    $('.delete_chart_spinner').removeClass('d-none');
    let requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            did:dashboard_id,
            current_dashboard: current_dashboard
        })
    };
    fetch('/board/edit/?mode=delete',requestOptions)
    .then(response => response.json())
    .then(data => {
        if(data.redirected_url)
        {
            window.location.href = data.redirected_url;
        }
        var anchorTag = document.querySelector("a[dashboard-id='"+dashboard_id+"']");
        if (anchorTag) {
        var listItem = anchorTag.parentNode;
        listItem.parentNode.removeChild(listItem);
        }
        $('#confirmdeletedashboardModal').modal('hide');
        $('.delete_chart_spinner').addClass('d-none');
    })
}

//Show New Project Modal
function add_new_project()
{
    $('.project-name-error-message').addClass('d-none');
    $('#new_project_modal').modal('show');
}
//Create a new project in DB and append new project in DOm at the last.
function create_new_project_name()
{
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    
    let project_name = document.getElementById('new_project_name').value;
    if(!project_name){
        $('.project-name-error-message').removeClass('d-none');
    }
    else{
        $('.delete_chart_spinner').removeClass('d-none');
        fetch('/addproject/',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify( {
                project_name: project_name
        })
        })
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
              throw new Error(response.status);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            $('#new_project_modal').modal('hide');
            let project_id = data.project_id;
            unordered_list = document.getElementById("projects")
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.classList.add("has-arrow", "waves-effect");
            a.textContent = project_name;
            var ul = document.createElement("ul");
            ul.classList.add("sub", "mm-collapse")
            subli = document.createElement("li");

            sub_add_dashboard_button = document.createElement('i');
            sub_add_dashboard_button.title = 'Add Dashboard';
            sub_add_dashboard_button.className = 'fa fa-plus fa-1x add_dashboard';
            sub_add_dashboard_button.setAttribute('data-id', project_id);
            sub_add_dashboard_button.id = 'add_dashboard';
            sub_add_dashboard_button.style.cursor = 'pointer';
            sub_add_dashboard_button.style.color = '#157eab';
            sub_add_dashboard_button.addEventListener('click', function() {
                var project_id = this.getAttribute('data-id');
                dashboardModal(project_id)
            });
            
            // Add Li in Project List
            subli.appendChild(sub_add_dashboard_button)

            ul.appendChild(subli);
            var style = document.createElement('style');
            var cssRule = '#'+sub_add_dashboard_button.id+'::before { content: ""; width: 0; height: 3em; border-radius: 30em; position: absolute; top: 0; left: 0; background-image: linear-gradient(to right, #157eab 0%, #157eab 100%); transition: .5s ease; display: block; z-index: -1; }';
            cssRule += ' #'+sub_add_dashboard_button.id+':hover::before { width: 9em; }';
            style.appendChild(document.createTextNode(cssRule));
            document.head.appendChild(style);
            li.appendChild(a);
            li.appendChild(ul)
            unordered_list.appendChild(li);
            $('#new_project_modal').modal('show');
            $('.delete_chart_spinner').addClass('d-none');
        });
    }
}
//Hide Show Elements Inside Projects when click on it.
document.addEventListener('click', function(event) {
    // Get the clicked element
    var clickedElement = event.target;
    // Check if the clicked element has the class name "has-arrow waves-effect"
    if (clickedElement.classList.contains('has-arrow') && clickedElement.classList.contains('waves-effect')) {
      // Find the next sibling element with the class name "mm-collapse"
      var mmCollapseElement = clickedElement.nextElementSibling;
      if (mmCollapseElement && mmCollapseElement.classList.contains('mm-collapse')) {
        // Replace the class name "sub mm-collapse" with "mm-show mm-collapse"

        if(mmCollapseElement.classList.contains('sub'))
        {
            mmCollapseElement.classList.replace('sub', 'mm-show');
        }
        else{
            mmCollapseElement.classList.replace('mm-show', 'sub');
        }
      }
    }
});