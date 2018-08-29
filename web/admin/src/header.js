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
import {translate as t} from '@doubledutch/admin-client'

export default class CustomHeader extends Component {
  render() {
    const newQuestions = this.props.questions
    const showBlock = this.props.showBlock
    const showAnswer = this.props.showAnswer
    var approveQuestions = newQuestions.filter(item => item.approve === true && item.new === false && item.answered === false)
    var blockedQuestions = newQuestions.filter(item => item.block === true && item.new === false && item.answered === false)
    var answeredQuestions = newQuestions.filter(item => item.answered === true)
        
    if (showBlock === false && showAnswer === false){
      if (approveQuestions.length === 0){
        return (
          <span className="buttonSpan2">
            <button className="listButton">{t('header_approved', {count: approveQuestions.length})}</button>
            <button className="listButton2" onClick={this.props.handleClick}>{t('header_blocked', {count: blockedQuestions.length})}</button>
            <button className="listButton2"  onClick={this.props.handleAnswer}>{t('header_answered', {count: answeredQuestions.length})}</button>
            <span className="spacer"/>
            <button className="answerButton2">
              {t('mark_all_answered')}
            </button>
          </span>
        )
    }
    else {
      return (
        <span className="buttonSpan2">
          <button className="listButton">{t('header_approved', {count: approveQuestions.length})}</button>
          <button className="listButton2" onClick={this.props.handleClick}>{t('header_blocked', {count: blockedQuestions.length})}</button>
          <button className="listButton2"  onClick={this.props.handleAnswer}>{t('header_answered', {count: answeredQuestions.length})}</button>
          <span className="spacer"/>
          <button className="answerButton" onClick={this.props.answerAll}>
            {t('mark_all_answered')}
          </button>
        </span>
      )
    }
    }
    
    if (showAnswer === true & showBlock === false){
      return (
        <span className="buttonSpan2">
          <button className="listButton2" onClick={this.props.handleApproved}>{t('header_approved', {count: approveQuestions.length})}</button>
          <button className="listButton2"  onClick={this.props.handleClick}>{t('header_blocked', {count: blockedQuestions.length})}</button>
          <button className="listButton">{t('header_answered', {count: answeredQuestions.length})}</button>
          <span className="spacer"/>
          <button className="answerButton2">
          {t('mark_all_answered')}
          </button>
        </span>
      )
    }

    if (showBlock === true && showAnswer === false){
      return (
        <span className="buttonSpan2">
          <button className="listButton2" onClick={this.props.handleApproved}>{t('header_approved', {count: approveQuestions.length})}</button>
          <button className="listButton">{t('header_blocked', {count: blockedQuestions.length})}</button>
          <button className="listButton2"  onClick={this.props.handleAnswer}>{t('header_answered', {count: answeredQuestions.length})}</button>
          <span className="spacer"/>
          <button className="answerButton2">
          {t('mark_all_answered')}
          </button>
        </span>
      )
    }
  }
}
