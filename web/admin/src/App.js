import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import client from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
const fbc = FirebaseConnector(client, 'qaapp')

fbc.initializeAppWithSimpleBackend()

export default class App extends Component {
  constructor() {
    super()
    this.state = { question: '', vote: '', questions: [], sharedVotes: [], characterCount: 0, showRecent: false, newUpdate: false, modalVisible: false, anom: false, color: 'white', height: 20, newValue: '', marginTop: 18, moderator: [], showBlock: false, newQuestions: 0, Approved: 0, Blocked: 0}
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.handleClick = this.handleClick.bind(this); 
  }
  componentDidMount() {
    this.signin.then(() => {
      const questionsRef = fbc.database.public.allRef('questions')
      const votesRef = fbc.database.public.allRef('votes')
      const modRef = fbc.database.public.allRef('moderators')
      modRef.on('child_added', data => {
        this.setState({ moderator: [...this.state.moderator, {...data.val(), key: data.key }] })
      })

      modRef.on('child_changed', data => {
        var moderator = this.state.moderator
        for (var i in moderator) {
          if (moderator[i].key === data.key) {
            moderator[i] = data.val()
            moderator[i].key = data.key
            this.setState({moderator})
            break
          }
        }
      })    

      questionsRef.on('child_added', data => {
        this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }] })
        fbc.database.public.allRef('votes').child(data.key).on('child_added', vote => {
          var userVote = false
          if (vote.key === client.currentUser.id){
            userVote = true
          }
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
      questionsRef.on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })
      questionsRef.on('child_changed', data => {
        var questions = this.state.questions
        for (var i in questions){
          if (questions[i].key === data.key) {
            questions[i] = data.val()
            questions[i].key = data.key
            this.setState({questions})
          }
        }
      })
    })
  }

  render() {
    const { questions, sharedVotes, showRecent, newUpdate, dropDown, newValue, height, marginTop, moderator} = this.state 
    const time = new Date().getTime()
    // var totalQuestions = questions.filter(item => item.approve === false && item.new === true)
    // if (totalQuestions === undefined){
    //   totalQuestions = ['']
    // }
    questions.sort(function (a,b){
      return b.dateCreate - a.dateCreate
    })
    return (
    <div className="App">
      {this.renderModal(questions)}
      <div className="topBox">
        <text className='bigBoxTitle'>{'Q & A'}</text>
        <text className='boxTitle'>Moderation:  </text>
        {this.renderModIcons()}
      </div>
      <div className="container">
        {/* <div className="questionContainer">
          <text className='boxTitle'>New Questions: {totalQuestions.length}</text>
          <span className="questionBox"> */}
            {this.renderHeader(questions, time)}
            
          {/* </span>
        </div> */}
        {this.renderRight(questions, time)}
      </div>
    
      

    </div>

    )
  }


  doDateMath = (date, time) => {
    var difference = Math.floor((time - date) / (1000*60))
    if (difference < 60) {
      difference = difference
      if (difference === 1) {
        difference = difference + " minute ago"
      }
      if (difference > 1) {
        difference = difference + " minutes ago"
      }
    }
    if (difference > 60) {
      difference = Math.floor(difference / 60) 
      if (difference === 1) {
        difference = difference + " hour ago"
      }
      if (difference > 1) {
        difference = difference + " hours ago"
      }
    }
    if (difference > 1440) {
      difference = Math.floor(difference / 1440) 
      if (difference === 1) {
        difference = difference + " day ago"
      }
      if (difference > 1) {
        difference = difference + " days ago"
      }
    }
    return difference
  }
  
  renderHeader = (questions, time) => {
    var totalQuestions = questions.filter(item => item.approve === false && item.new === true)
    if (totalQuestions === undefined){
      totalQuestions = ['']
    }
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === true) {
        return (
        <div className="questionContainer">
          <text className='boxTitle'>New Questions: {totalQuestions.length}</text>
          <span className="questionBox">
            <ul className='listBox'>
              { questions.map(task => {
                if (task.approve === false && task.new === true){
                  const { image, firstName, lastName } = task.creator
                  const {name} = task.event
                  const difference = this.doDateMath(task.dateCreate, time)
                  return (
                    <li className='cellBox' key={task.key}>
                      <span className='cellBoxLeft'>
                        <span className='cellBoxTop'>
                          <text className='introText'>{name}</text>
                          <text className='timeText'>{difference}</text>
                          <img src={require('./icons/Inactive.png')}/>
                          <text className='timeText'>  {task.score}</text>
                        </span>      
                        <text className="questionText">{task.text}</text>
                        <text className="nameText"> -{firstName} {lastName}</text>
                      </span>
                      <span className='cellBoxRight'>
                        <button className='button' onClick={()=>this.makeApprove(task)}>+</button>
                        <button className='button' onClick={()=>this.blockQuestion(task)}>x</button>
                      </span>
                    </li>
                  )
                }
              })
              }
            </ul>
            <button onClick={() => this.openModal()}>Remove All</button>
            
          </span>
        </div>
        )
      }
      else {
        return(
        <div className="questionContainer">
          <text className='boxTitle'>New Questions: {totalQuestions.length}</text>
          <span className="questionBox">
            <div className="modTextBox">
              <text className="bigModText">Moderation is turned off</text>
              <text className="smallModText">All submitted questions will appear in the</text>
              <text className="smallModText">approved questions list</text>
            </div>
          </span>
        </div>
        )
      }
    }
  }

  renderModIcons = () => {
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === true){
        return ( 
        <span>
          <button className="modButton" style={{position:"absolute"}} onClick={()=>this.markComplete()}>Yes</button>
          <button className="modButton2"  style={{marginLeft:"35px", width:"45px"}}onClick={()=>this.offApprove()}>No</button>
        </span>
        )
      }
      else {
        return (
        <span>
          <button className="modButton2" style={{width:"45px"}} onClick={()=>this.markComplete()}>Yes</button>
          <button className="modButton" style={{marginLeft:"-5px"}} onClick={()=>this.offApprove()}>No</button>
        </span>
        )
      }
    }
    else {
      return (
      <span>
        <button className="modButton2" style={{width:"45px"}} onClick={()=>this.markComplete()}>Yes</button>
        <button className="modButton" style={{marginLeft:"-5px"}} onClick={()=>this.offApprove()}>No</button>
      </span>
      )
    }
  }
  
  showButtons = () => {
    var totalQuestions = this.state.questions.filter(item => item.approve === true && item.new === false)
    var origQuestions = this.state.questions.filter(item => item.block === false)
    var blockedQuestions = this.state.questions.filter(item => item.block === true && item.new === false)
    if (totalQuestions === undefined){
      totalQuestions = ['']
    }
    if (blockedQuestions === undefined){
      blockedQuestions = ['']
    }
    if (origQuestions === undefined){
      origQuestions = ['']
    }
    if (this.state.moderator.length > 0){
      if (this.state.moderator[0].approve === false) {
        if (this.state.showBlock === false){
          return (
          <span>
            <button className="listButton" onClick={this.handleClick}>Approved Questions: {origQuestions.length}</button>
            <button className="listButton2" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
          </span>
          )
        }
        else {
          return (
          <span>
            <button className="listButton2" onClick={this.handleClick}>Approved Questions: {origQuestions.length}</button>
            <button className="listButton" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
          </span>
          )
        }
      }
      else {
        if (this.state.showBlock === false){
          return (
          <span>
            <button className="listButton" onClick={this.handleClick}>Approved Questions: {totalQuestions.length}</button>
            <button className="listButton2" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
          </span>
          )
        }
        else {
          return (
          <span>
            <button className="listButton2" onClick={this.handleClick}>Approved Questions: {totalQuestions.length}</button>
            <button className="listButton" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
          </span>
          )
        }
      }
    }
    else {
      if (this.state.showBlock === false){
        return (
        <span>
          <button className="listButton" onClick={this.handleClick}>Approved Questions: {totalQuestions.length}</button>
          <button className="listButton2" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
        </span>
        )
      }
      else {
        return (
        <span>
          <button className="listButton2" onClick={this.handleClick}>Approved Questions: {totalQuestions.length}</button>
          <button className="listButton" onClick={this.handleClick}>Blocked Questions: {blockedQuestions.length}</button>
        </span>
        )
      }
    }
  }

  handleClick() {
    this.setState(prevState => ({
      showBlock: !prevState.showBlock
    }));
  }

  renderRight = (questions, time) => {
    if (this.state.moderator.length > 0){
      if (this.state.moderator[0].approve === false){
        if (this.state.showBlock === false){
          return(
          <div className="questionContainer">
            {this.showButtons()}
            <span className="questionBox2">
              <ul className="listBox">
                { questions.map(task => {
                  if (task.block === false){
                    const difference = this.doDateMath(task.dateCreate, time)
                    const { image, firstName, lastName } = task.creator
                    const { name } = task.event
                    return (
                    <li className='cellBox' key={task.key}>
                      <span className='cellBoxLeft'>
                        <span className='cellBoxTop'>
                          <text className='introText'>{name}</text>
                          <text className='timeText'>{difference}</text>
                          <img src={require('./icons/Inactive.png')}/>
                          <text className='timeText'>  {task.score}</text>
                        </span>
                        <text className="questionText">{task.text}</text>
                        <text className="nameText"> -{firstName} {lastName}</text>
                      </span>
                      <span className='cellBoxRight'>
                        <button className='button' onClick={()=>this.makeApprove(task)}>+</button>
                        <button className='button' onClick={()=>this.blockQuestion(task)}>x</button>
                      </span>
                    </li>
                    )
                  }
                }) 
                }
              </ul>
            </span>
          </div>
          )
        }
      }
      
      if (this.state.moderator[0].approve === true){
        if (this.state.showBlock === false){
          return(
          <div className="questionContainer">
            {this.showButtons()}
            <span className="questionBox2">
              <ul className="listBox">
                { questions.map(task => {
                  if (task.approve === true && task.block === false){
                    const difference = this.doDateMath(task.dateCreate, time)
                    const { image, firstName, lastName } = task.creator
                    const { name } = task.event
                    return (
                    <li className='cellBox' key={task.key}>
                      <span className='cellBoxLeft'>
                        <span className='cellBoxTop'>
                          <text className='introText'>{name}</text>
                          <text className='introText'>Here</text>
                          <text className='timeText'>{difference}</text>
                          <img src={require('./icons/Inactive.png')}/>
                          <text className='timeText'>  {task.score}</text>
                        </span>
                        <text className="questionText">{task.text}</text>
                        <text className="nameText"> -{firstName} {lastName}</text>
                      </span>
                      <span className='cellBoxRight'>
                        <button className='button' onClick={()=>this.makeApprove(task)}>+</button>
                        <button className='button' onClick={()=>this.blockQuestion(task)}>x</button>
                      </span>
                    </li>
                    )
                  }
                })
                }
              </ul>
            </span>
          </div>
          )
        }
        else {
          return(
          <div className="questionContainer">
            {this.showButtons()}
            <span className="questionBox2">
              <ul className="listBox">
                { questions.map(task => {
                  if (task.approve === false && task.block === true){
                    const { image, firstName, lastName } = task.creator
                    const { name } = task.event
                    return (
                    <li className='cellBox' key={task.key}>
                      <span className='cellBoxLeft'>
                        <span className='cellBoxTop'>
                          <text className='introText'>{name}</text>
                        </span>
                        <text className="questionText">{task.text}</text>
                        <text className="nameText"> -{firstName} {lastName}</text>
                      </span>
                      <span className='cellBoxRight'>
                        <button className='button' onClick={()=>this.makeApprove(task)}>+</button>
                        <button className='button' onClick={()=>this.blockQuestion(task)}>x</button>
                      </span>
                    </li>
                    )
                  }
                }) 
                }
             </ul>
           </span>
          </div>
          )
        }
      }
      else {
        return(
        <div className="questionContainer">
          {this.showButtons()}
          <span className="questionBox2">
            <ul className="listBox">
              { questions.map(task => {
                if (task.approve === false && task.block === true){
                  const { image, firstName, lastName } = task.creator
                  const { name } = task.event
                  return (
                  <li className='cellBox' key={task.key}>
                    <span className='cellBoxLeft'>
                      <span className='cellBoxTop'>
                        <text className='introText'>{name}</text>
                      </span>
                      <text className="questionText">{task.text}</text>
                      <text className="nameText"> -{firstName} {lastName}</text>
                    </span>
                    <span className='cellBoxRight'>
                      <button className='button' onClick={()=>this.makeApprove(task)}>+</button>
                      <button className='button' onClick={()=>this.blockQuestion(task)}>x</button>
                    </span>
                  </li>
                  )
                }
              }) 
              }
            </ul>
          </span>
        </div>
        )
      }
    }
  }

 

  openModal() {
    this.setState({openVar: true});
  }


  closeModal() {
    this.setState({openVar: false});
  }

  renderModal = (questions) => {
    return(
    <Modal
    isOpen={this.state.openVar}
    onAfterOpen={this.afterOpenModal}
    onRequestClose={this.closeModal}
    contentLabel="Modal"
    >
      <text className="boxTitle">Are you sure you want to delete all?</text>
      <button onClick={this.closeModal}>Close</button>
      <button onClick={()=>this.deleteAll(questions)}>Delete All</button>
    </Modal>
    )
  }
  
  markComplete() {
    var mod = this.state.moderator[0]
    if (this.state.moderator.length === 0) {
      fbc.database.public.allRef('moderators').set({"approve": true})
    }
    else {
      fbc.database.public.allRef('moderators').child(mod.key).update({"approve": true})
    }
  }

  offApprove(){
    var mod = this.state.moderator[0]
    mod.approve = false
    fbc.database.public.allRef('moderators').child(mod.key).update({"approve": false})
  }

  makeApprove(question){
    fbc.database.public.allRef('questions').child(question.key).update({"approve": true, 'block': false, 'new': false})
  }

  blockQuestion(question){
    fbc.database.public.allRef('questions').child(question.key).update({"block": true, 'approve': false, 'new': false})
  }

  deleteAll(questions) {
    this.closeModal()
    if (questions !== undefined) {
      questions.map(question => {
        getRef(question).remove()
        function getRef(question) {
          return fbc.database.public.allRef('questions').child(question.key)
        }
      })
      this.setState({sharedTasks: []})
    }
  }

}

