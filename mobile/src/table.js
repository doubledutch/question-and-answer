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
import {
  FlatList, Image, StyleSheet, TouchableOpacity, Text, View
} from 'react-native'
import {Color, translate as t} from '@doubledutch/rn-client'
import {thumbsup, checkcircle, deletecircle, checkmark} from './images'

export default class MyList extends Component {
  constructor(props) {
    super(props)
    this.checkmarkSelectedBackground = new Color(props.primaryColor).limitSaturation(0.5).minLightness(0.9).limitLightness(0.9).rgbString()
  }
  state = {
    anom: false,
    showMessage: false,
  }

  render() {
    const {moderator, isAdmin, currentSort} = this.props
    var showAnswer = this.props.showAnswer
    let newQuestions = this.props.questions
    if (isAdmin && currentSort === "Answered") showAnswer = true

    if (showAnswer === true){
      newQuestions = newQuestions.filter(item => item.answered === true)
      newQuestions.sort((a,b) => b.lastEdit - a.lastEdit)
    }
    if (showAnswer === false){
      newQuestions = newQuestions.filter(item => item.answered === false)
    }
    let testQuestions = newQuestions
    if (moderator.length > 0 && isAdmin === false && moderator[0].approve === true) {    
      testQuestions = testQuestions.filter(item => item.approve === true)
    }

    return (
      <View>
        {this.renderHeader(testQuestions)}
        {(isAdmin) ? this.renderAdminList(newQuestions) : this.renderAttendeeList(newQuestions)}
      </View>
    )
  }

 renderAdminList = (newQuestions) => {
  const { moderator, currentSort } = this.props
  return (
    <FlatList
      data={newQuestions}
      ListFooterComponent={<View style={{height: 100}}></View>}
      renderItem={({item}) => {
        if (moderator.length > 0) {
          if (currentSort === "Blocked" || currentSort ==="New") {
            return this.renderCell(item)
          }
          if (moderator[0].approve !== true && item.answered === false) {
            return this.renderCell(item)
          }
          if (moderator[0].approve === true && item.approve === true && item.answered === false){
            return this.renderCell(item)
          } else if (item.answered === true) {
            return this.renderCell(item)
          }
        } else {
          return this.renderCell(item)
        }
      }}
    />
   )
 }

 renderAttendeeList = (newQuestions) => {
   const { moderator } = this.props
   return (
    <FlatList
    data={newQuestions}
    ListFooterComponent={<View style={{height: 100}}></View>}
    renderItem={({item}) => {
      if (moderator.length > 0){
        if (moderator[0].approve !== true && item.answered === false) {
          return this.renderCell(item)
        }
        if (moderator[0].approve === true && item.approve === true && item.answered === false){
          return this.renderCell(item)
        }
        else {
          if (item.answered === true){
             return this.renderCell(item)
          }
        }
      }
      else {
        return this.renderCell(item)
      }
    }
    }
    />
   )
 }

 renderCell = (item) => {
   return (
    <View>
      <View style={s.listContainer}>
        {this.props.openAdminHeader ? null : this.renderVoteButton(item)}
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
      {this.props.openAdminHeader ? this.renderAdminButtons(item) : null}
    </View>
   )
 }

  renderHeader = (questions) => {
    const { isAdmin, showAnswer, showRecent, allQuestions } = this.props
    if (allQuestions.length === 0 && isAdmin === false) {
      return (
        <View>
          {this.renderHeaderButtons(this.button1Style(), s.button2, s.button2)}
          <View style={{marginTop: 96}}>
            <Text style={{marginTop: 30, textAlign: "center", fontSize: 20, color: '#9B9B9B', marginBottom: 5, height: 25}}>Be the First to Ask a Question!</Text>
            <TouchableOpacity style={{marginTop: 5, height: 25}} onPress={this.props.showModal}><Text style={{textAlign: "center", fontSize: 18, color: this.props.primaryColor}}>Tap here to get started</Text></TouchableOpacity>
          </View>
        </View>
      )
    }
    if (showAnswer) {
      return (
        <View>
          {this.renderHeaderButtons(s.button2, s.button2, this.button1Style())}
          {questions.length ? null : this.renderHelpText()}
        </View>
      )
    }
    if (showRecent) {
      return (
        <View>
          {this.renderHeaderButtons(s.button2, this.button1Style(), s.button2)}
          {questions.length ? null : this.renderHelpText()}
        </View>
      )
    }
    else {
      return (
        <View>
          {this.renderHeaderButtons(this.button1Style(), s.button2, s.button2)}
          {questions.length ? null : this.renderHelpText()}
        </View>
      )
    }
  }

  renderHelpText = () => {
    const {moderator, currentSort} = this.props
    return (
      <View style={{marginTop: 96}}b>
        <Text style={{marginTop: 30, textAlign: "center", fontSize: 20, color: '#9B9B9B', marginBottom: 5, height: 25}}>{moderator[0].approve === false && currentSort === "New" ? t('mod_off'): t('no_matching_questions') }</Text>
      </View>
    )
  }

  renderHeaderButtons = (x,y,z) => {
    const {isAdmin} = this.props
    if (isAdmin) return (
      <View style={{height: 60}}>
        <View style={s.buttonContainer}>
          <TouchableOpacity style={s.squareHeaderButton1} onPress={this.props.showAdminPanel}>
            <Text style={[s.adminDashboardButton, this.primaryColorStyle()]}>{this.props.openAdminHeader ? t('hide') : t('open')} Admin Panel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.squareHeaderButton2} onPress={this.props.renderFilterSelect}>
            <Text style={s.adminDashboardButtonTitle}>Filters: </Text><Text style={[s.adminDashboardButton, this.primaryColorStyle()]}> {this.props.currentSort}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
    else return (
      <View style={{height: 60}}>
        <View style={s.buttonContainer}>
          <View style={s.divider}/>
          <TouchableOpacity style={x} onPress={this.props.findOrder}><Text style={s.dashboardButton}>Popular</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={y} onPress={this.props.findOrderDate}><Text style={s.dashboardButton}>Recent</Text></TouchableOpacity>
          <View style={s.dividerSm}/>
          <TouchableOpacity style={z} onPress={this.props.showAnswered}><Text style={s.dashboardButton}>Answered</Text></TouchableOpacity>
          <View style={s.divider}/>
        </View>
      </View>
    )
  }

  renderAdminButtons = (question) => {
    const { currentSort } = this.props
    switch(currentSort) {
      case "New": return (
      <View style={[{height: 44, backgroundColor: "white"}, s.buttonContainer]}>
        <TouchableOpacity style={s.squareHeaderButton1} onPress={()=>this.props.changeQuestionStatus(question, "block")}><Image style={{height: 20, width: 20}} source={deletecircle}/><Text style={s.adminDashboardButtonRed}> {t('block')}</Text></TouchableOpacity>
        <TouchableOpacity style={s.squareHeaderButton2} onPress={()=>this.props.changeQuestionStatus(question, "approve")}><Image style={{height: 20, width: 20}} source={checkcircle}/><Text style={s.adminDashboardButtonGreen}> {t('approve')}</Text></TouchableOpacity>
      </View>
      )
      case "Answered": return (
        <View style={[{height: 44, backgroundColor: "white"}, s.buttonContainer]}>
          <TouchableOpacity style={s.squareHeaderButton1} onPress={()=>this.props.changeQuestionStatus(question, "block")}><Image style={{height: 20, width: 20}} source={deletecircle}/><Text style={s.adminDashboardButtonRed}> {t('block')}</Text></TouchableOpacity>
          <TouchableOpacity style={s.squareHeaderButton2} onPress={()=>this.props.changeQuestionStatus(question, "approve")}><Image style={{height: 20, width: 20}} source={checkcircle}/><Text style={s.adminDashboardButtonGreen}> {t('approve')}</Text></TouchableOpacity>
        </View>
      )
      case "Blocked": return (
        <View style={[{height: 44, backgroundColor: "white"}, s.buttonContainer]}>
          <TouchableOpacity style={s.squareHeaderButton2} onPress={()=>this.props.changeQuestionStatus(question, "approve")}><Image style={{height: 20, width: 20}} source={checkcircle}/><Text style={s.adminDashboardButtonGreen}> {t('approve')}</Text></TouchableOpacity>
        </View>
      )
      case "Approved": return (
        <View style={[{height: 44, backgroundColor: "white"}, s.buttonContainer]}>
          <TouchableOpacity style={s.squareHeaderButton1} onPress={()=>this.props.changeQuestionStatus(question, "block")}><Image style={{height: 20, width: 20}} source={deletecircle}/><Text style={s.adminDashboardButtonRed}> {t('block')}</Text></TouchableOpacity>
          <TouchableOpacity style={s.squareHeaderButton2} onPress={()=>this.props.changeQuestionStatus(question, "answer")}><Image style={{height: 20, width: 20}} source={checkmark}/><Text style={s.adminDashboardButtonBlue}> {t('answer')}</Text></TouchableOpacity>
        </View>
      )
    }
  }

  renderVoteButton = question => {
    return (
      <TouchableOpacity style={s.leftContainer} onPress={() => this.newVotes(question)}>
        <Image style={[s.checkmark, question.myVote ? this.checkmarkSelectedStyle() : null]} source={thumbsup}/>
        <Text style={s.subText}>{question.score}</Text>
      </TouchableOpacity>
    )
  }

  newVotes = question => {
    this.props.newVote(question)
  }

  checkmarkSelectedStyle = () => ({backgroundColor: this.checkmarkSelectedBackground})
  primaryColorStyle = () => ({color: this.props.primaryColor})
  button1Style = () => [s.button1, {borderBottomColor: this.props.primaryColor}]
}

const s = StyleSheet.create({
  adminDashboardButton: {
    fontSize: 16,
    fontWeight: "bold",
  },
  adminDashboardButtonRed: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#CC6060"
  },
  adminDashboardButtonGreen: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8AB952"
  },
  adminDashboardButtonBlue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2"
  },
  adminDashboardButtonTitle: {
    fontSize: 16,
    color: '#9B9B9B'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "white",
    justifyContent: "center"
  },
  squareHeaderButton1: {
    justifyContent: 'center',
    alignItems: "center",
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  squareHeaderButton2: {
    justifyContent: 'center',
    alignItems: "center",
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  subText:{
    fontSize: 12,
    color: '#9B9B9B'
  },
  nameText:{
    fontSize: 14,
    color: '#9B9B9B',
  },
  button1: {
    height: 40,
    paddingTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    borderBottomWidth: 2,
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
    marginTop: 2,
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
  checkmark: {
    height: 16,
    width: 16,
    marginTop: 4
  },
  dashboardButton: {
    fontSize: 18,
    color: '#9B9B9B'
  },
})
