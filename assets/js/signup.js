$(document).ready(function(){
    $('.projects').select2();
    $('.projects').on('select2:close', function(){
        var selectedValue = $(this).val();
    });
});  