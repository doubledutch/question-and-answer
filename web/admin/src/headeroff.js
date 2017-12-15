import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'


export class CustomHeaderOff extends Component {
    constructor(props){
        super(props)
    }

    render() {
        const newQuestions = this.props.questions
        const showBlock = this.props.showBlock
        const showAnswer = this.props.showAnswer

        var origQuestions = newQuestions.filter(item => item.block === false && item.answered === false)
        var blockedQuestions = newQuestions.filter(item => item.block === true && item.new === false)
        var answeredQuestions = newQuestions.filter(item => item.answered === true)

        if (showBlock === false && showAnswer === false){
          return (
          <span className="buttonSpan2">
            <button className="listButton">Approved ({origQuestions.length})</button>
            <button className="listButton2" onClick={this.props.handleClick}>Blocked ({blockedQuestions.length})</button>
            <button className="listButton2"  onClick={this.props.handleAnswer}>Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton" onClick={this.props.answerAll}>Mark All as Answered</button>
          </span>
          )
        }
        if (showAnswer === true && showBlock === false){
          return (
          <span className="buttonSpan2">
            <button className="listButton2" onClick={this.props.handleApproved}>Approved ({origQuestions.length})</button>
            <button className="listButton2"  onClick={this.props.handleClick}>Blocked ({blockedQuestions.length})</button>
            <button className="listButton">Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton" onClick={this.props.answerAll}>Mark All as Answered</button>
          </span>
          )
        }
        if (showBlock === true && showAnswer === false){
          return (
          <span className="buttonSpan2">
            <button className="listButton2" onClick={this.props.handleApproved}>Approved ({origQuestions.length})</button>
            <button className="listButton">Blocked ({blockedQuestions.length})</button>
            <button className="listButton2"  onClick={this.props.handleAnswer}>Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton" onClick={this.props.answerAll}>Mark All as Answered</button>
          </span>
          )
        }
    }
}

export default CustomHeaderOff