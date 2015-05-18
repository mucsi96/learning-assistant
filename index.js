var fs = require('fs'),
    _ = require('lodash'),
    express = require('express'),
    open = require('open'),
    inquirer = require('inquirer'),
    app = express(),
    questionFile = 'questions.json',
    questionData;

if(!fs.existsSync(questionFile)) {
    inquirer.prompt([{
            name: 'minScore',
            message: 'Minimal score:'
        }, {
            name: 'numberOfQuestions',
            message: 'Number of questions:'
        }],
        function(answers) {
            var i,
                l,
                questions = [];

            questionData = {
                minScore: answers.minScore,
                questions: questions
            }

            for(i = 0, l = answers.numberOfQuestions; i < l; ++i) {
                questions.push({
                    number: i + 1,
                    score: 0
                });
            }
            save();
            start();
        });
} else {
    start();
}


function load() {
    questionData = JSON.parse(fs.readFileSync(questionFile, 'utf-8'));
}

function save() {
    fs.writeFileSync(questionFile, JSON.stringify(questionData))
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

function next() {
    var questions = questionData.questions;

    questions = _.filter(questions, function(question){
        return question.score < questionData.minScore;
    });

    questions = _.sortBy(questions, function (question){
        return question.asked || new Date(null);
    });

    return {
        question: takeLogRandom(questions),
        score: getScore()
    };
}

function getScore() {
    return {
        actual: _.reduce(questionData.questions, function(total, question) {
            return total + question.score;
        }, 0),
        expected: questionData.questions.length * questionData.minScore
    }
}

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/question/next', function(req, res){
    res.send(next());
});

app.get('/question/know/:number', function(req, res){
    var question = _.find(questionData.questions, {number: parseInt(req.params.number)});

    question.asked = new Date();
    question.score++;
    save();
    res.send(next());
});

app.get('/question/dontknow/:number', function(req, res){
    var question = _.find(questionData.questions, {number: parseInt(req.params.number)});

    question.asked = new Date();
    question.score--;
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


