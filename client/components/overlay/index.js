import React, { Component } from 'react';
const countries = require('../../../data/countries.js');

class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputsDisabled: false,
      visibility: '',
      value: 'China'
    };//The only place where you can assign this.state is the constructor.

    //NOTE:Because this.props and this.state may be updated asynchronously, you should not rely on their values for calculating the next state.

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({//NOTE:When you call setState(), React merges the object you provide into the current state.
      value: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.setQuestions(this.state.value)//MARK:This is a func

    this.modal.classList.add('animate-blur');// MARK: this.modal就是当前HTMLElement：className含有overlay的这个这个最外层div
    this.modal.style.backgroundColor = 'rgba(51, 51, 51, 0)';

    setInterval(
      () => this.setState({
        inputsDisabled: true,
        visibility:'hidden'
      }),250
    );
  }

  render() {
    const options = countries;
    const selectOptions = options.map((option, i) => (
      <option 
        key={`o${i}`}
        value={option.en}
      >
        {option.cn}
      </option>
    ));

    return (//When the ref attribute is used on an HTML element, the ref callback receives the current DOM element as its argument. For example, this code uses the ref callback to store a reference to a DOM node（ref回调函数接收当前HTML Element作为它的参数）:


      <div 
        ref={node => {this.modal = node;}}
        className={`overlay ${this.state.visibility}`.trim()}
      >
        <div className="o-grid-container">
          <div className="o-grid-row">
            <div data-o-grid-colspan="12">
              <header className="overlay-header">
                测验：你有多了解你的国家?- FT中文网
              </header>

              <section className="overlay-content">
                <p>
                  请选择你想测验的国家或地区
                </p>
                <form 
                  onSubmit={(event, value) => {
                    this.handleSubmit(event, value);
                  }}//QUEST:onSubmit可以有两个参数吗？
                >
                  <select
                    value={this.state.value}
                    onChange={this.handleChange}
                    required
                  >
                    {selectOptions}
                  </select>

                  <input
                    type="submit"
                    value="开始测验"
                    className="o-buttons o-buttons--big o-buttons--standout"
                    disabled={this.state.inputsDisabled}
                  />
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Overlay.propTypes = {
  setQuestions: React.PropTypes.func
};

export default Overlay;