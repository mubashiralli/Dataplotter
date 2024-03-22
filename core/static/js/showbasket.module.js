// $("#edit").on("click",function(event){
//     event.preventDefault();
//     let href = $(this).attr("href");

//     let id = href.split('bid=')[1];

//     $.ajax({
//         url : 'addbasket',
//         data: { id: id},
//         type: 'POST',
//         success: function (response){
//             console.log(response);
//         }
//     })
// });
function deletebasket(basket_id) {
  var result = confirm("Are you sure you want to remove the basket?");
  if (result) {
    axios({
      method: "POST",
      url: "/deletebasket",
      data: { id: basket_id },
    }).then(function (response) {
      if (response.status == 200) {
        tr = document.getElementById(basket_id);
        tr.remove();
        const counters = document.querySelectorAll("#counter");
        for (let i = 0; i < counters.length; i++) {
          counters[i].innerHTML = i + 1;
        }
        // console.log("td is ",counters);
      }
    });
  }
}
