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
import { CSVLink } from 'react-csv'
import client from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import moment from 'moment'
import CustomModal from './modal'
import CustomCell from './cell'
import ModIcon from './modicon'
import AnomIcon from './anomicon'
import CustomHeader from './header'
import CustomHeaderOff from './headeroff'
import CustomButtons from './buttons'
import SortableTable from './sortableTable'
import PresentationDriver from './PresentationDriver'
import SessionBox from './SessionBox'
import Select from 'react-select';
import {AttendeeSelector, TextInput} from '@doubledutch/react-components'
import 'react-select/dist/react-select.css';
import {openTab} from './utils'

const reorder = (fbc, list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  result.forEach((question, i) => {
    fbc.database.public.allRef('questions').child(question.session).child(question.key).update({order: i})
  })
  return result;
};

export default class Admin extends Component {
  constructor() {
    super()
    this.state = { 
      value: '', 
      session: 'All',
      question: '', 
      vote: '', 
      questions: [],
      pinnedQuestions: [],
      admins: [],
      sessions: [],
      showRecent: false,
      modalVisible: false, 
      color: 'white',
      marginTop: 18, 
      moderator: [],
      anom: [], 
      showBlock: false, 
      showAnswer: false, 
      newQuestions: 0, 
      openVar: false,
      modalColor: "#FAFAFA",
      hideSessions: false,
      hideSettings: false,
      hideAdmins: false,
      message: "* Please enter a valid session name" 
    }
  }

  backgroundUrlRef = () => this.props.fbc.database.public.adminRef('backgroundUrl') 
  publicUsersRef = () => this.props.fbc.database.public.usersRef()

  componentDidMount() {
      const {fbc} = this.props
      const modRef = fbc.database.public.adminRef('moderators')
      const sessRef = fbc.database.public.adminRef('sessions')
      const anomRef = fbc.database.public.adminRef('askAnom')
      const adminableUsersRef = () => fbc.database.private.adminableUsersRef()

      this.backgroundUrlRef = () => fbc.database.public.adminRef('backgroundUrl') 
      this.backgroundUrlRef().on('value', data => this.setState({backgroundUrl: data.val()}))
      fbc.getLongLivedAdminToken().then(longLivedToken => this.setState({longLivedToken}))

      adminableUsersRef().on('value', data => {
        const users = data.val() || {}
        this.setState(state => {
          return {
            admins: Object.keys(users).filter(id => users[id].adminToken)
          }
        })
      })

      sessRef.on('child_added', data => {
        this.setState({ sessions: [{...data.val(), key: data.key }, ...this.state.sessions] })
        var session = data
        fbc.database.public.allRef('questions').child(session.key).on('child_added', data => {
          var pinnedQuestions = this.state.pinnedQuestions
          if (data.val().pin) { pinnedQuestions = [...this.state.pinnedQuestions, {...data.val(), key: data.key }] }
             pinnedQuestions.sort(function (a,b){ return a.order - b.order })
          this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }], pinnedQuestions })

          fbc.database.public.allRef('votes').child(data.key).on('child_added', vote => {
            const userVote = vote.key === client.currentUser.id
            var questions = this.state.questions.map(question => 
              question.key === data.key ?
              { ...question, myVote: userVote, score: question.score + 1}
              : 
              question
            )
            this.setState({questions})
          })
          fbc.database.public.allRef('votes').child(data.key).on('child_removed', vote => {
            var userVote = true
            if (vote.key === client.currentUser.id){
              userVote = false
            }
            var questions = this.state.questions.map(question => 
              question.key === data.key ?
                { ...question, myVote: userVote, score: question.score - 1}
                : 
                question
            )
            this.setState({questions})
          })
        })
        fbc.database.public.allRef('questions').child(session.key).on('child_changed', data => {
          var questions = this.state.questions
          var pinnedQuestions = this.state.pinnedQuestions
          var isInPinned = pinnedQuestions.find(question => question.key === data.key)
          for (var i in questions) {
            if (questions[i].key === data.key) {
              var score = questions[i].score
              questions[i] = data.val()
              questions[i].score = score
              questions[i].key = data.key
              this.setState({questions})
            }
          }
          for (var i in pinnedQuestions){
            if (pinnedQuestions[i].key === data.key) {
              var score = questions[i].score
              pinnedQuestions[i] = data.val()
              pinnedQuestions[i].score = score
              pinnedQuestions[i].key = data.key
              pinnedQuestions.sort(function (a,b){ return a.order - b.order })
              this.setState({pinnedQuestions})
            }
          }
          if (data.val().pin && !isInPinned) {
            this.setState({ pinnedQuestions: [...this.state.pinnedQuestions, {...data.val(), key: data.key }] })
          }
        })
      })
      
      sessRef.on('child_changed', data => {
        var sessions = this.state.sessions
        for (var i in sessions){
          if (sessions[i].key === data.key) {
            sessions[i] = data.val()
            sessions[i].key = data.key
            this.setState({sessions})
          }
        }
      })

      sessRef.on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.session !== data.key) })
        this.setState({ sessions: this.state.sessions.filter(x => x.key !== data.key) })
      })
    
      modRef.on('child_added', data => {
        this.setState({ moderator: [...this.state.moderator, {...data.val(), key: data.key }] })
      })

      modRef.on('child_changed', data => {
        var moderator = this.state.moderator
        var questions = this.state.questions
        for (var i in moderator) {
          if (moderator[i].key === data.key) {
            moderator[i] = data.val()
            moderator[i].key = data.key
            if (data.val().approve === false){
              for (var q in questions){
                if (questions[q].approve === false && questions[q].new === true){
                  this.makeApprove(questions[q])
                }
              }
            }
            this.setState({moderator})
          }
        }
      })
      anomRef.on('child_added', data => {
        this.setState({ anom: [...this.state.anom, {...data.val(), key: data.key }] })
      })

      anomRef.on('child_changed', data => {
        var anom = this.state.anom
        for (var i in anom) {
          if (anom[i].key === data.key) {
            anom[i] = data.val()
            anom[i].key = data.key
            this.setState({anom})
          }
        }
      })    
  }

  questionsInCurrentSession = (questions) => {
    const {session} = this.state
    if (session === 'All') return questions
    else return questions.filter(question => question.session === session)
  }

  render() {
    const { questions, sessions, backgroundUrl, launchDisabled } = this.state 
    questions.sort(function (a,b){
      return b.dateCreate - a.dateCreate
    })
    const newQuestions = this.questionsInCurrentSession(questions)
    const pinnedQuestions = this.questionsInCurrentSession(this.state.pinnedQuestions)
    return (
    <div className="App">
      <div className="containerSmall">
        <SessionBox openVar = {this.state.openVar} closeModal = {this.closeModal} newSession = {this.newSession}
        sessions = {this.state.sessions} confirmDelete = {this.confirmDelete} confirmEdit = {this.confirmEdit}
        modalColor = {this.state.modalColor} message = {this.state.message} hideSection={this.hideSection} hideSessions={this.state.hideSessions}/>
      </div>
      <div className="container">
        {this.renderLeftHeader()}
        <div className="questionsContainer">
          {this.renderLeft(newQuestions, sessions)}
          {this.renderRight(newQuestions, pinnedQuestions)}
        </div>
        <div>
        <CSVLink className="csvButton" data={this.questionsInCurrentSession(questions).map(questionForCsv)} filename={"questions.csv"}>Export Questions</CSVLink>
        </div>
      </div>
      {this.state.hideSettings ? <div className="containerSmallRow">
        <div className="buttonSpan">
          <h2>Settings</h2>
          <div style={{flex:1}}/>
          <button className="hideButton" onClick={() => this.hideSection("Settings")}>Show Section</button>
        </div>
      </div> : <div className="containerSmallRow">
        <div className="cellBoxTop">
          <h2>Settings</h2>
          <div style={{flex:1}}/>
          <button className="hideButton" onClick={() => this.hideSection("Settings")}>Hide Section</button>
        </div>
        <div className="topBox">
          <p className='boxTitleBold'>Allow Attendees to Ask Anonymous Questions</p>
          <AnomIcon anom = {this.state.anom} offApprove = {this.offAnom} onApprove = {this.onAnom}/>
        </div>
        <div className="topBox">
          <p className='boxTitleBold'>Image for Presentation Background (Optional)</p>
          <input type="text" value={backgroundUrl} onChange={this.onBackgroundUrlChange} placeholder="Custom background image URL. Suggested at least 700px high and wide." className="background-url" />
        </div>
      </div> }
      <div className="containerSmall">
        {this.renderAdminSelect()}
      </div>
    </div>
    )
  }


  renderAdminSelect = () => {
    return (
      <div style={{marginRight: 20, marginBottom: 20}}>
          <div className="cellBoxTop">
            <h2>Settings</h2>
            <div style={{flex:1}}/>
            <button className="hideButton" onClick={() => this.hideSection("Admins")}>Hide Section</button>
          </div>
          { this.state.hideAdmins ? null : <AttendeeSelector 
            client={client}
            searchTitle="Select Admins"
            selectedTitle="Current Admins"
            onSelected={this.onAdminSelected}
            onDeselected={this.onAdminDeselected}
            selected={this.props.attendees.filter(a => this.isAdmin(a.id))} /> }
      </div>
    )
  }

  isAdmin(id) {
    return this.state.admins.includes(id)
  }

  getAttendees = query => client.getAttendees(query)

  renderPresentation = () => {
    const { launchDisabled } = this.state
    return (
      <div className="presentation-container">
        <div className="presentation-side">
          <iframe className="big-screen-container" src={this.bigScreenUrl()} title="presentation" />
          <div className="presentation-overlays">
            <div>Presentation Screen <button className="overlay-button" onClick={this.launchPresentation} disabled={launchDisabled || !this.bigScreenUrl()}>Launch in new tab</button></div>
          </div>
        </div>
        <div className="presentation-side">
          <PresentationDriver fbc={this.props.fbc} session={this.state.session}/>
        </div>
      </div>
    )
  }

  renderLeft = (questions, sessions) => {
    var totalQuestions = questions.filter(item => item.approve === false && item.new === true)
    if (totalQuestions === undefined){
      totalQuestions = ['']
    }
    var header = true
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === true) {
        return (
        <div className="questionContainer">
          <span className="buttonSpan">
            <p className='boxTitle'>New ({totalQuestions.length})</p>
            <span className="spacer"/>
            {(totalQuestions.length) ? <button className="approveButton" onClick={this.approveAll(questions)}>Mark All As Approved</button> : null}
          </span>
          <span className="questionBox">
            <ul className='listBox'>
              { questions.filter(task => task.new).map(task => {
                var difference = doDateMath(task.dateCreate)
                return (
                  <li className='cellBox' key={task.key}>
                    <CustomCell task = {task} difference = {difference}
                    />
                    <CustomButtons task = {task} header = {header} makeApprove = {this.makeApprove} blockQuestion = {this.blockQuestion}
                      canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer} />
                  </li>
                )
              }) }
            </ul>
          </span>
        </div>
        )
      }
      else {
        return(
        <div className="questionContainer">
          <span className="buttonSpan"><p className='boxTitle'>New ({totalQuestions.length})</p></span>
          <span className="questionBox">
            <div className="modTextBox">
              <p className="bigModText">Moderation is turned off</p>
              <p className="smallModText">All submitted questions will appear in the</p>
              <p className="smallModText">approved questions list</p>
            </div>
          </span>
        </div>
        )
      }
    }

    else{
      return(
        <div className="questionContainer">
          <span className="buttonSpan"><p className='boxTitle'>New ({totalQuestions.length})</p></span>
          <span className="questionBox">
            <div className="modTextBox">
              <p className="bigModText">Create a Session to Start Q &amp; A</p>
              <p className="smallModText">All submitted questions will appear below</p>
            </div>
          </span>
        </div>
      )
    }
  }

  renderLeftHeader = () => {
    const sample = {value: "All", label: "All", className: "dropdownText"}
    const sessions = []
    const sessionName = this.state.currentSession ? {value: "", label: this.state.currentSession.sessionName || "", className: "dropdownText"} : sample
    sessions.push(sample)
    this.state.sessions.forEach(session => sessions.push(Object.assign({}, {value: session.key, label: session.sessionName, className: "dropdownText"})))
    return (
      <span className="buttonSpan">
        <h2 className="noPadding">Moderation</h2>
        <Select
          className="dropdownMenu" 
          name="session"
          value={sessionName}
          onSelectResetsInput={false}
          onBlurResetsInput={false}
          onChange={this.handleSessionChange}
          clearable={false}
          options={sessions}
          disabled={this.state.disabled}
        />
        <p className='boxTitleBoldMargin'>Moderation:   </p>
        <ModIcon moderator = {this.state.moderator} offApprove = {this.offApprove} onApprove = {this.onApprove} />
        {this.state.session === "All" ? null : <span className="buttonSpanMargin">
          <PresentationDriver fbc={this.props.fbc} session={this.state.session}/>
          <button className="overlay-button" onClick={this.launchPresentation} disabled={this.state.launchDisabled || !this.bigScreenUrl()}>Launch in new tab</button>
        </span> }
      </span>
    )
  }

  renderBlocked = (questions) => {
    return(
    <span className="questionBox2">
      { questions.filter(task => task.new === false && task.block === true).length
        ? <ul className="listBox">
            { questions.filter(task => task.block).map(task => {
              var block = true
              var difference = doDateMath(task.dateCreate)
              return (
                <li className='cellBox' key={task.key}>
                  <CustomCell task = {task} difference = {difference} />
                  <CustomButtons task = {task} block = {block} makeApprove = {this.makeApprove} blockQuestion = {this.blockQuestion}
                    canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer} />
                </li>
              )
            }) }
          </ul>
        : this.renderMessage("Blocked Questions Will Display Here", "Blocked questions will not be visible to", "attendees")
      }
    </span>
    )
  }


  renderAnswered = (questions) => {
    questions.sort(function (a,b){
      return b.lastEdit - a.lastEdit
    })
    return (
      <span className="questionBox2">
      { questions.filter(task => task.answered === true).length
        ? <ul className="listBox">
            { questions.filter(task => task.answered).map(task => {
              var difference = doDateMath(task.dateCreate)
              return (
                <li className='cellBox' key={task.key}>
                  <CustomCell task = {task} difference = {difference} />
                  <CustomButtons task = {task} answered = {true} blockQuestion = {this.blockQuestion} />
                </li>
              )
            }) }
          </ul>
        : this.renderMessage("Answered Questions Will Display Here", "Click Check next to any approved question", "to mark it as answered")
      }
      </span>
    )
  }
  

  renderPinned = (questions) => {
    var questions = questions.filter(question => question.answered === false && question.block === false)
    if (this.state.session !== "All"){
      return (
        <span>
          <SortableTable items={questions} origItems = {this.state.questions} onDragEnd = {this.onDragEnd} 
            makeApprove = {this.makeApprove} blockQuestion = {this.blockQuestion} canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer}/>
        </span>
      )
    }
  else return (
   questions.map(task => {
    var pin = true
    var approve = true
    var difference = doDateMath(task.dateCreate)
    var origQuestion = this.state.questions.find(question => question.key === task.key)
    task.score = origQuestion.score || 0
    return (
      <li className='cellBox' key={task.key}>
        <CustomCell task = {task} difference = {difference} />
        <CustomButtons task = {task} pin = {pin} approve = {approve} makeApprove = {this.makeApprove} blockQuestion = {this.blockQuestion}
        canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer} />
      </li>
    )
  })
    )
  }

  setAdmin(userId, isAdmin, fbc) {
    const tokenRef = fbc.database.private.adminableUsersRef(userId).child('adminToken')
    if (isAdmin) {
      fbc.getLongLivedAdminToken().then(token => tokenRef.set(token))
    } else {
      tokenRef.remove()
    }
  }

  onAdminSelected = attendee => {
    const tokenRef = this.props.fbc.database.private.adminableUsersRef(attendee.id).child('adminToken')
    this.setState()
    this.props.fbc.getLongLivedAdminToken().then(token => tokenRef.set(token))
  }

  onAdminDeselected = attendee => {
    const tokenRef = this.props.fbc.database.private.adminableUsersRef(attendee.id).child('adminToken')
    tokenRef.remove()
  }

  onDragEnd = (result) =>{
    var items = this.questionsInCurrentSession(this.state.pinnedQuestions)
    if (!result.destination) {
      return;
    }
    else {
      items = reorder(
        this.props.fbc,
        items,
        result.source.index,
        result.destination.index
      )
    }
    this.setState({ pinnedQuestions: items });  
  }

  renderMessage = (m1, m2, m3) => (
    <div className="modTextBox">
      <p className="bigModText">{m1}</p>
      <p className="smallModText">{m2}</p>
      <p className="smallModText">{m3}</p>
    </div>
  )

  renderRight = (questions, pinnedQuestions) => {
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === false) {
        if (this.state.showBlock === false && this.state.showAnswer === false) {
          let approve = true
          return(
            <div className="questionContainer">
              <CustomHeaderOff questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
                answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved} />
              <span className="questionBox2">
                { questions.filter(task => task.block === false && task.answered === false).length
                  ? <ul className="listBox">
                      {this.renderPinned(pinnedQuestions)}
                      { questions.filter(t => !t.block && !t.pin && !t.answered).map(task => {
                        var difference = doDateMath(task.dateCreate)
                        return (
                          <li className='cellBox' key={task.key}>
                            <CustomCell task = {task} difference = {difference} />
                            <CustomButtons task = {task} approve = {approve} makeApprove = {this.makeApprove}
                              blockQuestion = {this.blockQuestion} canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer} />
                          </li>
                        )
                      }) }
                    </ul>
                  : this.renderMessage("Approved Questions Will Display Here", "All approved questions will be visible to", "attendees")}
              </span>
            </div>
          )
        }

        if (this.state.showAnswer === true){
          return(
          <div className="questionContainer">
            <CustomHeaderOff questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved} />
            {this.renderAnswered(questions)}
          </div>
          )
        }
        
        else {
          return(
          <div className="questionContainer">
            <CustomHeaderOff questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved} />
            {this.renderBlocked(questions)}
          </div>
          )
        }
      }

      if (this.state.moderator[0].approve === true){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          return (
            <div className="questionContainer">
              <CustomHeader questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
              answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} />
              <span className="questionBox2">
                { questions.filter(task => task.block === false && task.answered === false && task.approve === true && task.new === false).length
                  ? <ul className="listBox">
                      { this.renderPinned(pinnedQuestions) }
                      { questions.filter(t => t.approve && !t.block && !t.pin && !t.answered).map(task => (
                        <li className='cellBox' key={task.key}>
                          <CustomCell task = {task} difference = {doDateMath(task.dateCreate)} />
                          <CustomButtons task = {task} approve = {true} makeApprove = {this.makeApprove} blockQuestion = {this.blockQuestion}
                          canPin = {this.canPin} makePin = {this.makePin} makeAnswer = {this.makeAnswer} />
                        </li> )
                      ) }
                    </ul>
                  : this.renderMessage("Approved Questions Will Display Here", "All approved questions will be visible to", "attendees")
                }
              </span>
            </div>
          )
        }

        if (this.state.showAnswer === true){
          return(
          <div className="questionContainer">
            <CustomHeader questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved}/>
            {this.renderAnswered(questions)}
          </div>
          )
        }
        else {
          return(
          <div className="questionContainer">
            <CustomHeader questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer} answerAll = {this.answerAll}
            showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved} />
            {this.renderBlocked(questions)}
          </div>
          )
        }
      }
    }

    else {
      return(
        <div className="questionContainer">
          <CustomHeader questions = {questions} handleClick = {this.handleClick} handleAnswer = {this.handleAnswer}
          answerAll = {this.answerAll} showBlock = {this.state.showBlock} showAnswer = {this.state.showAnswer} handleApproved = {this.handleApproved} />
          {this.renderBlocked(questions)}
        </div>
      )
    }
  }

  confirmEdit = (task, value) => {
    this.props.fbc.database.public.adminRef('sessions').child(task.key).update({sessionName: value})
    .catch(error => {alert("Please retry saving your session")})
  }

  confirmDelete = (task) => {
    const status = task.archive || false
    this.props.fbc.database.public.adminRef('sessions').child(task.key).update({archive: !status})
    this.setState({ session: 'All' })
  }

  handleClick = () => {
    this.setState({
      showAnswer: false,
      showBlock: true
    })
  }


  handleAnswer = () => {
    this.setState({
      showAnswer: true,
      showBlock: false
    })
  }

  handleApproved = () => {
    this.setState({
      showAnswer: false,
      showBlock: false
    })
  }

  openModal = () => {
    this.setState({openVar: true, modalColor: "#FAFAFA", message: "* Please enter a session name"});
  }


  closeModal = () => {
    this.setState({openVar: false});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSessionChange = (selected) => {
    if (selected) {
      const currentSession = this.state.sessions.find(session => session.key === selected.value)
      this.setState({session: selected.value, currentSession})
    }
  }

  clearValue = (e) => {
    this.select.setInputValue('');
    this.setState({session: "All"})
	}

  hideSection = (section) => {
    const currentSection = "hide" + section
    const currentState = this.state[currentSection]
    this.setState({[currentSection]: !currentState})
  }

  newSession = (newSession) =>  {
    if (this.state.moderator.length === 0){
      this.props.fbc.database.public.adminRef('moderators').push({"approve": false})
    }
    this.props.fbc.database.public.adminRef('sessions').push({sessionName: newSession})
    .catch(error => {alert("Please retry saving your session")})
  }

  onApprove = () => {
    if (this.state.moderator.length === 0) {
      this.propsfbc.database.public.adminRef('moderators').push({"approve": true})
    }
    else {
      const mod = this.state.moderator[0]
      this.props.fbc.database.public.adminRef('moderators').child(mod.key).update({"approve": true})
    }
  }

  offApprove = () => {
    const anom = this.state.moderator[0]
    this.props.fbc.database.public.adminRef('moderators').child(anom.key).update({"approve": false})
  }

  onAnom = () => {
    if (this.state.anom.length === 0) {
      this.props.fbc.database.public.adminRef('askAnom').push({"allow": true})
    }
    else {
      const anom = this.state.anom[0]
      this.props.fbc.database.public.adminRef('askAnom').child(anom.key).update({"allow": true})
    }
  }

  offAnom = () => {
    const anom = this.state.anom[0]
    this.props.fbc.database.public.adminRef('askAnom').child(anom.key).update({"allow": false})

  }

  makeApprove = (question) => {
    const time = new Date().getTime()
    this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"approve": true, 'block': false, 'new': false, 'lastEdit': time})
  }

  canPin = () => {
    if (this.state.session === "All") return false
    else { const pinned = this.state.pinnedQuestions.filter(question => question.answered === false && question.block === false)
      return pinned.length < 5
    }
  }

  makePin = (question) => {
    const pinned = this.state.pinnedQuestions
    const order = pinned.length
    if (this.canPin()) {
      this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"pin": true, "approve": true, 'block': false, 'new': false, "order": order})
    }
  }

  makeAnswer = (question) => {
    const time = new Date().getTime()
    this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'block': false, 'new': false, 'pin': false, 'lastEdit': time})
  }

  blockQuestion = (question) => {
    this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"block": true, "answered": false, 'approve': false, 'new': false, 'pin': false})
  }

  approveAll = (questions) => {
    if (questions.length) {
      questions.forEach(question => {
        if (question.new) {
          this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"new": false, "approve": true})
        }
      })
    }
  }

  answerAll = () => {
    const questions = this.state.questions
    let modOn = false
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0]) {
        modOn = this.state.moderator[0].approve
      }
    }
    if (questions) {
      questions.forEach(question => {
        if (modOn) {
          if (question.block !== true && question.approve){
            this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'new': false, 'pin': false})
          }
        }
        else {
          if (question.block !== true){
            this.props.fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'new': false, 'pin': false})
          }
        }
      })
    }
  }
  onBackgroundUrlChange = e => this.backgroundUrlRef().set(e.target.value)

  launchPresentation = () => {
    this.setState({launchDisabled: true})
    setTimeout(() => this.setState({launchDisabled: false}), 2000)
    openTab(this.bigScreenUrl())
  }

  getSession = () => {
    const session = this.state.sessions.find(item => item.key === this.state.session)
    return session.sessionName
  }

  bigScreenUrl = () => this.state.longLivedToken ? `?page=bigScreen&session=${encodeURIComponent(this.state.session)}&sessionName=${encodeURIComponent(this.getSession())}&token=${encodeURIComponent(this.state.longLivedToken)}` : null

}

function questionForCsv(q) {
  const boolText = x => x ? 'true' : 'false'
  const creator = q.creator || {}
  const Status = findStatus(q)
  return {
    Question: q.text,
    Status,
    Session: q.sessionName,
    First_Name: creator.firstName,
    Last_Name: creator.lastName,
    Email: creator.email
  }
}

function findStatus(item){
  if (item.block) return "Blocked"
  if (item.answered && !item.block) return "Answered"
  if (item.approve && !item.answered && !item.block) return "Approved"
  else return "Pending"
}

const doDateMath = date => ' ' + moment(date).fromNow()
