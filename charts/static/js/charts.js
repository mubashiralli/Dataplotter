$(document).ready(function () {
  checkIfUserIsAdmin();
  checkIfUserIsViewer();
  //When user click on list button then all charts will be show in the list view
  $(".list_view").click(function (e) {
    if (localStorage.getItem("edit_view_value") === "false") {
      $(".switch .slider span:first-child").click();
    }
    localStorage.removeItem("edit_view_value");
    $(".switch").css("pointer-events", "unset");
    $(".read_only_message").fadeOut();
    let list_grid = document.getElementById("list_grid");
    if (list_grid) {
      list_grid.value = "list";
    } else {
      let input = document.createElement("input");
      input.id = "list_grid";
      input.type = "hidden";
      input.value = "list";
      document.body.appendChild(input);
    }
    $(".charts_container").removeClass("grid_view_con");
    $(".grid_view").removeClass("active");
    $(this).addClass("active");
    var elements = document.querySelectorAll(".charts_container > div");
    for (var i = 0; i < elements.length; i++) {
      var chartid = elements[i].id;
      elements[i].classList.remove("col-md-6");
      elements[i].classList.add("col-md-12");
      change_chart_size(chartid);
    }
  });
  //When user click on grid view button then all charts will be show in the grid view
  $(".grid_view").click(function (e) {
    var chosen_val = $(".switch input").prop("checked");
    if (chosen_val == false) {
      $(".switch .slider span:last-child").click();
    }
    $(".switch").css("pointer-events", "none");

    localStorage.setItem("edit_view_value", chosen_val);

    $(".read_only_message").fadeIn();
    let list_grid = document.getElementById("list_grid");
    if (list_grid) {
      list_grid.value = "grid";
    } else {
      let input = document.createElement("input");
      input.id = "list_grid";
      input.type = "hidden";
      input.value = "grid";
      document.body.appendChild(input);
    }
    $(".list_view").removeClass("active");
    $(this).addClass("active");
    $(".charts_container").addClass("grid_view_con");
    var elements = document.querySelectorAll(".charts_container > div");
    // console.log(elements);
    for (var i = 0; i < elements.length; i++) {
      var chartid = elements[i].id;
      elements[i].classList.remove("col-md-12");
      elements[i].classList.add("col-md-6");
      change_chart_size(chartid);
    }
    hideedit();
    $("#show_filter_panel").hide();
  });
  //When user change the slider value then change slider value
  var checkbox = document.querySelector('.switch input[type="checkbox"]');
  checkbox.addEventListener("change", function () {
    var sliderValue = this.checked ? "View" : "Edit";
    set_slider_value(sliderValue);
    if (sliderValue == "View") {
      hideedit();
      $("#show_filter_panel").hide();
    }
  });
  //Initialize select2 variables
  $("#dimension").select2(create_options_for_select2("dimension", "88%"));
  $("#breakdown_dimension").select2(
    create_options_for_select2("breakdown_dimension", "88%")
  );
  $("#metric").select2(create_options_for_select2("metric", "88%"));
  $("#sort").select2(create_options_for_select2("sort", "150px"));
  $("#secondary_sort").select2(
    create_options_for_select2("secondary_sort", "150px")
  );
  $("#filter_column").select2(
    create_options_for_select2("filter_column", "auto")
  );

  let chart_count = 0;
  const liElements = document.querySelectorAll(".custom-li");
  liElements.forEach((li) => {
    li.addEventListener("click", function () {
      chart_count += 1;
      const text = this.querySelector("a").textContent.trim();
      if (text === "Bar") {
        // Call a function for bar chart when user clicks on
        //chart_count is a global variable in which update count when create a chart,'1' is chart type,
        // Bar Chart is chart heading, 'bar' is js_name
        displayChart(chart_count, "1", "Bar Chart", "bar");
      } else if (text === "Stacked Bar") {
        // Call a function for stacked bar chart when user clicks on
        //chart_count is a global variable in which update count when create a chart,'1' is chart type,
        // Stacked Bar Chart is chart heading, 'stack' is js_name
        displayChart(chart_count, "1", "Stacked Bar Chart", "stack");
      } else if (text === "Line") {
        // Call a function for line chart when user clicks on
        //chart_count is a global variable in which update count when create a chart,'1' is chart type,
        // Line Chart is chart heading, 'line' is js_name
        displayChart(chart_count, "1", "Line Chart", "line");
      }
    });
  });
  //Reload Charts
  const dashboard_id = document.getElementById("dashID").value;
  const project_id = document.getElementById("project_id").value;
  $(".delete_chart_spinner").removeClass("d-none");
  fetch(`/charts/details/${dashboard_id}`)
    .then((response) => {
      if (!response.ok) throw new Error(response.status);
      return response.json();
    })
    .then((data) => {
      //Iterate over all charts that user created
      data.charts.forEach((chart) => {
        //create div for every chart
        create_div_for_graph(
          chart.chart_type,
          chart.id,
          chart.name,
          chart.js_name,
          chart.legend_postion
        );
        draw_chart(
          chart.id,
          chart.name,
          chart,
          chart.js_name,
          chart.legend_postion
        );
      });
      $(".delete_chart_spinner").addClass("d-none");
    })
    .catch((error) => {
      $(".delete_chart_spinner").addClass("d-none");
      show_error(error);
    });
  //Reload Filters
  (async () => {
    try {
      const response = await fetch(
        "/charts/createfilter/" +
          project_id +
          "?did=" +
          dashboard_id +
          "&mode=reload"
      );
      if (!response.ok) {
        throw new Error(response.status);
      }
      const data = await response.json();
      const fields = data.fields;
      pid = data.project_id;
      if (fields.length > 0) {
        $(".delete_chart_spinner").removeClass("d-none");
        //Iterate over all filters that we created
        for (const [index, field] of fields.entries()) {
          let column_name = field;
          const filtersResponse = await fetch(
            "/charts/filters/" +
              dashboard_id +
              "?filter_column=" +
              column_name +
              "&project_id=" +
              pid
          );
          if (!filtersResponse.ok) {
            throw new Error(filtersResponse.status);
          }
          const filtersData = await filtersResponse.json();
          $("#navbar").css("display", "block");
          // Draw the filter one by one.
          draw_filters(filtersData, column_name, dashboard_id);
          if (index + 1 == fields.length) {
            $(".delete_chart_spinner").addClass("d-none");
          }
        }
      }
    } catch (error) {
      show_error(error);
    }
  })();
  //Reload Basket
  fetch("/board/basket/" + project_id)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        $("#basket_navbar").css("display", "block");
        fetch("/board/selection/" + dashboard_id)
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.status);
            }
            return response.json();
          })
          .then((selected_data) => {
            show_created_basket_list(
              data,
              selected_data,
              dashboard_id,
              "basket_reload"
            );
          });
      }
    });
});
function get_slider_value() {
  var is_slider_exist = document.getElementById("slider_value");
  if (is_slider_exist !== null) {
    var slider_value = document.querySelectorAll("#slider_value");
    let lastsliderInput = slider_value[slider_value.length - 1];
    slider_value = lastsliderInput.value;
  } else {
    var checkbox = document.querySelector('input[type="checkbox"]');
    var slider_value = checkbox.checked ? "View" : "Edit";
  }
  return slider_value;
}

function draw_filters(data, column_name, dashboard_id) {
  if (get_slider_value() == "View") {
    $("#delete_filters_button").css("display", "none");
  }
  let project_id = document.getElementById("project_id").value;
  var filtersBtn = document.querySelector(".filtersbtn");
  var more_pages = data.more_pages;
  var dropdownDiv = document.createElement("div");
  dropdownDiv.className = "dropdown";
  dropdownDiv.id = data.data.id;
  var button = document.createElement("button");
  button.className = "cbtn bg_color_blue dropdown-toggle";
  button.type = "button";
  button.id = "dropdownMenu2";
  button.setAttribute("data-bs-toggle", "dropdown");
  button.setAttribute("aria-haspopup", "true");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", function (e) {
    edit_filter_panel(e);
  });
  dropdownDiv.appendChild(button);
  var dropdownMenuDiv = document.createElement("div");
  dropdownMenuDiv.className = "dropdown-menu";
  dropdownMenuDiv.setAttribute("aria-labelledby", "dropdownMenu2");
  dropdownMenuDiv.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  let searchLi = document.createElement("li");
  searchLi.className = "search-bar";
  let searchIconBtn = document.createElement("button");
  searchIconBtn.type = "button";
  searchIconBtn.innerHTML = '<i class="fas fa-search"></i>';
  searchIconBtn.style.border = "none";
  let searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "Search";
  searchInput.className = "search-input";
  searchInput.style.marginLeft = "4px";
  searchInput.addEventListener("input", function (e) {
    let searchTerm = e.target.value;
    filter_search_results(searchTerm, e);
  });
  searchLi.appendChild(searchIconBtn);
  searchLi.appendChild(searchInput);
  dropdownMenuDiv.appendChild(searchLi);
  let li = document.createElement("li");
  let select_all_input = document.createElement("input");
  select_all_input.id = "select_all";
  select_all_input.type = "checkbox";
  select_all_input.value = "Select All";
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
  dropdownDiv.appendChild(dropdownMenuDiv);
  filtersBtn.appendChild(dropdownDiv);
  let count_checked_values = 0;
  let selected_value;
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
      if (!selected_value) {
        selected_value = data.data.filter_values[i];
      }
      input.checked = true;
      count_checked_values += 1;
    }
    input.onclick = function (e) {
      select_all_input.checked = false;
      //Update Count
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

      var result = get_filters(e);
      if (result) {
        var listing_filters = result[0];
        var flag = result[1];
        if (!flag) {
          update_all_charts(listing_filters, "basket");
          update_checkbox_filter(e);
          show_datatable();
        }
      }
    };
    // dropdownMenuDiv.appendChild(input);
    var actionsButton = document.createElement("button");
    actionsButton.className = "dropdown-item button-item";
    actionsButton.title = data.data.filter_values[i];
    actionsButton.type = "button";
    actionsButton.innerText = data.data.filter_values[i];
    // Append the menu items to the dropdown menu div
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
    li.appendChild(input);
    li.appendChild(actionsButton);
    li.appendChild(onlyButton);
    dropdownMenuDiv.appendChild(li);
    // Append the dropdown menu div to the dropdown div
    dropdownDiv.appendChild(dropdownMenuDiv);
    // Append the dropdown div to the filtersbtn element
    filtersBtn.appendChild(dropdownDiv);
  }
  if (data.data.filter_values.length != count_checked_values) {
    if (selected_value) {
      selected_value = truncateString(selected_value, 5);
    } else {
      select_all_input.checked = false;
      selected_value = "";
    }
    button.innerText =
      data.data.filter_column +
      ":" +
      selected_value +
      "  (" +
      count_checked_values +
      ")";
  } else {
    button.innerText = data.data.filter_column;
    select_all_input.checked = true;
  }
  if (more_pages === true) {
    let button = document.createElement("button");
    button.id = "more_pages_" + data.data.filter_column;
    button.type = "button";
    button.innerText = "Show More";
    button.classList.add("btn", "btn-secondary");
    dropdownMenuDiv.appendChild(button);
    dropdownDiv.appendChild(dropdownMenuDiv);
    filtersBtn.appendChild(dropdownDiv);
    // $('#more_pages_' + data.data.filter_column).on('click', function (e) {
    //   filters_load_more_data(dropdownDiv,dropdownMenuDiv,data,dashboard_id,column_name,project_id);
    // });
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
}
function truncateString(inputString, maxLength) {
  return inputString.length > maxLength
    ? inputString.slice(0, maxLength) + "..."
    : inputString;
}
function create_delete_filters_button() {
  var filtersBtn = document.querySelector(".filtersbtn");
  let button = document.createElement("button");
  button.className = "cbtn bg_color_red delete-btn";
  button.type = "button";
  button.id = "delete_filters_button";
  button.innerHTML = '<i class = "fas fa-trash">';
  button.style.position = "absolute";
  button.style.right = "5px";
  button.style.top = "25px";
  button.addEventListener("click", function (e) {
    show_delete_all_filters_modal();
  });
  filtersBtn.appendChild(button);
}
function show_delete_all_filters_modal() {
  $("#confirmdeleteallfiltersModal").modal("show");
}
function delete_all_filters() {
  var filtersBtn = document.querySelector(".filtersbtn");
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let dropdowns = filtersBtn.querySelectorAll(".dropdown");
  $(".delete_chart_spinner").removeClass("d-none");
  dropdowns.forEach(function (dropdown) {
    let column_id = dropdown.id;
    let requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    };

    fetch("/charts/filters/" + column_id, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then((data) => {
        let filter_column = document.getElementById(column_id);
        filter_column.remove();
        const filtersbtnElement = document.querySelector(".filtersbtn");
        const dropdownCount =
          filtersbtnElement.querySelectorAll(".dropdown").length;
        if (dropdownCount == 0) {
          var result = get_filters();
          if (result) {
            var listing_filters = result[0];
            var flag = result[1];
            if (!flag) {
              update_all_charts(listing_filters, "basket");
              show_datatable();
            }
          }
          $(".navbar").hide();
          $("#show_filter_panel").css("display", "none");
          $("#confirmdeleteallfiltersModal").modal("hide");
          $(".delete_chart_spinner").addClass("d-none");
        }
      })
      .catch((error) => {
        show_error(error);
      });
  });
}
function create_filters(column_name, project_id, dashboard_id, csrfToken) {
  let requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      project_id: project_id,
      column_name: column_name,
      dashboard_id: dashboard_id,
    }),
  };
  $(".delete_chart_spinner").removeClass("d-none");
  fetch("/charts/filters", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      fetch(
        "/charts/filters/" +
          dashboard_id +
          "?filter_column=" +
          column_name +
          "&project_id=" +
          project_id
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.status);
          }
          return response.json();
        })
        .then((data) => {
          $("#navbar").css("display", "block");
          draw_filters(data, column_name, dashboard_id);
          $(".delete_chart_spinner").addClass("d-none");
        })
        .catch((error) => {
          show_error(error);
        });
    })
    .catch((error) => {
      show_error(error);
    });
}
function add_filters() {
  var slider_value = get_slider_value();
  // var is_slider_exist = document.getElementById('slider_value');
  // if (is_slider_exist !== null) {
  //   var slider_value = document.querySelectorAll('#slider_value');
  //   let lastsliderInput = slider_value[slider_value.length - 1];
  //   slider_value = lastsliderInput.value;
  // }
  // else {
  //   var checkbox = document.querySelector('input[type="checkbox"]');
  //   var slider_value = checkbox.checked ? 'View' : 'Edit';
  //   // console.log('Editing: '+ slider_value)
  // }
  if (slider_value == "View") {
    return;
  }
  let project_id = document.getElementById("project_id").value;
  let dashboard_id = document.getElementById("dashID").value;
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  fetch("/charts/createfilter/" + project_id + "?did=" + dashboard_id)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      let column_name = data.field;
      create_filters(column_name, project_id, dashboard_id, csrfToken);
    })
    .catch((error) => {
      show_error(error);
    });
}
function set_slider_value(slider_value) {
  let input = document.createElement("input");
  input.id = "slider_value";
  input.type = "hidden";
  input.value = slider_value;
  document.body.appendChild(input);
}
function scroll_newly_created_chart(chart_id) {
  $("html, body").animate(
    {
      scrollTop:
        $(".card-container-category-column:last").offset().top +
        $(".card-container-category-column:last").outerHeight(true),
    },
    100
  );
}
function show_breakdown_dimension(event) {
  $("#editbreakdowndimension").css("display", "block");
  $("#delete_breakdown_dimension").css("display", "block");
  var select2Dropdown = $("#breakdown_dimension").next(".select2-container");
  select2Dropdown.css("display", "block");
  var select2Dropdown = $("#breakdown_dimension")
    .next(".select2-container")
    .find(".select2-selection");
  select2Dropdown.trigger("click");
  $("#breakdown_dimension").val("").trigger("change");
  $("#add_breakdown_dimension").css("display", "none");
  event.preventDefault();
}
function show_metric_modal(val) {
  $("#editmetricModal").modal("show");
  $("#editmetricModal .modal-header").empty();
  var selectedValue = $(this).next("select").val();
  var labelText = $(this).find(".default-icon b").text();
  let heading_tag = document.createElement("h5");
  heading_tag.classList.add("modal-title");
  heading_tag.id = "modal_heading";
  heading_tag.textContent = selectedValue;
  $("#editmetricModal .modal-header").append(heading_tag);
  var closeButton = document.createElement("button");
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("class", "close");
  closeButton.setAttribute("data-bs-dismiss", "modal");
  closeButton.setAttribute("aria-label", "Close");
  var closeIcon = document.createElement("span");
  closeIcon.setAttribute("aria-hidden", "true");
  closeIcon.innerHTML = "&times;";
  closeButton.appendChild(closeIcon);
  $("#editmetricModal .modal-header").append(closeButton);
  $("#editmetricModal .modal-body").empty();
  let small = document.createElement("small");
  small.textContent = "Aggregation";
  $("#editmetricModal .modal-body").append(small);
  let br = document.createElement("br");
  $("#editmetricModal .modal-body").append(br);
  var options = ["sum", "avg", "Max", "Min", "count"];
  let editmetricoperation = document.getElementById(
    "editmetricoperation"
  ).value;
  for (var i = 0; i < options.length; i++) {
    let label = document.createElement("label");
    let input = document.createElement("input");
    let breakline = document.createElement("br");
    input.type = "radio";
    input.id = "aggregation";
    input.value = options[i].toLowerCase();
    input.name = "aggregation";
    if (val) {
      if (options[i].toLowerCase() === val) {
        input.checked = true;
      }
    } else if (options[i].toLowerCase() === editmetricoperation) {
      input.checked = true;
    }
    input.addEventListener("change", function (e) {
      let chart_heading =
        document.getElementById("edit_chart_heading").textContent;
      updatechart(e.target.id, chart_heading);
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + options[i]));
    $("#editmetricModal .modal-body").append(label);
    $("#editmetricModal .modal-body").append(breakline);
  }
}
function create_div_for_graph(
  id,
  chart_id,
  chart_heading,
  js_name,
  legend_position
) {
  const class_exist = document.querySelector(".col-xl-8");
  let charts_class = "";
  if (class_exist) {
    charts_class = ".col-xl-8";
  } else {
    charts_class = ".col-xl-12";
  }
  $(charts_class + ":last").append(
    '\
    <div class="card card-container-category-column" id="' +
      chart_id +
      '">\
        <div class="card-body">\
          <div class="charts_spinner text-center d-none"></div>\
            <h4 class="chart_heading"></h4>\
            <div id="chart' +
      chart_id +
      '" class="chart_container" style="height: 500px;" onclick="editchart(\'' +
      id +
      "'," +
      chart_id +
      ",'" +
      chart_heading +
      "','" +
      js_name +
      "','" +
      legend_position +
      '\');"></div>\
            <div id="magicTypeContainer"></div>\
        </div>\
    </div>'
  );
  var cardWidth = $("#" + chart_id)
    .find(".card-body")
    .width();
  $("#chart" + chart_id).css("width", cardWidth + "px");
}
function change_chart_size(chart_id) {
  var cardWidth = $("#" + chart_id)
    .find(".card-body")
    .width();
  const chartElements = document.querySelectorAll(".chart_container");
  chartElements.forEach(function (element) {
    let chartInstance = echarts.getInstanceByDom(element);
    if (chartInstance) {
      chartInstance.resize({ width: cardWidth });
    }
  });
}
function editchart(id, chart_id, chart_heading, js_name, legend_position) {
  if (
    get_slider_value() === "View" ||
    ($("#list_grid") && $("#list_grid").val() === "grid")
  ) {
    return;
  }
  let secondary_sort = document.getElementById("secondary_sort").value;
  if (!secondary_sort) {
    $("#secondary_sort").val("ASC").trigger("change");
  }
  var chartElement = document.getElementById("chart" + chart_id);
  chartElement.addEventListener("click", function (event) {
    localStorage.setItem("legends_clicked", false);
  });
  let legend_clicked = localStorage.getItem("legends_clicked");
  if (legend_clicked == "false") {
    var canvas_chart_element = document.getElementById("chart" + chart_id);
    // Get the ECharts instance associated with the chart element
    var e_charts = echarts.getInstanceByDom(canvas_chart_element);

    $("#show_edit_panel").css("display", "block");
    // $('html, body').animate({
    //   scrollTop: $('#show_edit_panel').offset().top + $('#show_edit_panel').height()
    // });
    var slider_value = get_slider_value();
    if (slider_value == "View") {
      return;
    } else {
      let list_grid = document.getElementById("list_grid");
      if (list_grid) {
        if (list_grid.value == "grid") {
          return;
        }
      }
    }
    var elements = document.querySelectorAll(".col-xl-12");
    $("#edit_chart_type").text(js_name);
    var selectElement = document.getElementById("legend_position");

    // Get the current options of the chart
    var echart_options = e_charts.getOption();
    console.dir(echart_options, { maxArrayLength: "none" });
    let legendPosition = echart_options.legend[0].top;
    if (legendPosition) {
      selectElement.value = "top";
    } else {
      legendPosition = echart_options.legend[0].bottom;
      selectElement.value = "bottom";
    }
    for (var i = 0; i < elements.length; i++) {
      elements[i].className = elements[i].className.replace(
        "col-xl-12",
        "col-xl-8"
      );
    }
    change_chart_size(chart_id);
    // var tableheight = $('#datatables').height()
    // if (tableheight > 100) {
    //   tableheight = tableheight;
    // } else {
    //   tableheight = 0;
    // }
    setTimeout(function (e) {
      $(".box_close").css("top", 20);
    }, 500);
    function boxtothetop() {
      var windowTop = $(window).scrollTop();
      var top;
      try {
        top = $(".col-xl-8 div:first-child").offset().top;
      } catch (error) {
        top = $(".col-xl-12 div:first-child").offset().top;
      }
      if (windowTop > top - 100) {
        $("#show_edit_panel").addClass("right_sidebar_fixed");
      } else {
        $("#show_edit_panel").removeClass("right_sidebar_fixed");
      }
    }
    $(function () {
      $(window).scroll(boxtothetop);
      boxtothetop();
    });
    const chartElement = document.getElementById("chart" + chart_id);
    const chart = echarts.getInstanceByDom(chartElement);
    const options = chart.getOption();
    var titleText = options.title[0].text;
    let edit_chart_heading = document.getElementById("edit_chart_heading");
    edit_chart_heading.textContent = titleText;

    let project_id = document.getElementById("project_id").value;
    if (!project_id) {
      project_id = document
        .getElementById("project_id")
        .getAttribute("data-id");
    }
    let chartInputs = document.querySelectorAll('input[id="chart_id"]');
    var colDiv = document.getElementsByClassName("col-xl-8")[0];
    var total_charts_created = colDiv.getElementsByClassName("card").length;
    let panel_chart_id;
    if (total_charts_created > 1) {
      // User Creates One or more charts
      if (chartInputs.length == 0) {
        // Check User open editing panel or not if 0 means no editing panel is open yet
        check = 1;
      } else {
        let lastchartInput = chartInputs[chartInputs.length - 1];
        panel_chart_id = lastchartInput.getAttribute("data-id");
      }
    } else {
      panel_chart_id = chart_id;
    }
    var check = 0;
    if (chartInputs.length == 0) {
      check = 1;
    } else {
      if (chart_id == panel_chart_id) {
        //console.log('Same Panel is already open')
      } else {
        check = 1;
      }
    }
    let get_form = document.getElementById("edit_chart");
    let input = document.createElement("input");
    input.type = "hidden";
    input.id = "chart_id";
    input.setAttribute("data-id", chart_id);
    get_form.appendChild(input);
    if (check == 1) {
      const projectId = project_id;
      const chartId = chart_id;
      const url = `/charts/${projectId}?chartid=${chartId}`;
      $(".spinner1").removeClass("d-none");
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.status);
          }
          return response.json();
        })
        .then((data) => {
          let columns = data.fields;
          const selectdimension = document.getElementById("dimension");
          const selectbreakdowndimension = document.getElementById(
            "breakdown_dimension"
          );
          const selectmetricdimension = document.getElementById("metric");
          let columns_datatype = {
            DateField: "Date",
            CharField: "ABC",
            TextField: "ABC",
            FloatField: "123",
            IntegerField: "123",
          };
          let dimensionCount;
          if ($(selectdimension).data("select2")) {
            dimensionCount = $(selectdimension).select2("data").length;
          }
          let breakdowndimensionCount;
          if ($(selectdimension).data("select2")) {
            breakdowndimensionCount = $(selectbreakdowndimension).select2(
              "data"
            ).length;
          }
          let metricCount;
          if ($(selectdimension).data("select2")) {
            metricCount = $(selectmetricdimension).select2("data").length;
          }
          for (var key in columns) {
            if (columns.hasOwnProperty(key)) {
              var fieldType = columns[key];
              fieldType = columns_datatype[fieldType];
              if (dimensionCount == 0) {
                insert_fields_into_select2(selectdimension, fieldType, key);
              }
              if (breakdowndimensionCount == 0) {
                insert_fields_into_select2(
                  selectbreakdowndimension,
                  fieldType,
                  key
                );
              }
              if (metricCount == 0) {
                insert_fields_into_select2(
                  selectmetricdimension,
                  fieldType,
                  key
                );
              }
            }
          }
          let metricOptionElement = document.createElement("option");
          metricOptionElement.value = "count";
          metricOptionElement.textContent = "Record Count";
          selectmetricdimension.appendChild(metricOptionElement);
          if (data.chart.breakdown) {
            $("#add_breakdown_dimension").css("display", "none");
            $("#editbreakdowndimension").css("display", "block");
            $("#delete_breakdown_dimension").css("display", "block");
            var select2Dropdown = $("#breakdown_dimension").next(
              ".select2-container"
            );
            select2Dropdown.css("display", "block");
            if (data.chart.secondary_sort) {
              $(".secondary_sort_container").css("display", "block");
              $(".value_sort").removeClass("d-none");
              $("#secondary_sort").select2(
                create_options_for_select2("secondary_sort", "150px")
              );
              $("#secondary_sort").css("display", "block");
              $("#secondary_sort")
                .val(data.chart.secondary_sort)
                .trigger("change");
            }
          } else {
            $("#editbreakdowndimension").css("display", "none");
            $("#delete_breakdown_dimension").css("display", "none");
            var select2Dropdown = $("#breakdown_dimension").next(
              ".select2-container"
            );
            select2Dropdown.css("display", "none");
            var select2Dropdown = $("#breakdown_dimension")
              .next(".select2-container")
              .find(".select2-selection");
            select2Dropdown.trigger("click");
            $("#breakdown_dimension").val("").trigger("change");
            $("#breakdown_dimension").select2({
              theme: "classic",
              templateSelection: function (option) {
                // Check if the option is empty or disabled
                if (!option.id || option.disabled) {
                  return option.text;
                }
                let container = $('<div class="custom-option"></div>');
                container.html(option.text);
                return container;
              },
            });
            $("#add_breakdown_dimension").css("display", "block");
            $(".value_sort").addClass("d-none");
            const select2Element = $("#secondary_sort");
            if (select2Element.hasClass("select2-hidden-accessible")) {
              select2Element.select2("destroy");
            }
            $("#secondary_sort").hide();
          }
          $("#editmetricoperation").val(data.chart.metric);
          $("#editmetric b").text(data.chart.metric);
          $("#editmetricModal").css("visibility", "hidden");
          show_metric_modal(data.chart.metric);
          setTimeout(function (e) {
            $("#editmetricModal").modal("hide");
            $("#editmetricModal").css("visibility", "unset");
          }, 500);

          if (data.chart.tds == true) {
            $("#dimension_sort_flag").prop("checked", true);
          } else {
            $("#dimension_sort_flag").prop("checked", false);
          }
          $("#dimension").val(data.chart.dimension).trigger("change");
          $("#breakdown_dimension").val(data.chart.breakdown).trigger("change");
          $("#metric")
            .val(data.chart.metric_column || "count")
            .trigger("change");
          $("#sort").val(data.chart.sorting).trigger("change");
        })
        .catch((error) => {
          show_error(error);
        });
      $(".spinner1").addClass("d-none");
    }
  }
}
function hideedit(id) {
  $("#show_edit_panel").css("display", "none");
  var elements = document.querySelectorAll(".col-xl-8");
  for (var i = 0; i < elements.length; i++) {
    elements[i].className = elements[i].className.replace(
      "col-xl-8",
      "col-xl-12"
    );
  }
  let chart_id = document
    .querySelector(".chart_container")
    .getAttribute("id")
    .replace("chart", "");
  change_chart_size(chart_id);
}
$("#delete_chart").on("click", function (e) {
  $("#confirmdeletechartModal").modal("show");
  $("#confirmdeletechartModal .modal-header").empty();
  var h5Element = document.createElement("h5");
  h5Element.classList.add("modal-title");
  h5Element.id = "confirmModalLabel";
  h5Element.textContent = "Confirm";
  var buttonElement = document.createElement("button");
  buttonElement.setAttribute("type", "button");
  buttonElement.classList.add("close");
  buttonElement.setAttribute("data-bs-dismiss", "modal");
  buttonElement.setAttribute("aria-label", "Close");
  var spanElement = document.createElement("span");
  spanElement.setAttribute("aria-hidden", "true");
  spanElement.innerHTML = "&times;";
  buttonElement.appendChild(spanElement);
  let modal_header = document.getElementById("confirmdeletechartModal");
  var modalHeader = modal_header.querySelector(".modal-header");
  modalHeader.appendChild(h5Element);
  modalHeader.appendChild(buttonElement);
});
function delete_chart() {
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let chartInputs = document.querySelectorAll('input[id="chart_id"]');
  let lastchartInput = chartInputs[chartInputs.length - 1];
  let chart_id = lastchartInput.getAttribute("data-id");
  var elements = document.querySelectorAll(".col-xl-8");
  for (var i = 0; i < elements.length; i++) {
    elements[i].className = elements[i].className.replace(
      "col-xl-8",
      "col-xl-12"
    );
  }
  $("#show_edit_panel").css("display", "none");
  change_chart_size(chart_id);
  var element = document.getElementById(chart_id);
  element.remove();
  //AJAX RUN
  let requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  };
  $(".delete_chart_spinner").removeClass("d-none");
  fetch("/charts/" + chart_id, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      $(".delete_chart_spinner").addClass("d-none");
      $("#confirmdeletechartModal").modal("hide");
    })
    .catch((error) => {
      show_error(error);
    });
}

function draw_chart(
  chart_id,
  chart_heading,
  data,
  chart_type,
  legend_position
) {
  // console.log('Data:', data);
  let x = data.x;
  let y = data.y;
  let legends = [];
  let series_data = [];
  for (var key in y) {
    if (y.hasOwnProperty(key)) {
      var values = y[key];

      json_object = {};
      legends.push(key);
      json_object["name"] = key;
      json_object["type"] = chart_type == "stack" ? "bar" : chart_type;
      chart_type == "stack"
        ? (json_object["stack"] = "stack")
        : (json_object["emphasis"] = {
            focus: "series",
            scale: true,
            scaleSize: 50,
          });
      json_object["data"] = values;
      json_object["barGap"] = 0;
      // json_object['label'] = labelOption;
      series_data.push(json_object);
    }
  }
  // console.log('series_Data', series_data);
  var barchartDom = document.getElementById("chart" + chart_id);
  var barChart = echarts.init(barchartDom);
  var currentOptions = barChart.getOption();
  if (currentOptions) {
    // Clear the series data
    currentOptions.series = [];
    barChart.setOption(currentOptions, true); // Use true to merge the new options
  }
  option = {
    dataZoom: [
      // {
      //   type: 'slider'
      // },
      // {
      //   type: 'inside'
      // }
    ],
    grid: {
      left: 0,
      right: "5%",
      top: "20%",
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
      top: "6%",

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
    // console.log('legends are selected: ', selectedSeriesName)
    localStorage.setItem("legends_clicked", true);
    // setTimeout(function(){
    //   $('#show_edit_panel').css('display', 'none');
    // },10)

    // Perform your additional functionality here based on the selectedSeriesName
  });
  localStorage.setItem("legends_clicked", false);
  if (!legend_position == undefined) {
    legend_position = "top";
  }
  if (legend_position == "top") {
    barChart.setOption({
      legend: {
        top: "6%",
        orient: "horizontal",
      },
    });
  } else if (legend_position == "bottom") {
    barChart.setOption({
      legend: {
        orient: "horizontal",
        bottom: 0,
      },
    });
  }
}
function displayChart(chart_id, chart_type, chart_heading, js_name) {
  let project_id = document.getElementById("project_id").value;
  let dashboard_id = parseInt(document.getElementById("dashID").value);
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  if (!project_id) {
    project_id = document.getElementById("project_id").getAttribute("data-id");
  }
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
  // filters = get_filters()[0]
  // console.log('Filters: ', filters)
  let basket_id;
  let basket_btn = document.querySelector(".basketbtn");
  var dropdowns = basket_btn.querySelectorAll("#basket_list");
  dropdowns.forEach(function (dropdown) {
    let allChecked = true;
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        checkboxes[i].checked = true;
        basket_id = checkboxes[i].id;
        break;
      }
    }
  });
  let requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      name: chart_heading,
      js_name: chart_type,
      chart_type: chart_type,
      dashboard: dashboard_id,
    }),
  };
  // Same AJAX call(TrendBar) to display Bar Chart
  fetch("/charts/details", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      chart_id = data.response.chartpk;
      let pid = data.response.project_id;
      let dimension = data.response.dimension;
      let metric = data.response.metric;
      let requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          pid: pid,
          Dimension: dimension,
          Operation: metric,
          Filters: listing_filters,
          basket: basket_id,
        }),
      };
      fetch("/charts/", requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.status);
          }
          return response.json();
        })
        .then((data) => {
          create_div_for_graph(chart_type, chart_id, chart_heading, js_name);
          $(".spinner").removeClass("d-none");
          js_name == "stack"
            ? draw_chart(chart_id, chart_heading, data, "bar")
            : draw_chart(chart_id, chart_heading, data, js_name);
          $(".spinner").addClass("d-none");
          let requestOptions = {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
              name: chart_heading,
              js_name: js_name,
              filters: listing_filters,
              chart_type: "1",
              dimension: dimension,
              metric: "count",
              breakdown: null,
              metric_column: null,
              sorting: "ASC",
              x: data.x,
              y: data.y,
            }),
          };
          fetch("/charts/" + chart_id, requestOptions)
            .then((response) => {
              if (!response.ok) {
                throw new Error(response.status);
              }
              return response.json();
            })
            .then((data) => {})
            .catch((error) => {
              console.error("Error:", error.message);
              $("#failureModal").modal("show");
              const h4Element = document.querySelector(
                "#failureModal .modal-body h4"
              );
              if (h4Element) {
                // Update the text content of the h4 element
                h4Element.textContent = error.message;
              }
            });
        })
        .catch((error) => {
          console.error("Error:", error.message);
          $("#failureModal").modal("show");
          const h4Element = document.querySelector(
            "#failureModal .modal-body h4"
          );
          if (h4Element) {
            // Update the text content of the h4 element
            h4Element.textContent = error.message;
          }
        });
    })
    .catch((error) => {
      // Handle the error
      console.error("Error:", error.message);
      $("#failureModal").modal("show");
      const h4Element = document.querySelector("#failureModal .modal-body h4");
      if (h4Element) {
        h4Element.textContent = error.message;
      }
    });
  scroll_newly_created_chart();
}
function ChangeLegendPosition(e) {
  let chartInputs = document.querySelectorAll('input[id="chart_id"]');
  let lastchartInput = chartInputs[chartInputs.length - 1];
  let chart_id = lastchartInput.getAttribute("data-id");
  var myChart = echarts.getInstanceByDom(
    document.getElementById("chart" + chart_id)
  );
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  var currentOption = myChart.getOption();
  let project_id = document.getElementById("project_id").value;
  if (!project_id) {
    project_id = document.getElementById("project_id").getAttribute("data-id");
  }
  let legend_position = e.value;
  var selectElement = document.getElementById("legend_position");
  selectElement.value = legend_position;
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
  } else if (legend_position == "left") {
    myChart.setOption({
      legend: {
        orient: "vertical",
        left: "left",
        top: "middle",
        itemHeight: 12,
      },
      yAxis: {
        offset: 20,
      },
    });
  } else if (legend_position == "right") {
    myChart.setOption({
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
      },
    });
  }

  let dimension = document.getElementById("dimension").value;
  let breakdown_dimension = document.getElementById(
    "breakdown_dimension"
  ).value;
  let metric = document.getElementById("metric").value;
  if (metric == "count") {
    metric = null;
  }
  let operation;
  var radioButtons = document.getElementsByName("aggregation");
  if (radioButtons.length > 0) {
    for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        operation = radioButtons[i].value;
        break;
      }
    }
  } else {
    operation = "count";
  }
  let sort = document.getElementById("sort").value;
  let js_name = document.getElementById("edit_chart_type").value;
  let name = document.getElementById("edit_chart_heading").textContent;
  const projectId = project_id;
  let postrequestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      pid: project_id,
      Dimension: dimension,
      Breakdown: breakdown_dimension !== "" ? breakdown_dimension : undefined,
      Metric: metric !== "" ? metric : undefined,
      Operation: operation,
      Sort: sort,
    }),
  };
  $("#" + chart_id + " .charts_spinner").removeClass("d-none");
  fetch("/charts/", postrequestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      let requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          name: name,
          js_name: js_name,
          filters: null,
          chart_type: "1",
          dimension: dimension,
          metric: operation,
          breakdown:
            breakdown_dimension !== "" ? breakdown_dimension : undefined,
          metric_column: metric,
          sorting: sort,
          x: data.x,
          y: data.y,
          legend_postion: legend_position,
        }),
      };
      fetch("/charts/" + chart_id, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.status);
          }
          return response.json();
        })
        .then((data) => {
          $("#" + chart_id + " .charts_spinner").addClass("d-none");
        })
        .catch((error) => {
          console.error("Error:", error.message);
          $("#failureModal").modal("show");
          const h4Element = document.querySelector(
            "#failureModal .modal-body h4"
          );
          if (h4Element) {
            h4Element.textContent = error.message;
          }
        });
    })
    .catch((error) => {
      console.error("Error:", error.message);
      $("#failureModal").modal("show");
      const h4Element = document.querySelector("#failureModal .modal-body h4");
      if (h4Element) {
        h4Element.textContent = error.message;
      }
    });
}
$("#metric, #dimension, #breakdown_dimension, #sort").on(
  "select2:select",
  function (e) {
    let targetid = e.target.id;
    let chart_heading = $("#" + targetid)
      .closest(".card-body")
      .find("h4")
      .text();
    localStorage.setItem("delete_breakdown_dimension", false);
    updatechart(targetid, chart_heading);
  }
);
$("#secondary_sort").on("select2:select", function (e) {
  let targetid = e.target.id;
  let chart_heading = $("#" + targetid)
    .closest(".card-body")
    .find("h4")
    .text();
  updatechart(targetid, chart_heading);
});
$("#dimension_sort_flag").on("change", function (e) {
  let targetid = e.target.id;
  let chart_heading = $("#" + targetid)
    .closest(".card-body")
    .find("h4")
    .text();
  updatechart(targetid, chart_heading);
});
$("#edit_chart_heading").on("blur", function (e) {
  let targetid = e.target.id;
  const editChartHeading = document.getElementById("edit_chart_heading");
  const newChartHeading = editChartHeading.textContent;
  chart_heading = newChartHeading;
  updatechart(targetid, chart_heading);
});
$("#delete_breakdown_dimension").on("click", function (e) {
  $("#editbreakdowndimension").css("display", "none");
  var select2Dropdown = $("#breakdown_dimension").next(".select2-container");
  select2Dropdown.css("display", "none");
  var select2Dropdown = $("#breakdown_dimension")
    .next(".select2-container")
    .find(".select2-selection");
  select2Dropdown.trigger("click");
  $("#breakdown_dimension").val("").trigger("change");
  $("#breakdown_dimension").select2({
    theme: "classic",
    templateSelection: function (option) {
      // Check if the option is empty or disabled
      if (!option.id || option.disabled) {
        return option.text;
      }
      let container = $('<div class="custom-option"></div>');

      container.html(option.text);
      return container;
    },
  });
  localStorage.setItem("delete_breakdown_dimension", true);
  $(".secondary_sort_container").css("display", "none");
  $(".secondary_sort_container").removeClass("d-none");
  $(".value_sort").css("display", "none");
  $("#secondary_sort").select2("destroy");
  $("#secondary_sort").next(".select2-container").hide();
  $("#delete_breakdown_dimension").css("display", "none");
  $("#add_breakdown_dimension").css("display", "block");
  event.preventDefault();
  let targetid = e.target.id;
  const editChartHeading = document.getElementById("edit_chart_heading");
  const newChartHeading = editChartHeading.textContent;
  chart_heading = newChartHeading;
  updatechart(targetid, chart_heading, "");
});
function updatechart(targetid, chart_heading, js_name) {
  let edit_chart_type = document.getElementById("edit_chart_type").textContent;
  var form = document.getElementById("dashboard_form");
  var csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let project_id = document.getElementById("project_id").value;
  $("#edit_chart_heading").textContent = chart_heading;
  if (!project_id) {
    project_id = document.getElementById("project_id").getAttribute("data-id");
  }
  let dimension = document.getElementById("dimension").value;
  let breakdown_dimension = document.getElementById(
    "breakdown_dimension"
  ).value;
  let metric = document.getElementById("metric").value;
  if (metric == "count") {
    metric = "";
  }
  let operation;
  var radioButtons = document.getElementsByName("aggregation");
  if (radioButtons.length > 0) {
    for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        operation = radioButtons[i].value;
        break;
      }
    }
  } else {
    operation = "count";
  }
  $("#editmetric b").text(operation);
  $("#editmetricoperation").val(operation);
  let sort = document.getElementById("sort").value;
  let secondary_sort = document.getElementById("secondary_sort").value;
  let dimension_sort_flag = document.getElementById("dimension_sort_flag");
  if (dimension_sort_flag.checked) {
    dimension_sort_flag = true;
  } else {
    dimension_sort_flag = false;
  }

  let legend_position = document.getElementById("legend_position").value;
  let chartInputs = document.querySelectorAll('input[id="chart_id"]');
  let lastchartInput = chartInputs[chartInputs.length - 1];
  let chart_id = lastchartInput.getAttribute("data-id");
  // filters = get_filters()
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
  let basket_id;
  // let listing_filters = []
  let basket_btn = document.querySelector(".basketbtn");
  var dropdowns = basket_btn.querySelectorAll("#basket_list");
  dropdowns.forEach(function (dropdown) {
    let allChecked = true;
    var checkboxes = dropdown.querySelectorAll(".checkbox-input");
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        checkboxes[i].checked = true;
        basket_id = checkboxes[i].id;
        break;
      }
    }
  });
  if (!listing_filters) {
    if (basket_id) {
      listing_filters = [{}];
    } else {
      listing_filters = null;
    }
  } else {
    listing_filters = listing_filters;
  }
  if (!secondary_sort) {
    secondary_sort = "ASC";
  }
  let secondary = document.getElementById("secondary_sort").value;
  if (!secondary_sort) {
    $("#secondary_sort").val("ASC").trigger("change");
  }
  let requestOptions;
  requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      pid: project_id,
      Filters: listing_filters,
      Dimension: dimension,
      Breakdown: breakdown_dimension !== "" ? breakdown_dimension : undefined,
      Metric: metric !== "" ? metric : undefined,
      Operation: operation,
      Sort: sort,
      secondary_sort: secondary_sort,
      tds: dimension_sort_flag,
      basket: basket_id,
    }),
  };

  if (dimension !== breakdown_dimension) {
    let click_breakdown_dimension = localStorage.getItem(
      "delete_breakdown_dimension"
    );
    if (click_breakdown_dimension == "true") {
      $(".secondary_sort_container").css("display", "none");
    } else {
      if (breakdown_dimension !== "") {
        $(".secondary_sort_container").css("display", "block");
        $("#secondary_sort").select2({
          theme: "classic",
          width: "150px",
        });
        $("#secondary_sort").show();
        $(".value_sort").removeClass("d-none");
        $(".value_sort").css("display", "block");
      }
    }

    $(".dimension_style").addClass("d-none");
    $("#" + chart_id + " .charts_spinner").removeClass("d-none");
    fetch("/charts/", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then((data) => {
        const chartElement = document.getElementById("chart" + chart_id);
        const chart = echarts.getInstanceByDom(chartElement);
        const options = chart.getOption();
        const series = options.series;
        let seriesType = series[0].type;
        // console.log(seriesType)
        draw_chart(chart_id, chart_heading, data, seriesType, legend_position);
        let requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            name: chart_heading,
            filters: listing_filters,
            js_name: seriesType,
            filters: null,
            chart_type: "1",
            dimension: dimension,
            metric: operation,
            breakdown: breakdown_dimension !== "" ? breakdown_dimension : null,
            metric_column: metric !== "" ? metric : null,
            sorting: sort,
            secondary_sort: secondary_sort,
            tds: dimension_sort_flag,
            x: data.x,
            y: data.y,
          }),
        };
        fetch("/charts/" + chart_id, requestOptions)
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.status);
            }
            return response.json();
          })
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
  } else {
    $(".dimension_style").removeClass("d-none");
  }
}
