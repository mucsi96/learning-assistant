$(function(){
    'strict mode'
    var template = Handlebars.compile($("#template").html());

    $.getJSON('question/next')
        .done(function(next){
            showNext(next);
        });

    function showNext(next) {
        if (!next.done) {
            $("#question-placeholder").html(template(next));
        } else {
            $("#question-placeholder").html("<h2>Done!</h2>");
        }

        $("#know").on('click', function() {
            $(this).attr('disabled','disabled');
            $.getJSON('question/know/' + next.question.id)
            .done(function(next){
                showNext(next);
            });
        });
        $("#dont-know").on('click', function() {
            $(this).attr('disabled','disabled');
            $.getJSON('question/dontknow/' + next.question.id)
            .done(function(next){
                showNext(next);
            });
        });
    }

});
