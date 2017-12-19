$.getJSON("/articles", function(data) {
    console.log(data);
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the information on the page
        //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<a href='" + data[i].link + "'>"+ "</a>" + data[i].note + "</p>");
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br>" + "<a href='" + data[i].link + "'>link</a>" + "</p>" + "<br>");
    }
});

$.getJSON('/notes', function(data){
    for(var i = 0; i < data.length; i++){
        $('#saved_notes').append('<button id=deletebutton>x</button>' + "<h5 data-id='"+ data[i]._id + "'>" + data[i].title + "<br />" + data[i].body + "<br>" + "</h5>");
    }
});

$(document).on("click", "p", function(){
    $('#notes').empty();
    var thisId = $(this).attr('data-id');

    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .done(function(data){
            $("#notes").append("<p>" + data.title + "</p>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' placeholder='Note Title'>");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

$(document).on('click', '#savenote', function(){
    var thisId = $(this).attr('data-id');

    $.ajax({
        method: 'POST',
        url: '/articles/' + thisId,
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        }
    })
    .done(function(data){
        console.log(data);
        $('#notes').empty();
    });

    $('#titleinput').val('');
    $('#bodyinpt').val('');

});

$(document).on('click', '#saved_notes_btn', function(){
    $.ajax({
        method: 'GET',
        url: '/notes/',
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        }
    })
    .done(function(data){
        console.log(data);
    });
});

$(document).on("click", "#deletebutton", function(){
    var selected = $(this).parent();
    $.ajax({
        method: 'GET',
        url: '/notes/' + selected.attr("data-id"),
        success: function(response) {
            // Remove the p-tag from the DOM
            selected.remove();
            // Clear the note and title inputs
            $("#titleinput").val("");
            $("#bodyinput").val("");
        }
    });
});