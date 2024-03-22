let inclusive_count = 0;
let exclusive_count = 0;
let edit_inclusive_count = 0;
let edit_exclusive_count = 0;
let filterValuesSelect;
let next_page = 0;
$(document).ready(function() {
    $(document).on('click', '#add_inclusive_filters', function(e) {
        basket_filters('inclusive');
    });
    $(document).on('click', '#add_exclusive_filters', function(e) {
        basket_filters('exclusive');
    });
    $(document).on('click', '#edit_inclusive', function(e) {
        edit_basket_filters('edit_inclusive');
    });
    $(document).on('click', '#edit_exclusive', function(e) {
        edit_basket_filters('edit_exclusive');
    });
    let select_date = document.getElementById('select_date');
    let project_id = document.getElementById('project_id').value;
    select_date.addEventListener('change', function(e) {
        $('#select_date_values').empty();
        $('#select_date_values').val(null).trigger('change');
        $('#select_date_values').select2({
            width:'250px',
            closeOnSelect: false
        });
        $('.delete_chart_spinner').removeClass('d-none');
        url = '/board/newbasket/?filter_column='+select_date.value+'&mode=newcol&project_id='+project_id
        fetch(url)
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
            throw new Error(response.status);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            let filter_values = data.filter_values;
            for(let value = 0 ;value<filter_values.length;value++)
            {
                let optionElement = $("<option></option>");
                optionElement.val(filter_values[value]);
                optionElement.text(filter_values[value]);
                $('#select_date_values').append(optionElement);
                // $(filterValuesSelect).val(filter_values[value]).trigger('change');
            }
            $('.delete_chart_spinner').addClass('d-none');
            if(data.more_pages)
            {
                let optionElement = $("<option></option>");
                optionElement.val('show_more');
                optionElement.text('Show More');
                $('#select_date_values').append(optionElement);
            }
            
            filterValuesSelect.style.width = '16rem';
            $('.delete_chart_spinner').addClass('d-none');
        })

    });
    $('#select_date_values').on('change', function(e) {
        var selectedItems = $(this).val();
        if (selectedItems && selectedItems.length > 0)
        {
            empty_inclusive_exclusive_values_from_initial_filter('inclusive',project_id);
            empty_inclusive_exclusive_values_from_initial_filter('exclusive',project_id);
        }
    });
    $('#edit_select_date_values').on('change', function(e) {
        var selectedItems = $(this).val(); // Get selected items
        if (selectedItems && selectedItems.length > 0)
        {
            empty_inclusive_exclusive_values_from_initial_filter('edit_inclusive',project_id);
            empty_inclusive_exclusive_values_from_initial_filter('edit_exclusive',project_id);
        }
    });
    $(document).on('change', '#inclusive_filters .select2-hidden-accessible', function() {
        empty_inclusive_exclusive_values('inclusive',$(this),project_id);
    });
    $(document).on('change', '#exclusive_filters .select2-hidden-accessible', function() {
        empty_inclusive_exclusive_values('exclusive',$(this),project_id);
    });
    $(document).on('change', '#edit_inclusive_filters .select2-hidden-accessible', function() {
        empty_inclusive_exclusive_values('edit_inclusive',$(this),project_id); 
    });
    $(document).on('change', '#edit_exclusive_filters .select2-hidden-accessible', function() {
        empty_inclusive_exclusive_values('edit_exclusive',$(this),project_id); 
    });
});
function basket_filters(filter)
{
    var last_column = $('.'+filter+'-filter-item > div:last-child select').val();
    if (last_column == '') {
        $('.basket_error_message').text('Please select last '+filter+' filter column first then add new filter')
        $('.basket_error_message').removeClass('d-none');
    }else{
        
        if(filter == 'inclusive'){
            document.getElementById('add_inclusive_filters').remove();
        }
        else{
            document.getElementById('add_exclusive_filters').remove();
        }
        if(filter == 'inclusive'){
            inclusive_count += 1;
        }
        else{
            exclusive_count += 1;
        }
        let project_id = document.getElementById('project_id').value;
        let dashboard_id = document.getElementById('dashID').value;
        var form = document.getElementById('dashboard_form');
        var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
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
            let inclusiveFiltersDiv = document.getElementById(filter+'_filters');
            let filterItemDiv = document.querySelector('.'+filter+'-filter-item');
            filterValuesSelect = document.createElement('select');
            let columnNameLabel = document.createElement('select');
            if (!filterItemDiv)
            {
                create_row(filter,inclusiveFiltersDiv,columnNameLabel,1,data,dashboard_id,project_id)
            } else {
                create_row(filter,inclusiveFiltersDiv,columnNameLabel,2,data,dashboard_id,project_id)
            }
            filterDiv = document.getElementsByClassName(filter+'-filter-item')[0]
            let columns = data.fields;
            const inclusiveColumnLabels = document.querySelectorAll('.'+filter+'-filter-item select[id="'+filter+'_column"]');
            const lastInclusiveColumnLabel = inclusiveColumnLabels[inclusiveColumnLabels.length - 1];
            const option = document.createElement('option');
                option.value = ''
                option.id = '';
                option.textContent = "Select Option";
                lastInclusiveColumnLabel.appendChild(option);
            let selected_inclusive_columns = []
            let filter_columns = document.querySelectorAll('.'+filter+'-filter-item #'+filter+'_column')
            for(let index = 0; index < filter_columns.length-1; index++)
            {
                selected_inclusive_columns.push(filter_columns[index].value)
            }
            for(let index = 0;index<data.fields.length;index++)
            {
                if ((selected_inclusive_columns.indexOf(data.fields[index]) === -1) && (select_date.value !== data.fields[index])) {
                    const option = document.createElement('option');
                    option.value = data.fields[index]
                    option.id = data.fields[index];
                    option.textContent = data.fields[index];
                    lastInclusiveColumnLabel.appendChild(option);
                }
            }

            lastInclusiveColumnLabel.addEventListener('change', function() {

                $('.basket_error_message').addClass('d-none');
                let get_total_filters = filterDiv.querySelectorAll('label').length;
                // lastInclusiveColumnLabel.textContent = data.fields[get_total_filters-1];
                if(filter == 'inclusive'){
                    $('#inclusive_filter_' + inclusive_count).empty();
                    $('#inclusive_filter_' + inclusive_count).val(null).trigger('change');
                    $('#inclusive_filter_' + inclusive_count).select2({
                        
                        width:'250px',
                        closeOnSelect: false
                    });
                }
                else{
                    $('#exclusive_filter_' + exclusive_count).empty();
                    $('#exclusive_filter_' + exclusive_count).val(null).trigger('change');
                    $('#exclusive_filter_' + exclusive_count).select2({
                        width:'250px',
                        closeOnSelect: false
                    });
                }

                $(filterValuesSelect).on('select2:open', function() {
                    $('.select2-dropdown--below').css('width', '100% !important');
                });
                $('.delete_chart_spinner').removeClass('d-none');

                let url;
                if(inclusive_count == 1 || exclusive_count == 1) {
                    let select_date = document.getElementById('select_date').value;
                    let selectedElement = $("#select_date_values");
                    let filters = '';
                    if (selectedElement.data('select2')) {
                        let selectedData = selectedElement.select2("data");
                        
                        if (selectedData.length > 0)
                        {
                            let selectedValues = $("#select_date_values").select2("val");
                            selectedValues = selectedValues.join(',');
                            filters = select_date + ':' + selectedValues
                        }
                        else{
                            filters = ''
                        }
                    }
                    // url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&mode=newcol&project_id='+project_id
                    
                    url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                }
                else{
                    
                    let filters = '';
                    if(filter == 'inclusive'){
                        filters_list = get_inclusive_or_exclusive_filters(filter,filters)
                        filters = convert_inclusive_exclusive_filters_list_into_string(filters_list)

                    }
                    else{
                        filters_list = get_inclusive_or_exclusive_filters('exclusive',filters)
                        filters = convert_inclusive_exclusive_filters_list_into_string(filters_list)
                    }
                    url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                }
                $('.basket_error_message').addClass('d-none');
                fetch(url)
                .then(response => {
                    // Handle unsuccessful response
                    if (!response.ok) {
                    throw new Error(response.status);
                    }
                    // Parse the response as JSON
                    return response.json();
                })
                .then(data => {
                    let filter_values = data.filter_values;
                    for(let value = 0 ;value<filter_values.length;value++)
                    {
                        let optionElement = document.createElement("option");
                        // optionElement.classList.add('custom-option');
                        optionElement.value = filter_values[value];
                        optionElement.textContent = filter_values[value];
                        filterValuesSelect.appendChild(optionElement);
                        // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                    }

                    if(data.more_pages)
                    {
                        next_page = data.next;
                        let optionElement = document.createElement("option");
                        // optionElement.classList.add('custom-option');
                        optionElement.value = '';
                        optionElement.textContent = 'Show More';
                        filterValuesSelect.appendChild(optionElement);
                    }
                    // $(filterValuesSelect).on('select2:select', function (e) {
                    //     let selectedValue = e.params.data.id;
                    //     if (selectedValue === '') {
                            
                    //         loadMoreData(dashboard_id,lastInclusiveColumnLabel,next_page,project_id,filterValuesSelect)
                    //     }
                    // });
                    filterValuesSelect.style.width = '16rem';
                    
                    $('.delete_chart_spinner').addClass('d-none');
                })
                // }
                
            });

            if(filter == 'inclusive'){
                var iconElement = document.createElement('i');
                iconElement.title = "Add inclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "add_inclusive_filters";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            }
            else{
                var iconElement = document.createElement('i');
                iconElement.title = "Add exclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "add_exclusive_filters";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            }
            let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
            lastFilterItemDiv.after(iconElement);
            $('.delete_chart_spinner').addClass('d-none');
        });
    }
}
function edit_basket_filters(filter)
{
    let select_date = document.getElementById('edit_select_date');
    var last_column = $('.'+filter+'-filter-item > div:last-child select').val();
    if (last_column == '') {
        $('#failureModal').modal('show');
        const h4Element = document.querySelector('#failureModal .modal-body h4');
        if (h4Element) {
            // Update the text content of the h4 element
            h4Element.textContent = 'Please select last '+filter+' filter column first then add new filter';
        }
    }else{
        if(filter == 'edit_inclusive'){
            document.getElementById('edit_inclusive').remove();
        }
        else{
            try {
                document.getElementById('edit_exclusive').remove();
            } catch (error) {
                
            }
            
        }
        if(filter == 'edit_inclusive'){
            edit_inclusive_count += 1;
        }
        else{
            edit_exclusive_count += 1;
        }
        let project_id = document.getElementById('project_id').value;
        let dashboard_id = document.getElementById('dashID').value;
        var form = document.getElementById('dashboard_form');
        var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
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
            let inclusiveFiltersDiv = document.getElementById(filter+'_filters');
            let filterItemDiv = document.querySelector('.'+filter+'-filter-item');
            filterValuesSelect = document.createElement('select');
            let columnNameLabel = document.createElement('select');
            if (!filterItemDiv)
            {
                create_row(filter,inclusiveFiltersDiv,columnNameLabel,1,data,dashboard_id,project_id)
            } else {
                create_row(filter,inclusiveFiltersDiv,columnNameLabel,2,data,dashboard_id,project_id)
            }
            filterDiv = document.getElementsByClassName(filter+'-filter-item')[0]
            let columns = data.fields;
            const inclusiveColumnLabels = document.querySelectorAll('.'+filter+'-filter-item select[id="'+filter+'_column"]');
            const lastInclusiveColumnLabel = inclusiveColumnLabels[inclusiveColumnLabels.length - 1];
            const option = document.createElement('option');
                option.value = ''
                option.id = '';
                option.textContent = "Select Option";
                lastInclusiveColumnLabel.appendChild(option);
            let selected_inclusive_columns = []
            let filter_columns = document.querySelectorAll('.'+filter+'-filter-item #'+filter+'_column')
            console.dir(filter_columns,{'maxArrayLength':'none'});
            for(let index = 0; index < filter_columns.length-1; index++)
            {
                selected_inclusive_columns.push(filter_columns[index].value)
            }
            for(let index = 0;index<data.fields.length;index++)
            {
                if ((selected_inclusive_columns.indexOf(data.fields[index]) === -1) && (select_date.value !== data.fields[index])) {

                // if(selected_inclusive_columns.indexOf(data.fields[index]) === -1){
                const option = document.createElement('option');
                option.value = data.fields[index]
                option.id = data.fields[index];
                option.textContent = data.fields[index];
                lastInclusiveColumnLabel.appendChild(option);
                }
            }
            lastInclusiveColumnLabel.addEventListener('change', function() {
                let get_total_filters = filterDiv.querySelectorAll('label').length;
                // lastInclusiveColumnLabel.textContent = data.fields[get_total_filters-1];
                if(filter == 'edit_inclusive'){
                    $('#edit_inclusive_filter_' + edit_inclusive_count).empty();
                    $('#edit_inclusive_filter_' + edit_inclusive_count).val(null).trigger('change');
                    $('#edit_inclusive_filter_' + edit_inclusive_count).select2({
                        width:'250px',
                        closeOnSelect: false
                    });
                }
                else{
                    $('#edit_exclusive_filter_' + edit_exclusive_count).empty();
                    $('#edit_exclusive_filter_' + edit_exclusive_count).val(null).trigger('change');
                    $('#edit_exclusive_filter_' + edit_exclusive_count).select2({
                        width:'250px',
                        closeOnSelect: false
                    });
                }

                $(filterValuesSelect).on('select2:open', function() {
                    $('.select2-dropdown--below').css('width', '100% !important');
                });
                $('.delete_chart_spinner').removeClass('d-none');
                let url;
                if(edit_inclusive_count > 1 || edit_exclusive_count > 1)
                {
                    let filters = '';
                    if(filter == 'edit_inclusive'){
                        includes_filters_list = get_inclusive_or_exclusive_filters(filter,filters)
                        console.dir('Edit Filters List: ',includes_filters_list)
                        filters = convert_inclusive_exclusive_filters_list_into_string(includes_filters_list)
                        
                    }
                    else{
                        includes_filters_list = get_inclusive_or_exclusive_filters('edit_exclusive',filters)
                        filters = convert_inclusive_exclusive_filters_list_into_string(includes_filters_list)
                        
                    }
                    url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                }
                else if(edit_inclusive_count == 1) {
                    let select_date = document.getElementById('edit_select_date').value;
                    let selectedElement = $("#edit_select_date_values");
                    let filters = '';
                    if (selectedElement.data('select2')) {
                        let selectedData = selectedElement.select2("data");
                        
                        if (selectedData.length > 0)
                        {
                            let selectedValues = $("#edit_select_date_values").select2("val");
                            selectedValues = selectedValues.join(',');
                            filters = select_date + ':' + selectedValues
                        }
                        else{
                            filters = ''
                        }
                    }
                    url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                    // url = '/charts/filters/'+dashboard_id+'?filter_column='+lastInclusiveColumnLabel.value+'&mode=newcol&project_id='+project_id
                }
                else if(edit_exclusive_count == 1)
                {
                    let select_date = document.getElementById('edit_select_date').value;
                    let selectedElement = $("#edit_select_date_values");
                    let filters = '';
                    if (selectedElement.data('select2')) {
                        let selectedData = selectedElement.select2("data");
                        
                        if (selectedData.length > 0)
                        {
                            let selectedValues = $("#edit_select_date_values").select2("val");
                            selectedValues = selectedValues.join(',');
                            filters = select_date + ':' + selectedValues
                        }
                        else{
                            filters = ''
                        }
                    }
                    url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                }
                // else{
                //     // url = '/charts/filters/'+dashboard_id+'?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&project_id='+project_id
                // }
                fetch(url)
                .then(response => {
                    // Handle unsuccessful response
                    if (!response.ok) {
                    throw new Error(response.status);
                    }
                    // Parse the response as JSON
                    return response.json();
                })
                .then(data => {
                    console.dir(filterValuesSelect,{'maxArrayLength':'none'});
                    let filter_values = data.filter_values;
                    for(let value = 0 ;value<filter_values.length;value++)
                    {
                        let optionElement = document.createElement("option");
                        // optionElement.classList.add('custom-option');
                        optionElement.value = filter_values[value];
                        optionElement.textContent = filter_values[value];
                        filterValuesSelect.appendChild(optionElement);
                        // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                    }

                    if(data.more_pages)
                    {
                        next_page = data.next;
                        let optionElement = document.createElement("option");
                        // optionElement.classList.add('custom-option');
                        optionElement.value = '';
                        optionElement.textContent = 'Show More';
                        filterValuesSelect.appendChild(optionElement);
                    }
                    $(filterValuesSelect).on('select2:select', function (e) {
                        let selectedValue = e.params.data.id;
                        if (selectedValue === '') {
                            
                            loadMoreData(dashboard_id,lastInclusiveColumnLabel,next_page,project_id,filterValuesSelect)
                        }
                    });
                    filterValuesSelect.style.width = '250px';
                    // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
                    // Assuming you want to change the width of the entire select2 dropdown
                    $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '250px');
                    $('.delete_chart_spinner').addClass('d-none');
                })
            });
            if(filter == 'edit_inclusive'){
                var iconElement = document.createElement('i');
                iconElement.title = "Add inclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "edit_inclusive";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            }
            else{
                var iconElement = document.createElement('i');
                iconElement.title = "Add exclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "edit_exclusive";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            }
            let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
            lastFilterItemDiv.after(iconElement);
            $('.delete_chart_spinner').addClass('d-none');
        });
    }
}
function show_edit_basket_modal(data)
{
    let project_id = document.getElementById('project_id').value;
    document.getElementById('edit_inclusive').remove();
    document.getElementById('edit_exclusive').remove();
    const inclusivefilterRemove = document.querySelector('.edit_inclusive-filter-item');
    const exclusivefilterRemove = document.querySelector('.edit_exclusive-filter-item');
    // Check if the element exists and has the class
    if (inclusivefilterRemove) {
    // Remove the element from the DOM
    inclusivefilterRemove.remove();
    }
    // Check if the element exists and has the class
    if (exclusivefilterRemove) {
        // Remove the element from the DOM
        exclusivefilterRemove.remove();
    }
    let select_date = document.getElementById('edit_select_date');
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
        for(let index = 0;index<data.fields.length;index++)
        {
            const option = document.createElement('option');
            option.value = data.fields[index]
            option.id = data.fields[index];
            option.textContent = data.fields[index];
            select_date.appendChild(option);
        }
        
    })
    $('#edit_select_date_values').val(null).trigger('change');
    $('#edit_select_date_values').select2({
        width:'250px',
        closeOnSelect: false
    });
    select_date.addEventListener('change', function(e) {
        $('#edit_select_date_values').empty();
        $('#edit_select_date_values').val(null).trigger('change');
        $('#edit_select_date_values').select2({
            width:'250px',
            closeOnSelect: false
        });
        $('.delete_chart_spinner').removeClass('d-none');
        url = '/board/newbasket/?filter_column='+select_date.value+'&mode=newcol&project_id='+project_id
        fetch(url)
        .then(response => {
            if (!response.ok) {
            throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            let filter_values = data.filter_values;
            for(let value = 0 ;value<filter_values.length;value++)
            {
                let optionElement = $("<option></option>");
                optionElement.val(filter_values[value]);
                optionElement.text(filter_values[value]);
                $('#edit_select_date_values').append(optionElement);
                // $(filterValuesSelect).val(filter_values[value]).trigger('change');
            }
            $('.delete_chart_spinner').addClass('d-none');
            if(data.more_pages)
            {
                let optionElement = $("<option></option>");
                optionElement.val('');
                optionElement.text('Show More');
                $('#edit_select_date_values').append(optionElement);
            }
            // $(filterValuesSelect).on('select2:select', function (e) {
            //     let selectedValue = e.params.data.id;
            //     if (selectedValue === '') {
                    
            //         loadMoreData(dashboard_id,lastInclusiveColumnLabel,next_page,project_id,filterValuesSelect)
            //     }
            // });
            filterValuesSelect.style.width = '16rem';
            $('.delete_chart_spinner').addClass('d-none');


        })

    });
    let check_edit_basket_id = document.getElementById('edit_basket_id');
    if(check_edit_basket_id)
    {
        check_edit_basket_id.value = data.id
    }
    else{
        const inputElement = document.createElement('input');
        inputElement.type = 'hidden';
        inputElement.id = 'edit_basket_id';
        inputElement.value = data.id;
        // Get the modal body element by its ID
        const modalBody = document.getElementById('show_edit_basket_modal');
        // Append the input element to the modal body
        modalBody.appendChild(inputElement);
    }
    $('#show_edit_basket_modal').modal('show');

    let edit_basket_name = document.getElementById('edit_basket_name');
    edit_basket_name.value = data.basket_name;
    $('.error_edit_basket_name').addClass('d-none');
    //Inclusive Filters
    if(data.includes_filters.length > 0){
        let includes_filters = data.includes_filters[0];
        let completedIterations = 0;
        const totalIterations = Object.keys(includes_filters).length;
        $('.delete_chart_spinner').removeClass('d-none');
        let keys = Object.keys(includes_filters);
        for (let i = 0; i < keys.length; i++)
        {
            let key = keys[i];
            let isLastIteration = i === keys.length - 1;
            let project_id = document.getElementById('project_id').value;
            let dashboard_id = document.getElementById('dashID').value;
            var form = document.getElementById('dashboard_form');
            var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
            fetch('/board/datatable/header/'+project_id)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(get_data => {
                // edit_basket_filters('edit_inclusive')
                edit_inclusive_count += 1;
                let inclusiveFiltersDiv = document.getElementById('edit_inclusive_filters');
                let filterItemDiv = document.querySelector('.edit_inclusive-filter-item');
                let filterValuesSelect = document.createElement('select');
                let columnNameLabel = document.createElement('select');
                if (!filterItemDiv) {
                    // If the filter-item div doesn't exist, create it
                    let filterDiv = document.createElement('div');
                    filterDiv.classList.add('edit_inclusive-filter-item');

                    let filter_row_div = document.createElement('div')
                    filter_row_div.classList.add('d-flex', 'filter-container');
                    filterDiv.appendChild(filter_row_div);
                    let filter_col_filter_column_div = document.createElement('div')
                    filter_col_filter_column_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_column_div);
                    // Create a label for the filter column
                    columnNameLabel.id = 'edit_inclusive_column';
                    filter_col_filter_column_div.appendChild(columnNameLabel);
                    // Create a select element to hold the filter values
                    let filter_col_filter_values_div = document.createElement('div')
                    filter_col_filter_values_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_values_div);
                    filterValuesSelect.id = 'edit_inclusive_filter_' + edit_inclusive_count;
                    // filterValuesSelect.class = 'inclusive_value';
                    filterValuesSelect.setAttribute('multiple', 'multiple'); // Enable multiple selections
                    filter_col_filter_values_div.appendChild(filterValuesSelect);

                    // Create a remove button for the filter item

                    let filter_col_remove_div = document.createElement('div')
                    filter_col_remove_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_remove_div);

                    let removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = function() {
                    // Remove the filter item when the remove button is clicked
                    filter_row_div.remove();
                    };
                    let finalcolumnradioButton = document.createElement('input');
                    
                    finalcolumnradioButton.type = 'radio';
                    finalcolumnradioButton.id = 'edit_inclusive_final_column';
                    finalcolumnradioButton.checked = false
                    finalcolumnradioButton.title = 'Final Column';
                    finalcolumnradioButton.style.marginLeft = '5px';
                    finalcolumnradioButton.onclick = function() {
                        edit_on_click_final_column('edit_inclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last')
                    };
                    filter_col_remove_div.appendChild(removeButton);
                    filter_col_remove_div.appendChild(finalcolumnradioButton);
                    // Attach the filter div to the inclusive_filters div
                    inclusiveFiltersDiv.appendChild(filterDiv);
                } else {
                    // If the filter-item div exists, add a new filter item in the next line

                    // Create a new filter item div
                    let newFilterDiv = document.getElementsByClassName('edit_inclusive-filter-item')[0]

                    // Create a label for the filter column
                    let filter_row_div = document.createElement('div')
                    filter_row_div.classList.add('d-flex', 'filter-container');
                    newFilterDiv.appendChild(filter_row_div);

                    let filter_col_filter_column_div = document.createElement('div')
                    filter_col_filter_column_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_column_div);

                    // Create a label for the filter column
                    columnNameLabel.id = 'edit_inclusive_column';
                    filter_col_filter_column_div.appendChild(columnNameLabel);
                    // Create a select element to hold the filter values

                    let filter_col_filter_values_div = document.createElement('div')
                    filter_col_filter_values_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_values_div);

                    filterValuesSelect.id = 'edit_inclusive_filter_' + edit_inclusive_count;
                    // filterValuesSelect.class = 'inclusive_value';
                    filterValuesSelect.setAttribute('multiple', 'multiple'); // Enable multiple selections
                    filter_col_filter_values_div.appendChild(filterValuesSelect);

                    // Create a remove button for the filter item

                    let filter_col_remove_div = document.createElement('div')
                    filter_col_remove_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_remove_div);

                    let removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = function() {
                        
                        let add_filters_exist = document.querySelector('#edit_inclusive')
                        if(!add_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add inclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_inclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                            let lastFilterItemDiv = document.querySelector('.edit_inclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        let add_exclusive_filters_exist = document.querySelector('#edit_exclusive')
                        if(!add_exclusive_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add exclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_exclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                        
                            let lastFilterItemDiv = document.querySelector('.exclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        // Remove the filter item when the remove button is clicked
                        filter_row_div.remove();
                        let get_last_row_remove_div = document.querySelector('.edit_inclusive-filter-item > .d-flex:last-child > .filter_rows:last-child');
                        let exist_inclusive_column = get_last_row_remove_div.querySelector('#edit_inclusive_final_column')
                        if(!exist_inclusive_column){
                        let finalcolumnradioButton = document.createElement('input');
                        finalcolumnradioButton.type = 'radio';
                        finalcolumnradioButton.id = 'edit_inclusive_final_column';
                        finalcolumnradioButton.checked = false
                        finalcolumnradioButton.title = 'Final Column';
                        finalcolumnradioButton.style.marginLeft = '6px';
                        finalcolumnradioButton.onclick = function() {
                            edit_on_click_final_column('edit_inclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                        };
                        // console.log(get_last_row_remove_div);
                        get_last_row_remove_div.appendChild(finalcolumnradioButton);
                        let lastFilterItemDiv = document.querySelector('.edit_inclusive-filter-item:last-of-type');
                        lastFilterItemDiv.after(newFilterDiv);
                        }
                        
                        let total_rows = document.querySelectorAll('.'+filter+'-filter-item > .d-flex');
                            if(total_rows.length == 0) {
                                if(filter == 'inclusive'){
                                    inclusive_count = 0
                                }
                                else{
                                    exclusive_count = 0
                                }
                        }
                    };
                    let filter_final_column = document.getElementById('edit_inclusive_final_column');
                    if(filter_final_column){
                        document.getElementById('edit_inclusive_final_column').remove();
                    }

                    let finalcolumnradioButton = document.createElement('input');
                    
                    finalcolumnradioButton.type = 'radio';
                    finalcolumnradioButton.id = 'edit_inclusive_final_column';
                    finalcolumnradioButton.checked = false
                    finalcolumnradioButton.title = 'Final Column';
                    finalcolumnradioButton.style.marginLeft = '5px';
                    finalcolumnradioButton.onclick = function() {
                        edit_on_click_final_column('edit_inclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last')
                    };
                    filter_col_remove_div.appendChild(removeButton);
                    filter_col_remove_div.appendChild(finalcolumnradioButton);

                    // let removeButton = document.createElement('button');
                    // removeButton.textContent = 'Remove';
                    // removeButton.onclick = function() {
                    // filter_row_div.remove();
                    // };
                    // filter_col_remove_div.appendChild(removeButton);
                    // let lastFilterItemDiv = document.querySelector('.edit_inclusive-filter-item:last-of-type');
                    // lastFilterItemDiv.after(newFilterDiv);

                }
                filterDiv = document.getElementsByClassName('edit_inclusive-filter-item')[0]
                let columns = get_data.fields;
                const inclusiveColumnLabels = document.querySelectorAll('.edit_inclusive-filter-item select[id="edit_inclusive_column"]');
                const lastInclusiveColumnLabel = inclusiveColumnLabels[inclusiveColumnLabels.length - 1];
                const option = document.createElement('option');
                    option.id = '';
                    option.value = ''
                    option.textContent = 'Select Option';
                    lastInclusiveColumnLabel.appendChild(option);
                let selected_inclusive_columns = []
                let filter_columns = document.querySelectorAll('.edit_inclusive-filter-item #edit_inclusive_column')
                console.dir(filter_columns,{'maxArrayLength':'none'});
                for(let index = 0; index < filter_columns.length-1; index++)
                {
                    selected_inclusive_columns.push(filter_columns[index].value)
                }
                for(let index = 0;index<get_data.fields.length;index++)
                {
                    if (selected_inclusive_columns.indexOf(get_data.fields[index]) === -1){
                        const option = document.createElement('option');
                        option.id = get_data.fields[index];
                        option.value = get_data.fields[index]
                        option.textContent = get_data.fields[index];
                        lastInclusiveColumnLabel.appendChild(option);
                        if(get_data.fields[index] == key)
                        {
                            option.selected = true;
                            let preventClose = false;
                            $('#edit_inclusive_filter_' + edit_inclusive_count).select2({
                                width:'250px',
                                closeOnSelect: false
                            })
                            if (includes_filters[key].indexOf(',') > -1)
                            {
                                let splitting_array = includes_filters[key].split(',');
                                splitting_array.forEach(item => {
                                    let optionElement = document.createElement("option");
                                    optionElement.value = item;
                                    optionElement.textContent = item;
                                    optionElement.selected = true; 
                                    filterValuesSelect.appendChild(optionElement);
                                    // $(filterValuesSelect).select2('data', {value: item, text: item});
                                    $(filterValuesSelect).select2({width:'250px'}).trigger('change');
                                });
                            }
                            else{
                                let optionElement = document.createElement("option");
                                    optionElement.value = includes_filters[key];
                                    optionElement.textContent = includes_filters[key];
                                    optionElement.selected = true; 
                                    filterValuesSelect.appendChild(optionElement);
                                    // $(filterValuesSelect).select2('data', {value: item, text: item});
                                $(filterValuesSelect).select2({width:'250px'}).trigger('change');
                                // $(filterValuesSelect).val(includes_filters[key]).trigger('change');
                            }
                            
                            
                        }
                    }
                }
                lastInclusiveColumnLabel.addEventListener('change', function() {
                    let get_total_filters = filterDiv.querySelectorAll('label').length;
                    $('#edit_inclusive_filter_' + edit_inclusive_count).empty();
                    $('#edit_inclusive_filter_' + edit_inclusive_count).val(null).trigger('change');
                    $('#edit_inclusive_filter_' + edit_inclusive_count).select2({
                        width:'250px',
                        closeOnSelect: false
                    })
                    $('.delete_chart_spinner').removeClass('d-none');
                    const url = '/charts/filters/'+dashboard_id+'?filter_column='+lastInclusiveColumnLabel.value+'&mode=newcol&project_id='+project_id
                    fetch(url)
                    .then(response => {
                        // Handle unsuccessful response
                        if (!response.ok) {
                        throw new Error(response.status);
                        }
                        // Parse the response as JSON
                        return response.json();
                    })
                    .then(filter_data => {
                        let filter_values = filter_data.filter_values;
                        let optionElement = document.createElement("option");
                            // optionElement.classList.add('custom-option');
                            optionElement.value = '';
                            optionElement.textContent = 'Select Option';
                            filterValuesSelect.appendChild(optionElement);
                        for(let value = 0 ;value<filter_values.length;value++)
                        {
                            let optionElement = document.createElement("option");
                            // optionElement.classList.add('custom-option');
                            optionElement.value = filter_values[value];
                            optionElement.textContent = filter_values[value];
                            filterValuesSelect.appendChild(optionElement);
                            // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                        }
                        filterValuesSelect.style.width = '250px';
                        // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
                        // Assuming you want to change the width of the entire select2 dropdown
                        $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '250px');
                        // $('.delete_chart_spinner').addClass('d-none');

                    })
                });
                if(isLastIteration == true){
                    let add_filters_exist = document.querySelector('#edit_inclusive')
                    if(!add_filters_exist) {
                        
                        var iconElement = document.createElement('i');
                        iconElement.title = "Add inclusive filters";
                        iconElement.className = "fa fa-plus fa-1x";
                        iconElement.id = "edit_inclusive";
                        iconElement.style.cursor = "pointer";
                        iconElement.style.color = "#157eab";
                        iconElement.setAttribute('aria-hidden', 'true');
                        
                        iconElement.onclick = function(){
                            edit_basket_filters('edit_inclusive')
                        }

                        let lastFilterItemDiv = document.querySelector('.edit_inclusive-filter-item:last-of-type');
                        lastFilterItemDiv.after(iconElement);

                }
                    
                }
                $('.delete_chart_spinner').addClass('d-none');
            });
        }
        
    }
    else{
        var iconElement = document.createElement('i');
        iconElement.title = "Add inclusive filters";
        iconElement.className = "fa fa-plus fa-1x";
        iconElement.id = "edit_inclusive";
        iconElement.style.cursor = "pointer";
        iconElement.style.color = "#157eab";
        iconElement.setAttribute('aria-hidden', 'true');
        iconElement.onclick = function(){
            edit_basket_filters('edit_inclusive')
        }
        let lastFilterItemDiv = document.querySelector('#edit_inclusive_filters');
        lastFilterItemDiv.after(iconElement);
    }
    //Exclusive Filters
    if(data.exclusive_filters.length > 0){
        let excludes_filters = data.exclusive_filters[0];
        let completedIterations = 0;
        const totalIterations = Object.keys(excludes_filters).length;
        $('.delete_chart_spinner').removeClass('d-none');
        let keys = Object.keys(excludes_filters);
        for (let i = 0; i < keys.length; i++)
        {
            let key = keys[i];
            let isLastIteration = i === keys.length - 1;
            let project_id = document.getElementById('project_id').value;
            let dashboard_id = document.getElementById('dashID').value;
            var form = document.getElementById('dashboard_form');
            var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
            // $('.delete_chart_spinner').removeClass('d-none');
            fetch('/board/datatable/header/'+project_id)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                throw new Error(response.status);
                }

                // Parse the response as JSON
                return response.json();
            })
            .then(get_data => {
                // edit_basket_filters('edit_exclusive')
                edit_exclusive_count += 1;
                let exclusiveFiltersDiv = document.getElementById('edit_exclusive_filters');
                let filterItemDiv = document.querySelector('.edit_exclusive-filter-item');
                let filterValuesSelect = document.createElement('select');
                let columnNameLabel = document.createElement('select');
                if (!filterItemDiv) {
                    // If the filter-item div doesn't exist, create it
                    let filterDiv = document.createElement('div');
                    filterDiv.classList.add('edit_exclusive-filter-item');
                    let filter_row_div = document.createElement('div')
                    filter_row_div.classList.add('d-flex');
                    filterDiv.appendChild(filter_row_div);

                    let filter_col_filter_column_div = document.createElement('div')
                    filter_col_filter_column_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_column_div);

                    // Create a label for the filter column
                    columnNameLabel.id = 'edit_exclusive_column';
                    filter_col_filter_column_div.appendChild(columnNameLabel);
                    // Create a select element to hold the filter values

                    let filter_col_filter_values_div = document.createElement('div')
                    filter_col_filter_values_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_values_div);


                    filterValuesSelect.id = 'edit_exclusive_filter_' + edit_exclusive_count;
                    // filterValuesSelect.class = 'inclusive_value';
                    filterValuesSelect.setAttribute('multiple', 'multiple'); // Enable multiple selections
                    filter_col_filter_values_div.appendChild(filterValuesSelect);

                    // Create a remove button for the filter item

                    let filter_col_remove_div = document.createElement('div')
                    filter_col_remove_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_remove_div);

                    let removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = function() {
                        
                        let add_filters_exist = document.querySelector('#edit_exclusive')
                        if(!add_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add exclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_exclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                            let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        let add_exclusive_filters_exist = document.querySelector('#edit_exclusive')
                        if(!add_exclusive_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add exclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_exclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                        
                            let lastFilterItemDiv = document.querySelector('.exclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        // Remove the filter item when the remove button is clicked
                        filter_row_div.remove();
                        let get_last_row_remove_div = document.querySelector('.edit_exclusive-filter-item > .d-flex:last-child > .filter_rows:last-child');
                        let exist_inclusive_column = get_last_row_remove_div.querySelector('#edit_exclusive_final_column')
                        if(!exist_inclusive_column){
                        let finalcolumnradioButton = document.createElement('input');
                        finalcolumnradioButton.type = 'radio';
                        finalcolumnradioButton.id = 'edit_exclusive_final_column';
                        finalcolumnradioButton.checked = false
                        finalcolumnradioButton.title = 'Final Column';
                        finalcolumnradioButton.style.marginLeft = '6px';
                        finalcolumnradioButton.onclick = function() {
                            edit_on_click_final_column('edit_exclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                        };
                        // console.log(get_last_row_remove_div);
                        get_last_row_remove_div.appendChild(finalcolumnradioButton);
                        let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                        lastFilterItemDiv.after(newFilterDiv);
                        }
                        
                        let total_rows = document.querySelectorAll('.'+filter+'-filter-item > .d-flex');
                            if(total_rows.length == 0) {
                                if(filter == 'inclusive'){
                                    inclusive_count = 0
                                }
                                else{
                                    exclusive_count = 0
                                }
                        }
                    };
                    let filter_final_column = document.getElementById('edit_exclusive_final_column');
                    if(filter_final_column){
                        document.getElementById('edit_exclusive_final_column').remove();
                    }

                    let finalcolumnradioButton = document.createElement('input');
                    
                    finalcolumnradioButton.type = 'radio';
                    finalcolumnradioButton.id = 'edit_exclusive_final_column';
                    finalcolumnradioButton.checked = false
                    finalcolumnradioButton.title = 'Final Column';
                    finalcolumnradioButton.style.marginLeft = '5px';
                    finalcolumnradioButton.onclick = function() {
                        edit_on_click_final_column('edit_exclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last')
                    };
                    filter_col_remove_div.appendChild(removeButton);
                    filter_col_remove_div.appendChild(finalcolumnradioButton);

                    // Attach the filter div to the inclusive_filters div
                    exclusiveFiltersDiv.appendChild(filterDiv);
                } else {
                    // If the filter-item div exists, add a new filter item in the next line

                    // Create a new filter item div
                    let newFilterDiv = document.getElementsByClassName('edit_exclusive-filter-item')[0]

                    // Create a label for the filter column
                    let filter_row_div = document.createElement('div')
                    filter_row_div.classList.add('d-flex');
                    newFilterDiv.appendChild(filter_row_div);

                    let filter_col_filter_column_div = document.createElement('div')
                    filter_col_filter_column_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_column_div);

                    // Create a label for the filter column
                    columnNameLabel.id = 'edit_exclusive_column';
                    filter_col_filter_column_div.appendChild(columnNameLabel);
                    // Create a select element to hold the filter values

                    let filter_col_filter_values_div = document.createElement('div')
                    filter_col_filter_values_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_filter_values_div);


                    filterValuesSelect.id = 'edit_exclusive_filter_' + edit_exclusive_count;
                    // filterValuesSelect.class = 'inclusive_value';
                    filterValuesSelect.setAttribute('multiple', 'multiple'); // Enable multiple selections
                    filter_col_filter_values_div.appendChild(filterValuesSelect);

                    // Create a remove button for the filter item

                    let filter_col_remove_div = document.createElement('div')
                    filter_col_remove_div.classList.add('filter_rows');
                    filter_row_div.appendChild(filter_col_remove_div);

                    let removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.onclick = function() {
                        
                        let add_filters_exist = document.querySelector('#edit_exclusive')
                        if(!add_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add exclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_exclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                            let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        let add_exclusive_filters_exist = document.querySelector('#edit_exclusive')
                        if(!add_exclusive_filters_exist) {
                            
                            var iconElement = document.createElement('i');
                            iconElement.title = "Add exclusive filters";
                            iconElement.className = "fa fa-plus fa-1x";
                            iconElement.id = "edit_exclusive";
                            iconElement.style.cursor = "pointer";
                            iconElement.style.color = "#157eab";
                            iconElement.setAttribute('aria-hidden', 'true');
                        
                            let lastFilterItemDiv = document.querySelector('.exclusive-filter-item:last-of-type');
                            lastFilterItemDiv.after(iconElement);
                        }
                        // Remove the filter item when the remove button is clicked
                        filter_row_div.remove();
                        let get_last_row_remove_div = document.querySelector('.edit_exclusive-filter-item > .d-flex:last-child > .filter_rows:last-child');
                        let exist_inclusive_column = get_last_row_remove_div.querySelector('#edit_exclusive_final_column')
                        if(!exist_inclusive_column){
                        let finalcolumnradioButton = document.createElement('input');
                        finalcolumnradioButton.type = 'radio';
                        finalcolumnradioButton.id = 'edit_exclusive_final_column';
                        finalcolumnradioButton.checked = false
                        finalcolumnradioButton.title = 'Final Column';
                        finalcolumnradioButton.style.marginLeft = '6px';
                        finalcolumnradioButton.onclick = function() {
                            edit_on_click_final_column('edit_exclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                        };
                        // console.log(get_last_row_remove_div);
                        get_last_row_remove_div.appendChild(finalcolumnradioButton);
                        let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                        lastFilterItemDiv.after(newFilterDiv);
                        }
                        
                        let total_rows = document.querySelectorAll('.'+filter+'-filter-item > .d-flex');
                            if(total_rows.length == 0) {
                                if(filter == 'inclusive'){
                                    inclusive_count = 0
                                }
                                else{
                                    exclusive_count = 0
                                }
                        }
                    };
                    let filter_final_column = document.getElementById('edit_exclusive_final_column');
                    if(filter_final_column){
                        document.getElementById('edit_exclusive_final_column').remove();
                    }

                    let finalcolumnradioButton = document.createElement('input');
                    
                    finalcolumnradioButton.type = 'radio';
                    finalcolumnradioButton.id = 'edit_exclusive_final_column';
                    finalcolumnradioButton.checked = false
                    finalcolumnradioButton.title = 'Final Column';
                    finalcolumnradioButton.style.marginLeft = '5px';
                    finalcolumnradioButton.onclick = function() {
                        edit_on_click_final_column('edit_exclusive',inclusive_count,exclusive_count,get_data,filterValuesSelect,dashboard_id,project_id,'last')
                    };
                    filter_col_remove_div.appendChild(removeButton);
                    filter_col_remove_div.appendChild(finalcolumnradioButton);

                    // Attach the new filter div after the last filter-item div
                    let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                    lastFilterItemDiv.after(newFilterDiv);
                }
                filterDiv = document.getElementsByClassName('edit_exclusive-filter-item')[0]
                let columns = get_data.fields;
                const exclusiveColumnLabels = document.querySelectorAll('.edit_exclusive-filter-item select[id="edit_exclusive_column"]');
                const lastexclusiveColumnLabel = exclusiveColumnLabels[exclusiveColumnLabels.length - 1];
                const option = document.createElement('option');
                    option.id = '';
                    option.value = ''
                    option.textContent = 'Select Option';
                    lastexclusiveColumnLabel.appendChild(option);
                for(let index = 0;index<get_data.fields.length;index++)
                {
                    const option = document.createElement('option');
                    option.id = get_data.fields[index];
                    option.value = get_data.fields[index]
                    option.textContent = get_data.fields[index];
                    lastexclusiveColumnLabel.appendChild(option);
                    if(get_data.fields[index] == key)
                    {
                        option.selected = true;
                        $('#edit_exclusive_filter_' + edit_exclusive_count).select2({
                            width:'250px',
                            closeOnSelect: false
                        })

                        if (excludes_filters[key].indexOf(',') > -1)
                        {
                            let splitting_array = excludes_filters[key].split(',');
                            splitting_array.forEach(item => {
                                let optionElement = document.createElement("option");
                                optionElement.value = item;
                                optionElement.textContent = item;
                                optionElement.selected = true; 
                                filterValuesSelect.appendChild(optionElement);
                                // $(filterValuesSelect).select2('data', {value: item, text: item});
                                $(filterValuesSelect).select2({width:'250px'}).trigger('change');
                            });
                        }
                        else{
                            let optionElement = document.createElement("option");
                                optionElement.value = excludes_filters[key];
                                optionElement.textContent = excludes_filters[key];
                                optionElement.selected = true; 
                                filterValuesSelect.appendChild(optionElement);
                                // $(filterValuesSelect).select2('data', {value: item, text: item});
                            $(filterValuesSelect).select2({width:'250px'}).trigger('change');
                            // $(filterValuesSelect).val(excludes_filters[key]).trigger('change');
                        }

                        // $('.delete_chart_spinner').removeClass('d-none');
                        // const url = '/charts/filters/'+dashboard_id+'?filter_column='+lastexclusiveColumnLabel.value+'&mode=newcol&project_id='+project_id
                        // fetch(url)
                        // .then(response => {
                        //     // Handle unsuccessful response
                        //     if (!response.ok) {
                        //     throw new Error(response.status);
                        //     }
                        //     // Parse the response as JSON
                        //     return response.json();
                        // })
                        // .then(filter_data => {
                        //     // edit_inclusive_count_change += 1;
                        //     let filter_values = filter_data.filter_values;
                        //     for(let value = 0 ;value<filter_values.length;value++)
                        //     {
                        //         let optionElement = document.createElement("option");
                        //         optionElement.value = filter_values[value];
                        //         optionElement.textContent = filter_values[value];
                        //         filterValuesSelect.appendChild(optionElement);

                        //         if (excludes_filters[key].indexOf(',') > -1)
                        //         {
                        //             let splitting_array = excludes_filters[key].split(',');
                        //             if(splitting_array.includes(filter_values[value]))
                        //             {
                        //                 optionElement.selected = true; 
                        //             }
                        //             $(filterValuesSelect).select2({width:'250px'}).trigger('change');
                        //         }
                        //         else{
                        //             if(filter_values[value] == excludes_filters[key])
                        //             {
                        //                 $(filterValuesSelect).val(excludes_filters[key]).trigger('change');
                        //             }
                        //         }
                        //     }
                        //     completedIterations++;
                        //     if (completedIterations === totalIterations) {
                        //         $('.delete_chart_spinner').addClass('d-none');
                        //     }
                        //     filterValuesSelect.style.width = '250px';
                        //     $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '250px');
                        //     // $('.delete_chart_spinner').addClass('d-none');
                        // })
                    }
                }
                lastexclusiveColumnLabel.addEventListener('change', function() {
                    let get_total_filters = filterDiv.querySelectorAll('label').length;
                    $('#edit_exclusive_filter_' + edit_exclusive_count).empty();
                    $('#edit_exclusive_filter_' + edit_exclusive_count).val(null).trigger('change');
                    $('#edit_exclusive_filter_' + edit_exclusive_count).select2({
                        width:'250px',
                        closeOnSelect: false
                    })
                    // $('.delete_chart_spinner').removeClass('d-none');
                    const url = '/charts/filters/'+dashboard_id+'?filter_column='+lastexclusiveColumnLabel.value+'&mode=newcol&project_id='+project_id
                    fetch(url)
                    .then(response => {
                        // Handle unsuccessful response
                        if (!response.ok) {
                        throw new Error(response.status);
                        }
                        // Parse the response as JSON
                        return response.json();
                    })
                    .then(filter_data => {
                        let filter_values = filter_data.filter_values;
                        let optionElement = document.createElement("option");
                            // optionElement.classList.add('custom-option');
                            optionElement.value = '';
                            optionElement.textContent = 'Select Option';
                            filterValuesSelect.appendChild(optionElement);
                        for(let value = 0 ;value<filter_values.length;value++)
                        {
                            let optionElement = document.createElement("option");
                            // optionElement.classList.add('custom-option');
                            optionElement.value = filter_values[value];
                            optionElement.textContent = filter_values[value];
                            filterValuesSelect.appendChild(optionElement);
                            // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                        }
                        filterValuesSelect.style.width = '250px';
                        // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
                        // Assuming you want to change the width of the entire select2 dropdown
                        $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '250px');
                        // $('.delete_chart_spinner').addClass('d-none');

                    })
                });
                if(isLastIteration == true){
                    let add_filters_exist = document.querySelector('#edit_exclusive_filters > #edit_exclusive_filters')
                    if(!add_filters_exist) {
                        
                        var iconElement = document.createElement('i');
                        iconElement.title = "Add exclusive filters";
                        iconElement.className = "fa fa-plus fa-1x";
                        iconElement.id = "edit_exclusive";
                        iconElement.style.cursor = "pointer";
                        iconElement.style.color = "#157eab";
                        iconElement.setAttribute('aria-hidden', 'true');
                        
                        iconElement.onclick = function(){
                            edit_basket_filters('edit_exclusive')
                        }

                        let lastFilterItemDiv = document.querySelector('.edit_exclusive-filter-item:last-of-type');
                        lastFilterItemDiv.after(iconElement);

                    }
                    
                }
                // $('.delete_chart_spinner').addClass('d-none');
            });

        }
        $('.delete_chart_spinner').addClass('d-none');

    }
    else{
        var iconElement = document.createElement('i');
        iconElement.title = "Add exclusive filters";
        iconElement.className = "fa fa-plus fa-1x";
        iconElement.id = "edit_exclusive";
        iconElement.style.cursor = "pointer";
        iconElement.style.color = "#157eab";
        iconElement.setAttribute('aria-hidden', 'true');
        
        iconElement.onclick = function(){
            edit_basket_filters('edit_exclusive')
        }
        let lastFilterItemDiv = document.querySelector('#edit_exclusive_filters');
        lastFilterItemDiv.after(iconElement);
    }
}
function edit_basket()
{
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let edit_basket_id = document.getElementById('edit_basket_id').value;
    let edit_basket_name = document.getElementById('edit_basket_name').value;
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id').value;
    // Assuming the parent element with class "inclusive-filter-item" exists.
    // const inclusiveFilterItem = document.querySelector('.edit_inclusive-filter-item');
    let includes_filters_list = '';
    includes_filters_list = get_inclusive_or_exclusive_filters('edit_inclusive',includes_filters_list)
    // if(inclusiveFilterItem){
    //     // Get all rows with class "row" within the "inclusive-filter-item" element.
    //     const rows = inclusiveFilterItem.querySelectorAll('.d-flex');
    //     let includes_filters_json = {};
    //     // Iterate through each row
    //     rows.forEach((row, rowIndex) => {
    //         // Get the filter_rows elements within the current row
    //         const colML4Elements = row.querySelectorAll('.filter_rows');
    //         // Get the value of the simple select with id "inclusive_column" within the current filter_rows
    //         const simpleSelect = colML4Elements[0].querySelector('#edit_inclusive_column');
    //         const simpleSelectValue = simpleSelect.value;
    //         // console.log(`Row ${rowIndex + 1} - Simple Select Value: ${simpleSelectValue}`);

    //         // Get the values of the select2 element within the current filter_rows
    //         const select2Values = [];
    //         const select2Options = colML4Elements[1].querySelectorAll('option:checked');
    //         select2Options.forEach((option) => {
    //             if(option.value.includes(' - '))
    //             {
    //                 select2Values.push(option.value.split(' - ')[1].trim())
    //             }
    //             else{
    //                 select2Values.push(option.value)
    //             }
    //         });
    //         // console.log(`Row ${rowIndex + 1} - Select2 Values: ${select2Values}`);
    //         if(includes_filters_json.hasOwnProperty(simpleSelectValue))
    //         {
    //             includes_filters_json[simpleSelectValue] = includes_filters_json[simpleSelectValue] + ',' +select2Values
    //         }
    //         else{
    //             includes_filters_json[simpleSelectValue] = select2Values.join(',')
    //         }
    //     });
    //     includes_filters_list.push(includes_filters_json)
    // }
    // Assuming the parent element with class "inclusive-filter-item" exists.
    const exclusiveFilterItem = document.querySelector('.edit_exclusive-filter-item');
    let excludes_filters_list = '';
    excludes_filters_list = get_inclusive_or_exclusive_filters('edit_exclusive',excludes_filters_list)
    console.log('excludes_filters_list')
    console.dir(excludes_filters_list,{'maxArrayLength':'none'});
    if(edit_basket_name && dashboard_id)
    {
        //Run PUT Request
        let requestOptions = {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                basket_name: edit_basket_name,
                dashboard:dashboard_id,
                includes_filters: includes_filters_list,
                exclusive_filters:excludes_filters_list,
            })
        };
        $('.filter_spinner').removeClass('d-none');
        fetch('/board/basket/'+edit_basket_id,requestOptions)  
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
            throw new Error(response.status);
            }
        
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            const inclusivefilterRemove = document.querySelector('.edit_inclusive-filter-item');
            const exclusivefilterRemove = document.querySelector('.edit_exclusive-filter-item');
            
            // Check if the element exists and has the class
            if (inclusivefilterRemove) {
            // Remove the element from the DOM
            inclusivefilterRemove.remove();
            }

            // Check if the element exists and has the class
            if (exclusivefilterRemove) {
                // Remove the element from the DOM
                exclusivefilterRemove.remove();
            }
            
            const myElement = document.getElementById(edit_basket_id);

            // Step 2: Get the next sibling element
            const nextSiblingElement = myElement.nextElementSibling;
            // Step 3: Change the text content of the next sibling element
            if (nextSiblingElement) {
                nextSiblingElement.textContent = edit_basket_name;

            }
            let get_edit_basket_name = document.getElementById('edit_basket_name');
            get_edit_basket_name.value = edit_basket_name

            $('#show_edit_basket_modal').modal('hide');
            $('.filter_spinner').addClass('d-none');

            const basketMenu = document.getElementById('basket_menu');
            while (basketMenu.firstChild) {
                basketMenu.removeChild(basketMenu.firstChild);
            }
            
            fetch('/board/basket/'+project_id)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                    throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                    if(data.length > 0)
                    {
                        let selected_basket;
                        fetch('/board/selection/'+dashboard_id)
                        .then(response => {
                            // Handle unsuccessful response
                            if (!response.ok) {
                            throw new Error(response.status);
                            }
                            // Parse the response as JSON
                            return response.json();
                        })
                        .then(selected_data => {
                            // $('#basket_navbar').css('display','block');
                            
                            let dropdownMenuDiv = document.getElementById('basket_menu');
                            let dropdownDiv = document.getElementById('basket_list');
                            let basketBtn = document.getElementById('basketbtn');
                            let button = document.getElementsByClassName('basket_dropdown_menu2')[0]
                            for(let i = 0;i<data.length;i++)
                            {
                                let li = document.createElement('li');
                                let input = document.createElement('input');
                                input.id = data[i].id
                                input.type = 'checkbox';
                                input.className = 'checkbox-input';
                                input.value = JSON.stringify(data[i]);
                                input.setAttribute('data-id',data[i].id);
    
                                if(selected_data.length > 0){
                                    selected_basket = selected_data[0].basket_id;
                    
                                    if(selected_basket == data[i].id)
                                    {
                                      let basket_name = data[i].basket_name;
                                      if(basket_name)
                                      {
                                        basket_name = truncateString(basket_name, 8)
                                      }
                                      input.checked = true;
                                      button.textContent = 'Basket (' +  basket_name+ ')';
                                    }
                                    else{
                                      input.checked = false;
                                    }
                                  }
    
                                // input.checked = false;
                                input.onclick = function(e)
                                {
                                    if(input.checked)
                                    {
                                        input.checked = true;
                                    }else{
                                        input.checked = false;
                                    }
                                    let is_selected = true;
                                    if(!input.checked)
                                    {
                                        is_selected = false;
                                    }
                                    var form = document.getElementById('dashboard_form');
                                    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
                                    requestOptions = {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': csrfToken
                                    },
                                    body: JSON.stringify({
                                        basket:data[i].id,
                                        dashboard:dashboard_id,
                                        is_selected:is_selected
                                    })
                                    };
                                    fetch('/board/selection/'+data[i].id,requestOptions)
                                    .then(response => {
                                    // Handle unsuccessful response
                                    if (!response.ok) {
                                        throw new Error(response.status);
                                    }
                                    // Parse the response as JSON
                                    return response.json();
                                    })
                                    .then(data => {
                                        // selected_basket = data[0].basket_id;
                                    })
                                    //Update Count
                                    let dropdown = e.target.closest('.dropdown');
                                    var checkboxes = dropdown.querySelectorAll('.checkbox-input');
                                    updated_count_checked_values = 1;
                                    if(checkboxes.length != updated_count_checked_values)
                                    {
                                        var basket_name = '';
                                        if (data[i].basket_name.length > 8) {
                                            basket_name =  data[i].basket_name.slice(0, 8) + '...';
                                        }
                                        else{
                                            basket_name = data[i].basket_name;
                                        }
                                        if(input.checked){
    
                                            button.innerText = 'Basket' + '  (' + basket_name+ ')';
                                        }
                                        else{
                                            button.innerText = 'Basket'
                                        }
                                    }
                                    else{
                                        button.innerText = 'Basket'
                                    }
                                    
                                    var result = get_baskets(e)
                                    let filters_btn =  document.querySelector('.filtersbtn')
                                    var dropdowns = filters_btn.querySelectorAll('.dropdown');
                                    let filters = {}
                                    var flag = false;
                                    let listing_filters = []
                                    
                                    dropdowns.forEach(function(dropdown) {
                                    let allChecked = true;
                                    var checkboxes = dropdown.querySelectorAll('.checkbox-input');
                                    if(checkboxes.length == 1)
                                    {
                                        for (var i = 0; i < checkboxes.length; i++) {
                                            if (!checkboxes[i].checked) {
                                                checkboxes[i].checked = true;
                                                allChecked = true;
                                                flag = true;
                                                break;
                                            }
                                        }
                                        
                                    }
                                    else
                                    {
                                        for (var i = 0; i < checkboxes.length; i++) {
                                            if (!checkboxes[i].checked) {
                                                allChecked = false;
                                                break;
                                            }
                                        }
                                        if(!allChecked)
                                        {
                                            for (var i = 0; i < checkboxes.length; i++) {
                                                if (checkboxes[i].checked) {
                                                    if(filters.hasOwnProperty(checkboxes[i].id))
                                                    {
                                                        filters[checkboxes[i].id].push(checkboxes[i].value);
                                                    }
                                                    else{
                                                        filters[checkboxes[i].id] = [checkboxes[i].value];
                                                    }
                                                }
                                            }
                                        }    
                                    }
    
                                    });
                                    
                                    
                                    let converted_filters = {}
                                    if(filters){
                                        for(let key in filters)
                                        {
                                            converted_filters[key] = filters[key].join(',')
                                        }
                                        listing_filters.push(converted_filters)
                                    }
                                    var flag1 = result[1];
                                    if(!flag1){
                                        update_all_charts(listing_filters,'basket')
                                        show_datatable()
    
                                    }
                                    else{
                                        update_all_charts(listing_filters)
                                        show_datatable()
                                    }
                                }
                                var actionsButton = document.createElement('button');
                                actionsButton.className = 'dropdown-item button-item bkt_name';
                                actionsButton.title = data[i].basket_name;
                                actionsButton.type = 'button';
                                actionsButton.innerText = data[i].basket_name;
    
                                let editButton = document.createElement('button');
                                editButton.className = 'dropdown-item button-item edit-button';
                                editButton.id = 'update_basket';
                                editButton.type = 'button';
                                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                                editButton.onclick = function() {
                                    show_edit_basket_modal(data[i])
                                    // alert('Edit button clicked for basket ID: ' + data[i].id);
                                };
                                let deleteButton = document.createElement('button');
                                deleteButton.className = 'dropdown-item button-item delete-button';
                                deleteButton.type = 'button';
                                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    
                                deleteButton.onclick = function() {
                                    delete_basket_modal(data[i].id)
                                };
                                
                                li.appendChild(input);
                                li.appendChild(actionsButton);
                                li.appendChild(editButton);
                                li.appendChild(deleteButton);
    
                                // li.appendChild(onlyButton);
                                dropdownMenuDiv.appendChild(li);
                                // Append the dropdown menu div to the dropdown div
                                dropdownDiv.appendChild(dropdownMenuDiv);
                                // Append the dropdown div to the filtersbtn element
                                basketBtn.appendChild(dropdownDiv);
                                let excludes_filters = []
                                if(data[i].exclusive_filters.length > 0)
                                {
                                    excludes_filters = data[i].exclusive_filters
                                }
                                let includes_filters = []
                                if(data[i].includes_filters.length > 0)
                                {
                                    includes_filters = data[i].includes_filters
                                }
                                //Run PUT Request
                                let requestOptions = {
                                    method: 'PUT',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': csrfToken
                                    },
                                    body: JSON.stringify({
                                        basket_name: data[i].basket_name,
                                        dashboard:data[i].dashboard_id,
                                        includes_filters: includes_filters,
                                        exclusive_filters:excludes_filters,
                                    })
                                };
                                // $('.filter_spinner').removeClass('d-none');
                                fetch('/board/basket/'+data[i].id,requestOptions)  
                                .then(response => {
                                    // Handle unsuccessful response
                                    if (!response.ok) {
                                    throw new Error(response.status);
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    
                                    $('.error_basket_name').addClass('d-none')
                                    let select_date = document.getElementById('select_date');
                                    select_date.value = ''
                                    $('#select_date_values').val(null).trigger('change');
                                    $('#select_date_values').select2({
                                        width:'250px',
                                        closeOnSelect: false
                                    });
                                    inclusive_count = 0;
                                    exclusive_count = 0;
                                    // $('.filter_spinner').addClass('d-none');
                                    $('#show_basket_modal').modal('hide');
                                    setTimeout(function(e){
                                        $('.delete_chart_spinner').addClass('d-none');
                                    },500);
                                });
                                
                            }
                        });
                    }
                    // $('.filter_spinner').addClass('d-none');
            });
        });
    }
    else{
        $('.error_edit_basket_name').removeClass('d-none')
    }
}
function get_baskets(e)
{
    let filters_btn =  document.querySelector('.basketbtn')
    var dropdowns = filters_btn.querySelectorAll('#basket_list');
    let filters = {}
    let flag = false;
    dropdowns.forEach(function(dropdown) {
        let allChecked = true;
        var checkboxes = dropdown.querySelectorAll('.checkbox-input');
        if(checkboxes.length == 1)
        {
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked){
                    filters[checkboxes[i].id] = [checkboxes[i].value]
                }
            } 
        }
        else{
            for (var i = 0; i < checkboxes.length; i++) {
                if(e.target.id == checkboxes[i].id){
                    if (checkboxes[i].checked) {
                        checkboxes[i].checked = true;
                        
                        if(filters.hasOwnProperty(checkboxes[i].id))
                        {
                            filters[checkboxes[i].id].push(checkboxes[i].value);
                        }
                        else{
                            filters[checkboxes[i].id] = [checkboxes[i].value];
                        }
                    }
                    
                }
                else{
                    checkboxes[i].checked = false;
                }
                
            }
            if(!allChecked)
            {
                for (var i = 0; i < checkboxes.length; i++) {

                    if(e.target.id == checkboxes[i].id){

                        if (checkboxes[i].checked) {
                            if(filters.hasOwnProperty(checkboxes[i].id))
                            {
                                filters[checkboxes[i].id].push(checkboxes[i].value);
                            }
                            else{
                                filters[checkboxes[i].id] = [checkboxes[i].value];
                            }
                        }
                    }
                    else{
                        checkboxes[i].checked = false;
                    }
                }
            }    
        }
        
    });
    let listing_filters = []
    let converted_filters = {}
    if(Object.keys(filters).length > 0){
        // console.log('filters')
        // console.log(filters)
        for(let key in filters)
        {
            converted_filters[key] = JSON.parse(filters[key].join(','))
        }
        listing_filters.push(converted_filters)
    }
    else{
        let result = get_filters()
        // console.log('Other Filters Check: ')
        // console.dir(result,{'maxArrayLength':'none'})
        if(result[0].length > 0)
        {
            return result
        }
        else{
            listing_filters.push(converted_filters)
        }
    }
    // console.log('LISTING FILTERS')
    // console.dir(listing_filters,{'maxArrayLength':'none'})
    return [listing_filters, flag];
}
// function get_only_filters(e)
// {
//     var targetElement = e.target;
//     var filter_id = targetElement.closest(".dropdown").id;

//     let filters_btn =  document.querySelector('.filtersbtn')
//     var dropdowns = filters_btn.querySelectorAll('.dropdown');
//     let filters = {}
//     dropdowns.forEach(function(dropdown) {
//         if(filter_id == dropdown.id)
//         {
//             var checkboxes = dropdown.querySelectorAll('.checkbox-input');
//             for (var i = 0; i < checkboxes.length; i++) {
//                 if((checkboxes[i].id == targetElement.id) && (checkboxes[i].value == targetElement.value))
//                 {
//                     checkboxes[i].checked = true;
//                     filters[checkboxes[i].id] = [checkboxes[i].value];
//                 }
//                 else{
//                     checkboxes[i].checked = false;
//                 }
//             }
//         }
//         else{
//             let allChecked = true;
//             var checkboxes = dropdown.querySelectorAll('.checkbox-input');
            
//             for (var i = 0; i < checkboxes.length; i++) {
//                 if (!checkboxes[i].checked) {
//                     allChecked = false;
//                     break;
//                 }
//             }
//             if(!allChecked)
//             {
//                 for (var i = 0; i < checkboxes.length; i++) {
//                     if (checkboxes[i].checked) {
//                         if(filters.hasOwnProperty(checkboxes[i].id))
//                         {
//                             filters[checkboxes[i].id].push(checkboxes[i].value);
//                         }
//                         else{
//                             filters[checkboxes[i].id] = [checkboxes[i].value];
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     // console.dir(filters,{'maxArrayLength':'none'})

//     let listing_filters = []
//     let converted_filters = {}
//     if(filters){
//         for(let key in filters)
//         {
//             converted_filters[key] = filters[key].join(',')
//         }
//         listing_filters.push(converted_filters)
//     }
//     else{
//         listing_filters.push(converted_filters)
//     }
//     // console.dir(listing_filters)
//     return listing_filters
// }
function show_basket_modal()
{
    localStorage.removeItem('remove_row');
    let project_id = document.getElementById('project_id').value;
    let select_date = document.getElementById('select_date');

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
        for(let index = 0;index<data.fields.length;index++)
        {
            const option = document.createElement('option');
            option.value = data.fields[index]
            option.id = data.fields[index];
            option.textContent = data.fields[index];
            select_date.appendChild(option);
        }
        
    })
    $('#select_date_values').val(null).trigger('change');
    $('#select_date_values').select2({
        width:'250px',
        closeOnSelect: false
    });
    
    let add_filters_exist = document.querySelector('#inclusive_filters > #add_inclusive_filters')
    if(!add_filters_exist) {
        
        var iconElement = document.createElement('i');
        iconElement.title = "Add inclusive filters";
        iconElement.className = "fa fa-plus fa-1x";
        iconElement.id = "add_inclusive_filters";
        iconElement.style.cursor = "pointer";
        iconElement.style.color = "#157eab";
        iconElement.setAttribute('aria-hidden', 'true');
    
        let lastFilterItemDiv = document.querySelector('.inclusive-filter-item:last-of-type');
        lastFilterItemDiv.after(iconElement);
    }
    let add_exclusive_filters_exist = document.querySelector('#exclusive_filters > #add_exclusive_filters')
    if(!add_exclusive_filters_exist) {
        
        var iconElement = document.createElement('i');
        iconElement.title = "Add exclusive filters";
        iconElement.className = "fa fa-plus fa-1x";
        iconElement.id = "add_exclusive_filters";
        iconElement.style.cursor = "pointer";
        iconElement.style.color = "#157eab";
        iconElement.setAttribute('aria-hidden', 'true');
    
        let lastFilterItemDiv = document.querySelector('.exclusive-filter-item:last-of-type');
        lastFilterItemDiv.after(iconElement);
    }

    const inclusivefilterRemove = document.querySelector('.inclusive-filter-item');
    const exclusivefilterRemove = document.querySelector('.exclusive-filter-item');
    const basket_name = document.querySelector('#basket_name');
    if(basket_name)
    {
        basket_name.value = ''
    }
    inclusive_count = 0;
    exclusive_count = 0;
    // Check if the element exists and has the class
    if (inclusivefilterRemove) {
    // Remove the element from the DOM
    inclusivefilterRemove.remove();
    }

    // Check if the element exists and has the class
    if (exclusivefilterRemove) {
        // Remove the element from the DOM
        exclusivefilterRemove.remove();
    }
    $('.basket_error_message').addClass('d-none');
    $('#show_basket_modal').modal('show');
}
function create_basket()
{
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let basket_name = document.getElementById('basket_name').value;
    let dashboard_id = document.getElementById('dashID').value;
    let project_id = document.getElementById('project_id').value;
    const inclusiveFilterItem = document.querySelector('.inclusive-filter-item');
    let includes_filters_list = [];
    if(inclusiveFilterItem){
        // Get all rows with class "row" within the "inclusive-filter-item" element.
        const rows = inclusiveFilterItem.querySelectorAll('.d-flex');
        
        let includes_filters_json = {};
        // Iterate through each row
        rows.forEach((row, rowIndex) => {
            // Get the filter_rows elements within the current row
            const colML4Elements = row.querySelectorAll('.filter_rows');

            // Get the value of the simple select with id "inclusive_column" within the current filter_rows
            const simpleSelect = colML4Elements[0].querySelector('#inclusive_column');
            const simpleSelectValue = simpleSelect.value;
            // console.log(`Row ${rowIndex + 1} - Simple Select Value: ${simpleSelectValue}`);

            // Get the values of the select2 element within the current filter_rows
            const select2Values = [];
            const select2Options = colML4Elements[1].querySelectorAll('option:checked');
            select2Options.forEach((option) => {
                if(option.value.includes(' - '))
                {
                    select2Values.push(option.value.split(' - ')[1].trim())
                }
                else{
                    select2Values.push(option.value)
                }
            });

            if(includes_filters_json.hasOwnProperty(simpleSelectValue))
            {
                includes_filters_json[simpleSelectValue] = includes_filters_json[simpleSelectValue] + ',' +select2Values
            }
            else{
                includes_filters_json[simpleSelectValue] = select2Values.join(',')
            }
        });
        includes_filters_list.push(includes_filters_json)
    }
    console.log('Includes Filters: '+ includes_filters_list)
    console.dir(includes_filters_list,{'maxArrayLength':'none'})

    // Assuming the parent element with class "inclusive-filter-item" exists.
    const exclusiveFilterItem = document.querySelector('.exclusive-filter-item');
    let excludes_filters_list = [];
    if(exclusiveFilterItem){
        // Get all rows with class "row" within the "inclusive-filter-item" element.
        const exclusive_rows = exclusiveFilterItem.querySelectorAll('.d-flex');
        
        let excludes_filters_json = {};
        // Iterate through each row
        exclusive_rows.forEach((row, rowIndex) => {
            // Get the filter_rows elements within the current row
            const colML4Elements = row.querySelectorAll('.filter_rows');

            // Get the value of the simple select with id "inclusive_column" within the current filter_rows
            const simpleSelect = colML4Elements[0].querySelector('#exclusive_column');
            const simpleSelectValue = simpleSelect.value;
            // console.log(`Row ${rowIndex + 1} - Simple Select Value: ${simpleSelectValue}`);

            // Get the values of the select2 element within the current filter_rows
            const select2Values = [];
            const select2Options = colML4Elements[1].querySelectorAll('option:checked');
            select2Options.forEach((option) => {
                if(option.value.includes(' - '))
                {
                    select2Values.push(option.value.split(' - ')[1].trim())
                }
                else{
                    select2Values.push(option.value)
                }
                // select2Values.push(option.value);
            });
            // console.log(`Row ${rowIndex + 1} - Select2 Values: ${select2Values}`);

            if(excludes_filters_json.hasOwnProperty(simpleSelectValue))
            {
                excludes_filters_json[simpleSelectValue] = excludes_filters_json[simpleSelectValue] + ',' +select2Values
            }
            else{
                excludes_filters_json[simpleSelectValue] = select2Values.join(',')
            }
        });
        let length = Object.keys(excludes_filters_json).length;
        if(length > 0){
            excludes_filters_list.push(excludes_filters_json)    
        }
        
    }
    console.log('Excludes Filters: '+ excludes_filters_list)
    console.dir(excludes_filters_list,{'maxArrayLength':'none'})

    if(basket_name && dashboard_id)
    {
        let add_filters_exist = document.querySelector('#inclusive_filters > #add_inclusive_filters')
        if(!add_filters_exist) {
            
            var iconElement = document.createElement('i');
            iconElement.title = "Add inclusive filters";
            iconElement.className = "fa fa-plus fa-1x";
            iconElement.id = "add_inclusive_filters";
            iconElement.style.cursor = "pointer";
            iconElement.style.color = "#157eab";
            iconElement.setAttribute('aria-hidden', 'true');
        
            let lastFilterItemDiv = document.querySelector('.inclusive-filter-item:last-of-type');
            lastFilterItemDiv.after(iconElement);
        }
        let add_exclusive_filters_exist = document.querySelector('#exclusive_filters > #add_exclusive_filters')
        if(!add_exclusive_filters_exist) {
            
            var iconElement = document.createElement('i');
            iconElement.title = "Add exclusive filters";
            iconElement.className = "fa fa-plus fa-1x";
            iconElement.id = "add_exclusive_filters";
            iconElement.style.cursor = "pointer";
            iconElement.style.color = "#157eab";
            iconElement.setAttribute('aria-hidden', 'true');
        
            let lastFilterItemDiv = document.querySelector('.exclusive-filter-item:last-of-type');
            lastFilterItemDiv.after(iconElement);
        }
        let requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                basket_name: basket_name,
                dashboard:dashboard_id,
                includes_filters: includes_filters_list,
                exclusive_filters:excludes_filters_list,
            })
        };
        $('.delete_chart_spinner').removeClass('d-none');
        fetch('/board/basket/',requestOptions)
        .then(response => {
            // Handle unsuccessful response
            if (!response.ok) {
              throw new Error(response.status);
            }
        
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            //GET REQUEST
            const basketMenu = document.getElementById('basket_menu');
            // Remove all <li> child elements
            while (basketMenu.firstChild) {
            basketMenu.removeChild(basketMenu.firstChild);
            }
            // $('.filter_spinner').removeClass('d-none');
            fetch('/board/basket/'+project_id)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                  throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                if(data.length > 0)
                {
                    let selected_basket;
                    fetch('/board/selection/'+dashboard_id)
                    .then(response => {
                        // Handle unsuccessful response
                        if (!response.ok) {
                        throw new Error(response.status);
                        }
                        // Parse the response as JSON-
                        return response.json();
                    })
                    .then(selected_data => {
                        $('#basket_navbar').css('display','block');
                        // Remove a key from localStorage
                        localStorage.removeItem('remove_row');
                        show_created_basket_list(data,selected_data,dashboard_id,'basket_create')
                    });
                }
            });
        });
    }
    else{
        $('.error_basket_name').removeClass('d-none')
    }
}
function delete_basket_modal(basket_id,event)
{
    $('#confirmdeletebasketModal').modal('show');
    let delete_basket_modal = document.getElementById('confirmdeletebasketModal');
    let modal_body = delete_basket_modal.querySelector('.modal-body');
    let check_basket_id = document.getElementById('delete_basket_id');
    if(check_basket_id)
    {
        check_basket_id.value = basket_id;
    }
    else{
        let input = document.createElement('input');
        input.type = 'hidden';
        input.value = basket_id;
        input.id = 'delete_basket_id';
        modal_body.appendChild(input);
    }
}
function delete_basket()
{
    var form = document.getElementById('dashboard_form');
    var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
    let get_basket_id = document.getElementById('delete_basket_id').value;
    let requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
    };
    $('.filter_spinner').removeClass('d-none');
    fetch('/board/basket/'+get_basket_id,requestOptions)
    .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
    })
    .then(data => {
        var result = get_filters()
        // console.log('DELTE RESULTS AFTER GETTING FILTERS')
        // console.dir(result,{'maxArrayLength':'none'})
        if(result)
        {
            var listing_filters = result[0];
            var flag = result[1];
            if(!flag){
            // if (Object.keys(listing_filters[0]).length > 0) {
                update_all_charts(listing_filters,'basket')
                // update_checkbox_filter()
                show_datatable()
            }
        }
        else{
            listing_filters = [{}]
            update_all_charts(listing_filters)
            show_datatable()
        }
        const basketMenu = document.getElementById("basket_menu");
        const liTagsInsideBasketMenu = basketMenu.querySelectorAll("li");
        const liCount = liTagsInsideBasketMenu.length;
        if(liCount == 1)
        {
            $('.basket_dropdown_menu2').text("Basket");
            $('#basket_navbar').css('display','none');
        }
        const elementToRemove = document.getElementById(get_basket_id);
        if(elementToRemove.checked)
        {
            $('.basket_dropdown_menu2').text("Basket");
        }
        if(elementToRemove)
        {
            const parentLi = elementToRemove.parentElement;
            if (parentLi) {
                // Remove the parent <li> element from the DOM
                parentLi.remove();
            }
        }
        $('.filter_spinner').addClass('d-none');
        $('#confirmdeletebasketModal').modal('hide');
    })
}
function loadMoreData(dashboard_id,lastInclusiveColumnLabel,next_page1,project_id,filterValuesSelect){
    const url = '/charts/filters/'+dashboard_id+'?filter_column='+lastInclusiveColumnLabel.value+'&mode=newcol&page='+next_page+'&project_id='+project_id
    fetch(url)
    .then(response => {
        // Handle unsuccessful response
        if (!response.ok) {
        throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(load_more_data => {
        
        let filter_values = load_more_data.filter_values;
        for(let value = 0 ;value<filter_values.length;value++)
        {
            let optionElement = document.createElement("option");
            // optionElement.classList.add('custom-option');
            optionElement.value = filter_values[value];
            optionElement.textContent = filter_values[value];
            filterValuesSelect.appendChild(optionElement);
        }
        if(load_more_data.more_pages)
        {
            
            next_page = load_more_data.next;
            let optionElement = document.createElement("option");
            optionElement.value = '';
            optionElement.textContent = 'Show More';
            filterValuesSelect.appendChild(optionElement);
        }
        filterValuesSelect.querySelector('option[value=""]').remove();
        // Refresh the Select2 to reflect the changes
        $(filterValuesSelect).trigger('change.select2');

        // $(filterValuesSelect).on('select2:select', function (e) {
        //     let selectedValue = e.params.data.id; // or e.params.data.text for the displayed text
        //     if (selectedValue === '') {
        //         loadMoreData(dashboard_id,lastInclusiveColumnLabel,data.next,project_id,filterValuesSelect)
                
        //     }
        // });

        // if (load_more_data.more_pages) {
        //     loadMoreData(dashboard_id,lastInclusiveColumnLabel,load_more_data.next,project_id,filterValuesSelect);
        // }
    })
}
function basketloadMoreData(dashboard_id,lastInclusiveColumnLabel,next_page1,project_id,filterValuesSelect,optional_column,filters){
    console.log('Filter Column: '+lastInclusiveColumnLabel)
    console.log('Next Page: '+next_page1)
    console.log('Select2 : '+filterValuesSelect)
    console.log('Filters : '+filters)
    let url = '/board/newbasket/?filter_column='+lastInclusiveColumnLabel.value+'&filters='+filters+'&mode=newcol&page='+next_page1+'&project_id='+project_id+'&optional_column='+optional_column
    $('.delete_chart_spinner').removeClass('d-none');
    fetch(url)
    .then(response => {
        // Handle unsuccessful response
        if (!response.ok) {
        throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(load_more_data => {
        
        let filter_values = load_more_data.filter_values;
        console.dir(filterValuesSelect,{'maxArrayLength':'none'});
        for(let value = 0 ;value<filter_values.length;value++)
        {
            let optionElement = document.createElement("option");
            // optionElement.classList.add('custom-option');
            optionElement.value = filter_values[value];
            optionElement.textContent = filter_values[value];
            filterValuesSelect.appendChild(optionElement);
        }
        if(load_more_data.more_pages)
        {
            
            next_page = load_more_data.next;
            let optionElement = document.createElement("option");
            optionElement.value = '';
            optionElement.textContent = 'Show More';
            filterValuesSelect.appendChild(optionElement);
            // $(filterValuesSelect).on('select2:select', function (e) {
            //     basketloadMoreData('',column_name,load_more_data.next,project_id,filterValuesSelect,lastInclusiveColumnLabel.value,filters)
            // });
        }
        filterValuesSelect.querySelector('option[value=""]').remove();
        // Refresh the Select2 to reflect the changes
        // $(filterValuesSelect).trigger('change.select2');
        $(filterValuesSelect).select2('close');

        // Reopen the Select2 dropdown after a short delay (adjust the delay as needed)
        setTimeout(function() {
            $(filterValuesSelect).select2('open');
        }, 10);
        $('.delete_chart_spinner').addClass('d-none');
    })
}
function on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,row,remove){
    if(filter == 'inclusive'){
        document.getElementById('add_inclusive_filters').remove();
    }
    else{
        document.getElementById('add_exclusive_filters').remove();
    }
    let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:first-child');
    let get_all_select = document.querySelectorAll('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows > #inclusive_column');
    if(get_all_select.length < 2){

        let columnNameLabel = document.createElement('select');
        columnNameLabel.style.maxWidth = '210px';
        columnNameLabel.style.marginTop = '5px';
        columnNameLabel.style.height = '35px';

        columnNameLabel.id = filter+'_column';
        lastFilterItemDiv.appendChild(columnNameLabel);

        const inclusiveColumnLabels = document.querySelectorAll('.'+filter+'-filter-item select[id="'+filter+'_column"]');
        const lastInclusiveColumnLabel = inclusiveColumnLabels[inclusiveColumnLabels.length - 1];
        const option = document.createElement('option');
            option.value = ''
            option.id = '';
            option.textContent = "Select Option";
            lastInclusiveColumnLabel.appendChild(option);
        let selected_inclusive_columns = []
        let filter_columns = document.querySelectorAll('.'+filter+'-filter-item #'+filter+'_column')
        console.dir(filter_columns,{'maxArrayLength':'none'});
        for(let index = 0; index < filter_columns.length-1; index++)
        {
            selected_inclusive_columns.push(filter_columns[index].value)
        }
        console.dir(selected_inclusive_columns,{'maxArrayLength':'none'});
        for(let index = 0;index<data.fields.length;index++)
        {
            if(selected_inclusive_columns.indexOf(data.fields[index]) === -1){
                const option = document.createElement('option');
                option.value = data.fields[index]
                option.id = data.fields[index];
                option.textContent = data.fields[index];
                lastInclusiveColumnLabel.appendChild(option);
            }
        }
        if(filter == 'inclusive'){
            if(remove == 'remove')
            {
                $('#inclusive_filter_' + (inclusive_count - 1)).val([]).trigger('change');
            }
            else{
                $('#inclusive_filter_' + inclusive_count).empty();
            }
            
            $('#inclusive_filter_' + inclusive_count).val(null).trigger('change');
            $('#inclusive_filter_' + inclusive_count).select2({
                width:'250px',
                closeOnSelect: false
            });
        }
        else{
            if(remove == 'remove'){
                $('#exclusive_filter_' + (exclusive_count - 1)).val([]).trigger('change');
            }
            else{
                $('#exclusive_filter_' + exclusive_count).empty();
            }
            
            $('#exclusive_filter_' + exclusive_count).val(null).trigger('change');
            $('#exclusive_filter_' + exclusive_count).select2({
                width:'250px',
                closeOnSelect: false
            });
        }

        lastInclusiveColumnLabel.addEventListener('change', function(e) {
            let get_total_filters = filterDiv.querySelectorAll('label').length;
            // lastInclusiveColumnLabel.textContent = data.fields[get_total_filters-1];
            if(filter == 'inclusive'){
                $('#inclusive_filter_' + inclusive_count).empty();
                $('#inclusive_filter_' + inclusive_count).val(null).trigger('change');
                $('#inclusive_filter_' + inclusive_count).select2({
                    width:'250px',
                    closeOnSelect: false
                });
            }
            else{
                $('#exclusive_filter_' + exclusive_count).empty();
                $('#exclusive_filter_' + exclusive_count).val(null).trigger('change');
                $('#exclusive_filter_' + exclusive_count).select2({
                    width:'250px',
                    closeOnSelect: false
                });
            }

            $(filterValuesSelect).on('select2:open', function() {
                $('.select2-dropdown--below').css('width', '100% !important');
            });
            let filters = '';
            if(row == 'first')
            {
                let select_date = document.getElementById('select_date').value;
                let selectedElement = $("#select_date_values");
                if (selectedElement.data('select2')) {
                    let selectedData = selectedElement.select2("data");
                    if (selectedData.length > 0)
                    {
                        let selectedValues = $("#select_date_values").select2("val");
                        selectedValues = selectedValues.join(',');
                        filters = select_date + ':' + selectedValues
                        
                    }
                    else{
                        filters = ''
                    }
                }
            }else{
                if(filter == 'inclusive'){
                    includes_filters_list = get_inclusive_or_exclusive_filters('inclusive',filters)
                    filters = convert_inclusive_exclusive_filters_list_into_string(includes_filters_list)
                }
                else{
                    excludes_filters_list = get_inclusive_or_exclusive_filters('exclusive',filters)
                    filters = convert_inclusive_exclusive_filters_list_into_string(excludes_filters_list)
                }
            }
            let first_select_column = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:first-child > select');
            let column_name = first_select_column;
            url = '/board/newbasket/?filter_column='+column_name.value+'&filters='+filters+'&mode=newcol&project_id='+project_id+'&optional_column='+lastInclusiveColumnLabel.value
            fetch(url)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                let filter_values = data.filter_values;
                for(let value = 0 ;value<filter_values.length;value++)
                {
                    let optionElement = document.createElement("option");
                    // optionElement.classList.add('custom-option');
                    optionElement.value = filter_values[value];
                    optionElement.textContent = filter_values[value];
                    filterValuesSelect.appendChild(optionElement);
                    // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                }
                if(data.more_pages)
                {
                    next_page = data.next;
                    let optionElement = document.createElement("option");
                    // optionElement.classList.add('custom-option');
                    optionElement.value = '';
                    optionElement.textContent = 'Show More';
                    filterValuesSelect.appendChild(optionElement);
                }
                $(filterValuesSelect).on('select2:select', function (e) {
                    let selectedValue = e.params.data.id;
                    if (selectedValue === '') {
                        basketloadMoreData(dashboard_id,column_name,next_page,project_id,filterValuesSelect,lastInclusiveColumnLabel.value,filters)
                    }
                });
            })
        });
    }
}
function edit_on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,row,remove){
    
    if(filter == 'edit_inclusive'){
        document.getElementById('edit_inclusive').remove();
    }
    else{
        document.getElementById('edit_exclusive').remove();
    }
    let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:first-child');
    let get_all_select = document.querySelectorAll('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows > #'+filter+'_column');
    console.dir(get_all_select,{'maxArrayLength':'none'});
    if(get_all_select.length < 2){

        let columnNameLabel = document.createElement('select');
        columnNameLabel.style.maxWidth = '210px';
        columnNameLabel.style.marginTop = '5px';
        columnNameLabel.style.height = '35px';

        columnNameLabel.id = filter+'_column';
        lastFilterItemDiv.appendChild(columnNameLabel);

        const inclusiveColumnLabels = document.querySelectorAll('.'+filter+'-filter-item select[id="'+filter+'_column"]');
        const lastInclusiveColumnLabel = inclusiveColumnLabels[inclusiveColumnLabels.length - 1];
        const option = document.createElement('option');
            option.value = ''
            option.id = '';
            option.textContent = "Select Option";
            lastInclusiveColumnLabel.appendChild(option);
        let selected_inclusive_columns = []
        let filter_columns = document.querySelectorAll('.'+filter+'-filter-item #'+filter+'_column')
        console.dir(filter_columns,{'maxArrayLength':'none'});
        for(let index = 0; index < filter_columns.length-1; index++)
        {
            selected_inclusive_columns.push(filter_columns[index].value)
        }
        console.dir(selected_inclusive_columns,{'maxArrayLength':'none'});
        for(let index = 0;index<data.fields.length;index++)
        {
            if(selected_inclusive_columns.indexOf(data.fields[index]) === -1){
                const option = document.createElement('option');
                option.value = data.fields[index]
                option.id = data.fields[index];
                option.textContent = data.fields[index];
                lastInclusiveColumnLabel.appendChild(option);
            }
        }
        if(filter == 'edit_inclusive'){
            if(remove == 'remove')
            {
                $('#edit_inclusive_filter_' + (edit_inclusive_count - 1)).val([]).trigger('change');
            }
            else{
                $('#edit_inclusive_filter_' + edit_inclusive_count).empty();
            }
            
            $('#edit_inclusive_filter_' + edit_inclusive_count).val(null).trigger('change');
            $('#edit_inclusive_filter_' + edit_inclusive_count).select2({
                width:'250px',
                closeOnSelect: false
            });
        }
        else{
            if(remove == 'remove'){
                $('#edit_exclusive_filter_' + (edit_exclusive_count - 1)).val([]).trigger('change');
            }
            else{
                $('#edit_exclusive_filter_' + edit_exclusive_count).empty();
            }
            $('#edit_exclusive_filter_' + edit_exclusive_count).val(null).trigger('change');
            $('#edit_exclusive_filter_' + edit_exclusive_count).select2({
                width:'250px',
                closeOnSelect: false
            });
        }
        lastInclusiveColumnLabel.addEventListener('change', function(e) {
            let get_total_filters = filterDiv.querySelectorAll('label').length;
            // lastInclusiveColumnLabel.textContent = data.fields[get_total_filters-1];
            if(filter == 'edit_inclusive'){
                $('#edit_inclusive_filter_' + edit_inclusive_count).empty();
                $('#edit_inclusive_filter_' + edit_inclusive_count).val(null).trigger('change');
                $('#edit_inclusive_filter_' + edit_inclusive_count).select2({
                    width:'250px',
                    closeOnSelect: false
                });
            }
            else{
                $('#edit_exclusive_filter_' + edit_exclusive_count).empty();
                $('#edit_exclusive_filter_' + edit_exclusive_count).val(null).trigger('change');
                $('#edit_exclusive_filter_' + edit_exclusive_count).select2({
                    width:'250px',
                    closeOnSelect: false
                });
            }

            $(filterValuesSelect).on('select2:open', function() {
                $('.select2-dropdown--below').css('width', '100% !important');
            });
            let filters = '';
            if(row == 'first')
            {
                let select_date = document.getElementById('select_date').value;
                let selectedElement = $("#select_date_values");
                if (selectedElement.data('select2')) {
                    let selectedData = selectedElement.select2("data");
                    if (selectedData.length > 0)
                    {
                        let selectedValues = $("#select_date_values").select2("val");
                        selectedValues = selectedValues.join(',');
                        filters = select_date + ':' + selectedValues
                        
                    }
                    else{
                        filters = ''
                    }
                }
            }else{
                if(filter == 'edit_inclusive'){
                    includes_filters_list = get_inclusive_or_exclusive_filters('edit_inclusive',filters)
                    filters = convert_inclusive_exclusive_filters_list_into_string(includes_filters_list)
                }
                else{
                    excludes_filters_list = get_inclusive_or_exclusive_filters('edit_exclusive',filters)
                    filters = convert_inclusive_exclusive_filters_list_into_string(excludes_filters_list)
                }
            }
            let first_select_column = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:first-child > select');
            let column_name = first_select_column;
            url = '/board/newbasket/?filter_column='+column_name.value+'&filters='+filters+'&mode=newcol&project_id='+project_id+'&optional_column='+lastInclusiveColumnLabel.value
            $('.delete_chart_spinner').removeClass('d-none');
            fetch(url)
            .then(response => {
                // Handle unsuccessful response
                if (!response.ok) {
                throw new Error(response.status);
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                let filter_values = data.filter_values;
                for(let value = 0 ;value<filter_values.length;value++)
                {
                    let optionElement = document.createElement("option");
                    // optionElement.classList.add('custom-option');
                    optionElement.value = filter_values[value];
                    optionElement.textContent = filter_values[value];
                    filterValuesSelect.appendChild(optionElement);
                    // $(filterValuesSelect).val(filter_values[value]).trigger('change');
                }
                if(data.more_pages)
                {
                    next_page = data.next;
                    let optionElement = document.createElement("option");
                    // optionElement.classList.add('custom-option');
                    optionElement.value = '';
                    optionElement.textContent = 'Show More';
                    filterValuesSelect.appendChild(optionElement);
                }
                $(filterValuesSelect).on('select2:select', function (e) {
                    let selectedValue = e.params.data.id;
                    if (selectedValue === '') {
                        basketloadMoreData(dashboard_id,column_name,next_page,project_id,filterValuesSelect,lastInclusiveColumnLabel.value,filters)
                    }
                });
                $('.delete_chart_spinner').addClass('d-none');
            })
        });
    }
}