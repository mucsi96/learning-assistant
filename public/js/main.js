$(function() {
    'strict mode'

    var template = Handlebars.compile($("#template").html());



    $.getJSON('question/next')
        .done(function(next) {
            showNext(next);
        });

    function showNext(next) {
        $("#question-placeholder").html(template(next));

        $("#know").on('click', function() {
            $(this).attr('disabled', 'disabled');
            $.getJSON('question/know/' + next.question.id)
                .done(function(next) {
                    showNext(next);
                });
        });
        $("#dont-know").on('click', function() {
            $(this).attr('disabled', 'disabled');
            $.getJSON('question/dontknow/' + next.question.id)
                .done(function(next) {
                    showNext(next);
                });
        });
        $("#restart").on('click', function() {
            $(this).attr('disabled', 'disabled');
            $.getJSON('restart')
                .done(function(next) {
                    showNext(next);
                });
        });

        setTimeout(function() {
            var $delayedElements = $(".delayed")
                .removeClass('delayed')
                .css('opacity', '0');

            setTimeout(function() {
                $delayedElements.removeAttr('style');
            }, 0);
        }, 1000);

    }

});
