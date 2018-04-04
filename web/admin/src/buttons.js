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

export default class CustomButtons extends Component {
  render() {
    const { task, header, approve, block, makeApprove, blockQuestion, makeAnswer, makePin } = this.props
    
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
      return (
        <span>
    {((this.props.session !== 'All') ? <button className="pinButton" onClick={() => makePin(task)}><img className="pinImage" src={require('./icons/thumbtack.svg')} alt="" />Move to Top</button> : <div style={{height: 25}}/>)}
          <span className='cellBoxRight'>
            <img className='button1' onClick={() => makeAnswer(task)} src={require('./icons/check.svg')} alt="answered"/>
            <img className='button1' onClick={() => blockQuestion(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
          </span>
        </span>
      )
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
