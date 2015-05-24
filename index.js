var fs = require('fs'),
    _ = require('lodash'),
    express = require('express'),
    inquirer = require('inquirer'),
    open = require('open'),
    app = express(),
    challengeFile,
    challenge;

if (process.argv.length < 3) {
    console.log("Please specify a question file!");
    return;
}

questionFile = process.argv[2];
challengeFile = questionFile.replace(/\.[^/.]+$/, '') + '.challenge.json';

if (!fs.existsSync(challengeFile)) {
    var questions = _.without(fs.readFileSync(questionFile, 'utf-8').split('\n'), '');

    challenge = {
        title: questions[0],
        questions: []
    }

    for(i = 1, l = questions.length; i < l; ++i) {
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
    var base = {
            title: challenge.title,
            questionsState: getQuestionsState()
        },
        round = getRound();

    if (round === -1) {
        return _.assign(base, {
            done: true
        });
    }

    return _.assign({
        question: takeRandom(getLeavingQuestions(round))
    });
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


