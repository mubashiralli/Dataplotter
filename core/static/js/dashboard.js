// When User click on new create chart button then show chart options.
//If its clicked outside then close chart options.
function showbartypes(event) {
    dropdown.style.display = 'block'
    var target = event.target;
    var button = document.getElementById("displayOptionsBtn");
    var svgElement = button.getElementsByTagName("svg")[0];

    if (target !== button && target !== svgElement) {
      // alert()
      var dropdown = document.getElementById("displayOptionsDropdown"); // Replace "yourDropdownId" with the actual ID of your dropdown element
      dropdown.style.display = "none";
    }
}
//Show current dashboard name and modal when user click on create duplicate page button
function create_duplicate_page()
{
  if(get_slider_value() == 'View')
  {
    return;
  }
  let dashboard_id = document.getElementById('dashID').value;
  let dashboardElement = document.querySelector(`a[dashboard-id="${dashboard_id}"]`);
  let dashboard_name = dashboardElement.getAttribute('title');
  let duplicate_page_name = document.getElementById('duplicate_page_name');
  duplicate_page_name.value = dashboard_name;
  $("#duplicate_page_modal").modal('show');
}
//If add click on create duplicate page button then first check.
// new Dashboard name is same or not with new dashboard name.
//If its same then input box will appear as red color otherwise create a new duplicate page.
function add_duplicate_page()
{
    var form = document.getElementById('dashboard_form');  
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let duplicate_page_modal = document.getElementById('duplicate_page_modal');
    let errorMessageElement = duplicate_page_modal.querySelector('.error-message');
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id').value;
    let duplicate_page_name = document.getElementById('duplicate_page_name');
    
    if (duplicate_page_name.value) {
      var default_dashboard = document.getElementById('duplicate_is_default_dashboard');
      if(default_dashboard.checked)
      {
          is_default = true;
      }
      else
      {
          is_default = false;
      }
      $('.delete_chart_spinner').removeClass('d-none');
      fetch('/board/copy/',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            dashboard_id:dashboard_id,
            dashboard_name: duplicate_page_name.value,
            is_default: is_default,
            project_id:Number(project_id),
      })
      })
      .then(response => response.json())
      .then(data => {
        $("#duplicate_page_modal").modal('hide');
        $('.delete_chart_spinner').addClass('d-none');
        window.location.href = data.redirect
      });
    } else {
      duplicate_page_name.classList.add('is-invalid');
      duplicate_page_name.style.border = '1px solid red';
      errorMessageElement.style.display = 'block';
      errorMessageElement.style.color = 'red';
    }
}
function show_default_dashboard()
{
  $('#show_default_dashboard_modal').modal('show');
}
function cancel_default_dashboard()
{
  let default_dashboard = document.getElementById('default_dashboard');
  default_dashboard.checked = false;
}
function make_default_dashboard()
{
  let dashboard_id = document.getElementById('dashID').value;
  let project_id = document.getElementById('project_id').value;
  $('.filter_spinner').removeClass('d-none');
  fetch('/board/default/'+dashboard_id+'?project_id='+project_id)
  .then(response => response.json())
  .then(data => {
      $("#show_default_dashboard_modal").modal('hide');
      $('.filter_spinner').addClass('d-none');
  })
}

// document.addEventListener("DOMContentLoaded", function() {
//     // Event listener to capture clicks outside the button and SVG element
//     document.addEventListener("click", function(event) {
//       var target = event.target;
//       var button = document.getElementById("displayOptionsBtn");
//       var svgElement = button.getElementsByTagName("svg")[0];
  
//       if (target !== button && target !== svgElement) {
//         // alert()
//         var dropdown = document.getElementById("displayOptionsDropdown"); // Replace "yourDropdownId" with the actual ID of your dropdown element
//         dropdown.style.display = "none";
//       }
//     });
// });
  