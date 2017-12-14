import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
import client, {Color} from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
const fbc = FirebaseConnector(client, 'questionanswer')


fbc.initializeAppWithSimpleBackend()

export default class App extends Component {
  constructor() {
    super()
    this.state = { value: '', session: 'All', filter: false, question: '', vote: '', questions: [], sessions: [], sharedVotes: [], characterCount: 0, showRecent: false, newUpdate: false, modalVisible: false, anom: false, color: 'white', height: 20, newValue: '', marginTop: 18, moderator: [], showBlock: false, showAnswer: false, newQuestions: 0, Approved: 0, Blocked: 0, showButton: 0, showButtons: "original"}
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.handleClick = this.handleClick.bind(this);
      // this.handleApproved = this.handleApproved.bind(this);  
      this.handleAnswer = this.handleAnswer.bind(this); 
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    this.signin.then(() => {
      const questionsRef = fbc.database.public.allRef('questions')
      const votesRef = fbc.database.public.allRef('votes')
      const modRef = fbc.database.public.allRef('moderators')
      const sessRef = fbc.database.public.allRef('sessions')
      

      sessRef.on('child_added', data => {
        this.setState({ sessions: [...this.state.sessions, {...data.val(), key: data.key }] })
        
      })
    
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
    const { questions, sharedVotes, showRecent, newUpdate, dropDown, newValue, height, marginTop, moderator, showAnswer, sessions } = this.state 
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
      {this.renderModal(questions)}
      <div className="topBox">
        <text className='bigBoxTitle'>{'Q & A'}</text>
        <button className="qaButton" onClick={this.renderForm}>Add QA Session</button>
      </div>
      <div className="container">
        {this.renderLeft(newQuestions, time, sessions)}
        {this.renderRight(newQuestions, time)}
      </div>
    </div>
    )
  }


  doDateMath = (date, time) => {
    var difference = Math.floor((time - date) / (1000*60))
    if (difference < 60) {
      difference = difference
      if (difference === 1) {
        return difference = difference + " minute ago"
      }
      if (difference > 1) {
        return difference = difference + " minutes ago"
      }
    }
    if (difference > 60) {
      difference = Math.floor(difference / 60) 
      if (difference === 1) {
        return difference = difference + " hour ago"
      }
      if (difference > 1) {
        return difference = difference + " hours ago"
      }
    }
    if (difference > 1440) {
      difference = Math.floor(difference / 1440) 
      if (difference === 1) {
        return difference = difference + " day ago"
      }
      if (difference > 1) {
        return difference = difference + " days ago"
      }
    }
    else {
      return difference = "0 minutes ago"
    }
    
  }

  renderButtons = (task, {header, approve, block, pin}) => {

  
    if (header){
      console.log("hi")
      return(
        <span style={{marginTop: 25}}>
        <span className='cellBoxRight'>
        <img className='button1' onClick={()=>this.makeApprove(task)} src={require('./icons/checkocircle.svg')}/>
        <img className='button1' onClick={()=>this.blockQuestion(task)} src={require('./icons/deleteocircle.svg')}/>
      </span>
      </span>
      )
    }

    if (approve){
        if (pin){
        return(
        <span style={{marginTop: 25}}>
        <span className='cellBoxRight'>
        <img className='button1' onClick={()=>this.makeAnswer(task)} src={require('./icons/check.svg')}/>
        <img className='button1' onClick={()=>this.blockQuestion(task)} src={require('./icons/deleteocircle.svg')}/>
        </span>
        </span>
        )
      }
      else {
        return(
          <span>
          <button className="pinButton" onClick={()=>this.makePin(task)}>Move to Top</button>
          <span className='cellBoxRight'>
          <img className='button1' onClick={()=>this.makeAnswer(task)} src={require('./icons/check.svg')}/>
          <img className='button1' onClick={()=>this.blockQuestion(task)} src={require('./icons/deleteocircle.svg')}/>
          </span>
          </span>
          )
        }

      }
    
      if (block){
        return(
          <span style={{marginTop: 25}}>
          <span className='cellBoxRight'>
          <img className='button1' onClick={()=>this.makeApprove(task)} src={require('./icons/checkocircle.svg')}/>
          <img className='button1' src={require('./icons/deletecircle.svg')}/>
          </span>
          </span>
          )
      }
     

    
  }

  renderCell = (task, difference) => {
    console.log("hey")
    const { firstName, lastName } = task.creator
    return (
        <span className='cellBoxLeft'>
          <span className='cellBoxTop'>
            <text className='introText'>{task.session}</text>
            <text className='timeText'>{difference}</text>
            <img src={require('./icons/Inactive.png')}/>
            <text className='timeText'>  {task.score}</text>
          </span>      
          <text className="questionText">{task.text}</text>
          <text className="nameText"> -{firstName} {lastName}</text>
        </span>
      
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
          <text className='boxTitle'>New Questions ({totalQuestions.length})</text>
          <span className="spacer"/>
          <text className='boxTitle'>Moderation:   </text>
          {this.renderModIcons()}
          {/* <span className="dropdownMenu"> */}
          <text className="dropdownTitle">View: </text>
  
      
      <form className="dropdownMenu" onSubmit={this.handleSubmit}>
           <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
            <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
            { sessions.map(task => {
            return (
            <option key={task.key} value={task.sessionName}>{'\xa0\xa0' + task.sessionName}</option>  
            )      
            })
          }
           </select>
      </form> 
          
          </span>
          <span className="questionBox">
            <ul className='listBox'>
              { questions.map(task => {
                if (task.new === true){
                  {this.renderCell(task, {header})}
                  const difference = this.doDateMath(task.dateCreate, time)
                  return (
                    <li className='cellBox' key={task.key}>
                      {this.renderCell(task, difference)}
                      {this.renderButtons(task, {header})}
                    </li>
                  )
                }
              })
              }
            </ul>
            <button className="answerButton" onClick={() => this.openModal()}>Remove All</button>
          </span>
        </div>
        )
      }
      else {
        return(
        <div className="questionContainer">
        <span className="buttonSpan">
          <text className='boxTitle'>New Questions ({totalQuestions.length})</text>
          <span className="spacer"/>
          <text className='boxTitle'>Moderation:   </text>
          {this.renderModIcons()}
          <text className="dropdownTitle">View: </text>
          
              
          <form className="dropdownMenu" onSubmit={this.handleSubmit}>
          <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
           <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
           { sessions.map(task => {
             
           return (
           <option key={task.key} value={task.sessionName}>{'\xa0\xa0' + task.sessionName}</option>  
           )      
           })
         }
          </select>
     </form> 
      </span>
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
          <button className="modButton" style={{position:"absolute"}} onClick={()=>this.onApprove()}>Yes</button>
          <button className="modButton2"  style={{marginLeft:"35px", width:"45px"}}onClick={()=>this.offApprove()}>No</button>
        </span>
        )
      }
      else {
        return (
        <span className="modIcons">
          <button className="modButton2" style={{width:"45px"}} onClick={()=>this.onApprove()}>Yes</button>
          <button className="modButton" style={{marginLeft:"-5px"}} onClick={()=>this.offApprove()}>No</button>
        </span>
        )
      }
    }
    else {
      return (
      <span>
        <button className="modButton2" style={{width:"45px"}} onClick={()=>this.onApprove()}>Yes</button>
        <button className="modButton" style={{marginLeft:"-5px"}} onClick={()=>this.offApprove()}>No</button>
      </span>
      )
    }
  }
  
  showButtons = (newQuestions) => {
    // var newQuestions = newQuestions
    // if (this.state.session !== 'All'){
    //   newQuestions = newQuestions.filter(item => item.session = this.state.session)
    // }
    var approveQuestions = newQuestions.filter(item => item.approve === true && item.new === false && item.answered === false)
    // var origQuestions = this.state.questions.filter(item => item.block === false)
    var blockedQuestions = newQuestions.filter(item => item.block === true && item.new === false && item.answered === false)
    var answeredQuestions = newQuestions.filter(item => item.answered === true)


        if (this.state.showBlock === false && this.state.showAnswer === false){
          return (
          <span className="buttonSpan">
            <button className="listButton">Approved ({approveQuestions.length})</button>
            <button className="listButton2" onClick={this.handleClick}>Blocked ({blockedQuestions.length})</button>
            <button className="listButton2"  onClick={this.handleAnswer}>Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton" onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
          </span>
          )
        }
        if (this.state.showAnswer === true & this.state.showBlock === false){
          return (
          <span className="buttonSpan">
            <button className="listButton2" onClick={this.handleApproved}>Approved ({approveQuestions.length})</button>
            <button className="listButton2"  onClick={this.handleClick}>Blocked ({blockedQuestions.length})</button>
            <button className="listButton">Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton"  onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
          </span>
          )
        }
        if (this.state.showBlock === true && this.state.showAnswer === false){
          return (
          <span className="buttonSpan">
            <button className="listButton2" onClick={this.handleApproved}>Approved ({approveQuestions.length})</button>
            <button className="listButton">Blocked ({blockedQuestions.length})</button>
            <button className="listButton2"  onClick={this.handleAnswer}>Answered ({answeredQuestions.length})</button>
            <span className="spacer"/>
            <button className="answerButton" onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
          </span>
          )
        }
      }


 


  renderModOff = (newQuestions) => {
    // var newQuestions = this.state.questions
    // if (this.state.session !== 'All'){
    //   newQuestions = newQuestions.filter(item => item.session = this.state.session)
    // }
    var origQuestions = newQuestions.filter(item => item.block === false && item.answered === false)
    var blockedQuestions = newQuestions.filter(item => item.block === true && item.new === false)
    var answeredQuestions = newQuestions.filter(item => item.answered === true)
  
    if (this.state.showBlock === false && this.state.showAnswer === false){
      return (
      <span className="buttonSpan">
        <button className="listButton">Approved ({origQuestions.length})</button>
        <button className="listButton2" onClick={this.handleClick}>Blocked ({blockedQuestions.length})</button>
        <button className="listButton2"  onClick={this.handleAnswer}>Answered ({answeredQuestions.length})</button>
        <span className="spacer"/>
        <button className="answerButton" onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
      </span>
      )
    }
    if (this.state.showAnswer === true && this.state.showBlock === false){
      return (
      <span className="buttonSpan">
        <button className="listButton2" onClick={this.handleApproved}>Approved ({origQuestions.length})</button>
        <button className="listButton2"  onClick={this.handleClick}>Blocked ({blockedQuestions.length})</button>
        <button className="listButton">Answered ({answeredQuestions.length})</button>
        <span className="spacer"/>
        <button className="answerButton" onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
      </span>
      )
    }
    if (this.state.showBlock === true && this.state.showAnswer === false){
      return (
      <span className="buttonSpan">
        <button className="listButton2" onClick={this.handleApproved}>Approved ({origQuestions.length})</button>
        <button className="listButton">Blocked ({blockedQuestions.length})</button>
        <button className="listButton2"  onClick={this.handleAnswer}>Answered ({answeredQuestions.length})</button>
        <span className="spacer"/>
        <button className="answerButton" onClick={() => this.answerAll(this.state.questions)}>Mark All as Answered</button>
      </span>
      )
    }
  

  }



  renderBlocked = (questions, time) => {
    return(
    <span className="questionBox2">
    <ul className="listBox">
      { questions.map(task => {
        if (task.approve === false && task.block === true){
          var block = true
          var header = false
          const difference = this.doDateMath(task.dateCreate, time)
          return (
          <li className='cellBox' key={task.key}>
          {this.renderCell(task, difference)}
             {this.renderButtons(task, {block})}
          </li>
          )
        }
      }) 
      }
    </ul>
  </span>
    )

  }

  renderAnswered = (questions, time) => {
    return (
      <span className="questionBox2">
      <ul className="listBox">
        { questions.map(task => {
          if (task.answered === true){
            const difference = this.doDateMath(task.dateCreate, time)
            return (
            <li className='cellBox' key={task.key}>
            {this.renderCell(task, difference)}
              {/* {this.renderButtons(task, header, block)} */}
            </li>
            )
          }
        }) 
        }
      </ul>
    </span>



    )

  }
  

  renderPinned = (questions, time) => {
    return (
    <span>
    { questions.map(task => {
      if (task.pin === true){
        var pin = true
        var approve = true
        const difference = this.doDateMath(task.dateCreate, time)
        return (
        <li className='cellBox' key={task.key}>
        {this.renderCell(task, difference)}
          {this.renderButtons(task, {pin, approve})}
        </li>
        )
      }
    })
    }
    </span>
    )
  }


  handleClick() {
    this.setState({
      showAnswer: false,
      showBlock: true
    })
    console.log(this.state.showAnswer)
    console.log(this.state.showBlock)
  }


  handleAnswer(){
    this.setState({
      showAnswer: true,
      showBlock: false
    })
    console.log(this.state.showAnswer)
    console.log(this.state.showBlock)
  }

  // handleApproved(){
  //   this.setState({
  //     showAnswer: false,
  //     showBlock: false
  //   })
  //   console.log(this.state.showAnswer)
  //   console.log(this.state.showBlock)
  //   console.log("here")
    
  // }

  handleApproved = () => {
    this.setState({
      showAnswer: false,
      showBlock: false
    })
    console.log(this.state.showAnswer)
    console.log(this.state.showBlock)
    console.log("here")
    
  }


  

  renderRight = (questions, time) => {
    if (this.state.moderator.length > 0){


      if (this.state.moderator[0].approve === false){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          var approve = true
          return(
          <div className="questionContainer">
             {this.renderModOff(questions)}
            <span className="questionBox2">
              <ul className="listBox">
             {this.renderPinned(questions, time)}
                  { questions.map(task => {
                  if (task.block === false && task.pin === false && task.answered === false){
                    const difference = this.doDateMath(task.dateCreate, time)
                    return (
                    <li className='cellBox' key={task.key}>
                    {this.renderCell(task, difference)}
                      {this.renderButtons(task, {approve})}
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

        if (this.state.showAnswer === true){
          var block = false
          var header = false
          return(
          <div className="questionContainer">
            {this.renderModOff(questions)}
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        
        else {
          return(
          <div className="questionContainer">
             {this.renderModOff(questions)}
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
      }

      if (this.state.moderator[0].approve === true){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          var approve = true
          return(
          <div className="questionContainer">
            {this.showButtons(questions)}
            <span className="questionBox2">
              <ul className="listBox">
              {this.renderPinned(questions, time)}
                 { questions.map(task => {
                  if (task.approve === true && task.block === false && task.pin === false & task.answered === false){
                    var block = false
                    var header = false
                    var pin = false
                    const difference = this.doDateMath(task.dateCreate, time)
                    return (
                    <li className='cellBox' key={task.key}>
                    {this.renderCell(task, difference)}
                      {this.renderButtons(task, {approve})}
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
        if (this.state.showAnswer === true){
          var block = false
          var header = false
          return(
          <div className="questionContainer">
            {this.showButtons(questions)}
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        else {
          return(
          <div className="questionContainer">
            {this.showButtons(questions)}
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
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
    className="Modal"
    overlayClassName="Overlay"
    
    >
      <text className="boxTitle">Are you sure you want to delete all?</text>
      <button onClick={this.closeModal}>Close</button>
      <button onClick={()=>this.deleteAll(questions)}>Delete All</button>
      <div style={{paddingTop: 50}}>
      <center style={{textAlign: "center"}}>Please name your new session.</center>
      <center style={{marginTop: 10}}>
      <form onSubmit={this.handleSubmit}>
        <label className="boxTitle">
          Session Name:
          <input name="value" style={{height: 18, fontSize: 14, width:'50%', marginLeft: 5}}type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input className="qaButton" type="submit" value="Submit" />
      </form>
      </center>
      </div>
    </Modal>
    )
  }

  handleChange(event){
    this.setState({[event.target.name]: event.target.value});
    

  }



  handleSubmit(event) {
    
      fbc.database.public.allRef('sessions').push({sessionName: this.state.value})
      // console.log(this.state.value)
   


    console.log("hiiii");
    // alert('An essay was submitted: ' + this.state.value);
    // event.preventDefault();




  }




  
  
  onApprove() {
    var mod = this.state.moderator[0]
    if (this.state.moderator.length === 0) {
      fbc.database.public.allRef('moderators').set({"approve": true})
    }
    else {
      fbc.database.public.allRef('moderators').child(mod.key).update({"approve": true})
    }
  }

  makeSession(text){

    fbc.database.public.allRef('sessions').set({"sessionID": text})

  }

  

  offApprove(){
    var mod = this.state.moderator[0]
    mod.approve = false
    fbc.database.public.allRef('moderators').child(mod.key).update({"approve": false})
  }

  makeApprove(question){
    var time = new Date().getTime()
    fbc.database.public.allRef('questions').child(question.key).update({"approve": true, 'block': false, 'new': false, 'lastEdit': time})
  }

  makePin(question){
    var pinned = this.state.questions.filter(task => task.pin === true)
    if (pinned.length < 3){
      fbc.database.public.allRef('questions').child(question.key).update({"pin": true, "approve": true, 'block': false, 'new': false})
    }
  }

  makeAnswer(question){
    fbc.database.public.allRef('questions').child(question.key).update({"answered": true, 'block': false, 'new': false, 'pin': false})
  }

  blockQuestion(question){
    fbc.database.public.allRef('questions').child(question.key).update({"block": true, 'approve': false, 'new': false, 'pin': false})
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

  answerAll(questions) {
    if (questions !== undefined) {
      questions.map(question => {
        if (question.block !== true){
        fbc.database.public.allRef('questions').child(question.key).update({"answered": true, 'new': false, 'pin': false})
        }
      })
    }
  }

}





