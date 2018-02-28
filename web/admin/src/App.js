import React, { Component } from 'react'
import './App.css'
import client from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import CustomModal from './modal'
import CustomCell from './cell'
import ModIcon from './modicon'
import CustomHeader from './header';
import CustomHeaderOff from './headeroff';
import CustomButtons from './buttons';
const fbc = FirebaseConnector(client, 'questionanswer')
fbc.initializeAppWithSimpleBackend()

export default class App extends Component {
  constructor() {
    super()
    this.state = { 
      value: '', 
      session: 'All',
      question: '', 
      vote: '', 
      questions: [], 
      sessions: [], 
      showRecent: false,
      modalVisible: false, 
      anom: false, 
      color: 'white',
      marginTop: 18, 
      moderator: [], 
      showBlock: false, 
      showAnswer: false, 
      newQuestions: 0, 
      openVar: false,
      modalColor: "#FAFAFA",
      message: "* Please enter a valid session name" 
    }
    this.signin = fbc.signinAdmin()
      .then(user => this.user = user)
      .catch(error => {alert("Please try reloading page to connect to the database")})
  }
  componentDidMount() {
    this.signin.then(() => {
      const modRef = fbc.database.public.adminRef('moderators')
      const sessRef = fbc.database.public.adminRef('sessions')

      sessRef.on('child_added', data => {
        this.setState({ sessions: [...this.state.sessions, {...data.val(), key: data.key }] })
        var session = data
        fbc.database.public.allRef('questions').child(session.key).on('child_added', data => {
          this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }] })
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
          for (var i in questions) {
            if (questions[i].key === data.key) {
              var score = questions[i].score
              questions[i] = data.val()
              questions[i].score = score
              questions[i].key = data.key
              this.setState({questions})
              break
            }
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
    })
  }

  render() {
    const { questions, sessions } = this.state 
    const time = new Date().getTime()
    questions.sort(function (a,b){
      return b.dateCreate - a.dateCreate
    })
    var newQuestions = questions
    if (this.state.session !== 'All'){
      newQuestions = questions.filter(question => question.session === this.state.session)
    }

    return (
    <div className="App">
      <CustomModal
      openVar = {this.state.openVar}
      closeModal = {this.closeModal}
      newSession = {this.newSession}
      sessions = {this.state.sessions}
      confirmDelete = {this.confirmDelete}
      confirmEdit = {this.confirmEdit}
      modalColor = {this.state.modalColor}
      message = {this.state.message}
      />
      <div className="topBox">
        <p className='bigBoxTitle'>{'Q & A'}</p>
        <button className="qaButton" onClick={this.openModal}>Add Q&A Session</button>
      </div>
      <div className="container">
        {this.renderLeft(newQuestions, time, sessions)}
        {this.renderRight(newQuestions, time)}
      </div>
    </div>
    )
  }

  renderLeft = (questions, time, sessions) => {
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
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
            <p className='boxTitle'>Moderation:   </p>
            <ModIcon
            moderator = {this.state.moderator}
            offApprove = {this.offApprove}
            onApprove = {this.onApprove}
            />
            <span className="spacer"/>
            <form className="dropdownMenu" onSubmit={this.handleSubmit}>
              <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
              <option style={{textAlign: "center"}} value="All">{'\xa0\xa0'}All Sessions</option>
              { sessions.map(task => {
                var title = task.sessionName
                if (title.length > 50){
                  var newTitle = task.sessionName.slice(0, 75)
                  title = newTitle + "..."
                }
                return (
                <option style={{textAlign: "center"}} key={task.key} value={task.key}>{'\xa0\xa0' + title}</option>  
                )      
              })
              }
              </select>
            </form> 
          </span>
          <span className="questionBox">
            <ul className='listBox'>
              { questions.filter(task => task.new).map(task => {
                var difference = this.doDateMath(task.dateCreate, time)
                return (
                  <li className='cellBox' key={task.key}>
                    <CustomCell
                      task = {task}
                      difference = {difference}
                    />
                    <CustomButtons
                      task = {task}
                      header = {header}
                      makeApprove = {this.makeApprove}
                      blockQuestion = {this.blockQuestion}
                      canPin = {this.canPin}
                      makePin = {this.makePin}
                      makeAnswer = {this.makeAnswer}
                    />
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
          <span className="buttonSpan">
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
            <p className='boxTitle'>Moderation:   </p>
            <ModIcon
            moderator = {this.state.moderator}
            offApprove = {this.offApprove}
            onApprove = {this.onApprove}
            />
            <span className="spacer"/>
            <form className="dropdownMenu" onSubmit={this.handleSubmit}>
              <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
              <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
              { sessions.map(task => {
                  var title = task.sessionName
                  if (title.length > 50){
                    var newTitle = task.sessionName.slice(0, 75)
                    title = newTitle + "..."
                  }
                return (
                <option key={task.key} value={task.key}>{'\xa0\xa0' + title}</option>  
                )      
              })
              }
              </select>
            </form> 
          </span>
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
          <span className="buttonSpan">
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
              <p className='boxTitle'>Moderation:   </p>
              <ModIcon
              moderator = {this.state.moderator}
              offApprove = {this.offApprove}
              onApprove = {this.onApprove}
              />
              <span className="spacer"/>
              <form className="dropdownMenu" onSubmit={this.handleSubmit}>
                <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
                <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
                { sessions.map(task => {
                    var title = task.sessionName
                    if (title.length > 75){
                      var newTitle = task.sessionName.slice(0, 75)
                      title = newTitle + "..."
                    }
                  return (
                  <option key={task.key} value={task.key}>{'\xa0\xa0' + title}</option>  
                  )      
                })
                }    
                </select>
              </form> 
            </span>
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

  renderBlocked = (questions, time) => {
    return(
    <span className="questionBox2">
      { questions.filter(task => task.new === false && task.block === true).length
        ? <ul className="listBox">
            { questions.filter(task => task.block).map(task => {
              var block = true
              var difference = this.doDateMath(task.dateCreate, time)
              return (
                <li className='cellBox' key={task.key}>
                  <CustomCell
                    task = {task}
                    difference = {difference}
                  />
                  <CustomButtons
                    task = {task}
                    block = {block}
                    makeApprove = {this.makeApprove}
                    blockQuestion = {this.blockQuestion}
                    canPin = {this.canPin}
                    makePin = {this.makePin}
                    makeAnswer = {this.makeAnswer}
                  />
                </li>
              )
            }) }
          </ul>
        : this.renderMessage("Blocked Questions Will Display Here", "Blocked questions will not be visible to", "attendees")
      }
    </span>
    )
  }


  renderAnswered = (questions, time) => {
    questions.sort(function (a,b){
      return b.lastEdit - a.lastEdit
    })
    return (
      <span className="questionBox2">
      { questions.filter(task => task.answered === true).length
        ? <ul className="listBox">
            { questions.filter(task => task.answered).map(task => {
              var difference = this.doDateMath(task.dateCreate, time)
              return (
                <li className='cellBox' key={task.key}>
                  <CustomCell
                    task = {task}
                    difference = {difference}
                  />
                  <span className='cellBoxRight'></span>
                </li>
              )
            }) }
          </ul>
        : this.renderMessage("Answered Questions Will Display Here", "Click Check next to any approved question", "to mark it as answered")
      }
      </span>
    )
  }
  

  renderPinned = (questions, time) => {
    return (
      <span>
        { questions.filter(task => task.pin).map(task => {
          var pin = true
          var approve = true
          var difference = this.doDateMath(task.dateCreate, time)
          return (
            <li className='cellBox' key={task.key}>
              <CustomCell
              task = {task}
              difference = {difference}
              />
              <CustomButtons
              task = {task}
              pin = {pin}
              approve = {approve}
              makeApprove = {this.makeApprove}
              blockQuestion = {this.blockQuestion}
              canPin = {this.canPin}
              makePin = {this.makePin}
              makeAnswer = {this.makeAnswer}
              />
            </li>
          )
        }) }
      </span>
    )
  }

  renderMessage = (m1, m2, m3) => (
    <div className="modTextBox">
      <p className="bigModText">{m1}</p>
      <p className="smallModText">{m2}</p>
      <p className="smallModText">{m3}</p>
    </div>
  )

  renderRight = (questions, time) => {
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === false) {
        if (this.state.showBlock === false && this.state.showAnswer === false) {
          let approve = true
          return(
            <div className="questionContainer">
              <CustomHeaderOff
                questions = {questions}
                handleClick = {this.handleClick}
                handleAnswer = {this.handleAnswer}
                answerAll = {this.answerAll}
                showBlock = {this.state.showBlock}
                showAnswer = {this.state.showAnswer}
                handleApproved = {this.handleApproved}
              />
              <span className="questionBox2">
                { questions.filter(task => task.block === false && task.answered === false).length
                  ? <ul className="listBox">
                      {this.renderPinned(questions, time)}
                      { questions.filter(t => !t.block && !t.pin && !t.answered).map(task => {
                        var difference = this.doDateMath(task.dateCreate, time)
                        return (
                          <li className='cellBox' key={task.key}>
                            <CustomCell
                              task = {task}
                              difference = {difference}
                            />
                            <CustomButtons
                              task = {task}
                              approve = {approve}
                              makeApprove = {this.makeApprove}
                              blockQuestion = {this.blockQuestion}
                              canPin = {this.canPin}
                              makePin = {this.makePin}
                              makeAnswer = {this.makeAnswer}
                            />
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
            <CustomHeaderOff
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        
        else {
          return(
          <div className="questionContainer">
            <CustomHeaderOff
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
      }

      if (this.state.moderator[0].approve === true){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          return (
            <div className="questionContainer">
              <CustomHeader
              questions = {questions}
              handleClick = {this.handleClick}
              handleAnswer = {this.handleAnswer}
              answerAll = {this.answerAll}
              showBlock = {this.state.showBlock}
              showAnswer = {this.state.showAnswer}
              />
              <span className="questionBox2">
                { questions.filter(task => task.block === false && task.answered === false && task.approve === true && task.new === false).length
                  ? <ul className="listBox">
                      { this.renderPinned(questions, time) }
                      { questions.filter(t => t.approve && !t.block && !t.pin && !t.answered).map(task => (
                        <li className='cellBox' key={task.key}>
                          <CustomCell
                            task = {task}
                            difference = {this.doDateMath(task.dateCreate, time)}
                          />
                          <CustomButtons
                            task = {task}
                            approve = {true}
                            makeApprove = {this.makeApprove}
                            blockQuestion = {this.blockQuestion}
                            canPin = {this.canPin}
                            makePin = {this.makePin}
                            makeAnswer = {this.makeAnswer}
                          />
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
            <CustomHeader
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        else {
          return(
          <div className="questionContainer">
            <CustomHeader
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
      }
    }

    else {
      return(
        <div className="questionContainer">
          <CustomHeader
          questions = {questions}
          handleClick = {this.handleClick}
          handleAnswer = {this.handleAnswer}
          answerAll = {this.answerAll}
          showBlock = {this.state.showBlock}
          showAnswer = {this.state.showAnswer}
          handleApproved = {this.handleApproved}
          />
          {this.renderBlocked(questions, time)}
        </div>
      )
    }
  }

  doDateMath = (date, time) => {
    const minutesAgo = Math.floor((time - date) / (1000*60))
    if (minutesAgo < 60) {
      if (minutesAgo === 1) {
        return minutesAgo + " minute ago"
      }
      if (minutesAgo > 1) {
        return minutesAgo + " minutes ago"
      }
      else {
        return "0 minutes ago"
      }
    } else if (minutesAgo > 60 && minutesAgo < 1440) {
      const hoursAgo = Math.floor(minutesAgo / 60) 
      if (hoursAgo === 1) {
        return hoursAgo + " hour ago"
      }
      if (hoursAgo > 1) {
        return hoursAgo + " hours ago"
      }
    } else if (minutesAgo >= 1440) {
      const daysAgo = Math.floor(minutesAgo / 1440) 
      if (daysAgo === 1) {
        return daysAgo + " day ago"
      }
      if (daysAgo > 1) {
        return daysAgo + " days ago"
      }
    }
  }

  confirmEdit = (task, value) => {
    fbc.database.public.adminRef('sessions').child(task.key).update({sessionName: value})
    .catch(error => {alert("Please retry saving your session")})
  }

  confirmDelete = (task) => {
    fbc.database.public.adminRef('sessions').child(task.key).remove()
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

  handleSubmit = (event) => {
  }

  newSession = (newSession) =>  {
    if (this.state.moderator.length === 0){
      fbc.database.public.adminRef('moderators').push({"approve": false})
    }
    fbc.database.public.adminRef('sessions').push({sessionName: newSession})
    .catch(error => {alert("Please retry saving your session")})
  }

  onApprove = () => {
    if (this.state.moderator.length === 0) {
      fbc.database.public.adminRef('moderators').push({"approve": true})
    }
    else {
      const mod = this.state.moderator[0]
      fbc.database.public.adminRef('moderators').child(mod.key).update({"approve": true})
    }
  }

  offApprove = () => {
    const mod = this.state.moderator[0]
    fbc.database.public.adminRef('moderators').child(mod.key).update({"approve": false})
  }

  makeApprove = (question) => {
    const time = new Date().getTime()
    fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"approve": true, 'block': false, 'new': false, 'lastEdit': time})
  }

  canPin = () => this.state.questions.filter(task => task.pin === true).length < 3

  makePin = (question) => {
    if (this.canPin()) {
      fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"pin": true, "approve": true, 'block': false, 'new': false})
    }
  }

  makeAnswer = (question) => {
    const time = new Date().getTime()
    fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'block': false, 'new': false, 'pin': false, 'lastEdit': time})
  }

  blockQuestion = (question) => {
    fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"block": true, 'approve': false, 'new': false, 'pin': false})
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
            fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'new': false, 'pin': false})
          }
        }
        else {
          if (question.block !== true){
            fbc.database.public.allRef('questions').child(question.session).child(question.key).update({"answered": true, 'new': false, 'pin': false})
          }
        }
      })
    }
  }
}
