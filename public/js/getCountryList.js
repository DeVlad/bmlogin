var url = window.location.origin + '/country';

$.getJSON(url, function (countries) {
    $.each(countries, function (index) {        
        var option = document.createElement('option');
        $('#country').append($(option).attr('value', countries[index].country_id).html(countries[index].country));
    });
});
