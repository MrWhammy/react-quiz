import React from 'react';
import {createRoot} from 'react-dom/client';
import {getQuestions, getRounds} from './questions';
import './index.css';

function Question(props) {
    return (
        <div className="question">
            <img className='question-img' src={props.question.image} alt={props.question.number}></img>
            <div className="question-text">{props.question.question}</div>
        </div>
    );
}

function Answer(props) {
    return (
        <div className="answer">
            <div className="answer-question">{props.question.question}</div>
            <div className="answer-text">{props.question.answer}</div>
            <div className="answer-song">{props.question.artist} - {props.question.song}</div>
        </div>
    );
}

function Title() {
    return (<div className="title">
        <header></header>
        <div className="logo"/>
        <span className="titleText">7e TC Sterrenbos quiz</span>
        <footer></footer>
    </div>);
}

class RoundTitle extends React.Component {
    render() {
        return (
            <div className="title">
                <header>
                    <h1>7e TC Sterrenbos quiz</h1>
                </header>
                <div className="logo"/>
                <div className='roundTitle'>
                    <span className="roundTitleText">{this.props.round.title}</span>
                    {this.props.part === 'Answer' &&
                    <span className="roundTitleAnswer">De antwoorden</span>
                    }
                </div>
                <footer><h3>{this.props.round.title}</h3></footer>
            </div>
        );
    }
}

class Round extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: Date.now(),
        };
    }

    render() {
        let content;
        switch (this.props.part) {
            case "Question":
                content = <Question question={this.props.question}/>
                break;
            case "Answer":
                content = <Answer question={this.props.question}/>
                break;
            default:
                console.error("Unknown part " + this.props.part);
                break;
        }
        return (
            <div className="round">
                <header>
                    <h1>7e TC Sterrenbos quiz</h1>
                </header>
                <div className="logo"/>
                {content}
                <footer><h3>{this.props.round.title} -
                    Vraag {this.props.question.number}/{this.props.totalQuestions}</h3></footer>
                {this.props.part === 'Question' &&
                <Timer startTime={this.state.startTime}/>
                }
            </div>
        );
    }
}

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: Date.now(),
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({time: Date.now()}), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const startTime = this.props.startTime;
        const now = this.state.time;
        const totalSeconds = Math.floor((now - startTime) / 1000);
        const seconds = totalSeconds > 0 ? totalSeconds % 60 : 0;
        const minutes = totalSeconds > 0 ? (totalSeconds - seconds) / 60 : 0;
        return <div className='timer'><h3>{minutes.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}:{seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}</h3></div>
    }
}

class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: 'Title',
            rounds: [],
            questions: [],
            currentRoundIndex: -1,
            currentQuestionIndex: 0
        }
    }

    getCurrentRound() {
        return this.getRound(this.state.currentRoundIndex);
    }

    getRound(roundIndex) {
        return roundIndex < this.state.rounds.length ? this.state.rounds[roundIndex] : {title: "Round X"};
    }

    getCurrentQuestion() {
        return this.state.currentQuestionIndex < this.state.questions.length ? this.state.questions[this.state.currentQuestionIndex] : {};
    }

    next() {
        switch (this.state.show) {
            case 'Title':
                this.toNextRound();
                break;
            case 'RoundTitle':
                this.startRound();
                break;
            case 'Round':
                this.nextQuestion();
                break;
            default:
                console.error("Unknown show state " + this.state.show);
                break;
        }
    }

    startRound() {
        this.setAndStoreState({
            show: 'Round',
            currentQuestionIndex: 0
        });
    }

    nextQuestion() {
        const questionIndex = this.state.currentQuestionIndex;
        if (questionIndex < this.state.questions.length - 1) {
            this.setAndStoreState({
                currentQuestionIndex: (questionIndex + 1)
            });
        } else {
            switch (this.state.part) {
                case "Question":
                    this.toAnswerRoundTitle();
                    break;
                case "Answer":
                    this.toNextRound();
                    break;
                default:
                    console.error("Unknown part " + this.props.part);
                    break;
            }
        }
    }

    toAnswerRoundTitle() {
        this.setAndStoreState({
            show: 'RoundTitle',
            part: 'Answer',
            currentQuestionIndex: 0
        });
    }

    toNextRound() {
        const roundIndex = this.state.currentRoundIndex;
        if (roundIndex < this.state.rounds.length - 1) {
            const newRoundIndex = roundIndex + 1;
            this.toRound(newRoundIndex);
        }
    }

    toRound(newRoundIndex) {
        getQuestions(this.getRound(newRoundIndex).sheet).then(questions => {
            this.setAndStoreState({
                show: 'RoundTitle',
                part: 'Question',
                questions: questions,
                currentQuestionIndex: 0,
                currentRoundIndex: newRoundIndex,
                startTime: Date.now()
            });
        });
    }

    toPreviousRound() {
        const roundIndex = this.state.currentRoundIndex;
        const newRoundIndex = roundIndex > 0 ? (roundIndex - 1) : 0;
        this.toRound(newRoundIndex);
    }

    previous(force) {
        switch (this.state.show) {
            case 'RoundTitle':
                if (force) {
                    this.toPreviousRound();
                }
                break;
            case 'Round':
                this.previousQuestion(force);
                break;
            default:
                console.error("Unknown show state " + this.state.show);
                break;
        }
    }

    previousQuestion(force) {
        const question = this.state.currentQuestionIndex;
        if (question > 0) {
            this.setAndStoreState({currentQuestionIndex: (question - 1)});
        } else {
            switch (this.state.part) {
                case "Question":
                    if (force) {
                        this.toRound(this.state.currentRoundIndex);
                    }
                    break;
                case "Answer":
                    this.toAnswerRoundTitle();
                    break;
                default:
                    console.error("Unknown part " + this.props.part);
                    break;
            }
        }
    }

    onKeyPressed(event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }

        switch (event.key) {
            case "Down": // IE/Edge specific value
            case "ArrowDown":
                this.next();
                break;
            case "Up": // IE/Edge specific value
            case "ArrowUp":
                this.previous(event.ctrlKey);
                break;
            case "Left": // IE/Edge specific value
            case "ArrowLeft":
                this.previous(event.ctrlKey);
                break;
            case "Right": // IE/Edge specific value
            case "ArrowRight":
                this.next();
                break;
            default:
                // Do nothing
                break;
        }
    }

    loadState() {
        return JSON.parse(window.localStorage.getItem("QUIZ_STATE") || "{}");
    }

    setAndStoreState(newState) {
        this.setState(newState, () => window.localStorage.setItem("QUIZ_STATE", JSON.stringify({
            currentRoundIndex: this.state.currentRoundIndex,
            currentQuestionIndex: this.state.currentQuestionIndex,
            show: this.state.show,
            part: this.state.part,
            startTime: this.state.startTime
        })));
    }

    componentDidMount() {
        getRounds().then(rounds => {
            let storedState = this.loadState();
            switch (storedState.show) {
                case 'RoundTitle':
                case 'Round':
                    getQuestions(rounds[storedState.currentRoundIndex].sheet).then(questions => {
                        this.setState({
                            show: storedState.show,
                            part: storedState.part,
                            currentRoundIndex: storedState.currentRoundIndex,
                            currentQuestionIndex: storedState.currentQuestionIndex,
                            rounds: rounds,
                            questions: questions,
                            startTime: storedState.startTime
                        });
                    });
                    break;
                default:
                    this.setState({
                        rounds: rounds
                    });
                    break;
            }
        });
    }

    render() {
        let content;
        switch (this.state.show) {
            case 'Title':
                content = <Title/>;
                break;
            case 'RoundTitle':
                const titleRound = this.getCurrentRound();
                content = <RoundTitle round={titleRound} part={this.state.part}/>;
                break;
            case 'Round':
                const round = this.getCurrentRound();
                const question = this.getCurrentQuestion();
                content = <Round round={round} question={question} totalQuestions={this.state.questions.length}
                                 part={this.state.part}/>;
                break;
            default:
                console.error("Unknown show state " + this.state.show);
                break;
        }

        return (
            <div
                className="quiz"
                onKeyDown={(e) => this.onKeyPressed(e)}
                tabIndex="0"
            >
                {content}
            </div>
        );
    }


}

// ========================================
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Quiz/>);
