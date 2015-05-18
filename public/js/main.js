$(function(){
    'strict mode'
    var template = Handlebars.compile($("#template").html());

    $.getJSON('question/next')
        .done(function(next){
            showNext(next);
        });

    function setProcessingState(processing) {
        if (processing) {
            $("#know").attr('disabled','disabled');
            $("#dont-know").attr('disabled','disabled');
        } else {
            $("#know").removeAttr('disabled');
            $("#dont-know").removeAttr('disabled');
        }
    }

    function showNext(next) {
        if (next.score.actual < next.score.expected) {
            $("#question-placeholder").html(template(next));
        } else {
            $("#question-placeholder").html("<h2>Done!</h2>");
        }

        $("#know").on('click', function() {
            setProcessingState(true);
            $.getJSON('question/know/' + next.question.number)
            .done(function(next){
                setProcessingState(false);
                showNext(next);
            });
        });
        $("#dont-know").on('click', function() {
            setProcessingState(true);
            $.getJSON('question/dontknow/' + next.question.number)
            .done(function(next){
                setProcessingState(false);
                showNext(next);
            });
        });
    }

});
