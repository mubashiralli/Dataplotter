//Initialize datatable_header selectize
var select1 = $('#datatable_header').selectize({
    plugins: ['remove_button'],
    onItemRemove: function () {

        this.open();
    },
    maxItems: 50
});
var datatable_header_selectize = select1[0].selectize;

$(document).ready(function () {
    let dashboard_id = document.getElementById('dashID').value;

    //Check datatables value is true or false. If true means datatables created then show View Datatables button
    // Else Show New Datatable created Button.
    fetch('/board/'+dashboard_id)
    .then(response => response.json())
    .then(data => {
        $('.mb-sm-0').text(data.result[0].dashboard_name);
        document.title = data.result[0].dashboard_name;
        var datatables = data.result[0].datatables;
        var project_id = data.result[0].project_id_id;
        let input = document.createElement('input');
        input.id = 'project_id';
        input.value = project_id;
        input.type = 'hidden'
        document.body.appendChild(input);
        $('#add_table_header').removeClass('d-none');
        $('#add_table').css('display', 'inline-block');
        if(datatables)
        {
            $('#add_table_header').addClass('d-none');
            $('#add_table').removeClass('d-none');
        }
    })
    .catch(error => {
        // Handle the error
        console.error('Error:', error.message);
        // Retrieve the error code
        const statusCode = error.response.status;
        console.log('Error Code:', statusCode);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          // Update the text content of the h4 element
          h4Element.textContent = statusCode;
        }
    }); 
});
$(document).ready(function(e){
    // When User scroll down then only filters bar.
    window.onscroll = function() {
        var header_height = $('.navbar-header').height();
        $(window).scroll(function() {
            if ($(this).scrollTop() > header_height+150) {
                $('.filter_bar_con').addClass('top_content_fixed').fadeIn();
            } else {
                $('.filter_bar_con').removeClass('top_content_fixed').fadeIn();
            }
        });
    }
});
//When User will click on View Datatable button then this function will run and show datatable in DOM
function show_datatable(status,search,e)
{
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id');
    let dataId = project_id.getAttribute('data-id');
    if(!dataId)
    {
        let project_id = document.querySelectorAll('input[id="project_id"]');
        let lastproject_idInput = project_id[project_id.length - 1];
        dataId = lastproject_idInput.getAttribute('data-id');
    }
    fetch('/board/tables/'+dashboard_id+'?project_id='+project_id.value)
    .then(response => {
        // Handle unsuccessful response
        if (!response.ok) {
          throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(data => {
        var displayValue = $('#datatables').css('display');
        if(status == true){
            if(displayValue === 'block'){
                $('#add_table').css('background-color', '#157eab');
                $('#datatables').css('display', 'none');
                $('#update_datatable_column_button').addClass('d-none')
            }
            else{
                $('#update_datatable_column_button').removeClass('d-none')
                $('#add_table').css('background-color', 'green');
                var buttonElement = document.getElementById('add_table');
                // Change the title (tooltip) text
                buttonElement.title = 'Hide Table';
                $('#datatables').css('display', 'block');
            }
            // $('#add_table').css('display', 'none');
            if ($.fn.DataTable.isDataTable('#myTable')) {
                $('#myTable').DataTable().destroy();
                $('#myTable thead tr.filters').remove();
            }
        }
        else{
            // $('#datatables').css('display', 'block');
            if ($.fn.DataTable.isDataTable('#myTable')) {
                $('#myTable').DataTable().destroy();
                $('#myTable thead tr.filters').remove();
                if(displayValue == 'block'){
                    draw_datatable(data,search,e)
                }
            }
        }
        if(displayValue == 'none'){

            draw_datatable(data,search,e)
        }
    }).catch(error => {
        // Handle the error
        console.error('Error:', error.message);
        // Retrieve the error code
        const statusCode = error.response.status;
        console.log('Error Code:', statusCode);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          // Update the text content of the h4 element
          h4Element.textContent = statusCode;
        }
    });
    $('#myTable_wrapper').css('top','1px');
}
//Fetch Filters or Basket if created from DOM and Draw Table.
function draw_datatable(data,search,e)
{
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id');
    let dataId = project_id.getAttribute('data-id');
    if(!dataId)
    {
        let project_id = document.querySelectorAll('input[id="project_id"]');
        let lastproject_idInput = project_id[project_id.length - 1];
        dataId = lastproject_idInput.getAttribute('data-id');
    }
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    if(search == true){
        filters = get_search_filters(e)
    }else{
        filters = get_filters()
    }
    let basket_id ;
    let listing_filters = []
    if(!filters)
    {
        let filters_btn =  document.querySelector('.basketbtn')
        var dropdowns = filters_btn.querySelectorAll('#basket_list');
        
        dropdowns.forEach(function(dropdown) {
            let allChecked = true;
            var checkboxes = dropdown.querySelectorAll('.checkbox-input');
            for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checkboxes[i].checked = true;
                basket_id = checkboxes[i].id;
                break;
            } 
            } 
        });
    }
    else{
        filters = filters[0]
    }
    if(!filters)
    {
        if(basket_id){
        filters = [{}]
        }
        else{
        filters = null
        }
        
    }
    let requestOptions;
    if(basket_id)
    {
        requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            dashboard_id:dashboard_id,
            pid: project_id,
            Filters:filters,
            basket:basket_id
        })
        };
    }
    else{
        requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            dashboard_id:dashboard_id,
            pid: project_id,
            Filters:filters
        })
        };
    }
    let columns = data.header;
    var headerRow = $('#headerRow');
    // Clear existing headers
    headerRow.empty();
    // Create new headers based on selected values
    columns.forEach(function(value) {
        var th = $('<th>').text(value);
        headerRow.append(th);
    });
    //Create datatable_columns object from columns list for datatable data source
    let datatable_columns = [];
    for(let i=0;i<columns.length;i++)
    {
        datatable_columns.push({
            data:columns[i],
            name:columns[i]
        })
    }
    $('#myTable thead tr')
        .clone(true)
        .addClass('filters')
        .appendTo('#myTable thead');

    var table = $('#myTable').DataTable({
        scrollX: true,
        orderCellsTop: true,
        fixedHeader: true,
        autoWidth: true,
        initComplete: function () {
            //Add Search Fields
            var api = this.api();
            // For each column
            api.columns().eq(0).each(function (colIdx) {
                
                // Set the header cell to contain the input element if it's visible
                var cell = $('.filters th').eq($(api.column(colIdx).header()).index());
                var myTablecell = $('#myTable th').eq($(api.column(colIdx).header()).index());
                var displayValue = $(myTablecell).css('display');
                if (displayValue != 'none') {
                var title = $(cell).text();
                $(cell).html('<input type="text" placeholder="' + title + '" />');
                }

            });

            // Apply the search
            $('.filters input').on('keyup change', function () {
                var columnIndex = $(this).closest('th').index();
                table
                .column(columnIndex)
                .search(this.value)
                .draw();
            });
            table.columns.adjust();
            // Update table layout
            table.draw();

        },
        //"ajax": "/board/datatable/"+dataId,
        "ajax": {
            url: "/board/datatable/" + project_id.value,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",

            beforeSend: function(request) {
            // Show the spinner before making the Ajax request
            request.setRequestHeader("X-CSRFToken", csrfToken);
            $('.datatable_spiner').removeClass('d-none');
            },
            complete: function() {
            // Hide the spinner after the search is complete
            $('.datatable_spiner').addClass('d-none');
            },
            data: function(d)
            {
                var searchData = {};
                $('.filters input').each(function () {
                    var columnIndex = $(this).closest('th').index();
                    var columnData = table.column(columnIndex).search();
                    var columnName = table.settings().init().columns[columnIndex].data;
                    searchData[columnName] = columnData;
                });
                var requestData ;
                if(basket_id)
                {
                    requestData = {
                        dashboard_id:dashboard_id,
                        Filters:filters,
                        basket:basket_id,
                        SearchData: searchData,
                        draw: d.draw,
                        columns: d.columns,
                        order: d.order,
                        start: d.start,
                        length: d.length,
                        search: {
                            value: d.search.value,
                            regex: d.search.regex
                        },
                    };
                }
                else{
                    requestData = {
                        dashboard_id:dashboard_id,
                        Filters:filters,
                        SearchData: searchData,
                        draw: d.draw,
                        columns: d.columns,
                        order: d.order,
                        start: d.start,
                        length: d.length,
                        search: {
                            value: d.search.value,
                            regex: d.search.regex
                        },
                    };
                }  
                return JSON.stringify(requestData);
            }
        },
        dom: 'Plrtip',      
        columns: datatable_columns,
        columnDefs:[{
        searchPanes:{
            //cascadePanes: true,
            show: true,
        },
        // targets: [0, 1, 2, 3],
        
        }],
        serverSide: true,
        select: true,
        "createdRow": function(row, data, dataIndex) {
            if (table.row(row).index() % 2 === 1) {
                $(row).addClass('odd-row').css('background-color', '#E5F3FD');
            } else {
                $(row).addClass('odd-row').css('background-color', '#D1E5F4');
            }
        }
    });
}

//When User click on Create Datatable button then this function will run
// This function will get fields against project from backend and add fields in selectize element.
function add_datatable_header()
{
    let project_id = document.getElementById('project_id').value;
    $('#add_datatable_header_Modal').modal('show');
    $('.delete_chart_spinner').removeClass('d-none');
    fetch('/board/datatable/header/'+project_id)
    .then(response => {
        // Handle unsuccessful response
        if (!response.ok) {
          throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(data => {
        let arr2 = data.fields;
        for(var i = 0; i < arr2.length; i++){
            var data = {
                'value':arr2[i],
                'text':arr2[i],
            };
            datatable_header_selectize.addOption(data);
        };
        $('.delete_chart_spinner').addClass('d-none');
    }).catch(error => {
        // Handle the error
        console.error('Error:', error.message);
        // Retrieve the error code
        // const statusCode = error.response.status;
        // console.log('Error Code:', statusCode);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          // Update the text content of the h4 element
          h4Element.textContent = 'Please create a Default Dashboard';
        }
    });
}
//When user will click on create Datatable then This function will run and update selected fields at backend.
function save_datatable_header()
{
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id').value;
    let selected_headers = datatable_header_selectize.getValue();
    $('.delete_chart_spinner').removeClass('d-none');
    let requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            dashboard:dashboard_id,
            table_header: selected_headers
        })
    };
    fetch('/board/tables/',requestOptions)
    .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
    })
    .then(data => {
        show_datatable(true);
        $('#add_datatable_header_Modal').modal('hide');
        $('#add_table').removeClass('d-none');
        $('#add_table_header').addClass('d-none');
        $('.delete_chart_spinner').addClass('d-none');
    }).catch(error => {
        console.error('Error:', error.message);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          h4Element.textContent = error.message;
        }
    });
}
// When user will click on Modify Column button then this function will run and update selectize element.
function update_columns()
{
    let dashboard_id = document.getElementById('dashID').value;
    add_datatable_header()
    $('.delete_chart_spinner').removeClass('d-none');
    fetch('/board/tables/'+dashboard_id)
    .then(response => {
        // Handle unsuccessful response
        if (!response.ok) {
          throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(data => {
        let columns = data.header;
        let col_id = data.col_id;

        var input = $('<input>', {
            id: 'col_id',
            value: col_id, // Assuming col_id is a variable with the desired value
            type: 'hidden'
        });
        
        // Get the modal body element
        var modalBody = $('#add_datatable_header_Modal .modal-body');
        
        // Append the input element to the modal body
        modalBody.append(input);

        for(let i=0;i<columns.length;i++)
        {
            var data = {
                'value':columns[i],
                'text':columns[i],
            };
            datatable_header_selectize.addOption(data);
            datatable_header_selectize.addItem(columns[i]);  
        }
        var modalFooter = $('#add_datatable_header_Modal .modal-footer');
        // Clear the current content of the modal footer
        modalFooter.empty();
        // Add the updated content with the "update_datatable" button
        modalFooter.append(`
            <button type="button" class="cbtn bg_color_gray" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="cbtn bg_color_blue update_datatable" id="update_datatable" onclick="update_datatable()">Update</button>
        `);
        // Update the modal title
        $('#add_datatable_header_Modal #confirmModalLabel').text('Update Columns');
        $('.delete_chart_spinner').addClass('d-none');
    })
    .catch(error => {
        // Handle the error
        console.error('Error:', error.message);
        // Retrieve the error code
        // const statusCode = error.response.status;
        // console.log('Error Code:', statusCode);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          // Update the text content of the h4 element
          h4Element.textContent = error.message;
        }
    });
}
// This function is for update table at the backend and redraw datatable.
function update_datatable()
{
    let chartInputs = document.querySelectorAll('input[id="col_id"]');
    let lastchartInput = chartInputs[chartInputs.length - 1];
    let col_id = lastchartInput.getAttribute('value');
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id').value;
    let selected_headers = datatable_header_selectize.getValue();
    $('.delete_chart_spinner').removeClass('d-none');
    let requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            dashboard:dashboard_id,
            table_header: selected_headers
        })
    };
    fetch('/board/tables/'+col_id,requestOptions)
    .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
    })
    .then(data => {

        fetch('/board/tables/'+dashboard_id)
        .then(response => response.json())
        .then(data => {
            $('#myTable').DataTable().destroy();
            $('#myTable thead tr.filters').remove();
            $('#myTable tbody').remove();
            draw_datatable(data)
        })
        $('#add_datatable_header_Modal').modal('hide');
        $('#add_table').removeClass('d-none');
        $('#add_table_header').addClass('d-none');
        $('.delete_chart_spinner').addClass('d-none');
    }).catch(error => {
        console.error('Error:', error.message);
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
          h4Element.textContent = error.message;
        }
    });
}