import React, { Component } from 'react'
import './App.css'

export default class CustomButtons extends Component {
  render() {
    const { task, header, approve, block, pin, canPin, makeApprove, blockQuestion, makeAnswer, makePin } = this.props
    
    if (header) {
      return(
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' onClick={() => makeApprove(task)} src={require('./icons/checkocircle.svg')} alt="approve"/>
            <img className='button1' onClick={() => blockQuestion(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
          </span>
        </span>
      )
    }
    
    if (approve) {
      if (pin) {
        return (
          <span style={{marginTop: 25}}>
            <span className='cellBoxRight'>
              <img className='button1' onClick={() => makeAnswer(task)} src={require('./icons/check.svg')} alt="answered"/>
              <img className='button1' onClick={() => blockQuestion(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
            </span>
          </span>
        )
      }
      else {
        return (
          <span>
            <button className="pinButton" disabled={!canPin()} style={{opacity: canPin() ? 1 : 0.3}} onClick={() => makePin(task)}><img className="pinImage" src={require('./icons/thumbtack.svg')} alt="" />Pin to Top</button>
            <span className='cellBoxRight'>
              <img className='button1' onClick={() => makeAnswer(task)} src={require('./icons/check.svg')} alt="answered"/>
              <img className='button1' onClick={() => blockQuestion(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
            </span>
          </span>
        )
      }
    }

    if (block) {
      return (
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' onClick={() => makeApprove(task)} src={require('./icons/checkocircle.svg')} alt="approve" />
            <img className='button1' src={require('./icons/deletecircle.svg')} alt="" />
          </span>
        </span>
      )
    }
  }
}
