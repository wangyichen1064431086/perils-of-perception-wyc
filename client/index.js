import Share from 'ftc-share';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Question from './components/question';
import Overlay from './components/overlay';

Share.init();

class App extends Component {
  constructor(props) {
    super(props);
    const {questions} = props;

    this.state = {
      questionsLoaded: false,
      questions: [],
      questionsLength: 0,
      activeQuestion: 0,
      score: 0,
      complete: false,
      chooseQuestions: true,
      country: null
    }

    this.setQuestions = this.setQuestions.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.updateScore = this.updateScore.bind(this);
  }

  setQuestions(value) {
    const key = value.toLowerCase().replace(/\s/g,'-');//小写，并把空格替换为'-'
    const data = `/ig/perils-of-perception/${key}.json`;

    fetch(data)
      .then(res => res.json())//response.json():读取 Response对象并且将它设置为已读,并返回一个被解析为JSON格式的promise对象
      .then(({ questions }) => this.setState({
        questionsLoaded: true,
        questions,
        country:value,
        questionsLength: questions.filter(question => question.answer !== '').sort((a,b) => Number(a.meta.qid.slice(1)) - Number(b.meta.qid.slice(1))).slice(2).questionsLength
      }));      
  }

  updateProgress(n) {
    if(n < this.state.questionsLength) {
      this.setState({ activeQuestion: n });
    } else {
      this.setState({
        activeQuestion:null,
        complete: true
      });
    }
  }

  updateScore(n) {
    this.setState(prevState => ({
      score: prevState.score + n
    }));
  }

  render() {
 
  }
}