import React from 'react';
import ReactDOM from 'react-dom';
import questions from './questions.json';
import { getRounds } from './questions';
import './index.css';

function Question(props) {
  return (
    <div className="question">
      <div 
        className="question-img" 
        style={{ backgroundImage:`url(${props.image})` }}
        >
          &nbsp;
      </div>
      <div className="question-text">{props.question}</div>
    </div>
  );
}

class Round extends React.Component {
  render() {
    return (
      <div className="round">
        <header>
            <h1>7e TC Sterrenbos quiz</h1>
          </header>
          <div className="logo" />
          <Question
            question={this.props.question.question}
            image={this.props.question.image}
          />
          <footer><h3>{this.props.round.title} - Vraag {this.props.question.number}</h3></footer>
          <Timer startTime={this.props.startTime} />
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
      rounds: [],
      currentRoundIndex: 0,
      currentQuestionIndex: 0,
      startTime: Date.now()
    }
  }

  nextQuestion() {
    const questionIndex = this.state.currentQuestionIndex;
    if (questionIndex < questions.length - 1) {
      this.setState({
        currentQuestionIndex: (questionIndex+1),
        startTime: Date.now()
      });
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
        this.nextQuestion();
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        this.previousQuestion();
        break;
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
        this.previousQuestion();
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        this.nextQuestion();
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
    const round = this.state.currentRoundIndex < this.state.rounds.length ? this.state.rounds[this.state.currentRoundIndex] : { title: "Round X" };
    const question = questions[this.state.currentQuestionIndex];
    return (
      <div 
        className="quiz"
        onKeyDown={(e) => this.onKeyPressed(e)}
        tabIndex="0"
        >
        <Round round={round} question={question} startTime={this.state.startTime} />
      </div>
    );
  }

  
}

// ========================================

ReactDOM.render(
  <Quiz />,
  document.getElementById('root')
);
