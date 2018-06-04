/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import './App.css'
import ReactTooltip from 'react-tooltip'
import checkocircle from './icons/checkocircle.svg'
import checkcircle from './icons/checkcircle.svg'
import deleteocircle from './icons/deleteocircle.svg'
import deletecircle from './icons/deletecircle.svg'
import check from './icons/check.svg'


export default class CustomButtons extends Component {
  render() {
    const { task, header, approve, block, pin, canPin, makeApprove, blockQuestion, makeAnswer, makePin, answered } = this.props
    
    if (header) {
      return(
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' data-tip="Move to Approved" onClick={() => makeApprove(task)} src={checkocircle} alt="approve"/>
            <img className='button1' data-tip="Move to Blocked" onClick={() => blockQuestion(task)} src={deleteocircle} alt="block"/>
          </span>
          <ReactTooltip />
        </span>
      )
    }
    
    if (approve) {
      if (pin) {
        return (
          <span style={{marginTop: 25}}>
            <span className='cellBoxRight'>
              <img className='button1' data-tip="Move to Answered" onClick={() => makeAnswer(task)} src={check} alt="answered"/>
              <img className='button1' data-tip="Move to Blocked" onClick={() => blockQuestion(task)} src={deleteocircle} alt="block"/>
            </span>
            <ReactTooltip />
          </span>
        )
      }
      else {
        return (
          <span>
            <button className="pinButton" disabled={!canPin()} style={{opacity: canPin() ? 1 : 0.3}} onClick={() => makePin(task)}><img className="pinImage" src={require('./icons/thumbtack.svg')} alt="" />Pin to Top</button>
            <span className='cellBoxRight'>
              <img className='button1' data-tip="Move to Answered" onClick={() => makeAnswer(task)} src={check} alt="answered"/>
              <img className='button1' data-tip="Move to Blocked" onClick={() => blockQuestion(task)} src={deleteocircle} alt="block"/>
            </span>
            <ReactTooltip />
          </span>
        )
      }
    }

    if (block) {
      return (
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' data-tip="Move to Approved" onClick={() => makeApprove(task)} src={checkocircle} alt="approve" />
            <img className='button1' data-tip="Unavailable" src={deletecircle} alt="block"/>
          </span>
          <ReactTooltip />
        </span>
      )
    }
    if (answered) {
      return (
        <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
            <img className='button1' data-tip="Unavailable" src={checkcircle} alt="approve" />
            <img className='button1' data-tip="Move to Blocked" onClick={() => blockQuestion(task)} src={deleteocircle} alt="block"/>
          </span>
          <ReactTooltip />
        </span>
      )
    }
  }
}
