// function create_option_for_chart(chart_heading,legends,x,series_data,barChart)
// {
//     option = {
//         dataZoom: [
//             // {
//             //   type: 'slider'
//             // },
//             // {
//             //   type: 'inside'
//             // }
//         ],
//         grid: {
//             left: 0,
//             right:'5%',
//             top: '20%',
//             bottom: '10%',
//             containLabel:true
//         },
//         title: {
//             text: chart_heading
//         },
//         tooltip: {
//         trigger: 'item',
//             axisPointer: {
//                 type: 'cross'
//             }
//         },
//         legend: {
//             type:'scroll',
//             top: '6%',
        
//             itemGap: 20,
//             textStyle: {
//                 margin: [0, 15, 15, 0]
//             },
//             data: legends
//         },
//         toolbox: {
//             show: true,
//             orient: 'vertical',
//             left: 'right',
//             top: 'center',
//             feature: {
//                 mark: { show: true },
//                 dataView: { show: true, readOnly: false },
//                 magicType: { show: true, type: ['line', 'bar', 'stack'],position:{right:200} },
//                 saveAsImage: { show: true }
//             }
//         },
//         xAxis: [
//         {
//             type: 'category',
//             axisTick: { show: false },
//             data: x,
//         }],
//         yAxis: [
//         {
//             type: 'value'
//         }],
//         series: series_data
//     };
//     option && barChart.setOption(option);
//     barChart.resize();
// }
// function make_data_for_chart(chart_id,chart_heading,data,chart_type,legend_position,type)
// {
//     let x = data.x;
//     let y = data.y;
//     let legends = [];
//     let series_data = []
//     for (var key in y) {
//         if (y.hasOwnProperty(key)) {
//         var values = y[key];
//         json_object = {};
//         legends.push(key);
//         json_object['name'] = key;
//         if(type == 'bar'){
//             json_object['type'] = chart_type;
//         }
//         else{
//             json_object['type'] = 'bar';
//         }
//         json_object['emphasis'] = {'focus':'series',scale:true,scaleSize:50};
//         json_object['data'] = values;
//         if(type == 'stack')
//         {
//             json_object['stack'] = 'stack';
//         }
//         json_object['barGap'] = 0;
//         series_data.push(json_object);
//         }
//     }
//     var barchartDom = document.getElementById('chart'+chart_id);
//     var barChart = echarts.init(barchartDom);
//     create_option_for_chart(chart_heading,legends,x,series_data,barChart)  
//     barChart.on('legendselectchanged', function(params) {
//         localStorage.setItem('legends_clicked',true);
//     });
//     localStorage.setItem('legends_clicked',false);
//     update_legend(legend_position,barChart)
// }
// function update_legend(legend_position,barChart)
// {
//     if (!legend_position == undefined) {
//         legend_position = 'top';
//     }
//     if(legend_position == 'top')
//     {
//         barChart.setOption({
//             legend: {
//             top: '6%',
//             orient:'horizontal'
//             }
//         });
//     }
//     else if(legend_position == 'bottom')
//     {
//         barChart.setOption({
//             legend: {
//             orient:'horizontal',
//             bottom: 0
//             }
//         });
//     }
// }
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=') || cookie.startsWith('csrfmiddlewaretoken=')) {
            return cookie.split('=')[1];
        }
    }
    return null; // Return null if the cookie is not found
}
function insert_fields_into_select2(select2_instance,fieldType,key)
{
    let optionElement = document.createElement("option");
    optionElement.classList.add('custom-option');
    optionElement.value = key;
    optionElement.textContent = fieldType + ' ' + key;
    optionElement.style.backgroundColor = 'lightblue';
    select2_instance.appendChild(optionElement);
}
function show_created_basket_list(data,selected_data,dashboard_id,type)
{
    let dropdownMenuDiv = document.getElementById('basket_menu');
    let dropdownDiv = document.getElementById('basket_list');
    let basketBtn = document.getElementById('basketbtn');
    let button = document.getElementsByClassName('basket_dropdown_menu2')[0]
    for (let i = 0; i < data.length; i++) {
        let li = document.createElement('li');
        let input = document.createElement('input');
        input.id = data[i].id
        input.type = 'checkbox';
        input.className = 'checkbox-input';
        input.value = JSON.stringify(data[i]);
        input.setAttribute('data-id', data[i].id);
        if (selected_data.length > 0) {
            selected_basket = selected_data[0].basket_id;
            if (selected_basket == data[i].id) {
                let basket_name = data[i].basket_name;
                if (basket_name) {
                // basket_name = truncateString(basket_name, 8)
                basket_name = basket_name
                }
                input.checked = true;
                button.textContent = 'Basket (' + basket_name + ')';
            }
            else {
                input.checked = false;
            }
        }
        input.onclick = function (e)
        {
            let is_selected = true;
            if(input.checked == true){
                input.checked = true;
            }
            else{
                input.checked = false;
                is_selected = false;
                button.textContent = 'Basket';
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
                basket: data[i].id,
                dashboard: dashboard_id,
                is_selected: is_selected
                })
            };
            fetch('/board/selection/' + data[i].id, requestOptions)
                .then(response => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                return response.json();
                })
                .then(data => {
                // selected_basket = data[0].basket_id;
                })
            //Update Count
            var basket_name = '';
            if(input.checked == true){
                basket_name = data[i].basket_name;
                button.innerText = 'Basket' + '  (' + basket_name + ')';
            }
            var result = get_baskets(e)
            let listing_filters = get_filters(e)[0]
            var flag1 = result[1];
            // console.log(flag1)
            if (!flag1) {
                update_all_charts(listing_filters, 'basket')
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
        editButton.onclick = function () {
        show_edit_basket_modal(data[i])
        };
        let deleteButton = document.createElement('button');
        deleteButton.className = 'dropdown-item button-item delete-button';
        deleteButton.type = 'button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = function (event) {
        delete_basket_modal(data[i].id)
        };
        if (get_slider_value() == 'Edit') {
        li.appendChild(input);
        li.appendChild(actionsButton);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        }
        else {
        li.appendChild(input);
        li.appendChild(actionsButton);

        }
        dropdownMenuDiv.appendChild(li);
        dropdownDiv.appendChild(dropdownMenuDiv);
        basketBtn.appendChild(dropdownDiv);

        if(type == 'basket_create')
        {
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
        }
        setTimeout(function(e){
            $('.delete_chart_spinner').addClass('d-none');
        },500);
        // let excludes_filters = []
        // if(data[i].exclusive_filters.length > 0)
        // {
        //     excludes_filters = data[i].exclusive_filters
        // }
        // let includes_filters = []
        // if(data[i].includes_filters.length > 0)
        // {
        //     includes_filters = data[i].includes_filters
        // }
        // //Run PUT Request
        // let requestOptions = {
        //     method: 'PUT',
        //     headers: {
        //     'Content-Type': 'application/json',
        //     'X-CSRFToken': csrfToken
        //     },
        //     body: JSON.stringify({
        //         basket_name: data[i].basket_name,
        //         dashboard:data[i].dashboard_id,
        //         includes_filters: includes_filters,
        //         exclusive_filters:excludes_filters,
        //     })
        // };
        // // $('.filter_spinner').removeClass('d-none');
        // fetch('/board/basket/'+data[i].id,requestOptions)  
        // .then(response => {
        //     // Handle unsuccessful response
        //     if (!response.ok) {
        //     throw new Error(response.status);
        //     }
        //     return response.json();
        // })
        // .then(data => {
            
        //     $('.error_basket_name').addClass('d-none')
        //     let select_date = document.getElementById('select_date');
        //     select_date.value = ''
        //     $('#select_date_values').val(null).trigger('change');
        //     $('#select_date_values').select2({
        //         width:'250px',
        //         closeOnSelect: false
        //     });
        //     inclusive_count = 0;
        //     exclusive_count = 0;
        //     // $('.filter_spinner').addClass('d-none');
        //     $('#show_basket_modal').modal('hide');
        //     setTimeout(function(e){
        //         $('.delete_chart_spinner').addClass('d-none');
        //     },500);
        // });

    }
}