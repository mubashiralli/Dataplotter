//This function get all filters from Filters Section and basket section
function get_filters(e) {
  let filters_btn = document.querySelector(".filtersbtn");
  var dropdowns = filters_btn.querySelectorAll(".dropdown");
  let filters = {};
  let flag = false;
  let listing_filters = [];
  let basket_flag = true;
  //Iterate over all dropdown and check each dropdown list have any uncheck value exist or not.
  //If Exist then retrieve all check values in array.

  dropdowns.forEach(function (dropdown) {
    let allChecked = true;
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    if (checkboxes.length == 1) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].checked = true;
          allChecked = true;
          flag = true;
          break;
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          allChecked = false;
          break;
        }
      }
      if (!allChecked) {
        for (var i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].checked) {
            if (filters.hasOwnProperty(checkboxes[i].id)) {
              filters[checkboxes[i].id].push(checkboxes[i].value);
            } else {
              filters[checkboxes[i].id] = [checkboxes[i].value];
            }
          }
        }
      }
    }
  });

  //Iterate over each filter and convert array to comma separated string as per backend require and return filters
  let converted_filters = {};
  if (filters) {
    for (let key in filters) {
      converted_filters[key] = filters[key].join(",");
    }
    listing_filters.push(converted_filters);
  } else {
    listing_filters.push(converted_filters);
  }
  return [listing_filters, flag, basket_flag];
}
//Get target search value from input field and return filters
function get_search_filters(e) {
  var targetElement = e.target;
  var filter_id = targetElement.closest(".dropdown").id;
  let basket_btn = document.querySelector(".basketbtn");
  var basket_dropdowns = basket_btn.querySelectorAll("#basket_list");
  let basket_flag = false;
  basket_dropdowns.forEach(function (dropdown) {
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        basket_flag = true;
        break;
      }
    }
  });
  let filters_btn = document.querySelector(".filtersbtn");
  var dropdowns = filters_btn.querySelectorAll(".dropdown");
  let filters = {};
  let flag = false;
  let listing_filters = [];

  dropdowns.forEach(function (dropdown) {
    search_value = dropdown.querySelector(".search-input").value;
    let allChecked = true;
    // get all checked values from target dropdown filter
    if (search_value) {
      // if(filter_id == dropdown.id)
      var checkboxes = dropdown.querySelectorAll(".checkbox-input");
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          if (filters.hasOwnProperty(checkboxes[i].id)) {
            filters[checkboxes[i].id].push(checkboxes[i].value);
          } else {
            filters[checkboxes[i].id] = [checkboxes[i].value];
          }
        }
      }
    }
    //IF not target Filter then check dropdown have any uncheck value exist then get all checked values, store it into filters array
    else {
      let allChecked = true;
      var checkboxes = dropdown.querySelectorAll(".checkbox-input");
      if (checkboxes.length == 1) {
        for (var i = 0; i < checkboxes.length; i++) {
          if (!checkboxes[i].checked) {
            checkboxes[i].checked = true;
            allChecked = true;
            flag = true;
            break;
          }
        }
      } else {
        for (var i = 0; i < checkboxes.length; i++) {
          if (!checkboxes[i].checked) {
            allChecked = false;
            break;
          }
        }
        if (!allChecked) {
          for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
              if (filters.hasOwnProperty(checkboxes[i].id)) {
                filters[checkboxes[i].id].push(checkboxes[i].value);
              } else {
                filters[checkboxes[i].id] = [checkboxes[i].value];
              }
            }
          }
        }
      }
    }
  });
  //Convert filters array to comma seperated string.
  let converted_filters = {};
  if (filters) {
    for (let key in filters) {
      converted_filters[key] = filters[key].join(",");
    }
    listing_filters.push(converted_filters);
  } else {
    listing_filters.push(converted_filters);
  }
  return [listing_filters, flag, basket_flag];
}
// This function will get checked value from target dropdown and
// also check other filters if they have unchecked values then fetch all checked values otherwise neglect.
function get_only_filters(e) {
  let basket_btn = document.querySelector(".basketbtn");
  var basket_dropdowns = basket_btn.querySelectorAll("#basket_list");
  let basket_flag = true;
  basket_dropdowns.forEach(function (dropdown) {
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        // basket_flag = true;
        break;
      }
    }
  });
  if (basket_flag) {
    var targetElement = e.target;
    var filter_id = targetElement.closest(".dropdown").id;
    // alert(filter_id)
    let filters_btn = document.querySelector(".filtersbtn");
    var dropdowns = filters_btn.querySelectorAll(".dropdown");
    let filters = {};
    dropdowns.forEach(function (dropdown) {
      //get targeted filter which user applied filter
      if (filter_id == dropdown.id) {
        var checkboxes = dropdown.querySelectorAll(".checkbox-input");
        for (var i = 0; i < checkboxes.length; i++) {
          if (
            checkboxes[i].id == targetElement.id &&
            checkboxes[i].value == targetElement.value
          ) {
            checkboxes[i].checked = true;
            filters[checkboxes[i].id] = [checkboxes[i].value];
          } else {
            checkboxes[i].checked = false;
          }
        }
      }
      //get remaining filters values other than targeted filter
      else {
        let allChecked = true;
        var checkboxes = dropdown.querySelectorAll(".checkbox-input");

        for (var i = 0; i < checkboxes.length; i++) {
          if (!checkboxes[i].checked) {
            allChecked = false;
            break;
          }
        }
        if (!allChecked) {
          for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
              if (filters.hasOwnProperty(checkboxes[i].id)) {
                filters[checkboxes[i].id].push(checkboxes[i].value);
              } else {
                filters[checkboxes[i].id] = [checkboxes[i].value];
              }
            }
          }
        }
      }
    });
    // console.dir(filters,{'maxArrayLength':'none'})
    let listing_filters = [];
    let converted_filters = {};
    if (filters) {
      for (let key in filters) {
        converted_filters[key] = filters[key].join(",");
      }
      listing_filters.push(converted_filters);
    } else {
      listing_filters.push(converted_filters);
    }
    // console.dir(listing_filters)
    return listing_filters;
  } else {
    return;
  }
}
//Send all filters and basket filter if its selected to Backend through POST and PUT request.
//And re-create chart.
function update_all_charts(filters, basket) {
  // console.dir(filters,{'maxArrayLength':'none'})
  let dashboard_id = document.getElementById("dashID").value;
  let project_id = document.getElementById("project_id").value;

  fetch("/charts/details/" + dashboard_id)
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }
      // Parse the response as JSON
      return response.json();
    })
    .then((chart_details) => {
      for (let index = 0; index < chart_details.charts.length; index++) {
        let chart_id = chart_details.charts[index].id;
        let chart_heading = chart_details.charts[index].name;
        let js_name = chart_details.charts[index].js_name;
        let chart_type = chart_details.charts[index].chart_type;
        let dimension = chart_details.charts[index].dimension;
        let breakdown = chart_details.charts[index].breakdown;
        let metric = chart_details.charts[index].metric;
        let metric_column = chart_details.charts[index].metric_column;
        let sorting = chart_details.charts[index].sorting;
        let legend_postion = chart_details.charts[index].legend_postion;
        let secondary_sort = chart_details.charts[index].secondary_sort;
        let x = chart_details.charts[index].x;
        let y = chart_details.charts[index].y;
        var csrfToken = getCSRFToken();
        let requestOptions;
        if (basket) {
          let filters_btn = document.querySelector(".basketbtn");
          var dropdowns = filters_btn.querySelectorAll("#basket_list");
          let basket_id;
          dropdowns.forEach(function (dropdown) {
            var checkboxes = dropdown.querySelectorAll(".checkbox-input");
            for (var i = 0; i < checkboxes.length; i++) {
              if (checkboxes[i].checked) {
                basket_id = checkboxes[i].id;
              }
            }
          });
          requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
              pid: project_id,
              Filters: filters,
              Dimension: dimension,
              Breakdown: breakdown !== "" ? breakdown : undefined,
              Metric: metric_column !== "" ? metric_column : undefined,
              Operation: metric,
              Sort: sorting,
              secondary_sort: secondary_sort,
              basket: basket_id,
            }),
          };
        } else {
          requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
              pid: project_id,
              Filters: filters,
              Dimension: dimension,
              Breakdown: breakdown !== "" ? breakdown : undefined,
              Metric: metric_column !== "" ? metric_column : undefined,
              Operation: metric,
              Sort: sorting,
            }),
          };
        }
        $("#" + chart_id + " .charts_spinner").removeClass("d-none");
        fetch("/charts/", requestOptions)
          .then((response) => {
            // Handle unsuccessful response
            if (!response.ok) {
              throw new Error(response.status);
            }

            // Parse the response as JSON
            return response.json();
          })
          .then((data) => {
            const chartElement = document.getElementById("chart" + chart_id);
            const chart = echarts.getInstanceByDom(chartElement);
            const options = chart.getOption();
            // Assuming the series object is located within the options object
            const series = options.series;
            // Assuming there is only one series in the chart, you can access its type
            let seriesType = "bar";
            let y = data.y;
            let x = data.x;

            let legends = [];
            let series_data = [];
            for (var key in y) {
              if (y.hasOwnProperty(key)) {
                var values = y[key];
                json_object = {};
                legends.push(key);
                json_object["name"] = key;
                json_object["emphasis"] = {
                  focus: "series",
                  scale: true,
                  scaleSize: 50,
                };
                json_object["data"] = values;
                json_object["barGap"] = 0;
                // json_object['label'] = labelOption;
                if (js_name == "stack") {
                  json_object["type"] = "bar";
                  json_object["stack"] = "stack";
                } else {
                  json_object["type"] = js_name;
                }
                series_data.push(json_object);
              }
            }
            chart.clear();
            var barChart = echarts.init(chartElement);
            option = {
              dataZoom: [
                // {
                // type: 'slider'
                // },
                // {
                // type: 'inside'
                // }
              ],
              grid: {
                left: 0,
                right: "5%",
                top: "20%", // Adjust the top position of the grid area
                bottom: "10%",
                containLabel: true,
              },
              title: {
                text: chart_heading,
              },
              tooltip: {
                trigger: "item",
                axisPointer: {
                  type: "cross",
                },
              },
              legend: {
                type: "scroll",
                top: "5%",
                itemGap: 20,
                textStyle: {
                  margin: [0, 15, 15, 0],
                },
                data: legends,
              },
              toolbox: {
                show: true,
                orient: "vertical",
                left: "right",
                top: "center",
                feature: {
                  mark: { show: true },
                  dataView: { show: true, readOnly: false },
                  magicType: {
                    show: true,
                    type: ["line", "bar", "stack"],
                    position: { right: 200 },
                  },
                  saveAsImage: { show: true },
                },
              },
              xAxis: [
                {
                  type: "category",
                  axisTick: { show: false },
                  data: x,
                  // axisLabel: {
                  //     rotate: 45 // Rotate the category labels by 45 degrees to create more space
                  // }
                },
              ],
              yAxis: [
                {
                  type: "value",
                },
              ],
              series: series_data,
            };
            option && barChart.setOption(option);
            barChart.resize();
            barChart.on("legendselectchanged", function (params) {
              // This function will be triggered when a legend item is clicked
              var selectedSeriesName = params.name; // Name of the selected series
              console.log("legends are selected: ", selectedSeriesName);
              localStorage.setItem("legends_clicked", true);
              // setTimeout(function(){
              //   $('#show_edit_panel').css('display', 'none');
              // },10)

              // Perform your additional functionality here based on the selectedSeriesName
            });
            localStorage.setItem("legends_clicked", false);
            var myChart = echarts.getInstanceByDom(
              document.getElementById("chart" + chart_id)
            );
            if (legend_position == "top") {
              myChart.setOption({
                legend: {
                  top: "6%",
                  orient: "horizontal",
                },
              });
            } else if (legend_position == "bottom") {
              myChart.setOption({
                legend: {
                  orient: "horizontal",
                  bottom: 0,
                },
              });
            }
            let requestOptions = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              body: JSON.stringify({
                name: chart_heading,
                js_name: js_name,
                filters: filters,
                chart_type: chart_type,
                dimension: dimension,
                metric: metric,
                breakdown: breakdown !== "" ? breakdown : null,
                metric_column: metric_column !== "" ? metric_column : null,
                sorting: sorting,
                x: data.x,
                y: data.y,
              }),
            };
            fetch("/charts/" + chart_id, requestOptions)
              .then((response) => response.json())
              .then((data) => {
                $("#" + chart_id + " .charts_spinner").addClass("d-none");
              })
              .catch((error) => {
                $("#" + chart_id + " .charts_spinner").addClass("d-none");
                show_error(error);
              });
          })
          .catch((error) => {
            $("#" + chart_id + " .charts_spinner").addClass("d-none");
            show_error(error);
          });
      }
    })
    .catch((error) => {
      show_error(error);
    });
}
// When user apply filter from specific Dropdown Filter then update Checkbox values at the backend from PUT Request.
function update_checkbox_filter(e) {
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  var targetElement = e.target;
  var filter_id = targetElement.closest(".dropdown").id;
  const filter_dropdown = document.getElementById(filter_id);
  const checkboxes = filter_dropdown.querySelectorAll(".checkbox-input");
  let uncheckedValues = [];
  checkboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
      uncheckedValues.push(checkbox.value);
    }
  });
  let requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      unchecked_values: uncheckedValues,
    }),
  };
  fetch("/charts/filters/" + filter_id + "?update=unchecked", requestOptions)
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }

      // Parse the response as JSON
      return response.json();
    })
    .then((data) => {})
    .catch((error) => {
      show_error(error);
    });
}
// When user apply filter from specific Dropdown Filter inside searchbox then update Checkbox values at the backend from PUT Request.
function update_search_checkbox_filter(e) {
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  var targetElement = e.target;
  var filter_id = targetElement.closest(".dropdown").id;
  const filter_dropdown = document.getElementById(filter_id);
  const checkboxes = filter_dropdown.querySelectorAll(".checkbox-input");
  let selectedValues = [];
  let uncheckedValues = [];
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedValues.push(checkbox.value);
    }
  });
  let requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      unchecked_values: uncheckedValues,
      search: true,
      selected_values: selectedValues,
    }),
  };
  fetch("/charts/filters/" + filter_id + "?update=unchecked", requestOptions)
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }

      // Parse the response as JSON
      return response.json();
    })
    .then((data) => {})
    .catch((error) => {
      show_error(error);
    });
}
// Show Edit Filter Panel if user is not viewer and initialize Select2 and show fields in select2 from run datatable header ajax call
function edit_filter_panel(e) {
  let is_viewer = localStorage.getItem("is_viewer");
  if (is_viewer == "false") {
    let project_id = document.getElementById("project_id").value;
    var targetElement = e.target;
    let filter_id = targetElement.closest(".dropdown").id;
    let filter_column = e.target.textContent;
    if (filter_column.includes(":")) {
      filter_column = filter_column.split(":")[0];
    }
    let old_filter_column = document.getElementById("old_filter_column");
    let old_filter_column_id = document.getElementById("old_filter_column_id");
    old_filter_column.value = filter_column;
    old_filter_column_id.value = filter_id;

    var is_slider_exist = document.getElementById("slider_value");
    if (is_slider_exist !== null) {
      var slider_value = document.querySelectorAll("#slider_value");
      let lastsliderInput = slider_value[slider_value.length - 1];
      slider_value = lastsliderInput.value;
    } else {
      var checkbox = document.querySelector('input[type="checkbox"]');
      var slider_value = checkbox.checked ? "View" : "Edit";
      // console.log('Editing: '+ slider_value)
    }
    if (slider_value == "View") {
      return;
    }
    var tableheight = $("#datatables").height();
    if (tableheight > 100) {
      tableheight = tableheight;
    } else {
      tableheight = 0;
    }
    setTimeout(function (e) {
      var scrollposition = document.documentElement.scrollTop - tableheight;
      //   $('.right_panel').css('padding-top', scrollposition-200);
      $(".box_close").css("top", 20);
    }, 500);
    $("#show_filter_panel").slideDown(0);
    const select_filter_column = document.getElementById("filter_column");
    let sidepanel_col = document.querySelector(".col-xl-12");
    let chart_id;
    if (sidepanel_col) {
      chart_id = sidepanel_col.querySelector(".card");
    } else {
      sidepanel_col = document.querySelector(".col-xl-8");
      chart_id = sidepanel_col.querySelector(".card");
    }
    if (chart_id) {
      change_chart_size(chart_id.id);
    }
    fetch("/board/datatable/header/" + project_id)
      .then((response) => {
        // Handle unsuccessful response
        if (!response.ok) {
          throw new Error(response.status);
        }
        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        let select2Element = $("#filter_column");
        $("#filter_column").css("width", "200px");
        let selectedData = select2Element.select2("data");
        if (selectedData.length > 0) {
          filter_column = targetElement
            .closest(".dropdown")
            .querySelectorAll(".checkbox-input")[0].id;
          $("#filter_column").val(filter_column).trigger("change");
        } else {
          for (let index = 0; index < data.fields.length; index++) {
            if (filter_column === data.fields[index]) {
              filter_column = data.fields[index];
            }
            let optionElement = document.createElement("option");
            optionElement.classList.add("custom-option");
            optionElement.value = data.fields[index];
            optionElement.textContent = data.fields[index];
            optionElement.style.color = "white";
            optionElement.style.backgroundColor = "lightblue";
            select_filter_column.appendChild(optionElement);
          }
          $("#filter_column").val(filter_column).trigger("change");
        }
      })
      .catch((error) => {
        show_error(error);
      });
  }
}
//When User change Filter then find by column by id in Dropdown Filters and Update DOM
function update_filter(
  data,
  column_name,
  column_id,
  dashboard_id,
  old_filter_column
) {
  // alert('inside this update_filter function')
  let project_id = document.getElementById("project_id").value;
  var filtersBtn = document.querySelector(".filtersbtn");
  var more_pages = data.more_pages;
  var dropdownDiv = document.getElementById(column_id);
  var button = dropdownDiv.querySelector("#dropdownMenu2");
  button.textContent = column_name;
  button.addEventListener("click", function (e) {
    edit_filter_panel(e);
  });
  var liElements = dropdownDiv.querySelectorAll("li");
  liElements.forEach((li) => {
    li.remove();
  });
  let more_pages_column_name = "more_pages_" + old_filter_column;
  let get_more_pages_column_name = document.getElementById(
    more_pages_column_name
  );
  if (get_more_pages_column_name) {
    get_more_pages_column_name.remove();
  }
  let dropdownMenuDiv = dropdownDiv.querySelector(".dropdown-menu");

  let searchLi = document.createElement("li");
  searchLi.className = "search-bar";
  // Create the search icon button
  let searchIconBtn = document.createElement("button");
  searchIconBtn.type = "button";
  searchIconBtn.innerHTML = '<i class="fas fa-search"></i>';
  searchIconBtn.style.border = "none";

  // Create the search input
  let searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "Search";
  searchInput.className = "search-input";
  searchInput.style.marginLeft = "4px";
  searchInput.addEventListener("input", function (e) {
    let searchTerm = e.target.value;
    filter_search_results(searchTerm, e);
  });
  // Append the elements for the search bar to the searchLi
  searchLi.appendChild(searchIconBtn);
  searchLi.appendChild(searchInput);

  dropdownMenuDiv.appendChild(searchLi);

  let li = document.createElement("li");
  let select_all_input = document.createElement("input");
  select_all_input.id = "select_all";
  select_all_input.type = "checkbox";
  select_all_input.value = "Select All";
  select_all_input.checked = true;
  select_all_input.onclick = function (e) {
    let dropdown = e.target.closest(".dropdown");
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    let count = 0;
    if (!select_all_input.checked) {
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
        count += 1;
      }
    }
    button.innerText = data.data.filter_column;

    var result = get_filters(e);
    // console.dir(result,{'maxArrayLength':'none'})
    if (result) {
      var listing_filters = result[0];
      var flag = result[1];
      if (!flag) {
        // if (Object.keys(listing_filters[0]).length > 0) {
        update_all_charts(listing_filters, "basket");
        update_checkbox_filter(e);
        show_datatable();
      }
    }
  };
  li.appendChild(select_all_input);

  let strong = document.createElement("strong");
  strong.textContent = "Select All";
  strong.style.marginLeft = "2rem";
  li.appendChild(strong);

  dropdownMenuDiv.appendChild(li);

  for (let i = 0; i < data.data.filter_values.length; i++) {
    // Create the dropdown menu items
    let li = document.createElement("li");
    let input = document.createElement("input");
    input.id = data.data.filter_column;
    input.type = "checkbox";
    input.className = "checkbox-input";
    input.value = data.data.filter_values[i];
    input.checked = true;
    input.setAttribute(
      "data-id",
      data.data.filter_column + ":" + data.data.filter_values[i]
    );
    input.onclick = function (e) {
      select_all_input.checked = false;
      let dropdown = e.target.closest(".dropdown");
      var checkboxes = dropdown.querySelectorAll(".checkbox-input");
      let updated_count_checked_values = 0;
      let checked_filter_value;
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          if (!checked_filter_value) {
            checked_filter_value = checkboxes[i].value;
          }
          updated_count_checked_values += 1;
        }
      }
      if (checked_filter_value) {
        checked_filter_value = truncateString(checked_filter_value, 5);
      } else {
        checked_filter_value = "";
      }
      if (checkboxes.length != updated_count_checked_values) {
        button.innerText =
          data.data.filter_column +
          ":" +
          checked_filter_value +
          "  (" +
          updated_count_checked_values +
          ")";
      } else {
        select_all_input.checked = true;
        button.innerText = data.data.filter_column;
      }
      //alert(input.value);
      var result = get_filters(e);
      if (result) {
        var listing_filters = result[0];
        var flag = result[1];
        if (!flag) {
          // if (Object.keys(listing_filters[0]).length > 0) {
          update_all_charts(listing_filters, "basket");
          update_checkbox_filter(e);
          show_datatable();
        }
      }
    };
    // dropdownMenuDiv.appendChild(input);
    var actionsButton = document.createElement("button");
    actionsButton.className = "dropdown-item button-item";
    actionsButton.type = "button";
    actionsButton.innerText = data.data.filter_values[i];

    var onlyButton = document.createElement("button");
    onlyButton.id = data.data.filter_column;
    onlyButton.value = data.data.filter_values[i];
    onlyButton.className = "dropdown-item button-item only_btn";
    onlyButton.type = "button";
    onlyButton.innerText = "Only";
    onlyButton.setAttribute(
      "data-id",
      data.data.filter_column + ":" + data.data.filter_values[i]
    );
    onlyButton.onclick = function (e) {
      select_all_input.checked = false;
      listing_filters = get_only_filters(e);
      if (listing_filters == undefined) {
        var result = get_filters(e);
        if (result) {
          listing_filters = result[0];
          var flag = result[1];
          if (!flag) {
            update_all_charts(listing_filters, "basket");
            update_checkbox_filter(e);
            show_datatable();
          }
        }
      } else {
        update_all_charts(listing_filters, "basket");
        update_checkbox_filter(e);
        show_datatable();
      }
    };
    // Append the menu items to the dropdown menu div
    li.appendChild(input);
    li.appendChild(actionsButton);
    li.appendChild(onlyButton);
    dropdownMenuDiv.appendChild(li);
  }
  if (more_pages === true) {
    let button = document.createElement("button");
    button.id = "more_pages_" + data.data.filter_column;
    button.type = "button";
    button.innerText = "Show More";
    button.classList.add("btn", "btn-secondary");
    dropdownMenuDiv.appendChild(button);
    // dropdownDiv.appendChild(dropdownMenuDiv);
    // filtersBtn.appendChild(dropdownDiv);
    $("#more_pages_" + data.data.filter_column).on("click", function (e) {
      fetch(
        "/charts/filters/" +
          dashboard_id +
          "?filter_column=" +
          column_name +
          "&page=" +
          data.next +
          "&project_id=" +
          project_id
      )
        .then((response) => {
          // Handle unsuccessful response
          if (!response.ok) {
            throw new Error(response.status);
          }

          // Parse the response as JSON
          return response.json();
        })
        .then((data) => {
          let remove_previous_show_more_button = document.getElementById(
            "more_pages_" + data.data.filter_column
          );
          remove_previous_show_more_button.remove();
          $("#more_pages_" + data.data.filter_column).remove();
          for (let i = 0; i < data.data.filter_values.length; i++) {
            // Create the dropdown menu items
            let li = document.createElement("li");
            let input = document.createElement("input");
            input.id = data.data.filter_column;
            input.type = "checkbox";
            input.className = "checkbox-input";
            input.value = data.data.filter_values[i];
            input.setAttribute(
              "data-id",
              data.data.filter_column + ":" + data.data.filter_values[i]
            );
            if (
              data.data.unchecked_values.includes(data.data.filter_values[i])
            ) {
              input.checked = false;
            } else {
              // if(!selected_value)
              // {
              // selected_value = data.data.filter_values[i];
              // }
              input.checked = true;
              // count_checked_values += 1;
            }
            // dropdownMenuDiv.appendChild(input);
            var actionsButton = document.createElement("button");
            actionsButton.className = "dropdown-item button-item";
            actionsButton.type = "button";
            actionsButton.innerText = data.data.filter_values[i];
            // Append the menu items to the dropdown menu div
            li.appendChild(input);
            li.appendChild(actionsButton);

            var onlyButton = document.createElement("button");
            onlyButton.id = data.data.filter_column;
            onlyButton.value = data.data.filter_values[i];
            onlyButton.className = "dropdown-item button-item only_btn";
            onlyButton.type = "button";
            onlyButton.innerText = "Only";
            onlyButton.setAttribute(
              "data-id",
              data.data.filter_column + ":" + data.data.filter_values[i]
            );
            onlyButton.onclick = function (e) {
              select_all_input.checked = false;
              listing_filters = get_only_filters(e);
              // console.dir(listing_filters,{'maxArrayLength':'none'});
              update_all_charts(listing_filters);
              update_checkbox_filter(e);
              show_datatable();
            };

            li.appendChild(onlyButton);
            let dropdownMenuDiv = dropdownDiv.querySelector(".dropdown-menu");
            dropdownMenuDiv.appendChild(li);

            // Append the dropdown menu div to the dropdown div
            // dropdownDiv.appendChild(dropdownMenuDiv);
            // Append the dropdown div to the filtersbtn element
            // filtersBtn.appendChild(dropdownDiv);
          }
        })
        .catch((error) => {
          show_error(error);
        });
    });
  }
}
//If user select different column then Run PUT Request to update filter and also update datatable and charts also.
$("#filter_column").on("select2:select", function (e) {
  let old_filter_column = document.getElementById("old_filter_column").value;
  let old_filter_column_id = document.getElementById(
    "old_filter_column_id"
  ).value;
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let project_id = document.getElementById("project_id").value;
  let filter_column = document.getElementById("filter_column").value;
  let dashboard_id = document.getElementById("dashID").value;
  $(".filter_spinner").removeClass("d-none");
  const url =
    "/charts/filters/" +
    dashboard_id +
    "?filter_column=" +
    filter_column +
    "&mode=newcol&project_id=" +
    project_id;
  fetch(url)
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }
      // Parse the response as JSON
      return response.json();
    })
    .then((data) => {
      let filter_values = data.filter_values;
      let filter_column = data.filter_column;
      let dashboard_id = data.dashboard;
      let requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          filter_column: filter_column,
          filter_values: filter_values,
          limit: 75,
        }),
      };
      fetch("/charts/filters/" + old_filter_column_id, requestOptions)
        .then((response) => {
          // Handle unsuccessful response
          if (!response.ok) {
            throw new Error(response.status);
          }
          // Parse the response as JSON
          return response.json();
        })
        .then((data) => {
          const url =
            "/charts/filters/" +
            dashboard_id +
            "?filter_column=" +
            filter_column +
            "&project_id=" +
            project_id;
          fetch(url)
            .then((response) => {
              // Handle unsuccessful response
              if (!response.ok) {
                throw new Error(response.status);
              }

              // Parse the response as JSON
              return response.json();
            })
            .then((data) => {
              update_filter(
                data,
                filter_column,
                old_filter_column_id,
                dashboard_id,
                old_filter_column
              );
              let get_old_filter_column =
                document.getElementById("old_filter_column");
              get_old_filter_column.value = filter_column;
              $(".filter_spinner").addClass("d-none");
              var result = get_filters(e);
              // console.dir(result,{'maxArrayLength':'none'})
              if (result) {
                var listing_filters = result[0];
                var flag = result[1];
                if (!flag) {
                  show_datatable();
                  update_all_charts(listing_filters, "basket");
                  update_checkbox_filter(e);
                }
              }
            });
        })
        .catch((error) => {
          show_error(error);
        });
    })
    .catch((error) => {
      show_error(error);
    });
});
// Delete filter from backend and update datatables and charts
function delete_filter() {
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let old_filter_column_id = document.getElementById(
    "old_filter_column_id"
  ).value;
  let remove_filter = document.getElementById(old_filter_column_id);
  let sidepanel_col = document.querySelector(".charts_container");
  let chart_id = sidepanel_col.querySelector(".card");

  if (chart_id) {
    chart_id = chart_id.id;
  }
  remove_filter.remove();
  $("#show_filter_panel").css("display", "none");
  change_chart_size(chart_id);
  let requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  };
  $(".delete_chart_spinner").removeClass("d-none");
  fetch("/charts/filters/" + old_filter_column_id, requestOptions)
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }
      // Parse the response as JSON
      return response.json();
    })
    .then((data) => {
      $("#confirmdeletefilterModal").modal("hide");
      const filtersbtnElement = document.querySelector(".filtersbtn");
      // Get the length of 'dropdown' elements inside 'filtersbtn'
      const dropdownCount =
        filtersbtnElement.querySelectorAll(".dropdown").length;
      if (dropdownCount == 0) {
        $(".navbar").hide();
      }

      var result = get_filters();
      console.dir(result, { maxArrayLength: "none" });
      if (result) {
        var listing_filters = result[0];
        var flag = result[1];
        if (!flag) {
          // if (Object.keys(listing_filters[0]).length > 0) {
          update_all_charts(listing_filters, "basket");
          show_datatable();
        }
      }
      $(".delete_chart_spinner").addClass("d-none");
    })
    .catch((error) => {
      show_error(error);
    });
}
function hidefilteredit(id) {
  $("#show_filter_panel").css("display", "none");
}
// Ask confirmation he/she wants to delete filter or not.
$("#delete_filter").on("click", function (e) {
  $("#confirmdeletefilterModal").modal("show");
  let delete_filter_modal = document.getElementById("confirmdeletefilterModal");
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
});
// This function will run when user enter a keyword in searchbox. Fetch Data from backend against this searchvalue and update values in dropdown.
function filter_search_results(searchvalue, event) {
  let project_id = document.getElementById("project_id").value;
  let dashboard_id = document.getElementById("dashID").value;
  var dropdownDiv = event.target.closest(".dropdown");
  var button = dropdownDiv.querySelector("#dropdownMenu2");
  let dropdownMenuDiv = dropdownDiv.querySelector(".dropdown-menu");
  var filter_column;
  if (button.textContent.includes(":")) {
    filter_column = button.textContent.split(":")[0];
  } else {
    filter_column = button.textContent;
  }
  // alert(filter_column)
  let filter_id = event.target.closest(".dropdown").id;
  var dropdownDiv = document.getElementById(filter_id);
  let dropdownMenu2 = dropdownDiv.querySelector("#dropdownMenu2");
  let column_name;
  if (dropdownMenu2.textContent.includes(":")) {
    column_name = dropdownMenu2.textContent.split(":")[0];
  } else {
    column_name = dropdownMenu2.textContent;
  }
  //Run AJAX CALL to retrieve data from backend
  const url =
    "/charts/filters/" +
    dashboard_id +
    "?filter_column=" +
    filter_column +
    "&search_value=" +
    searchvalue +
    "&project_id=" +
    project_id;
  $(".delete_chart_spinner").removeClass("d-none");
  (async () => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(response.status);
      }
      const data = await response.json();

      let remove_previous_show_more_button = document.getElementById(
        "more_pages_" + column_name
      );
      if (remove_previous_show_more_button) {
        remove_previous_show_more_button.remove();
      }
      var liElements = dropdownDiv.querySelectorAll("li");
      var liArray = Array.from(liElements);
      var elementsToRemove = liArray.slice(1);
      elementsToRemove.forEach((li) => {
        li.remove();
      });
      // console.log("Search Value: " + searchvalue);
      let select_all_input;

      let dropdown = event.target.closest(".dropdown");
      var checkboxes = dropdown.querySelectorAll(".checkbox-input");
      let li = document.createElement("li");
      console.log("Dropdown: 1214");
      select_all_input = document.createElement("input");
      select_all_input.id = "select_all";
      select_all_input.type = "checkbox";
      select_all_input.value = "Select All";

      if (data.data.unchecked_values.length > 0) {
        select_all_input.checked = false;
      } else {
        select_all_input.checked = true;
      }
      select_all_input.onclick = function (e) {
        let selected_value;
        let dropdown = e.target.closest(".dropdown");
        var checkboxes = dropdown.querySelectorAll(".checkbox-input");
        let count = 0;
        if (!select_all_input.checked) {
          for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = false;
          }
        } else {
          for (var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = true;
            count += 1;
            if (count == 1) {
              selected_value = checkboxes[i].value;
            }
          }
        }
        // let count = 0;
        // if(!select_all_input.checked)
        // {
        //     for (var i = 0; i < checkboxes.length; i++) {
        //         checkboxes[i].checked = false;
        //     }
        // }
        // else{
        //     for (var i = 0; i < checkboxes.length; i++) {
        //         checkboxes[i].checked = true;
        //         count += 1;
        //     }
        // }

        selected_value = truncateString(selected_value, 5);
        button.innerText =
          data.data.filter_column + ":" + selected_value + "  (" + count + ")";
        // button.innerText = data.data.filter_column;

        var result = get_search_filters(e);
        console.log("RESULT");
        console.dir(result);
        if (result) {
          var listing_filters = result[0];
          var flag = result[1];
          if (!flag) {
            // if (Object.keys(listing_filters[0]).length > 0) {
            update_all_charts(listing_filters, "basket");
            update_search_checkbox_filter(e);
            show_datatable("", true, e);
          }
        }
        // var result = get_filters(e)
        // console.dir(result,{'maxArrayLength':'none'})
        // if(result)
        // {
        // var listing_filters = result[0];
        // var flag = result[1];
        //     if(!flag){
        //     // if (Object.keys(listing_filters[0]).length > 0) {
        //         update_all_charts(listing_filters,'basket')
        //         update_search_checkbox_filter(e)
        //         show_datatable()
        //     }
        // }
      };
      li.appendChild(select_all_input);
      let strong = document.createElement("strong");
      strong.textContent = "Select All";
      strong.style.marginLeft = "2rem";
      li.appendChild(strong);
      dropdownMenuDiv.appendChild(li);
      // }
      let more_pages = data.more_pages;
      let select_all_count = 0;
      for (let i = 0; i < data.data.filter_values.length; i++) {
        // Create the dropdown menu items
        let li = document.createElement("li");
        let input = document.createElement("input");
        input.id = data.data.filter_column;
        input.type = "checkbox";
        input.className = "checkbox-input";
        input.value = data.data.filter_values[i];
        if (data.data.unchecked_values.length > 0) {
          let index = data.data.unchecked_values.indexOf(
            data.data.filter_values[i]
          );
          if (index !== -1) {
            input.checked = false;
          } else {
            input.checked = true;
            select_all_count += 1;
          }
        } else {
          input.checked = true;
        }
        input.setAttribute(
          "data-id",
          data.data.filter_column + ":" + data.data.filter_values[i]
        );
        input.onclick = function (e) {
          // select_all_input.checked = false;
          let dropdown = e.target.closest(".dropdown");
          var checkboxes = dropdown.querySelectorAll(".checkbox-input");
          let updated_count_checked_values = 0;
          let checked_filter_value;
          for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
              if (!checked_filter_value) {
                checked_filter_value = checkboxes[i].value;
              }
              updated_count_checked_values += 1;
            }
          }
          if (checked_filter_value) {
            checked_filter_value = truncateString(checked_filter_value, 5);
          }
          if (checkboxes.length != updated_count_checked_values) {
            if (checked_filter_value) {
              button.innerText =
                data.data.filter_column +
                ":" +
                checked_filter_value +
                "  (" +
                updated_count_checked_values +
                ")";
            } else {
              button.innerText = data.data.filter_column;
            }
          } else {
            select_all_input.checked = true;
            button.innerText =
              data.data.filter_column +
              ":" +
              checked_filter_value +
              "  (" +
              updated_count_checked_values +
              ")";

            // button.innerText = data.data.filter_column
          }
          // alert(input.value);
          var result = get_search_filters(e);
          console.log("RESULT");
          console.dir(result);
          if (result) {
            var listing_filters = result[0];
            var flag = result[1];
            if (!flag) {
              // if (Object.keys(listing_filters[0]).length > 0) {
              update_all_charts(listing_filters, "basket");
              update_search_checkbox_filter(e);
              show_datatable("", true, e);
            }
          }
        };
        // dropdownMenuDiv.appendChild(input);
        var actionsButton = document.createElement("button");
        actionsButton.className = "dropdown-item button-item";
        actionsButton.type = "button";
        actionsButton.innerText = data.data.filter_values[i];

        var onlyButton = document.createElement("button");
        onlyButton.id = data.data.filter_column;
        onlyButton.value = data.data.filter_values[i];
        onlyButton.className = "dropdown-item button-item only_btn";
        onlyButton.type = "button";
        onlyButton.innerText = "Only";
        onlyButton.setAttribute(
          "data-id",
          data.data.filter_column + ":" + data.data.filter_values[i]
        );
        onlyButton.onclick = function (e) {
          select_all_input.checked = false;
          //Update Count
          let updated_count_checked_values = 1;
          let checked_filter_value = e.target.value;
          if (checked_filter_value) {
            checked_filter_value = truncateString(checked_filter_value, 5);
          }
          button.innerText =
            data.data.filter_column +
            ":" +
            checked_filter_value +
            "  (" +
            updated_count_checked_values +
            ")";
          // select_all_input.checked = false;
          listing_filters = get_only_filters(e);

          if (listing_filters == undefined) {
            var result = get_filters(e);
            if (result) {
              listing_filters = result[0];
              var flag = result[1];
              if (!flag) {
                update_all_charts(listing_filters, "basket");
                update_search_checkbox_filter(e);
                show_datatable();
              }
            }
          } else {
            update_all_charts(listing_filters, "basket");
            update_search_checkbox_filter(e);
            show_datatable();
          }
          // console.dir(listing_filters,{'maxArrayLength':'none'});
          // update_all_charts(listing_filters)
          // update_search_checkbox_filter(e)
          // show_datatable('',true,e)
        };
        // Append the menu items to the dropdown menu div
        li.appendChild(input);
        li.appendChild(actionsButton);
        li.appendChild(onlyButton);
        dropdownMenuDiv.appendChild(li);

        let get_select_all_count = 0;
        let select_all_flag = false;
        let select_all_dropdown = event.target.closest(".dropdown");
        var select_all_checkboxes =
          select_all_dropdown.querySelectorAll(".checkbox-input");
        var get_select_all_checkbox =
          select_all_dropdown.querySelector("#select_all");
        if (get_select_all_checkbox) {
          for (var index = 0; index < select_all_checkboxes.length; index++) {
            if (!select_all_checkboxes[index].checked) {
              select_all_flag = true;
              get_select_all_checkbox.checked = false;
              break;
            } else {
              get_select_all_checkbox.checked = true;
              get_select_all_count += 1;
            }
          }
        }
        // if(get_select_all_count === select_all_checkboxes.length){
        //     if(select_all_flag == false){
        //         var get_select_all_checkbox = select_all_dropdown.querySelector('#select_all');
        //         if(get_select_all_checkbox){
        //             if(data.data.uncheckedValues > 0){
        //                 get_select_all_checkbox.checked = false;

        //             }else{
        //                 get_select_all_checkbox.checked = true;
        //             }
        //             // for (var index = 0; index < select_all_checkboxes.length; index++) {
        //             //     console.log(select_all_checkboxes[index].id)
        //             //     if (!select_all_checkboxes[index].checked) {
        //             //         get_select_all_checkbox.checked = false;
        //             //         console.log('Uncheck Values')
        //             //     }
        //             //     else{
        //             //         get_select_all_checkbox.checked = true;
        //             //     }
        //             // }
        //         }
        //     }

        // }
      }
      console.log("dropdown value in search: ", dropdownMenuDiv);
      if (more_pages === true) {
        load_more_data(
          dropdownDiv,
          dropdownMenuDiv,
          data,
          dashboard_id,
          column_name,
          project_id,
          searchvalue
        );
      }
      $(".delete_chart_spinner").addClass("d-none");
    } catch (error) {
      console.log(error);
      show_error(error);
    }
  })();
}
// Load More Data trigger when user click on Show More button.
function load_more_data(
  dropdownDiv,
  dropdownMenuDiv,
  data,
  dashboard_id,
  column_name,
  project_id,
  searchvalue
) {
  let button = document.createElement("button");
  button.id = "more_pages_" + data.data.filter_column;
  button.type = "button";
  button.innerText = "Show More";
  button.classList.add("btn", "btn-secondary");
  dropdownMenuDiv.appendChild(button);

  $("#more_pages_" + data.data.filter_column).on("click", function (e) {
    $(".delete_chart_spinner").removeClass("d-none");
    fetch(
      "/charts/filters/" +
        dashboard_id +
        "?filter_column=" +
        column_name +
        "&page=" +
        data.next +
        "&project_id=" +
        project_id +
        "&search_value=" +
        searchvalue
    )
      .then((response) => {
        // Handle unsuccessful response
        if (!response.ok) {
          throw new Error(response.status);
        }

        // Parse the response as JSON
        return response.json();
      })
      .then((data) => {
        let remove_previous_show_more_button = document.getElementById(
          "more_pages_" + data.data.filter_column
        );
        remove_previous_show_more_button.remove();
        $("#more_pages_" + data.data.filter_column).remove();
        for (let i = 0; i < data.data.filter_values.length; i++) {
          try {
            dropdownMenuDiv.querySelector("#select_all").checked = false;
          } catch (e) {
            console.log('');
          }

          // Create the dropdown menu items
          let li = document.createElement("li");
          let input = document.createElement("input");
          input.id = data.data.filter_column;
          input.type = "checkbox";
          input.className = "checkbox-input";
          input.value = data.data.filter_values[i];
          input.setAttribute(
            "data-id",
            data.data.filter_column + ":" + data.data.filter_values[i]
          );
          input.checked = false;
          input.onclick = function (e) {
            dropdownMenuDiv.querySelector("#select_all").checked = false;
            // select_all_input.checked = false;
            let dropdown = e.target.closest(".dropdown");
            var checkboxes = dropdown.querySelectorAll(".checkbox-input");
            let updated_count_checked_values = 0;
            let checked_filter_value;
            for (var i = 0; i < checkboxes.length; i++) {
              if (checkboxes[i].checked) {
                if (!checked_filter_value) {
                  checked_filter_value = checkboxes[i].value;
                }
                updated_count_checked_values += 1;
              }
            }
            if (checked_filter_value) {
              checked_filter_value = truncateString(checked_filter_value, 5);
            }
            var dropdownDiv = e.target.closest(".dropdown");
            var filter_button = dropdownDiv.querySelector("#dropdownMenu2");
            if (checkboxes.length != updated_count_checked_values) {
              if (checked_filter_value) {
                filter_button.innerText =
                  data.data.filter_column +
                  ":" +
                  checked_filter_value +
                  "  (" +
                  updated_count_checked_values +
                  ")";
              } else {
                filter_button.innerText = data.data.filter_column;
              }
            } else {
              select_all_input.checked = true;
              filter_button.innerText =
                data.data.filter_column +
                ":" +
                checked_filter_value +
                "  (" +
                updated_count_checked_values +
                ")";

              // button.innerText = data.data.filter_column
            }
            // alert(input.value);
            var result = get_search_filters(e);
            console.log("RESULT");
            console.dir(result);
            if (result) {
              var listing_filters = result[0];
              var flag = result[1];
              if (!flag) {
                // if (Object.keys(listing_filters[0]).length > 0) {
                update_all_charts(listing_filters, "basket");
                update_search_checkbox_filter(e);
                show_datatable("", true, e);
              }
            }
          };
          // dropdownMenuDiv.appendChild(input);
          var actionsButton = document.createElement("button");
          actionsButton.className = "dropdown-item button-item";
          actionsButton.type = "button";
          actionsButton.innerText = data.data.filter_values[i];
          // Append the menu items to the dropdown menu div
          li.appendChild(input);
          li.appendChild(actionsButton);
          var onlyButton = document.createElement("button");
          onlyButton.id = data.data.filter_column;
          onlyButton.value = data.data.filter_values[i];
          onlyButton.className = "dropdown-item button-item only_btn";
          onlyButton.type = "button";
          onlyButton.innerText = "Only";
          onlyButton.setAttribute(
            "data-id",
            data.data.filter_column + ":" + data.data.filter_values[i]
          );
          onlyButton.onclick = function (e) {
            dropdownMenuDiv.querySelector("#select_all").checked = false;
            updated_count_checked_values = 1;
            let checked_filter_value = e.target.value;
            if (checked_filter_value) {
              checked_filter_value = truncateString(checked_filter_value, 5);
            }

            var dropdownDiv = e.target.closest(".dropdown");
            var filter_button = dropdownDiv.querySelector("#dropdownMenu2");
            filter_button.textContent =
              data.data.filter_column +
              ":" +
              checked_filter_value +
              "  (" +
              updated_count_checked_values +
              ")";
            // select_all_input.checked = false;
            listing_filters = get_only_filters(e);
            console.log("Listing Filters");
            console.dir(listing_filters, { maxArrayLength: "none" });

            if (listing_filters == undefined) {
              var result = get_filters(e);
              if (result) {
                listing_filters = result[0];
                var flag = result[1];
                if (!flag) {
                  update_all_charts(listing_filters, "basket");
                  update_checkbox_filter(e);
                  show_datatable();
                }
              }
            } else {
              update_all_charts(listing_filters, "basket");
              update_checkbox_filter(e);
              show_datatable();
            }
          };
          li.appendChild(onlyButton);
          let dropdownMenuDiv = dropdownDiv.querySelector(".dropdown-menu");
          dropdownMenuDiv.appendChild(li);

          if (data.data.unchecked_values.includes(data.data.filter_values[i])) {
            input.checked = false;
          } else {
            // if(!selected_value)
            // {
            // selected_value = data.data.filter_values[i];
            // }
            input.checked = true;
            // count_checked_values += 1;
          }
        }
        let more_pages = data.more_pages;
        if (more_pages) {
          load_more_data(
            dropdownDiv,
            dropdownMenuDiv,
            data,
            dashboard_id,
            column_name,
            project_id,
            searchvalue
          );
        }
        $(".delete_chart_spinner").addClass("d-none");
      })
      .catch((error) => {
        console.log("error in filters file", error);
        show_error(error);
      });
  });
}
function filters_load_more_data(
  dropdownDiv,
  dropdownMenuDiv,
  data,
  dashboard_id,
  column_name,
  project_id
) {
  $(".delete_chart_spinner").removeClass("d-none");
  fetch(
    "/charts/filters/" +
      dashboard_id +
      "?filter_column=" +
      column_name +
      "&page=" +
      data.next +
      "&project_id=" +
      project_id
  )
    .then((response) => {
      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      dropdownMenuDiv.querySelector("#select_all").checked = false;
      let remove_previous_show_more_button = document.getElementById(
        "more_pages_" + data.data.filter_column
      );
      remove_previous_show_more_button.remove();
      $("#more_pages_" + data.data.filter_column).remove();
      for (let i = 0; i < data.data.filter_values.length; i++) {
        // Create the dropdown menu items
        let li = document.createElement("li");
        let input = document.createElement("input");
        input.id = data.data.filter_column;
        input.type = "checkbox";
        input.className = "checkbox-input";
        input.value = data.data.filter_values[i];
        input.setAttribute(
          "data-id",
          data.data.filter_column + ":" + data.data.filter_values[i]
        );
        if (data.data.unchecked_values.includes(data.data.filter_values[i])) {
          input.checked = false;
        } else {
          // if(!selected_value)
          // {
          // selected_value = data.data.filter_values[i];
          // }
          input.checked = true;
          // count_checked_values += 1;
        }

        input.onclick = function (e) {
          dropdownMenuDiv.querySelector("#select_all").checked = false;
          // select_all_input.checked = false;
          let dropdown = e.target.closest(".dropdown");
          var checkboxes = dropdown.querySelectorAll(".checkbox-input");
          let updated_count_checked_values = 0;
          let checked_filter_value;
          for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
              if (!checked_filter_value) {
                checked_filter_value = checkboxes[i].value;
              }
              updated_count_checked_values += 1;
            }
          }
          if (checked_filter_value) {
            checked_filter_value = truncateString(checked_filter_value, 5);
          }
          var dropdownDiv = e.target.closest(".dropdown");
          var filter_button = dropdownDiv.querySelector("#dropdownMenu2");
          if (checkboxes.length != updated_count_checked_values) {
            if (checked_filter_value) {
              filter_button.innerText =
                data.data.filter_column +
                ":" +
                checked_filter_value +
                "  (" +
                updated_count_checked_values +
                ")";
            } else {
              filter_button.innerText = data.data.filter_column;
            }
          } else {
            select_all_input.checked = true;
            filter_button.innerText =
              data.data.filter_column +
              ":" +
              checked_filter_value +
              "  (" +
              updated_count_checked_values +
              ")";

            // button.innerText = data.data.filter_column
          }
          // alert(input.value);
          var result = get_filters(e);
          console.log("RESULT");
          console.dir(result);
          if (result) {
            var listing_filters = result[0];
            var flag = result[1];
            if (!flag) {
              // if (Object.keys(listing_filters[0]).length > 0) {
              update_all_charts(listing_filters, "basket");
              update_search_checkbox_filter(e);
              show_datatable("", true, e);
            }
          }
        };
        // dropdownMenuDiv.appendChild(input);
        var actionsButton = document.createElement("button");
        actionsButton.className = "dropdown-item button-item";
        actionsButton.type = "button";
        actionsButton.innerText = data.data.filter_values[i];
        // Append the menu items to the dropdown menu div
        li.appendChild(input);
        li.appendChild(actionsButton);
        var onlyButton = document.createElement("button");
        onlyButton.id = data.data.filter_column;
        onlyButton.value = data.data.filter_values[i];
        onlyButton.className = "dropdown-item button-item only_btn";
        onlyButton.type = "button";
        onlyButton.innerText = "Only";
        onlyButton.setAttribute(
          "data-id",
          data.data.filter_column + ":" + data.data.filter_values[i]
        );
        onlyButton.onclick = function (e) {
          dropdownMenuDiv.querySelector("#select_all").checked = false;
          updated_count_checked_values = 1;
          let checked_filter_value = e.target.value;
          if (checked_filter_value) {
            checked_filter_value = truncateString(checked_filter_value, 5);
          }

          var dropdownDiv = e.target.closest(".dropdown");
          var filter_button = dropdownDiv.querySelector("#dropdownMenu2");
          filter_button.textContent =
            data.data.filter_column +
            ":" +
            checked_filter_value +
            "  (" +
            updated_count_checked_values +
            ")";
          // select_all_input.checked = false;
          listing_filters = get_only_filters(e);
          console.log("Listing Filters");
          console.dir(listing_filters, { maxArrayLength: "none" });

          if (listing_filters == undefined) {
            var result = get_filters(e);
            if (result) {
              listing_filters = result[0];
              var flag = result[1];
              if (!flag) {
                update_all_charts(listing_filters, "basket");
                update_checkbox_filter(e);
                show_datatable();
              }
            }
          } else {
            update_all_charts(listing_filters, "basket");
            update_checkbox_filter(e);
            show_datatable();
          }
        };
        li.appendChild(onlyButton);
        let dropdownMenuDiv = dropdownDiv.querySelector(".dropdown-menu");
        dropdownMenuDiv.appendChild(li);
        console.log("unchecked value", data.data.unchecked_values);
        console.log();
        if (data.data.unchecked_values.includes(data.data.filter_values[i])) {
          input.checked = false;
        } else {
          // if(!selected_value)
          // {
          // selected_value = data.data.filter_values[i];
          // }
          input.checked = true;
          // count_checked_values += 1;
        }
      }
      let more_pages = data.more_pages;
      if (more_pages) {
        let button = document.createElement("button");
        button.id = "more_pages_" + data.data.filter_column;
        button.type = "button";
        button.innerText = "Show More";
        button.classList.add("btn", "btn-secondary");
        dropdownMenuDiv.appendChild(button);

        $("#more_pages_" + data.data.filter_column).on("click", function (e) {
          filters_load_more_data(
            dropdownDiv,
            dropdownMenuDiv,
            data,
            dashboard_id,
            column_name,
            project_id
          );
        });
      }
      $(".delete_chart_spinner").addClass("d-none");
    })
    .catch((error) => {
      show_error(error);
    });
}
