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

'use strict'
import React, { Component } from 'react'
import ReactNative, {
  Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Modal, Image
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'
const primaryColor = new Color(client.primaryColor).limitLightness(0.9).rgbString()

export default class CustomModal extends Component {
  constructor(props){
    super(props)
    this.state = {
      question: '', 
      anomStatus: false,
      color: 'white', 
      borderColor: '#EFEFEF',
      inputHeight: 0,
      search: false,
      session: '',
      newList: [],
      isError: this.props.showError
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.showError !== this.state.isError){
      this.setState({isError: nextProps.showError})
    }
  }

  modalClose() {
    this.setState({anomStatus: false, color: 'white'})
    this.props.hideModal()
  }

  sessionSelect = session => {
    this.props.selectSession(session)
  }

  makeQuestion = (question, anomStatus) => {
    this.props.createSharedTask(question, anomStatus)
    this.setState({question: ''})
  }

  render() {
    const newStyle = {
      flex: 1,
      fontSize: 18,
      color: '#364247',
      textAlignVertical: 'top',
      maxHeight: 100,
      height: Math.max(35, this.state.inputHeight),
      paddingTop: 0,
    }
    
    const androidStyle = {
      paddingLeft: 0,
      marginTop: 17,
      marginBottom: 10
    }

    const iosStyle = {
      marginTop: 20,
      marginBottom: 10,
    }
    
    var newColor = "#9B9B9B"
    if (this.props.session){
      newColor = primaryColor
    }

    const colorStyle = {
      backgroundColor: newColor
    }

    if (this.props.launch === true) {
      let sessions = this.props.sessions
      let displayTable = true
      if (this.state.search) { 
        sessions = this.state.newList
        if (sessions.length === 0) {
          displayTable = false
        }
      }
      return(
        <View style={{flex: 1}}>
          {this.renderModalHeader()}
          { displayTable ? <FlatList
          style={{backgroundColor: '#EFEFEF'}}
          data = {sessions}
          ListFooterComponent={<View style={{height: 100}}></View>}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => this.sessionSelect(item)} style={s.listContainer}>
              <View style={s.leftContainer}>
                <SessionRadio selected={this.props.session === item} />
              </View>
              <View style={s.rightContainer}>
                <Text style={{fontSize: 16, color: '#364247'}}>{item.sessionName}</Text>
              </View>
            </TouchableOpacity>
          )} /> : <Text style={{textAlign: "center", marginTop: 100, fontSize: 20, color: '#9B9B9B', flex: 1, }}>No Search Results</Text> }
          <View style={{borderTopColor:"#b7b7b7", borderTopWidth: 1, backgroundColor: '#EFEFEF'}}>
            <TouchableOpacity disabled={this.props.disable} onPress={this.props.closeSessionModal} style={[s.bigButton, colorStyle]}>
              <Text style={{fontSize: 14, textAlign: "center", marginTop: 13, color: "white"}}>Join Q&amp;A</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      var borderColor = this.state.borderColor
      if (this.state.isError){borderColor = "red"}
      const borderStyle = {borderColor: borderColor}
      const allow = this.props.anom[0] ? this.props.anom[0].allow : true
      return (
        <View style={{flex: 1}}>
          <View style={[s.modal, borderStyle]}>
            <TouchableOpacity style={s.circleBox}><Text style={s.whiteText}>?</Text></TouchableOpacity>
            <TextInput style={Platform.select({ios: [newStyle, iosStyle], android: [newStyle, androidStyle]})} placeholder="Type your question here"
              value={this.state.question}
              onChangeText={question => this.setState({question, isError: false})} 
              maxLength={250}
              autoFocus={true}
              multiline={true}
              placeholderTextColor="#9B9B9B"
              onContentSizeChange={(event) => this._handleSizeChange(event)}
            />
            <Text style={s.counter}>{250 - this.state.question.length} </Text>
          </View>
          <View style={s.bottomButtons}>
            <View style={s.rightBox}>
              <Text style={{color: this.state.isError ? "red" : "white", paddingTop: 2, fontSize: 12, marginLeft: 10}}>*Please enter a question</Text>
              {allow ? <View style={s.anomBox}>
                {this.renderAnomIcon()}
                <Text style={s.anomText}>Ask anonymously</Text>
              </View> : null
              }
            </View>
            <TouchableOpacity style={s.sendButton} onPress={() => this.makeQuestion(this.state.question, this.state.anomStatus)}><Text style={s.sendButtonText}>{this.props.questionError}</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={s.modalBottom} onPress={this.modalClose.bind(this)}></TouchableOpacity> 
        </View>
      )
    }
  }

  renderAnomIcon = () => {
    if (this.state.anomStatus) {
      return (
        <TouchableOpacity onPress={() => this.makeTrue()}><Image style={s.checkButton} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/checkbox_active.png"}}/></TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={() => this.makeTrue()}><Image style={s.checkButton} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/checkbox_inactive.png"}}/></TouchableOpacity>
      )
    }
  }

  _handleSizeChange = event => {
    this.setState({
      inputHeight: event.nativeEvent.contentSize.height
    });
  };

  makeTrue() {
    if (this.state.anomStatus === false){
      this.setState({anomStatus: true, color: 'black'})
    }
    if (this.state.anomStatus === true){
      this.setState({anomStatus: false, color: 'white'})
    }
  }

  updateList = (value) => {
    const queryText = value.toLowerCase()
    if (queryText.length > 0){
      var queryResult = [];
      this.props.sessions.forEach(function(content){
        var title = content.sessionName
        if (title) {
          if (title.toLowerCase().indexOf(queryText)!== -1){
            queryResult.push(content);
          }
        }
      });
      this.setState({search: true, newList: queryResult, session: value})
    }
    else {
      this.setState({search: false, session: value})
    }
  }
  
  renderModalHeader = () => {
    const newStyle = {
      flex: 1,
      fontSize: 18,
      color: '#364247',
      textAlignVertical: 'top',
      maxHeight: 100,
      height: Math.max(35, this.state.inputHeight),
      paddingTop: 0,
    }
    const androidStyle = {
      paddingLeft: 0,
      marginTop: 5,
      marginBottom: 5,
    }
    const iosStyle = {
      marginTop: 3,
      marginBottom: 10,
    }
    if (this.props.sessions.length > 0) {
      return ( 
        <View style={{borderBottomColor: "#b7b7b7", borderBottomWidth: 1}}>
          <Text style={s.modHeader}> Please confirm your session</Text>
          <View style={{backgroundColor: '#9B9B9B', padding: 10}}>
            <View style={{flexDirection: "row", backgroundColor: "#FFFFFF", borderBottomColor: "#b7b7b7", borderBottomWidth: 1, borderRadius: 5, height: 40}}>
              {this.state.search ? <View style={{width: 40}} /> : <TouchableOpacity style={s.circleBoxMargin}><Text style={s.whiteText}>?</Text></TouchableOpacity>}
              <TextInput style={Platform.select({ios: [newStyle, iosStyle], android: [newStyle, androidStyle]})} placeholder="Search"
                value={this.state.session}
                onChangeText={session => this.updateList(session)} 
                maxLength={25}
                placeholderTextColor="#9B9B9B"
              />
              {this.state.search ? <TouchableOpacity style={s.circleBoxMargin} onPress={this.resetSearch}><Text style={s.whiteText}>X</Text></TouchableOpacity> : null}
            </View>
          </View>
        </View >
      )
    }
    else {
      return (
        <View>
          <View style={{borderBottomColor: "#b7b7b7", borderBottomWidth: 1, marginBottom: 150}}>
            <Text style={s.modHeader}> Please confirm your session</Text>
          </View >
            {this.props.isDataLoaded && <Text style={{textAlign: "center", fontSize: 20, color: '#9B9B9B', marginBottom: 5}}>No Live Sessions Available</Text>}
        </View>
      )
    }
  }

  resetSearch = () => {
    this.setState({session: "", search: false})
  }
}

const SessionRadio = ({selected}) => (
  <View style={[s.radio, selected ? {borderColor: primaryColor} : null]}>
    {selected ? <View style={[s.radioDot, {backgroundColor: primaryColor}]} /> : null}
  </View>
)

const s = ReactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  circleBoxMargin: {
  marginTop:10,
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

  whiteText: {
    fontSize: 18,
    color: 'white',
  },

  modHeader: {
    backgroundColor: 'white', 
    height: 51, 
    fontSize: 18, 
    textAlign: "center", 
    paddingTop: 15, 
    color: '#364247'
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 82
  },

  modal: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
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
    borderBottomColor: primaryColor,
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
    backgroundColor: primaryColor,
    height: 42,
    borderRadius: 4,
  },
  checkButton: {
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 15,
    height: 19,
    width: 19,
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
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderColor: '#c4c4c4',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  }
})
