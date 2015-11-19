$(function() {
    'strict mode'

    Handlebars.registerHelper('breaklines', function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        console.log(text);
        return new Handlebars.SafeString(text);
    });

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
