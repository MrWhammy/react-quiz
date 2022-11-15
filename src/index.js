import React from 'react';
import {createRoot} from 'react-dom/client';
import {getQuestions, getRounds} from './questions';
import './index.css';

function QuestionFull(props) {
    return (
        <div className="questionFull">
            <img className='question-img' src={props.question.image} alt={props.question.number}></img>
            <div className="question-text">{props.question.question}</div>
        </div>
    );
}

function QuestionImage(props) {
    return (
        <div className="questionImage">
            <img className='question-img' src={props.question.image} alt={props.question.number}></img>
        </div>
    );
}


function Question(props) {
    switch (props.part) {
        case "Full":
            return <QuestionFull question={props.question} />;
        case "Image":
            return <QuestionImage question={props.question} />
        default:
            console.error("Unknown question part " + props.part)
            break;
    }
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

function Spinner() {
    return (
        <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}

function Title(props) {
    return (<div className="title">
        <header></header>
        <div className="logo"/>
        <span className="titleText">
        {props.loaded ?
            props.title :
            <Spinner/>
        }
            </span>
        <footer></footer>
    </div>);
}

function RoundTitle(props) {
    return (
        <div className="title">
            <header>
                <h1>7e TC Sterrenbos quiz</h1>
            </header>
            <div className="logo"/>
            <div className='roundTitle'>
                <span className="roundTitleText">{props.round.title}</span>
                {props.part === 'Answer' &&
                <span className="roundTitleAnswer">De antwoorden</span>
                }
            </div>
            <footer><h3>{props.round.title}</h3></footer>
        </div>
    );
}

function Round(props) {
    let content;
    switch (props.part) {
        case "Question":
            content = <Question question={props.question} part={props.questionPart}/>
            break;
        case "Answer":
            content = <Answer question={props.question}/>
            break;
        default:
            console.error("Unknown part " + props.part);
            break;
    }
    return (
        <div className="round">
            <header>
                <h1>7e TC Sterrenbos quiz</h1>
            </header>
            <div className="logo"/>
            {content}
            <footer><h3>{props.round.title} -
                Vraag {props.question.number}/{props.totalQuestions}</h3></footer>
            {props.part === 'Question' &&
            <Timer startTime={props.startTime}/>
            }
        </div>
    );
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
            currentQuestionIndex: 0,
            loaded: false,
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
        if (this.state.part === "Question" && this.state.questionPart === "Image") {
            this.setAndStoreState({
                questionPart: "Full"
            })
        } else {
            const questionIndex = this.state.currentQuestionIndex;
            if (questionIndex < this.state.questions.length - 1) {
                this.setAndStoreState({
                    questionPart: "Image",
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
        } else {
            this.setAndStoreState({
                show: 'EndCard'
            })
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
            questionPart: this.state.questionPart,
            startTime: this.state.startTime,
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
                            questionPart: storedState.questionPart,
                            currentRoundIndex: storedState.currentRoundIndex,
                            currentQuestionIndex: storedState.currentQuestionIndex,
                            startTime: storedState.startTime,
                            rounds: rounds,
                            questions: questions,
                            loaded: true,
                        });
                    });
                    break;
                default:
                    this.setState({
                        startTime: Date.now(),
                        rounds: rounds,
                        loaded: true,
                    });
                    break;
            }
        });
    }

    render() {
        let content;
        switch (this.state.show) {
            case 'Title':
                content = <Title title="7e TC Sterrenbos quiz" loaded={this.state.loaded}/>;
                break;
            case 'RoundTitle':
                const titleRound = this.getCurrentRound();
                content = <RoundTitle round={titleRound} part={this.state.part}/>;
                break;
            case 'Round':
                const round = this.getCurrentRound();
                const question = this.getCurrentQuestion();
                content = <Round startTime={this.state.startTime} round={round} question={question}
                                 totalQuestions={this.state.questions.length} questionPart={this.state.questionPart}
                                 part={this.state.part}/>;
                break;
            case 'EndCard':
                content = <Title title="Bedankt!" loaded="true"/>;
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
const root = createRoot(container);
root.render(<Quiz/>);
