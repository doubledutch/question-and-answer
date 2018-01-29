'use strict'
import React, { Component } from 'react'
import ReactNative, {
  Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Modal, Image
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'


export class CustomModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            question: '', 
            anom: false, 
            color: 'white', 
            height: 22, 
            borderColor: '#EFEFEF'
          }
    }

    modalClose(){
        this.setState({anom: false, color: 'white'})
        this.props.hideModal()
    }

 

    sessionSelect = (session) => {
        this.props.selectSession(session)
    }


    makeQuestion = (question, anom) => {
        this.props.createSharedTask(question, anom)
        this.setState({question: '', anom: false})
    }

    render(){
        const newStyle = {
            flex: 1,
            marginBottom: 20,
            fontSize: 18,
            color: '#9B9B9B',
            textAlignVertical: 'top',
            maxHeight: 100,
            height: this.state.height,
            marginTop: 20,
            paddingTop: 0,
        }
        
        const androidStyle1 = {
          paddingLeft: 0,
        }

        var newColor = "#9B9B9B"
        if (this.props.sessions.length > 0){
          newColor = client.primaryColor
        }

        const colorStyle = {
          backgroundColor: newColor
        }

        if (this.props.launch === true) {
            return(
                <View style={{flex: 1}}>
                    {this.renderModalHeader()}
                    <FlatList
                    style={{backgroundColor: '#EFEFEF'}}
                    data = {this.props.sessions}
                    ListFooterComponent={<View style={{height: 100}}></View>}
                    renderItem={({item}) =>{  
                        return (
                        <TouchableOpacity onPress={() => this.sessionSelect(item)} style={s.listContainer}>
                            <View style={s.leftContainer}>
                                {this.renderModIcon(item)}
                            </View>
                            <View style={s.rightContainer}>
                                <Text style={{fontSize: 16}}>{item.sessionName}</Text>
                            </View>
                        </TouchableOpacity>
                        )
                    }
                    }
                    />
                    <View style={{borderTopColor:"#b7b7b7", borderTopWidth: 1, backgroundColor: '#EFEFEF'}}>
                        <TouchableOpacity disabled={this.props.disable} onPress={this.props.closeSessionModal} style={[s.bigButton, colorStyle]}><Text style={{fontSize: 14, textAlign: "center", marginTop: 13, color: "white"}}>Join Q&A</Text></TouchableOpacity>
                    </View>
                </View>
            )
        }
      else {
        var borderColor = this.state.borderColor
        if (this.props.showError === "red"){borderColor = "red"}
        const borderStyle = {borderColor: borderColor}
        return (
            <View style={{flex: 1}}>
                <View style={[s.modal, borderStyle]}>
                    <TouchableOpacity style={s.circleBox}><Text style={s.whiteText}>?</Text></TouchableOpacity>
                    <TextInput style={Platform.select({ios: newStyle, android: [newStyle, androidStyle1]})} placeholder="Type your question here"
                    value={this.state.question}
                    onChangeText={question => this.setState({question})} 
                    maxLength={250}
                    autoFocus={true}
                    multiline={true}
                    placeholderTextColor="#9B9B9B"
                    onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}/>
                    <Text style={s.counter}>{250 - this.state.question.length} </Text>
                </View>
                <View style={s.bottomButtons}>
                <View style={s.rightBox}>
                    <Text style={{color: this.props.showError, paddingTop: 2, fontSize: 12, marginLeft: 10}}>*Please enter a question</Text>
                    <View style={s.anomBox}>
                        {this.renderAnomIcon()}
                        <Text style={s.anomText}>Ask anonymously</Text>
                    </View>
                </View>
                <TouchableOpacity style={s.sendButton} onPress={() => this.makeQuestion(this.state.question, this.state.anom)}><Text style={s.sendButtonText}>{this.props.questionError}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={s.modalBottom} onPress={this.modalClose.bind(this)}></TouchableOpacity> 
        </View>
        )
      }
    }

    renderAnomIcon = () => {
      if (this.state.anom){
      return (
        <TouchableOpacity onPress={() => this.makeTrue()}><Image style={s.checkButton} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/checkbox_active.png"}}/></TouchableOpacity>

      )
    }
    else {
      return (
        <TouchableOpacity onPress={() => this.makeTrue()}><Image style={s.checkButton} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/checkbox_inactive.png"}}/></TouchableOpacity>
      )
    }
    }

    updateSize = (height) => {
        this.setState({height});
    }
    makeTrue(){
        if (this.state.anom === false){
            this.setState({anom: true, color: 'black'})
        }
        if (this.state.anom === true){
            this.setState({anom: false, color: 'white'})
        }
    }
    
    renderModIcon= (item) => {
        if (this.props.session === item) {
            return <Image style={{width: 20, height: 20}} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/radio_active.png"}}/>
        }
        else {
            return <Image style={{width: 20, height: 20}} source={{uri: "https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/radio_inactive.png"}}/>
        }
   }

   renderModalHeader = () => {
      if (this.props.sessions.length > 0){
        return( 
        <View style={{borderBottomColor: "#b7b7b7", borderBottomWidth: 1}}>
          <Text style={s.modHeader}> Please confirm your session</Text>
        </View >
        )
      }
      else {
        return(
        <View>
          <View style={{borderBottomColor: "#b7b7b7", borderBottomWidth: 1, marginBottom: 150}}>
            <Text style={s.modHeader}> Please confirm your session</Text>
          </View >
            <Text style={{textAlign: "center", fontSize: 20, color: '#9B9B9B', marginBottom: 5}}>No Live Sessions Available</Text>
        </View>
        )
      }
  }
}

export default CustomModal

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
