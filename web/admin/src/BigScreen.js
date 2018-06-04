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

import React, {PureComponent} from 'react'
import './BigScreen.css'
import {Avatar} from '@doubledutch/react-components'

export default class BigScreen extends PureComponent {
  state = {questions: []}
  componentDidMount() {
    const {session} = this.props
    this.backgroundUrlRef().on('value', data => this.setState({backgroundUrl: data.val()}))
    this.sessionRef().on('value', data => this.setState({session: data.val()}))
    this.selectSession(session)
  }

  render() {
    const {backgroundUrl, session} = this.state
    const { client } = this.props
    const color = client
    if (!session) return this.renderNonexistent()
    return (
      <div className="big-screen" style={backgroundUrl ? {backgroundImage: `url(${backgroundUrl})`} : null}>
        {this.renderState(session)}
        <div className="big-screen-bottom">
          <h2>Select the "{this.props.sessionName}" session from the Live Q&A section of the event app to join the conversation</h2>
        </div>
      </div>
    )
  }

  selectSession = (session) => {
    const {fbc} = this.props
      fbc.database.public.allRef('questions').child(session).on('child_added', data => {
        this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }] })
        fbc.database.public.allRef('votes').child(data.key).on('child_added', vote => {
          this.setState(prevState => ({
            questions: prevState.questions.map(question => 
              question.key === data.key
                ? { ...question, score: question.score + 1}
                : question
            )
          }))
        })
        fbc.database.public.allRef('votes').child(data.key).on('child_removed', vote => {
          this.setState(prevState => ({
            questions: prevState.questions.map(question => 
              question.key === data.key
                ? { ...question, score: question.score - 1}
                : question
            )
          }))
        })
      })
      fbc.database.public.allRef('questions').child(session).on('child_changed', data => {
        const questions = this.state.questions
        for (var i in questions) {
          if (questions[i].key === data.key) {
            const score = questions[i].score
            const newQuestions = questions.filter(x => x.key !== data.key)
            var newObject = data.val()
            newObject.score = score
            this.setState({ questions: [...newQuestions, {...newObject, key: data.key }] })   
            break
          }
        }
      })
      fbc.database.public.allRef('questions').child(session).on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })
    }

  renderState(session) {
    switch (session.state) {
      case 'LIVE': return this.renderTable()
      default: return null
    }
  }

  renderTable = (session) => {
    var pinnedQuestions = this.state.questions.filter(item => item.pin === true && item.approve && item.block === false && item.answered === false && item.session === this.props.session)
    var otherQuestions = this.state.questions.filter(item => item.pin === false && item.approve && item.block === false && item.answered === false && item.session === this.props.session)
    pinnedQuestions.sort(function (a,b){ 
      return a.order - b.order
    })
    this.originalOrder(otherQuestions)
    let newQuestions = pinnedQuestions.concat(otherQuestions)
    return (
      <ul className="box">
        { newQuestions.map(task => (
          <li className='box-content' key={task.key}>
            <p className="question-title">"{task.text}"</p>
            { !task.anom ? <div className="cellName">
              <Avatar user={task.creator} size={25}/>
              <p className="name">{task.creator.firstName} {task.creator.lastName}</p><img className="box-icon" src={require('./icons/Inactive.png')} alt="inactive"/><p className="vote">{task.score}</p>
              </div> : <div className="cellName"><p className="name">-Anonymous</p><img className="box-icon" src={require('./icons/Inactive.png')} alt="inactive"/><p className="vote">{task.score}</p></div>}
          </li> )
        ) }
      </ul>
    )
  }

  originalOrder = (questions) => {
    if (this.state.showRecent === false) {
      this.dateSort(questions)
      questions.sort(function (a,b){ 
        return b.score - a.score
      })
    }
    if (this.state.showRecent === true) {
      this.dateSort(questions)
    }
  }

  dateSort = (questions) => {
    questions.sort(function (a,b){
      return b.dateCreate - a.dateCreate
    })
  }

  renderNonexistent = () => <div className="big-screen"><div className="box box-content">This session has not been initialized for viewing</div></div>

  sessionRef = () => this.props.fbc.database.public.adminRef('sessions').child(this.props.session)
  backgroundUrlRef = () => this.props.fbc.database.public.adminRef('backgroundUrl')
}

