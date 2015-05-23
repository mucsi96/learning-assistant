var fs = require('fs'),
    _ = require('lodash'),
    express = require('express'),
    inquirer = require('inquirer'),
    open = require('open'),
    app = express(),
    challengeFile,
    challenge;

if (process.argv.length < 3) {
    console.log("Please specify a challenge file!");
    return;
}

challengeFile = process.argv[2];

if(!fs.existsSync(challengeFile) && process.argv.length < 4) {
    inquirer.prompt([{
            name: 'numberOfQuestions',
            message: 'Number of questions:'
        }],
        function(answers) {
            var i,
                l,
                questions = [];

            challenge = {
                questions: questions
            }

            for(i = 0, l = answers.numberOfQuestions; i < l; ++i) {
                questions.push({
                    id: i,
                    text: i + 1,
                    answers: []
                });
            }
            save();
        });
} else if (!fs.existsSync(challengeFile)) {
    var questionFile = process.argv[3],
        questions = fs.readFileSync(questionFile, 'utf-8').match(/\S+/g);

    challenge = {
        questions: []
    }

    for(i = 0, l = questions.length; i < l; ++i) {
        challenge.questions.push({
            id: i,
            text: questions[i],
            answers: []
        });
    }

    save();

}
start();

function load() {
    challenge = JSON.parse(fs.readFileSync(challengeFile, 'utf-8'));
}

function save() {
    fs.writeFileSync(challengeFile, JSON.stringify(challenge))
}

function logRandom(maxN) {
    var t = 2^maxN;

    return Math.floor(Math.log((Math.random() * t) + 1)/Math.log(2));
}

function takeLogRandom(questions) {
    if (!questions.length) {
        return;
    }

    return questions[logRandom(questions.length - 1)];
}

function takeRandom(questions) {
    return questions[Math.floor(Math.random() * questions.length)];
}

function wasQuestionAnsweredCorrectly(question){
    var lastAnswer = question.answers.length &&
            question.answers[question.answers.length - 1];

    return !!lastAnswer && lastAnswer.correct;
}

function getUnansweredQuestions(){
    return _.filter(challenge.questions, function(question){
        return !wasQuestionAnsweredCorrectly(question);
    });
}

function getRound() {
    var unansweredQuestions = getUnansweredQuestions();

    if (!unansweredQuestions.length) {
        return -1;
    }

    return _.min(unansweredQuestions, function(question){
        return question.answers.length;
    }).answers.length;
}

function getRoundQuestions(round) {
    return _.filter(challenge.questions, function(question){
        return round === question.answers.length;
    });
}

function getLeavingQuestions(round) {
    return _.filter(getRoundQuestions(round), function(question){
        return !wasQuestionAnsweredCorrectly(question);
    });
}

function getQuestionsState() {
    return _.map(challenge.questions, function(question){
        if (wasQuestionAnsweredCorrectly(question)) {
            return "done";
        }

        return "" + question.answers.length;
    });
}

function next() {
    var round = getRound();

    if (round === -1) {
        return {done: true};
    }

    var questions = getLeavingQuestions(round),
        nextRoundQuestions = getRoundQuestions(round + 1);

    return {
        questionsState: getQuestionsState(),
        question: takeRandom(questions),
        score: {
            round: round + 1,
            done: nextRoundQuestions.length,
            total: nextRoundQuestions.length + questions.length,
            percent: Math.round(100 * nextRoundQuestions.length / (nextRoundQuestions.length + questions.length))
        }
    }
}


app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/question/next', function(req, res){
    res.send(next());
});

app.get('/question/know/:id', function(req, res){
    var question = _.find(challenge.questions, {id: parseInt(req.params.id)});

    question.lastAnswerTime = new Date();
    question.answers.push({correct: true});
    save();
    res.send(next());
});

app.get('/question/dontknow/:id', function(req, res){
    var question = _.find(challenge.questions, {id: parseInt(req.params.id)});

    question.lastAnswerTime = new Date();
    question.answers.push({correct: false});
    save();
    res.send(next());
});

function start() {
    load();

    app.listen(3000, function () {
        open('http://localhost:3000');
        console.log('App started at http://localhost:3000');
    });
}


