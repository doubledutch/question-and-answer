import React, { Component } from 'react'
import ReactNative, {
  KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList
} from 'react-native'
// import { List, ListItem, SearchBar } from "react-native-elements";
import client, { Avatar, TitleBar } from '@doubledutch/rn-client'
import FirebaseConnector from '@doubledutch/firebase-connector'

const fbc = FirebaseConnector(client, 'qaapp')
fbc.initializeAppWithSimpleBackend()



export default class HomeView extends Component {
  constructor() {
    super()
    this.state = { question: '', vote: '', sharedTasks: [], sharedVotes: [], characterCount: 0, showRecent: false, newUpdate: false,}
    this.signin = fbc.signin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
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

  renderHeader = () => {
    return <SearchBar placeholder="Type Here..." lightTheme round />;
  };
  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };



  render() {
    
    const { sharedTasks, sharedVotes, showRecent, newUpdate } = this.state
 
    questions = sharedTasks.map(t => ({...t, type:'shared'}))
    votes = sharedVotes.map(t => ({...t, type:'shared'}))
    questionScore = questions.map(function(x) { return Object.assign({id: x.key, score: 0}) })

    this.findScore(questionScore, votes, questions)
    if (showRecent === true) {
    }
  
 
   
    return (
      <KeyboardAvoidingView style={s.container} behavior={Platform.select({ios: "padding", android: null})}>
        <TitleBar title="Keynote" client={client} signin={this.signin} />
        <View style={s.compose}>
          <TextInput style={s.composeText} placeholder="Add Question..."
            value={this.state.question}
            onChangeText={question => this.setState({question})} 
            maxLength={250}
            />
          <View style={s.sendButtons}>
            <TouchableOpacity style={s.sendButton} onPress={this.createSharedTask}><Text style={s.sendButtonText}>Submit 📢</Text></TouchableOpacity>
          </View>
        </View>
        <View style={s.counter}>
        <Text>{this.state.question.length}/250 </Text>
        </View>
        

        <ScrollView style={s.scroll}>
        
          {questions.map(question => (
            <View key={question.id} style={s.task}>
              {/* { renderCreator(question) } */}
              <Text style={s.taskText}>{question.text}</Text>
              <TouchableOpacity onPress={() => this.newVote(question)}><Text style={s.checkmark}>👍 </Text></TouchableOpacity>
            </View>
          ))} 
        </ScrollView>
        
       
      </KeyboardAvoidingView>
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
        console.log(value.creator)
        if (value.key === a.id) {
          value.score = a.score
        }  
      })
    });
     questions.sort(function (a,b){
      return b.score - a.score
    })
  }

  findOrderDate(questions){

    //need to sort by date created

  }

  createSharedTask = () => this.createQuestion(fbc.database.public.allRef)
 
  createQuestion(ref) {
    console.log(this.state.question)
    if (this.user && this.state.question) {
      var time = new Date().getTime()
      ref('questions').push({
        text: this.state.question,
        creator: client.currentUser.firstName + " " + client.currentUser.lastName,
        score : 0,
        dateCreate: time
      })
      .then(() => this.setState({question: ''}))
      .catch (x => console.error(x))
    }    
  }

  createVote(voteNum, question){
    ref = fbc.database.public.allRef
    if (this.user && question) {
      ref('votes').push({
        question: question.key,
        creator: client.currentUser.id,
        vote : voteNum,
      })
      .then(() => this.setState({vote: ''}))
      .catch (x => console.error(x))
      
    }
    
  }


newVote(question){
  userVote = false
//nototalvotes
if (this.state.sharedVotes === undefined){
  this.createVote(1, question) 
  
}
if (this.state.sharedVotes !== undefined) {
filteredArray = this.state.sharedVotes.filter( obj => obj.question === question.key)
//no votes on this questions
if (filteredArray.length === 0) {
  this.createVote(1, question)
}
if (filteredArray.length > 0){
//user hasnt yet voted on question
filteredArray.find(function(value, index){
  
  //user has voted
  if (value.creator === client.currentUser.id) {
    this.userVote = true
      getRef(value).remove()
      function getRef(vote) {
        return fbc.database.public.allRef('votes').child(vote.key)
      }
  }
  //user hasnt yet voted on question
  if (this.userVote === false) {
    this.createVote(1, question)
    
  }
})
}
}
}

  
}

// function renderCreator(question) {
//   // console.log(question.date)
//   return <Avatar user={question.creator} size={22} style={s.creatorAvatar} />
// }

const fontSize = 18
const s = ReactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9e1f9',
  },
  scroll: {
    flex: 1,
    padding: 15
  },
  task: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10
  },
  checkmark: {
    textAlign: 'center',
    fontSize
  },
  creatorAvatar: {
    marginRight: 4
  },
  creatorEmoji: {
    marginRight: 4,
    fontSize
  },
  taskText: {
    fontSize,
    flex: 1
  },
  compose: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10
  },
  sendButtons: {
    justifyContent: 'center',
  },
  counter: {
    backgroundColor: 'white',
  },
  sendButton: {
    justifyContent: 'center',
    margin: 5
  },
  sendButtonText: {
    fontSize: 20,
    color: 'gray'
  },
  composeText: {
    flex: 1
  }
})
