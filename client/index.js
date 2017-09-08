import Share from 'ftc-share';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Question from './components/question';
import Overlay from './components/overlay';

Share.init();
const endpoint = 'https://ft-ig-answer-api.herokuapp.com/api/v1';//该链接打开为not found


class App extends Component {
  constructor(props) {
    super(props); //In ES6 Class, you need to explicitly call super(); when defining the constructor of a subclass.
    const {questions} = props;

    this.state = { // In constructor, initialize the state:
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
        questionsLength: questions.
        filter(question => question.answer !== '')//问题过滤，只要每项question.answer有内容的
        .sort((a,b) => Number(a.meta.qid.slice(1)) - Number(b.meta.qid.slice(1)))//问题排序，根据每项question的.meta.qid.slice(1)的大小进行排序
        .slice(2)//从第3个问题开始选取
        .length//求前述过滤后剩下的问题数目
      }));      
  }

  updateProgress(n) {
    /**
     * @dest 如果n比questionsLength小，则设置activeQuestion为n;否则activeQuestion为null
     */
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
    /**
     * @dest 为state.score增加分值n
     */
    this.setState(prevState => ({//this.setState(): schedule updates to the component local state
      score: prevState.score + n
    }));
  }

  render() {
    /**
     * The render method returns a description of what you want to render, and then React takes that description and renders it to the screen. In particular, render returns a React element.
     * Most React developers use JSX which makes it easier to write these structures.
     * JSX： The <div /> syntax is transformed at build time to React.createElement('div').
     * The render method can display the value from the current state 
     */
    const chooseQuestions = this.state.chooseQuestions && (
      <Overlay setQuestions = {this.setQuestions}/>
    );

    const loadStatus = !this.state.questionsLoaded && <p><strong>测验正在快速加载...（若无法加载成功，建议使用Chrome、Firefox、Safari或IE 9以上的浏览器浏览。）</strong></p>

    const questions = this.state.questions.filter(question => question.answer !== '')
    .sort((a,b) => Number(a.meta.qid.slice(1)) - Number(b.meta.qid.slice(1)))
    .slice(2)
    .map((question, i) =>
      <Question 
          key={question.meta.qid}
          questionId={question.id}
          questionIndex={i}
          active={i === this.state.activeQuestion}
          questionType={question.meta.type}
          questionText={question.text}
          options={
            Object.keys(question.options)//Object.keys() 方法会返回一个由一个给定 对象的自身可枚举属性组成的数组
            .map(option =>  
              question.options[option]
            ).filter(option =>
              option !== null
            )
          }
          answer={Number(question.answer)}
          countryAnswer={Number(question.meta.perceived)}
          responsesData={question.responses}
          updateProgress={this.updateProgress}
          updateScore={this.updateScore}
          endpoint={endpoint}
          country={this.state.country}
          questionsLength={this.state.questionsLength}
      />
    );
    let feedback;

    switch (true) {
      case this.state.score >= 70:
        feedback = '- 你果然是达人';
        break;
      default:
        feedback = '';

    }

    const results = this.state.complete && (
      <div className="results">
        <h2></h2>
        <h2>
          测验结束：你的准确率达{Math.round(this.state.score)}&#37;{feedback}
        </h2>
      </div>
    )//&#37为%

    return (
      <div>
        <link rel="stylesheet" href="https://build.origami.ft.com/v2/bundles/css?modules=o-buttons@^4.4.1" />

        {chooseQuestions} 
        {loadStatus}
        {questions}
        {results}
      </div>
    )
  }
}

App.propTypes = {
  questions: React.PropTypes.array
};

ReactDOM.render(<App />, document.getElementById('react-container'));