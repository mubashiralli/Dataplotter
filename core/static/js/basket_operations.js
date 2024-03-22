function empty_inclusive_exclusive_values_from_initial_filter(filter,project_id)
{
    $('#'+filter+'_filters .select2-hidden-accessible').val(null).trigger('change');
    $('#'+filter+'_filters .select2-hidden-accessible').empty();
    var select2Dropdown = $('#'+filter+'_filters .filter-container:first-child .filter_rows:nth-child(2) .select2-hidden-accessible');
    var inclusive_column_value = $('#'+filter+'_filters .filter-container:first-child .filter_rows:nth-child(1) #'+filter+'_column').val();
    let select_date;
    let selectedElement;
    let filters = '';
    if(filter == 'inclusive' || filter == 'exclusive'){
        select_date = document.getElementById('select_date').value;
        selectedElement = $("#select_date_values");
        filters = '';
        if (selectedElement.data('select2')) {
            let selectedData = selectedElement.select2("data");
            if (selectedData.length > 0)
            {
                let selectedValues = $("#select_date_values").select2("val");
                selectedValues = selectedValues.join(',');
                filters = select_date + ':' + selectedValues
            }
            else
            {
                filters = ''
            }
        }
    }
    else{
        select_date = document.getElementById('edit_select_date').value;
        selectedElement = $("#edit_select_date_values");
        filters = '';
        if (selectedElement.data('select2')) {
            let selectedData = selectedElement.select2("data");
            if (selectedData.length > 0)
            {
                let selectedValues = $("#edit_select_date_values").select2("val");
                selectedValues = selectedValues.join(',');
                filters = select_date + ':' + selectedValues
            }
            else
            {
                filters = ''
            }
        }
    }
    
    url = '/board/newbasket/?filter_column='+inclusive_column_value+'&filters='+filters+'&mode=newcol&project_id='+project_id
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
        let newOptions = [];
        for(let value = 0 ;value<filter_values.length;value++)
        {
            newOptions.push({ id: filter_values[value], text: filter_values[value] })
        }
        select2Dropdown.select2({
            width:'250px',
            data: newOptions,
            closeOnSelect:false
        }).trigger('change');

        // if(data.more_pages)
        // {
        //     let optionElement = $("<option></option>");
        //     optionElement.val('show_more');
        //     optionElement.text('Show More');
        //     $('#select_date_values').append(optionElement);
        // }
        // $(filterValuesSelect).on('select2:select', function (e) {
        //     let selectedValue = e.params.data.id;
        //     if (selectedValue === '') {
        //         loadMoreData(dashboard_id,inclusive_column_value,next_page,project_id,filterValuesSelect)
        //     }
        // });
        // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
        // Assuming you want to change the width of the entire select2 dropdown
        // $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '15rem');
        $('.delete_chart_spinner').addClass('d-none');


    })
}
function empty_inclusive_exclusive_values(filter,event,project_id)
{
    var currentContainer = event.closest('.filter-container');
    var nextFilterContainer = currentContainer.next('.filter-container');
    if (nextFilterContainer.length > 0) {
        
        var select2Dropdown = nextFilterContainer.find('.select2-hidden-accessible');
        select2Dropdown.empty().select2({
            width:'250px',
            closeOnSelect:false
        });
        let column_name = nextFilterContainer.find('#'+filter+'_column').val();
        let filters_list = [];
        let filters = '';
        filters_list = get_inclusive_or_exclusive_filters(filter);
        filters = convert_inclusive_exclusive_filters_list_into_string(filters_list)
        console.log('Filters: ', filters)
        
        url = '/board/newbasket/?filter_column='+column_name+'&filters='+filters+'&mode=newcol&project_id='+project_id
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
            let newOptions = [];
            for(let value = 0 ;value<filter_values.length;value++)
            {
                newOptions.push({ id: filter_values[value], text: filter_values[value] })
            }
            select2Dropdown.select2({
                width:'250px',
                data: newOptions,
                closeOnSelect:false
            }).trigger('change');

            if(data.more_pages)
            {
                next_page = data.next;
                let optionElement = document.createElement("option");
                // optionElement.classList.add('custom-option');
                optionElement.value = '';
                optionElement.textContent = 'Show More';
                select2Dropdown.appendChild(optionElement);
            }
            // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
            // Assuming you want to change the width of the entire select2 dropdown
            // $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '15rem');
            $('.delete_chart_spinner').addClass('d-none');


        })
        
        
    }
}
function create_row(filter,inclusiveFiltersDiv,columnNameLabel,rownumber,data,dashboard_id,project_id)
{
    let filterDiv;
    if(rownumber == 1){
        filterDiv = document.createElement('div');
        filterDiv.classList.add(filter+'-filter-item');
    }
    else{
        filterDiv = document.getElementsByClassName(filter+'-filter-item')[0];
    }
    
    let filter_row_div = document.createElement('div')
    filter_row_div.classList.add('d-flex', 'filter-container');
    filterDiv.appendChild(filter_row_div);

    let filter_col_filter_column_div = document.createElement('div')
    filter_col_filter_column_div.classList.add('filter_rows');
    filter_row_div.appendChild(filter_col_filter_column_div);
    
    columnNameLabel.id = filter+'_column';
    filter_col_filter_column_div.appendChild(columnNameLabel);
    
    let filter_col_filter_values_div = document.createElement('div')
    filter_col_filter_values_div.classList.add('filter_rows');
    filter_row_div.appendChild(filter_col_filter_values_div);

    if(filter == 'inclusive'){
        filterValuesSelect.id = filter+'_filter_' + inclusive_count;
    }
    else if(filter == 'exclusive'){
        filterValuesSelect.id = filter+'_filter_' + exclusive_count;
    }
    else if(filter == 'edit_inclusive')
    {
        filterValuesSelect.id = filter+'_filter_' + edit_inclusive_count;
    }
    else if(filter == 'edit_exclusive')
    {
        filterValuesSelect.id = filter+'_filter_' + edit_exclusive_count;
    }
    filterValuesSelect.setAttribute('multiple', 'multiple'); // Enable multiple selections
    filter_col_filter_values_div.appendChild(filterValuesSelect);
    
    let filter_col_remove_div = document.createElement('div')
    filter_col_remove_div.classList.add('filter_rows');
    filter_row_div.appendChild(filter_col_remove_div);
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    
    removeButton.onclick = function(e) {
        var currentContainer = $(this).closest('.filter-container');
        console.dir(currentContainer)
        var nextFilterContainer = currentContainer.nextAll('.filter-container');
        console.log('Next Container: ',nextFilterContainer.length)
        // console.dir(nextFilterContainer,{'maxArrayLength':'none'});
        
        localStorage.setItem('remove_row',1);
        filter_row_div.remove();

        if(nextFilterContainer.length > 0){
            var select2Dropdown = nextFilterContainer.find('.select2-hidden-accessible');
            select2Dropdown.empty().select2({
                width:'250px',
                closeOnSelect:false
            });
            let column_name = nextFilterContainer.find('#'+filter+'_column').val();
            let filters_list = [];
            let filters = '';
            filters_list = get_inclusive_or_exclusive_filters(filter);
            filters = convert_inclusive_exclusive_filters_list_into_string(filters_list)
            console.log('Filters: ', filters)

            console.log('Filters Length: ', filters.split(':'))

            if(filters.split(':')[1] == '')
            {
                if(filter == 'inclusive' || filter == 'exclusive'){
                    select_date = document.getElementById('select_date').value;
                    selectedElement = $("#select_date_values");
                    filters = '';
                    if (selectedElement.data('select2')) {
                        let selectedData = selectedElement.select2("data");
                        if (selectedData.length > 0)
                        {
                            let selectedValues = $("#select_date_values").select2("val");
                            selectedValues = selectedValues.join(',');
                            filters = select_date + ':' + selectedValues
                        }
                        else
                        {
                            filters = ''
                        }
                    }
                }
                else{
                    select_date = document.getElementById('edit_select_date').value;
                    selectedElement = $("#edit_select_date_values");
                    filters = '';
                    if (selectedElement.data('select2')) {
                        let selectedData = selectedElement.select2("data");
                        if (selectedData.length > 0)
                        {
                            let selectedValues = $("#edit_select_date_values").select2("val");
                            selectedValues = selectedValues.join(',');
                            filters = select_date + ':' + selectedValues
                        }
                        else
                        {
                            filters = ''
                        }
                    }
                }
            }
            url = '/board/newbasket/?filter_column='+column_name+'&filters='+filters+'&mode=newcol&project_id='+project_id
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
                let newOptions = [];
                for(let value = 0 ;value<filter_values.length;value++)
                {
                    newOptions.push({ id: filter_values[value], text: filter_values[value] })
                }
                select2Dropdown.select2({
                    width:'250px',
                    data: newOptions,
                    closeOnSelect:false
                }).trigger('change');

                if(data.more_pages)
                {
                    next_page = data.next;
                    let optionElement = document.createElement("option");
                    // optionElement.classList.add('custom-option');
                    optionElement.value = '';
                    optionElement.textContent = 'Show More';
                    select2Dropdown.appendChild(optionElement);
                }
                // Assuming you want to change the width of the select2 dropdown with class 'select2-dropdown' and class 'select2-dropdown--below'
                // Assuming you want to change the width of the entire select2 dropdown
                // $('.select2-container.select2-container--classic.select2-container--below.select2-container--focus.select2-container--open .select2-dropdown').css('width', '15rem');
                $('.delete_chart_spinner').addClass('d-none');


            })
        }

        let get_last_row_remove_div = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:last-child');
        filter_col_remove_div.appendChild(removeButton);
        
        let check_final_column_exist = document.querySelector('.'+filter+'-filter-item > .d-flex:last-child > .filter_rows:last-child > #'+filter+'_final_column' )
        if(get_last_row_remove_div){
            if(!check_final_column_exist){
                
                let finalcolumnradioButton = document.createElement('input');
                finalcolumnradioButton.type = 'radio';
                finalcolumnradioButton.id = filter+ '_final_column';
                finalcolumnradioButton.checked = false
                finalcolumnradioButton.title = 'Final Column';
                finalcolumnradioButton.style.marginLeft = '6px';
                finalcolumnradioButton.onclick = function() {
                    if(rownumber == 1){
                        on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'first')
                    }else{
                        on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                    }
                };
                get_last_row_remove_div.appendChild(finalcolumnradioButton);
            }
        }

        
        let total_rows = document.querySelectorAll('.'+filter+'-filter-item > .d-flex');
        if(filter == 'inclusive'){
            if(total_rows.length == 0)
            {
                inclusive_count = 0;
            }
            let add_filters_exist = document.querySelector('#'+filter+'_filters > #add_inclusive_filters')
            if(!add_filters_exist) {
                
                var iconElement = document.createElement('i');
                iconElement.title = "Add inclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "add_inclusive_filters";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            
                let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
                lastFilterItemDiv.after(iconElement);
            }
        }
        else if(filter == 'exclusive'){
            if(total_rows.length == 0)
            {
                exclusive_count = 0;
            }
            let add_exclusive_filters_exist = document.querySelector('#'+filter+'_filters > #add_exclusive_filters')
            if(!add_exclusive_filters_exist) {
                var iconElement = document.createElement('i');
                iconElement.title = "Add exclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "add_exclusive_filters";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
            
                let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
                lastFilterItemDiv.after(iconElement);
            }
        }
        else if(filter == 'edit_inclusive'){
            if(total_rows.length == 0)
            {
                edit_inclusive_count = 0;
            }
            let add_filters_exist = document.querySelector('#'+filter+'_filters > #edit_inclusive')
            if(!add_filters_exist) {
                var iconElement = document.createElement('i');
                iconElement.title = "Add inclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "edit_inclusive";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
                let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
                lastFilterItemDiv.after(iconElement);
            }
        }
        else if(filter == 'edit_exclusive'){
            if(total_rows.length == 0)
            {
                edit_exclusive_count = 0;
            }
            let add_exclusive_filters_exist = document.querySelector('#'+filter+'_filters > #edit_exclusive')
            if(!add_exclusive_filters_exist) {
                var iconElement = document.createElement('i');
                iconElement.title = "Add exclusive filters";
                iconElement.className = "fa fa-plus fa-1x";
                iconElement.id = "add_exclusive_filters";
                iconElement.style.cursor = "pointer";
                iconElement.style.color = "#157eab";
                iconElement.setAttribute('aria-hidden', 'true');
                let lastFilterItemDiv = document.querySelector('.'+filter+'-filter-item:last-of-type');
                lastFilterItemDiv.after(iconElement);
            }
        }     
        
        if(total_rows.length == 0) {
            if(filter == 'inclusive'){
                inclusive_count = 0
            }
            else{
                exclusive_count = 0
            }
        }
    };
    let filter_final_column = document.getElementById(filter+'_final_column');
    if(filter_final_column){
        document.getElementById(filter+'_final_column').remove();
    }
    let finalcolumnradioButton = document.createElement('input');
    finalcolumnradioButton.type = 'radio';
    finalcolumnradioButton.id = filter+ '_final_column';
    finalcolumnradioButton.checked = false
    finalcolumnradioButton.title = 'Final Column';
    finalcolumnradioButton.style.marginLeft = '6px';
    finalcolumnradioButton.onclick = function() {
        if(rownumber == 1){
            if(localStorage.getItem('remove_row') == 1){
                if(filter == 'edit_inclusive' || filter == 'edit_exclusive'){
                    edit_on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'first')
                }
                else{
                    on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'first','remove')
                }
            }else{
                if(filter == 'edit_inclusive' || filter == 'edit_exclusive'){
                    edit_on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'first','remove')
                }
                else{
                    on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'first')
                }
            }
        }
        else{
            if(localStorage.getItem('remove_row') == 1)
            {
                if(filter == 'edit_inclusive' || filter == 'edit_exclusive'){
                    edit_on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last')
                }
                else{
                    on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                }
                // on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last','remove')
            }else{
                if(filter == 'edit_inclusive' || filter == 'edit_exclusive'){
                    edit_on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last','remove')
                }
                else{
                    on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last')
                }
                // on_click_final_column(filter,inclusive_count,exclusive_count,data,filterValuesSelect,dashboard_id,project_id,'last')

            }
        }
    };
    filter_col_remove_div.appendChild(removeButton);
    filter_col_remove_div.appendChild(finalcolumnradioButton);
    inclusiveFiltersDiv.appendChild(filterDiv);
}
function get_inclusive_or_exclusive_filters(filter,filters)
{
    const inclusiveFilterItem = document.querySelector('.'+filter+'-filter-item');
    let includes_filters_list = [];
    if(inclusiveFilterItem)
    {
        const rows = inclusiveFilterItem.querySelectorAll('.d-flex');
        let includes_filters_json = {};
        rows.forEach((row, rowIndex) => {
            // Get the filter_rows elements within the current row
            const colML4Elements = row.querySelectorAll('.filter_rows');

            // Get the value of the simple select with id "inclusive_column" within the current filter_rows
            const simpleSelect = colML4Elements[0].querySelector('#'+filter+'_column');
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
                ;
            });
            // console.log(`Row ${rowIndex + 1} - Select2 Values: ${select2Values}`);

            if(includes_filters_json.hasOwnProperty(simpleSelectValue))
            {
                includes_filters_json[simpleSelectValue] = includes_filters_json[simpleSelectValue] + ',' +select2Values
            }
            else{
                includes_filters_json[simpleSelectValue] = select2Values.join(',')
            }
        });
        let length = Object.keys(includes_filters_json).length;
        if(length > 0){
            includes_filters_list.push(includes_filters_json)    
        }
        return includes_filters_list
    }
    else{
        return includes_filters_list
    }
}
function convert_inclusive_exclusive_filters_list_into_string(includes_filters_list)
{
    let filters = '';
    for(let filter = 0;filter<includes_filters_list.length;filter++)
    {
        for(let key in includes_filters_list[filter])
        {
            if(filters){
                if(includes_filters_list[filter][key]){
                    filters += '|' +  key+':'+includes_filters_list[filter][key] 
                }
            }
            else{
                filters = key+':'+includes_filters_list[filter][key]
            }

        }
    }
    return filters;

}