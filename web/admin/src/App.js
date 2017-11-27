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
    this.state = { question: '', vote: '', sharedTasks: [], sharedVotes: [], openVar: false }
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))

      this.openModal = this.openModal.bind(this);
      this.afterOpenModal = this.afterOpenModal.bind(this);
      this.closeModal = this.closeModal.bind(this);
  
  }

  componentDidMount() {
    this.signin.then(() => {
      const sharedRef = fbc.database.public.allRef('questions')
      const sharedRefVotes = fbc.database.public.allRef('votes')
      sharedRef.on('child_added', data => {
        this.setState({ sharedTasks: [...this.state.sharedTasks, {...data.val(), key: data.key }] })
      })
      sharedRef.on('child_removed', data => {
        this.setState({ sharedTasks: this.state.sharedTasks.filter(x => x.key !== data.key) })
      })
      sharedRef.on('child_changed', data => {
        this.setState({ sharedTasks: [...this.state.sharedTasks, {...data.val(), key: data.key }] })
      })
      sharedRefVotes.on('child_added', data => {
        this.setState({ sharedVotes: [...this.state.sharedVotes, {...data.val(), key: data.key }] })
      })
      sharedRef.on('child_removed', data => {
        this.setState({ sharedVotes: this.state.sharedVotes.filter(x => x.key !== data.key) })
      })
      sharedRefVotes.on('child_changed', data => {
        this.setState({ sharedVotes: [...this.state.sharedVotes, {...data.val(), key: data.key }] })
      })
    })
  }

  openModal() {
    this.setState({openVar: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
    // ()=>this.deleteAll(questions)
  }

  closeModal() {
    this.setState({openVar: false});
    // ()=>this.deleteAll(questions)

  }

  render() {

    const { sharedTasks, sharedVotes } = this.state
    
       var questions = sharedTasks.map(t => ({...t, type:'shared'}))
      //  var questions2 = sharedTasks.map(t => ({...t, type:'shared'}))
       var votes = sharedVotes.map(t => ({...t, type:'shared'}))
       var questionScore = questions.map(function(x) { return Object.assign({id: x.key, score: 0}) })
       
   
       this.findScore(questionScore, votes, questions)

    return (
      <div className="App">
      <Modal
  isOpen={this.state.openVar}
  onAfterOpen={this.afterOpenModal}
  onRequestClose={this.closeModal}
  
  contentLabel="Modal"
>
<h2>Are you sure you want to delete all?</h2>
<button onClick={this.closeModal}>Close</button>
<div>       </div>
<button onClick={()=>this.deleteAll(questions)}>Delete All</button>

</Modal>
        <h3>Questions:</h3>
        <ul>
          { questions.map(task => {
            const { image, firstName, lastName } = task.creator
            return (
              <li key={task.key}>
                <img className="avatar" src={image} alt="" />
                <span> {firstName} {lastName} - {task.text} - </span>
                <button onClick={()=>this.markComplete(task)}>Remove Question</button>
              </li>
            )
          }) }
        </ul>
        <button onClick={() => this.openModal()}>Remove All</button>
      </div>
    )
  }

  findScore(questionScore, votes, questions){
    votes.forEach(function(a) {
    questionScore.find(function(value, index) {
      if (value.id === a.question) {
        value.score += a.vote
      }
    })
  });
  this.findOrder(questionScore, questions)
  }


  findOrder(questionScore, questions){
    questionScore.forEach(function(a){
      questions.find(function(value, index){
        if (value.key === a.id) {
          value.score = a.score
        }  
      })
    });
     questions.sort(function (a,b){
      return b.score - a.score
    })
  }



  markComplete(question) {
    console.log("hello")
    getRef(question).remove()
    function getRef(question) {
      return fbc.database.public.allRef('questions').child(question.key)
    }
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
//  this.setState({sharedTasks: []})
    }

}

 
}
