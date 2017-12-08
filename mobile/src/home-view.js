'use strict'
import React, { Component } from 'react'
import ReactNative, {
  KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Modal
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
const fbc = FirebaseConnector(client, 'qaapp')
fbc.initializeAppWithSimpleBackend()

export default class HomeView extends Component {
  constructor() {
    super()
    this.state = { question: '', vote: '', questions: [], sharedVotes: [], moderator: [], characterCount: 0, showRecent: false, newUpdate: false, modalVisible: false, anom: false, color: 'white', height: 20, newValue: '', marginTop: 18}
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
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
            moderator[i].approve = data.val().approve
            this.setState({moderator})
            console.log(moderator)
            break;
          }
        }
      })
    
      questionsRef.on('child_added', data => {
        this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }] })
        fbc.database.public.allRef('votes').child(data.key).on('child_added', vote => {
          // const votesForQuestion = (this.state.votes[data.key] || 0) + 1
          // this.setState({votes: {...this.state.votes, [data.key]: votesForQuestion}})
          // var userVote = false
          const userVote = vote.key === client.currentUser.id
          // if (vote.key === client.currentUser.id){
          //   userVote = true
          // }
          var questions = this.state.questions.map(question => 
            question.key === data.key ?
            // transform the one with a matching id
            { ...question, myVote: userVote, score: question.score + 1}
            : 
            question
          )
          this.setState({questions})
        })
        fbc.database.public.allRef('votes').child(data.key).on('child_removed', vote => {
          // const votesForQuestion = (this.state.votes[question.key] || 0) - 1
          // this.setState({votes: {...this.state.votes, [question.key]: votesForQuestion}})
          var userVote = true
          if (vote.key === client.currentUser.id){
            userVote = false
          }
          var questions = this.state.questions.map(question => 
            question.key === data.key ?
                    // transform the one with a matching id
              { ...question, myVote: userVote, score: question.score - 1}
              : 
              question
          )
          this.setState({questions})
        })
      })

      questionsRef.on('child_changed', data => {
        var questions = this.state.questions
        for (var i in questions) {
          if (questions[i].key === data.key) {
            questions[i].approve = data.val().approve
            this.setState({questions})
            break
          }
        }
      })

      questionsRef.on('child_removed', data => {
          this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })

    })
  }

  renderHeader = (questions) => {
    if (this.state.showRecent === false) {
      return (
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button1} onPress={() => this.findOrder(questions)}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={() => this.findOrderDate(questions)}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View>
      )
    }
    if (this.state.showRecent === true) {
      return (
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button2} onPress={() => this.findOrder(questions)}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button1} onPress={() => this.findOrderDate(questions)}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View>
      )
    }
  };

  showModal(){
    this.setState({modalVisible: true})
  }

  hideModal(){
    this.setState({modalVisible: false})
  }

  makeTrue(){
    if (this.state.anom === false){
      this.setState({anom: true, color: 'black'})
    }
    if (this.state.anom === true){
      this.setState({anom: false, color: 'white'})
    }
  }

  updateSize = (height) => {
    this.setState({
      height,
    });
  }

  render() {
    const { questions, sharedVotes, showRecent, newUpdate, dropDown, newValue, height, marginTop, moderator} = this.state   
      this.originalOrder(questions)
      const newStyle = {
        height,
        flex: 1,
        marginTop,
        marginBottom: 20,
        fontSize: 18,
        color: '#9B9B9B',
        textAlignVertical: 'top'
      }
    
    return (
      <KeyboardAvoidingView style={s.container} behavior={Platform.select({ios: "padding", android: null})}>
      <TitleBar title="Keynote" client={client} signin={this.signin} />
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {alert("Modal has been closed.")}}>
        <View style={s.modal}>
          <TouchableOpacity style={s.circleBox}><Text style={s.whiteText}>?</Text></TouchableOpacity>
            <TextInput style={[newStyle]} placeholder="Type your question here"
              value={this.state.question}
              onChangeText={question => this.setState({question, marginTop: 20})} 
              maxLength={250}
              autoFocus={true}
              multiline={true}
              placeholderTextColor="#9B9B9B"
              onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}/>
            <Text style={s.counter}>{250 - this.state.question.length} </Text>
        </View>
        <View style={s.bottomButtons}>
          <View style={s.anomBox}>
            <TouchableOpacity style={s.checkButton} onPress={() => this.makeTrue()}><Text style={{color:this.state.color, textAlign: 'center'}}>X</Text></TouchableOpacity>
            <Text style={s.anomText}>Ask anonymously</Text>
          </View>
            <TouchableOpacity style={s.sendButton} onPress={this.createSharedTask}><Text style={s.sendButtonText}>Ask Question</Text></TouchableOpacity>
        </View>
          <TouchableOpacity style={s.modalBottom} onPress={() => this.hideModal()}></TouchableOpacity> 
      </Modal>
      <View>
        <TouchableOpacity style={s.compose} onPress={() => this.showModal()}>
          <TouchableOpacity style={s.circleBox} onPress={() => this.showModal()}><Text style={s.whiteText}>?</Text></TouchableOpacity>
          <TouchableOpacity style={s.composeBox} onPress={() => this.showModal()}><Text style={s.composeText}>Type your question here</Text></TouchableOpacity>
        </TouchableOpacity>
      </View>
      <FlatList
        data={questions}
        ListHeaderComponent={this.renderHeader(questions)}
        renderItem={({item}) =>{          
          if (moderator.length === 0) {
            return (
              <View style={s.listContainer}>
                <View style={s.leftContainer}>
                  <TouchableOpacity onPress={() => this.newVote(item)}><Text style={s.checkmark}>👍 </Text></TouchableOpacity>
                  <Text style={s.subText}>{item.score}</Text>
                </View>
                <View style={s.rightContainer}>
                  <Text style={s.questionText}>{item.text}</Text>
                  {item.anom === false &&
                  <Text style={s.nameText}>
                    -{item.creator.firstName} {item.creator.lastName}
                  </Text>
                }
                {item.anom === true &&
                  <Text style={s.nameText}>
                    -Anonymous
                  </Text>
                }
                </View>
              </View>
              )
            }
          if (moderator.length > 0){
            if (moderator[0].approve !== true ) {
              return(
                <View style={s.listContainer}>
                  <View style={s.leftContainer}>
                    <TouchableOpacity onPress={() => this.newVote(item)}><Text style={s.checkmark}>👍 </Text></TouchableOpacity>
                    <Text style={s.subText}>{item.score}</Text>
                  </View>
                  <View style={s.rightContainer}>
                    <Text style={s.questionText}>{item.text}</Text>
                    {item.anom === false &&
                    <Text style={s.nameText}>
                      -{item.creator.firstName} {item.creator.lastName}
                    </Text>
                  }
                    {item.anom === true &&
                    <Text style={s.nameText}>
                      -Anonymous
                    </Text>
                  }
                  </View>
                </View>
                )
              }

            if (moderator[0].approve === true ){
              if (item.approve === true){
                return(
                  <View style={s.listContainer}>
                    <View style={s.leftContainer}>
                      <TouchableOpacity onPress={() => this.newVote(item)}><Text style={s.checkmark}>👍 </Text></TouchableOpacity>
                      <Text style={s.subText}>{item.score}</Text>
                    </View>
                    <View style={s.rightContainer}>
                      <Text style={s.questionText}>{item.text}</Text>
                      {item.anom === false &&
                      <Text style={s.nameText}>
                        -{item.creator.firstName} {item.creator.lastName}
                      </Text>
                      }
                      {item.anom === true &&
                      <Text style={s.nameText}>
                        -Anonymous
                      </Text>
                      }
                    </View>
                  </View>
                  )
              }
            }
          }
        }
        }
        />
      </KeyboardAvoidingView>
    )
  }

  originalOrder(questions){
    if (this.state.showRecent === false) {
      questions.sort(function (a,b){
        return b.score - a.score
      })
    }
    if (this.state.showRecent === true) {
      questions.sort(function (a,b){
        return b.dateCreate - a.dateCreate
      })
    }
  }

  findOrder(questions){
    this.setState({showRecent: false})
  }

  findOrderDate(questions){
    this.setState({showRecent: true})
  }

  createSharedTask = () => this.createQuestion(fbc.database.public.allRef)
 
  createQuestion(ref) {
    var time = new Date().getTime()
    if (this.user && this.state.question) {
      ref('questions').push({
        text: this.state.question,
        creator: client.currentUser,
        score : 0,
        dateCreate: time,
        anom: this.state.anom,
        approve: false
      })
      .then(() => this.setState({question: '', anom: false}))
      .catch (x => console.error(x))
    }
    this.hideModal()    
  }

  newVote(question){
    if (question.myVote === true) {
      fbc.database.public.allRef("votes").child(question.key).child(client.currentUser.id).remove()
    }
    else {
      fbc.database.public.allRef('votes').child(question.key).child(client.currentUser.id).set(1)
      .then(() => this.setState({vote: ''}))
      .catch (x => console.error(x))
    }
  }
 
}

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
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 82
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
    borderBottomColor: new Color().rgbString() 
  },
  button2: {
    height: 40,
    paddingTop: 10,
    marginBottom: 10,
    justifyContent: 'center', 
  },
  divider: {
    width: 110
  },
  dividerSm: {
    flex: 1
  },
  questionText:{
    fontSize: 16,
    color: '#364247',
    fontFamily: 'System',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    backgroundColor: 'white',
    marginBottom: 2,
  },
  leftContainer: {
    flexDirection: 'column',
    paddingLeft: 10,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems:'center',
    height: '100%',
    paddingTop: 15
  },
  rightContainer: {
    flex: 1,
    width: '80%',
    paddingLeft: 15,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  anomBox: {
    flex: 1,
    flexDirection: 'row',
  },
  anomText: {
    flex:1,
    fontSize: 14,
    color: '#364247',
    marginLeft: 5,
    marginTop: 32,
  },
  checkmark: {
    textAlign: 'center',
    fontSize,
  },
  compose: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  composeBox: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
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
    height: 20,
    borderRadius: 100/2,
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
    backgroundColor: new Color().rgbString(),
    height: 42,
    borderRadius: 4,
  },
  checkButton: {
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 32,
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
  },
  whiteText: {
    fontSize: 18,
    color: 'white',
  }
})
