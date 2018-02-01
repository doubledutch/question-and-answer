'use strict'
import React, { Component } from 'react'
import ReactNative, {
  KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Image, Modal
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import MyList  from './table'
import CustomModal from './modal'
const fbc = FirebaseConnector(client, 'questionanswer')
fbc.initializeAppWithSimpleBackend()

class HomeView extends Component {
  constructor() {
    super()
    this.state = {
      question: '', 
      vote: '', 
      launch: true, 
      disable: true, 
      session: '', 
      sessions: [], 
      questions: [], 
      sharedVotes: [], 
      moderator: [], 
      characterCount: 0, 
      showRecent: false, 
      showAnswer: false, 
      showError: "white", 
      newUpdate: false, 
      modalVisible: true, 
      anom: false, 
      color: 'white', 
      height: 20, 
      newValue: '', 
      marginTop: 18, 
      animation: "none",
      title: "Q & A",
      questionAsk: false,
      questionError: "Ask Question",
      topBorder: "#EFEFEF",
      approve: false
    }
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
  }

  componentDidMount() {
    this.signin.then(() => {
      const questionsRef = fbc.database.public.allRef('questions')
      const votesRef = fbc.database.public.allRef('votes')
      const modRef = fbc.database.public.adminRef('moderators')
      const sessRef = fbc.database.public.adminRef('sessions')

      sessRef.on('child_added', data => {
        this.setState({ sessions: [...this.state.sessions, {...data.val(), key: data.key }] })
      })

      sessRef.on('child_removed', data => {
        if (data.key === this.state.session.key) {
          this.setState({ sessions: this.state.sessions.filter(x => x.key !== data.key), session: '', launch: true, modalVisible: true})
        }
        else {
          this.setState({ sessions: this.state.sessions.filter(x => x.key !== data.key) })
        }
      })

      sessRef.on('child_changed', data => {
        var sessions = this.state.sessions
        for (var i in sessions) {
          if (sessions[i].key === data.key) {
            sessions[i].sessionName = data.val().sessionName
            if (this.state.session.key === data.key) {
              var newSession = this.state.session
              newSession.sessionName = data.val().sessionName
              this.setState({sessions, session: newSession })
            }
            else {
              this.setState({sessions})
            }
            break;
          }
        }
      })

      modRef.on('child_added', data => {
        this.setState({ moderator: [...this.state.moderator, {...data.val(), key: data.key }] })
      })

      modRef.on('child_changed', data => {
        var moderator = this.state.moderator
        for (var i in moderator) {
          if (moderator[i].key === data.key) {
            moderator[i].approve = data.val().approve
            this.setState({moderator})
            break;
          }
        }
      })
    })
  }
  render() {
    let titleText = this.state.title
    if (this.state.session){
      if (this.state.session.sessionName.length < 30){
        titleText = this.state.session.sessionName
      }
      else {
        var newText = this.state.session.sessionName.slice(0,25)
        newText = newText + "..."
        titleText = newText
      }
    }

    return (
      <KeyboardAvoidingView style={s.container} behavior={Platform.select({ios: "padding", android: null})}>
        <TitleBar title={titleText} client={client} signin={this.signin} />
        {this.renderHome()}
      </KeyboardAvoidingView> 
    )
  }



  renderHome = () => {
    const newStyle = {
      flex: 1,
      marginBottom: 20,
      fontSize: 18,
      color: '#9B9B9B',
      maxHeight: 100,
      height: 22,
      marginTop: 20,
      paddingTop: 0,
    }
    
    const androidStyle = {
      paddingLeft: 0,
      paddingBottom: 0,
      textAlignVertical: 'center'
    }

    const { questions, sharedVotes, showRecent, newUpdate, dropDown, newValue, height, marginTop, moderator, sessions, launch, showAnswer, session} = this.state
    var pinnedQuestions = this.state.questions.filter(item => item.pin === true && item.block === false && item.session === session.key)
    var otherQuestions = this.state.questions.filter(item => item.pin === false && item.block === false && item.session === session.key)
    this.originalOrder(pinnedQuestions)
    this.originalOrder(otherQuestions)
    let newQuestions = pinnedQuestions.concat(otherQuestions)
    if (this.state.modalVisible === false){
      return(
      <View style={{flex:1}}>
        <View style={s.textBox}>
            <TouchableOpacity style={s.circleBox} onPress={this.showModal}><Text style={s.whiteText}>?</Text></TouchableOpacity>
            <TextInput  underlineColorAndroid='transparent' style={Platform.select({ios: newStyle, android: [newStyle, androidStyle]})} placeholder="Type your question here"
            value={this.state.question}
            autoFocus={false}
            onFocus={this.showModal}
            multiline={true}
            placeholderTextColor="#9B9B9B"
            />
        </View>
        <View style={{flex:1}}>
          <MyList 
          questions={newQuestions}
          showModal = {this.showModal}
          showAnswer = {this.state.showAnswer}
          moderator = {this.state.moderator}
          showRecent = {this.state.showRecent}
          showAnswered = {this.showAnswered}
          findOrder = {this.findOrder}
          findOrderDate = {this.findOrderDate}
          originalOrder = {this.originalOrder}
          newVote = {this.newVote}
          />
        </View>
        {this.renderModal()}
      </View>
      )
    } else {
      return(
        <CustomModal
          sessions={sessions}
          launch={launch}
          showModal = {this.showModal}
          closeSessionModal = {this.closeSessionModal}
          makeTrue = {this.makeTrue}
          createSharedTask = {this.createSharedTask}
          selectSession = {this.selectSession}
          disable = {this.state.disable}
          question = {this.state.question}
          showError = {this.state.showError}
          session = {this.state.session}
          hideModal = {this.hideModal}
          modalVisible = {this.state.modalVisible}
          questionError = {this.state.questionError}
          style={{flex:1}}
        />
      )
    }
  }

  showAnswered = () => {
    this.setState({showAnswer: true})
  }

  renderIcon = (question) => {
    if (question.myVote === true){
      return <TouchableOpacity onPress={() => this.newVote(question)}><Image style={s.checkmark} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Active.png"}}/></TouchableOpacity>
    }
    else {
      return <TouchableOpacity onPress={() => this.newVote(question)}><Image style={s.checkmark} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Inactive.png"}}/></TouchableOpacity>
    }
  }

  showModal = () => {
    this.setState({modalVisible: true, animation: "none"})
  }

  hideModal = () => {
    if (this.state.launch === false) {
      this.setState({modalVisible: false, animation: "slide", showError: "white"})
    }
    if (this.state.launch === true){
      this.setState({modalVisible: false, animation: "slide", showError: "white"})
    }
  }
  
  selectSession = (session) => {
    this.setState({session, disable: false})
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
            var myVote = questions[i].myVote
            var oldState = questions[i].approve
            questions[i] = data.val()
            questions[i].score = score
            questions[i].myVote = myVote
            questions[i].key = data.key
            if (data.val().creator.id === client.currentUser.id && oldState !== data.val().approve){
              this.setState({questions, approve: true, questionAsk: true})
            }
            else {
              this.setState({questions})
            }
            break
          }
        }
      })
      fbc.database.public.allRef('questions').child(session.key).on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })
    }

    closeSessionModal = () => {
      this.setState({launch: false})
      this.hideModal()
    }

    renderModal = () => {
      var modOn = false
      if (this.state.moderator.length > 0) {
        if (this.state.moderator[0]) {
          modOn = this.state.moderator[0].approve
        }
      }
      if (this.state.questionAsk && modOn && this.state.approve) {
        setTimeout(() => {
          this.closeConfirm()
          }
          ,5000)
        return (
          <TouchableOpacity style={s.listContainer} onPress={this.closeConfirm}>
            <Image style={{width: 20, height: 20}} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/check_circle_white.png"}}/>
            <Text style={{marginLeft: 5, fontSize: 14, color: "white"}}>Your question has been approved!</Text>
          </TouchableOpacity>
        )
      }

      if (this.state.questionAsk && modOn && this.state.approve === false) {
        setTimeout(() => {
          this.closeConfirm()
          }
          ,5000)
        return (
          <TouchableOpacity style={s.listContainer} onPress={this.closeConfirm}>
            <Image style={{width: 20, height: 20}} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/check_circle_white.png"}}/>
            <Text style={{marginLeft: 5, fontSize: 14, color: "white"}}>Your question has been submitted for approval!</Text>
          </TouchableOpacity>
        )
      }

    }

 

    closeConfirm = () => {
      this.setState({questionAsk: false, approve: false})
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

    findOrder = () => {
      this.setState({showRecent: false, showAnswer: false})
    }

    findOrderDate = () => {
      this.setState({showRecent: true, showAnswer: false})
    }

  createSharedTask = (question, anom) => this.createQuestion(fbc.database.public.allRef, question, anom)
 
  createQuestion = (ref, question, anom) => {
    var time = new Date().getTime()
    var questionName = question.trim()
    if (questionName.length === 0) {
      this.setState({showError: "red"})
    }
    let approveVar = true
    let newVar = false
    if (this.state.moderator[0].approve){
      approveVar = false
      newVar = true
    }
    if (this.user && questionName.length > 0) {
      ref('questions').child(this.state.session.key).push({
        text: questionName,
        creator: client.currentUser,
        score : 0,
        dateCreate: time,
        anom: anom,
        approve: approveVar,
        block: false,
        new: newVar,
        answered: false,
        pin: false,
        lastEdit: time, 
        session: this.state.session.key,
        sessionName: this.state.session.sessionName
      })
      .then(() => {
        this.setState({question: '', anom: false, showError: "white"})
        setTimeout(() => {
          this.hideModal()
          this.setState({questionAsk: this.state.moderator[0].approve})
          }
          ,250)
      })
      .catch(error => this.setState({questionError: "Retry"}))
    }
  }

  newVote = (question) => {
    if (question.myVote === true) {
      fbc.database.public.allRef("votes").child(question.key).child(client.currentUser.id).remove()
    }
    else {
      fbc.database.public.allRef('votes').child(question.key).child(client.currentUser.id).set(1)
      .then(() => this.setState({vote: ''}))
      .catch(x => console.error(x))
    }
  }
}

export default HomeView

const fontSize = 18
const s = ReactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  modHeader: {
    backgroundColor: 'white', 
    height: 51, 
    fontSize: 18, 
    textAlign: "center", 
    paddingTop: 15, 
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 82
  },



  textBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },


  modal: {
    marginTop: 65,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 1, 
  },
  modalBottom: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.5
  },
  subText:{
    fontSize: 12,
    color: '#9B9B9B'

  },
  nameText:{
    fontSize: 14,
    color: '#9B9B9B',

  },
  bigButton:{
    height: 42, 
    marginTop: 30, 
    marginBottom: 30, 
    marginLeft: 21, 
    marginRight: 21,
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: "#b7b7b7"
  },

  button: {
    width: '25%',
    height: 40,
    paddingTop: 10,
    paddingBottom: 5,
    justifyContent: 'center',
  },
  button1: {
    height: 40,
    paddingTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: client.primaryColor
  },

  button2: {
    height: 40,
    paddingTop: 10,
    marginBottom: 10,
    justifyContent: 'center', 
  },
  divider: {
    flex: 1
  },
  dividerSm: {
    width: 30
  },
  questionText:{
    fontSize: 16,
    color: '#364247',
    fontFamily: 'System',
  },
  listContainer: {
    flexDirection: "row",
    backgroundColor: client.primaryColor,
    height: 42, 
    alignItems:'center',
    justifyContent: 'center',
    marginBottom: 0,
  },

  anomBox: {
    flex: 1,
    flexDirection: 'row',
  },
  rightBox: {
    flex: 1,
    flexDirection: 'column',
  },
  anomText: {
    flex:1,
    fontSize: 14,
    color: '#364247',
    marginLeft: 5,
    marginTop: 16,
  },
  checkmark: {
    height: 16,
    width: 16,
    marginTop: 4
  },
  compose: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: "#ffffff"
  },
  composeBox: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
    padding: 0
  },
  circleBox: {
    marginTop:20,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#9B9B9B',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    height: 22,
    borderRadius: 50,
  },
  sendButtons: {
    justifyContent: 'center',
    flex: 1
  },
  counter: {
    justifyContent: 'center',
    marginTop:23,
    width: 30,
    fontSize: 14,
    marginRight: 11,
    height: 20,
    color: '#9B9B9B', 
    textAlign: 'center'
  },
  sendButton: {
    justifyContent: 'center',
    marginTop: 20,
    marginRight: 10,
    width: 124,
    backgroundColor: client.primaryColor,
    height: 42,
    borderRadius: 4,
  },
  checkButton: {
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 15,
    height: 19,
    width: 19,
    borderColor: '#9B9B9B',
    borderWidth: 1,
    borderRadius: 2
  },
  sendButtonText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center'
  },
  dashboardButton: {
    fontSize: 18,
    color: '#9B9B9B',
  },
  composeText: {
    flex: 1,
    fontSize: 18,
    color: '#9B9B9B',
    paddingTop: 0,
  },
  whiteText: {
    fontSize: 18,
    color: 'white',
  }
})
