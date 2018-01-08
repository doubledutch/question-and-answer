'use strict'
import React, { Component } from 'react'
import ReactNative, {
  KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Modal, Image
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'


export class MyList extends Component {
    constructor(props){
        super(props)
        this.newVotes = this.newVotes.bind(this)
        this.state = {
          anom: false
        }
    }

  render() {
    const showAnswer = this.props.showAnswer
    const showRecent = this.props.showRecent
    const moderator = this.props.moderator
    let newQuestions = this.props.questions

    if (showAnswer === true){
      newQuestions = newQuestions.filter(item => item.answered === true)
    }
    if (showAnswer === false){
      newQuestions = newQuestions.filter(item => item.answered === false)
    }

    return (
      <FlatList
      data={newQuestions}
      ListHeaderComponent={this.renderHeader(this.props.questions)}
      renderItem={({item}) => {
        if (moderator.length > 0){
          if (moderator[0].approve !== true && item.answered === false) {
            return(
              <View style={s.listContainer}>
                <View style={s.leftContainer}>
                  {this.renderIcon(item)}
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
          if (moderator[0].approve === true && item.approve === true && item.answered === false){
              return(
                <View style={s.listContainer}>
                  <View style={s.leftContainer}>
                    {this.renderIcon(item)}
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
          else {
            if (item.answered === true){
              return (
              <View style={s.listContainer}>
                <View style={s.leftContainer}>
                  {this.renderIcon(item)}
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
        else {
          return (
            <View style={s.listContainer}>
              <View style={s.leftContainer}>
                {this.renderIcon(item)}
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
    />
  )
 }


  renderHeader = (questions) => {
    if (questions.length === 0) {
      return (
        <View>
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button1}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.findOrderDate}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.showAnswered}><Text style={s.dashboardButton}>Answered</Text></TouchableOpacity>
          <View style={s.divider}/>
          </View>
          <View style={{marginTop: 96}}>
          <Text style={{textAlign: "center", fontSize: 20, color: '#9B9B9B', marginBottom: 5}}>Be the First to Ask a Question!</Text>
          <TouchableOpacity onPress={this.props.showModal}><Text style={{textAlign: "center", fontSize: 16, color: new Color().rgbString()}}>Tap here to get started</Text></TouchableOpacity>
            </View>
        </View>
      )
    }

    if (this.props.showAnswer === true) {
      return (
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button2} onPress={this.props.findOrder}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.findOrderDate}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button1}><Text style={s.dashboardButton}>Answered</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View> 
      )
    }
    if (this.props.showRecent === false) {
      return (
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button1} ><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.findOrderDate}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.showAnswered}><Text style={s.dashboardButton}>Answered</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View>
      )
    }
    if (this.props.showRecent === true) {
      return (
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={s.button2} onPress={this.props.findOrder}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button1}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={s.button2} onPress={this.props.showAnswered}><Text style={s.dashboardButton}>Answered</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View>
      )
    }
  }

  // origOrder = () => {
  //   this.props.originalOrder(this.otherQuestions)
  // }
 
  renderIcon = (question) => {
    if (question.myVote === true){
      return <TouchableOpacity onPress={() => this.newVotes(question)}><Image style={s.checkmark} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Active.png"}}/></TouchableOpacity>
    }
    else {
       return <TouchableOpacity onPress={() => this.newVotes(question)}><Image style={s.checkmark} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Inactive.png"}}/></TouchableOpacity>
    }
  }

  newVotes(question){
    this.props.newVote(question)
  }

  // showAnswer(){
  //   this.props.showAnswered()
  // }

  // modalOpen(){
  //   this.props.showModal()
  // }

}

export default MyList


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
    backgroundColor: new Color().rgbString() ,
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
    borderBottomColor: new Color().rgbString() 
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
    textAlign: 'center',
    height: 16,
    width: 16,
    marginTop: 4
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
    backgroundColor: new Color().rgbString(),
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
  },
  whiteText: {
    fontSize: 18,
    color: 'white',
  }
})
