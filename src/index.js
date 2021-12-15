import React from 'react';
import ReactDOM from 'react-dom';
import { getQuestions, getRounds } from './questions';
import './index.css';

function Question(props) {
  return (
    <div className="question">
      <div 
        className="question-img" 
        style={{ backgroundImage:`url(${props.question.image})` }}
        >
          &nbsp;
      </div>
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

function Title(props) {
  return (<div className="title">
        <header></header>
          <div className="logo" />
          <span className="titleText">7e TC Sterrenbos quiz</span>
          <footer></footer>
      </div>);
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
        content = <Question question={this.props.question} />
        break;
      case "Answer":
        content = <Answer question={this.props.question} />
        break;
      default:
        console.error("Unknown part "+this.props.part);
        break;
    }
    return (
      <div className="round">
        <header>
            <h1>7e TC Sterrenbos quiz</h1>
          </header>
          <div className="logo" />
          {content}
          <footer><h3>{this.props.round.title} - Vraag {this.props.question.number}</h3></footer>
          {this.props.part === 'Question' &&
          <Timer startTime={this.state.startTime} />
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
    this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000);
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
    return <div className='timer'><h3>{minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:{seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}</h3></div>
  }
}

class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'Title',
      rounds: [],
      questions: [],
      currentRoundIndex: 0,
      currentQuestionIndex: 0
    }
  }

  getCurrentRound() {
    return this.state.currentRoundIndex < this.state.rounds.length ? this.state.rounds[this.state.currentRoundIndex] : { title: "Round X" };
  }

  getCurrentQuestion() {
    return this.state.currentQuestionIndex < this.state.questions.length ? this.state.questions[this.state.currentQuestionIndex] : {};
  }

  next() {
    switch (this.state.show) {
      case 'Title':
        this.startQuiz();
        break;
      case 'Round':
        this.nextQuestion();
        break;
      default:
        console.error("Unknown show state "+this.state.show);
        break;
    }
  }

  startQuiz() {
    if (this.state.rounds.length > 0) {
      getQuestions(this.getCurrentRound().sheet).then(questions => 
        this.setState({
          show: 'Round',
          part: 'Question',
          questions: questions,
          currentRoundIndex: 0,
          currentQuestionIndex: 0,
          startTime: Date.now()
        })
      );
    }
  }

  nextQuestion() {
    const questionIndex = this.state.currentQuestionIndex;
    if (questionIndex < this.state.questions.length - 1) {
      this.setState({
        currentQuestionIndex: (questionIndex+1)
      });
    } else {
      switch (this.state.part) {
        case "Question":
          this.setState({
            part: 'Answer',
            currentQuestionIndex: 0
          });
          break;
        case "Answer":
          const roundIndex = this.state.currentRoundIndex;
          if (roundIndex < this.state.rounds.length - 1) {
            this.setState({
              part: 'Question',
              currentQuestionIndex: 0,
              currentRoundIndex: (roundIndex+1)
            });
          }
          break;
        default:
          console.error("Unknown part "+this.props.part);
          break;
      }
    }
  }

  previous() {
    if (this.state.show === 'Round') {
      this.previousQuestion();
    }
  }

  previousQuestion() {
    const question = this.state.currentQuestionIndex;
    if (question > 0) {
      this.setState({currentQuestionIndex: (question-1)});
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
        this.previous();
        break;
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
        this.previous();
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

  componentDidMount() {
    getRounds().then(rounds => {
      this.setState({
        rounds: rounds
      });
    });
  }

  render() {
    let content;
    switch (this.state.show) {
      case 'Title':
        content =  <Title />;
        break;
      case 'Round':
        const round = this.getCurrentRound();
        const question = this.getCurrentQuestion();
        content = <Round round={round} question={question} part={this.state.part} />;
        break;
      default:
        console.error("Unknown show state "+this.state.show);
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

ReactDOM.render(
  <Quiz />,
  document.getElementById('root')
);
