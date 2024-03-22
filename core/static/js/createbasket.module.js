arr = Array();
var select = $("#car_make").selectize({
  plugins: ["remove_button"],
  maxItems: 300,
});
var car_model_select = $("#car_model").selectize({
  plugins: ["remove_button"],
  maxItems: 300,
});

$(document).ready(function () {
  $("#form_is").submit(function (event) {
    event.preventDefault(); // Prevent the form from submitting via the browser
    var form = $(this);
    var formData = new FormData(form[0]);
    console.log("event , ", formData);
    // $.ajax({
    //     type: 'POST',
    //     url: event.target.action,
    //     data: $(this).serialize(),
    //     success: function(response) {
    //         console.log(response); // Handle the successful response
    //     },
    //     error: function(xhr, status, error) {
    //         console.log(xhr.responseText); // Handle the error response
    //     }
    // });
  });
});
// function submitForm(){

//     console.log('submit is clicked');
//     // const formData = new FormData(event.target);
//     // console.log('Form Data: ',formData);
//     // console.log('event target ',event.target.method);
// }
// function update_basket(event,project_id){
//     event.preventDefault();
//     console.log('update_basket = ',project_id);
// }
function typeoffinance(date, project_id) {
  //first
  date = date.value;
  $("#tof").empty();
  $("#car_make").empty();
  $("#car_model").empty();
  axios({
    method: "GET",
    url: "/finances?date=" + date + "&pid=" + project_id + "&type=Finance",
  }).then(function (response) {
    div = document.getElementById("tof");
    // $("#tof").empty();
    select[0].selectize.clear();
    car_model_select[0].selectize.clear();
    // $("#car_model").empty();
    div.innerHTML += "<option>Select Type of Finance</option>";
    arr2 = response.data.FinanceType;

    for (var i = 0; i < arr2.length; i++) {
      div.innerHTML +=
        '<option value="' + arr2[i] + '">' + arr2[i] + "</option>";
    }
  });
}
function car_models(e, project_id) {
  //last
  var car_modal_selectize = car_model_select[0].selectize;
  car_modal_selectize.open();
  date = document.getElementById("date").value;
  tof = document.getElementById("tof").value;
  // project_id = document.getElementById('project_id').value;
  arr.push(e.value);
  //

  //
  var selectize = select[0].selectize;
  var foo = selectize.getValue();
  axios({
    method: "GET",
    url:
      "/models?tof=" +
      tof +
      "&date=" +
      date +
      "&make=" +
      foo +
      "&pid=" +
      project_id,
  }).then(function (response) {
    div = document.getElementById("car_model");
    // $("#car_model").empty();
    arr2 = response.data.models;
    carmodel_array = response.data.models;

    for (var i = 0; i < arr2.length; i++) {
      var data = {
        value: carmodel_array[i],
        text: arr2[i],
      };
      car_modal_selectize.addOption(data);
    }
  });
}
function carmake(typeoffinance, project_id) {
  //second
  var selectize = select[0].selectize;
  selectize.open();
  div = document.getElementById("date");
  tof = typeoffinance.value;

  axios({
    method: "GET",
    url:
      "/finances?tof=" +
      tof +
      "&date=" +
      div.value +
      "&pid=" +
      project_id +
      "&type=Make",
  }).then(function (response) {
    div = document.getElementById("car_make");
    arr2 = response.data.Make;
    //alert(arr2)
    for (var i = 0; i < arr2.length; i++) {
      var data = {
        value: arr2[i],
        text: arr2[i],
      };
      selectize.addOption(data);
      // selectize.refreshOptions();
      let html = '<option value="' + arr2[i] + '">' + arr2[i] + "</option>";
      div.innerHTML += html;
      // console.log(html)
    }
  });
}
$(".btn.btn-info").click(function (e) {
  $("#car_make option").attr("selected", "selected");
});
