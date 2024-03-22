//When user change the size of window then change the size of all charts.
function resizeCharts(e) {
    let chart_id = document.querySelector('.charts_container .card-container-category-column').id;
    const cardContainers = document.querySelectorAll('.chart_container');
    const screenWidth = window.innerWidth;
    cardContainers.forEach(container => {
        change_chart_size(chart_id)
    });
}
window.addEventListener('resize', resizeCharts);

function checkIfUserIsAdmin() {
    $('.delete_chart_spinner').removeClass('d-none');
    fetch('/isadmin')
      .then(response => response.json())
      .then(data => {
        if (data.status === true) {
          $('.admin_rights').removeClass('d-none');
        }
        $('.delete_chart_spinner').addClass('d-none');
      });
}
function checkIfUserIsViewer() {
    fetch('/isviewer')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("is_viewer", data.status);  
            if (data.status === false) {
                $('.display-options').removeClass('d-none');
                $('.right_btns').removeClass('d-none');
                $('#edit_view').removeClass('d-none');
                $('.delete_chart_spinner').addClass('d-none');
            } else {
                $('.switch .slider span:last-child').click();
            }
        });
}
function create_options_for_select2(id,width)
{
    options = {
        theme: "classic",
        templateSelection: function(option) {
            // Check if the option is empty or disabled
            if (!option.id || option.disabled) {
            return option.text;
            }
            if(id == 'filter_column' || id == 'secondary_sort'){
                container = $('<div class="custom-option" style="margin-bottom:-3px"></div>');
            }
            else if(id == 'sort')
            {
                container = $('<div class="custom-option" style="margin-bottom:-2px"></div>');
            }
            else{
                container = $('<div class="custom-option"></div>');
            }
            container.html(option.text);
        return container;
        }
    }
    if (width) {
        options.width = width;
    }
    return options
}
function show_error(error){
    $('#failureModal').modal('show');
    const h4Element = document.querySelector('#failureModal .modal-body h4');
    if (h4Element) if(error.message == 500) h4Element.textContent = error;
}