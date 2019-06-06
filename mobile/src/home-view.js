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

import React, { PureComponent } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native'
import client, { TitleBar, useStrings, translate as t } from '@doubledutch/rn-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'
import i18n from './i18n'
import MyList from './table'
import CustomModal from './modal'
import FilterSelect from './filtersModal'
import LoadingView from './LoadingView'

useStrings(i18n)

class HomeView extends PureComponent {
  constructor(props) {
    super(props)
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
      anom: [],
      characterCount: 0,
      showRecent: false,
      showAnswer: false,
      showError: false,
      newUpdate: false,
      modalVisible: true,
      color: 'white',
      height: 20,
      newValue: '',
      marginTop: 18,
      animation: 'none',
      title: t('q&a'),
      questionAsk: false,
      questionError: t('ask_question'),
      topBorder: '#EFEFEF',
      approve: false,
      isAdmin: false,
      showFilterSelect: false,
      currentSort: 'Popular',
      openAdminHeader: false,
      isLoggedIn: false,
      logInFailed: false,
      isDataLoaded: false,
      adminSessions: [],
    }
    this.signin = props.fbc.signin().then(user => (this.user = user))

    this.signin.catch(err => console.error(err))
  }

  componentDidMount() {
    const { fbc, sessionId } = this.props
    client.getCurrentUser().then(currentUser => this.setState({ currentUser }))
    client.getPrimaryColor().then(primaryColor => this.setState({ primaryColor }))
    this.signin
      .then(() => {
        const modRef = fbc.database.public.adminRef('moderators')
        const sessRef = fbc.database.public.adminRef('sessions')
        const anomRef = fbc.database.public.adminRef('askAnom')

        const wireListeners = () => {
          sessRef.on('child_added', data => {
            this.setState({ sessions: [...this.state.sessions, { ...data.val(), key: data.key }] })
            if (sessionId) {
              const directSession = data.key === sessionId ? { ...data.val(), key: data.key } : null
              if (directSession) {
                this.selectSession(directSession)
                this.hideModal()
                this.setState({ launch: false })
              }
            }
          })

          sessRef.on('child_removed', data => {
            if (data.key === this.state.session.key) {
              this.setState({
                sessions: this.state.sessions.filter(x => x.key !== data.key),
                session: '',
                launch: true,
                modalVisible: true,
              })
            } else {
              this.setState({ sessions: this.state.sessions.filter(x => x.key !== data.key) })
            }
          })

          sessRef.on('child_changed', data => {
            const sessions = this.state.sessions.slice()
            for (const i in sessions) {
              if (sessions[i].key === data.key) {
                sessions[i] = data.val()
                sessions[i].key = data.key
                if (this.state.session.key === data.key) {
                  let changeModalView = this.state.modalVisible
                  let changeLaunch = this.state.launch
                  const changeDisable = true
                  let newSession = data.val()
                  newSession.key = data.key
                  if (changeLaunch && changeModalView) {
                    newSession = ''
                  }
                  if (data.val().archive && !sessionId) {
                    changeModalView = true
                    changeLaunch = true
                    newSession = ''
                  }
                  this.setState({
                    sessions,
                    session: newSession,
                    modalVisible: changeModalView,
                    launch: changeLaunch,
                    disable: changeDisable,
                  })
                } else {
                  this.setState({ sessions })
                }
                break
              }
            }
          })

          modRef.on('child_added', data => {
            this.setState({
              moderator: [...this.state.moderator, { ...data.val(), key: data.key }],
            })
          })

          modRef.on('child_changed', data => {
            const { moderator } = this.state
            for (const i in moderator) {
              if (moderator[i].key === data.key) {
                moderator[i].approve = data.val().approve
                this.setState({ moderator })
                break
              }
            }
          })
          anomRef.on('child_added', data => {
            this.setState({ anom: [...this.state.anom, { ...data.val(), key: data.key }] })
          })

          anomRef.on('child_changed', data => {
            const { anom } = this.state
            for (const i in anom) {
              if (anom[i].key === data.key) {
                anom[i] = data.val()
                anom[i].key = data.key
                this.setState({ anom })
              }
            }
          })

          fbc.database.private.adminableUserRef('dummy').once('value', data => {
            // We don't expect data. This is just to capture whether we are done loading data.
            this.setState({ isDataLoaded: true })
          })

          // The function below will hide the login screen component with a 1/2 second delay to provide an oppt for firebase data to downlaod
          this.hideLogInScreen = setTimeout(() => {
            this.setState({ isLoggedIn: true })
          }, 500)
        }
        fbc.database.private.adminableUserRef().once('value', async data => {
          const { adminSessions, adminToken } = data.val() || {}
          if (adminToken) {
            console.log('Attendee appears to be admin.  Logging out and logging in w/ admin token.')
            await fbc.firebase.auth().signOut()
            client.longLivedToken = adminToken
            await fbc.signinAdmin()
            console.log('Re-logged in as admin')
            this.setState({ isAdmin: true, adminSessions })
          }
          wireListeners()
        })
      })
      .catch(() => this.setState({ logInFailed: true }))
  }

  render() {
    const { suggestedTitle } = this.props
    const { currentUser, primaryColor } = this.state
    if (!currentUser || !primaryColor) return null

    let titleText = suggestedTitle || this.state.title
    if (this.state.session) {
      if (this.state.session.sessionName.length < 30) {
        titleText = this.state.session.sessionName
      } else {
        let newText = this.state.session.sessionName.slice(0, 25)
        newText += '...'
        titleText = newText
      }
    }

    return (
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.select({ ios: 'padding', android: null })}
      >
        <TitleBar title={titleText} client={client} signin={this.signin} />
        {this.state.isLoggedIn ? (
          this.state.showFilterSelect ? (
            <FilterSelect
              session={this.state.session}
              currentSort={this.state.currentSort}
              questions={this.state.questions}
              handleChange={this.handleChange}
              openAdminHeader={this.state.openAdminHeader}
              findOrder={this.findOrder}
              findOrderDate={this.findOrderDate}
              primaryColor={primaryColor}
            />
          ) : (
            this.renderHome()
          )
        ) : (
          <LoadingView logInFailed={this.state.logInFailed} />
        )}
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
      textAlignVertical: 'center',
    }

    const {
      showRecent,
      moderator,
      launch,
      showAnswer,
      session,
      isAdmin,
      primaryColor,
      modalVisible,
      adminSessions,
    } = this.state
    const sessions = this.state.sessions.filter(item => item.archive !== true)
    let newQuestions = []
    if (session) newQuestions = this.sortFilter()
    if (!modalVisible) {
      return (
        <View style={{ flex: 1 }}>
          <View style={s.textBox}>
            <TouchableOpacity style={s.circleBox} onPress={this.showModal}>
              <Text style={s.whiteText}>?</Text>
            </TouchableOpacity>
            <TextInput
              underlineColorAndroid="transparent"
              style={Platform.select({ ios: newStyle, android: [newStyle, androidStyle] })}
              placeholder="Type your question here"
              value={this.state.question}
              autoFocus={false}
              onFocus={this.showModal}
              multiline
              placeholderTextColor="#9B9B9B"
            />
          </View>
          <View style={{ flex: 1 }}>
            <MyList
              session={this.state.session}
              questions={newQuestions}
              allQuestions={this.state.questions}
              showModal={this.showModal}
              showAnswer={showAnswer}
              moderator={moderator}
              showRecent={showRecent}
              showAnswered={this.showAnswered}
              findOrder={this.findOrder}
              findOrderDate={this.findOrderDate}
              originalOrder={this.originalOrder}
              newVote={this.newVote}
              isAdmin={isAdmin}
              adminSessions={adminSessions}
              changeQuestionStatus={this.changeQuestionStatus}
              renderFilterSelect={this.renderFilterSelect}
              currentSort={this.state.currentSort}
              showAdminPanel={this.showAdminPanel}
              openAdminHeader={this.state.openAdminHeader}
              primaryColor={primaryColor}
            />
          </View>
          {this.renderModal()}
        </View>
      )
    }
    return (
      <CustomModal
        sessions={sessions}
        launch={launch}
        showModal={this.showModal}
        closeSessionModal={this.closeSessionModal}
        makeTrue={this.makeTrue}
        anom={this.state.anom}
        createSharedTask={this.createSharedTask}
        selectSession={this.selectSession}
        disable={this.state.disable}
        question={this.state.question}
        showError={this.state.showError}
        session={this.state.session}
        hideModal={this.hideModal}
        modalVisible={this.state.modalVisible}
        questionError={this.state.questionError}
        style={{ flex: 1 }}
        isDataLoaded={this.state.isDataLoaded}
        primaryColor={primaryColor}
      />
    )
  }

  sortFilter = () => {
    const { currentSort, questions, session } = this.state
    if (this.state.isAdmin) {
      const pinnedQuestions = questions.filter(item => item.pin === true)
      const otherQuestions = questions.filter(item => item.pin === false)
      pinnedQuestions.sort((a, b) => a.order - b.order)
      this.originalOrder(otherQuestions)
      const allQuestions = pinnedQuestions.concat(otherQuestions)
      let orderedQuestions = allQuestions
      switch (currentSort) {
        case 'Answered':
          orderedQuestions = allQuestions.filter(
            item => item.answered && item.session === session.key,
          )
          break
        case 'Blocked':
          orderedQuestions = allQuestions.filter(
            item => item.block && item.new === false && item.session === session.key,
          )
          break
        case 'New':
          orderedQuestions = allQuestions.filter(
            item => item.approve === false && item.new && item.session === session.key,
          )
          break
        default:
          orderedQuestions = allQuestions.filter(
            item =>
              item.block === false &&
              item.answered === false &&
              item.approve &&
              item.new === false &&
              item.session === session.key,
          )
      }
      return orderedQuestions
    }

    const pinnedQuestions = questions.filter(
      item => item.pin === true && item.block === false && item.session === session.key,
    )
    const otherQuestions = questions.filter(
      item => item.pin === false && item.block === false && item.session === session.key,
    )
    pinnedQuestions.sort((a, b) => a.order - b.order)
    this.originalOrder(otherQuestions)
    const newQuestions = pinnedQuestions.concat(otherQuestions)
    return newQuestions
  }

  showAnswered = () => {
    this.setState({ showAnswer: true })
  }

  renderIcon = question => {
    if (question.myVote === true) {
      return (
        <TouchableOpacity onPress={() => this.newVote(question)}>
          <Image
            style={s.checkmark}
            source={{
              uri: 'https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Active.png',
            }}
          />
        </TouchableOpacity>
      )
    }
    return (
      <TouchableOpacity onPress={() => this.newVote(question)}>
        <Image
          style={s.checkmark}
          source={{
            uri: 'https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/Inactive.png',
          }}
        />
      </TouchableOpacity>
    )
  }

  showModal = () => {
    this.setState({ modalVisible: true, animation: 'none' })
  }

  hideModal = () => {
    if (this.state.launch === false) {
      this.setState({ modalVisible: false, animation: 'slide', showError: false })
    }
    if (this.state.launch === true) {
      this.setState({ modalVisible: false, animation: 'slide', showError: false })
    }
  }

  selectSession = session => {
    this.setState({ session, disable: false })
    if (!this.state.questions.some(question => question.session === session.key)) {
      this.sessionListeners(session)
    }
  }

  sessionListeners = session => {
    const { fbc } = this.props
    const { currentUser } = this.state
    fbc.database.public
      .allRef('questions')
      .child(session.key)
      .on('child_added', data => {
        this.setState({ questions: [...this.state.questions, { ...data.val(), key: data.key }] })
        fbc.database.public
          .allRef('votes')
          .child(data.key)
          .on('child_added', vote => {
            const isThisMyVote = vote.key === currentUser.id
            this.setState(prevState => ({
              questions: prevState.questions.map(question =>
                question.key === data.key
                  ? {
                      ...question,
                      myVote: question.myVote || isThisMyVote,
                      score: question.score + 1,
                    }
                  : question,
              ),
            }))
          })
        fbc.database.public
          .allRef('votes')
          .child(data.key)
          .on('child_removed', vote => {
            const wasThisMyVote = vote.key === currentUser.id
            this.setState(prevState => ({
              questions: prevState.questions.map(question =>
                question.key === data.key
                  ? {
                      ...question,
                      myVote: question.myVote && !wasThisMyVote,
                      score: question.score - 1,
                    }
                  : question,
              ),
            }))
          })
      })

    fbc.database.public
      .allRef('questions')
      .child(session.key)
      .on('child_changed', data => {
        const { questions } = this.state
        for (const i in questions) {
          if (questions[i].key === data.key) {
            const { score } = questions[i]
            const { myVote } = questions[i]
            const oldState = questions[i].approve
            const newQuestions = questions.filter(x => x.key !== data.key)
            const newObject = data.val()
            newObject.score = score
            newObject.myVote = myVote
            if (
              data.val().creator.id === currentUser.id &&
              oldState !== newObject.approve &&
              !newObject.block &&
              !newObject.answered
            ) {
              this.setState({
                questions: [...newQuestions, { ...newObject, key: data.key }],
                approve: true,
                questionAsk: true,
              })
            } else {
              this.setState({ questions: [...newQuestions, { ...newObject, key: data.key }] })
            }
            break
          }
        }
      })
    fbc.database.public
      .allRef('questions')
      .child(session.key)
      .on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })
  }

  handleChange = (prop, value) => {
    this.setState({ [prop]: value })
  }

  closeSessionModal = () => {
    this.setState({ launch: false })
    this.hideModal()
  }

  renderModal = () => {
    let modOn = false
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0]) {
        modOn = this.state.moderator[0].approve
      }
    }
    if (
      this.state.questionAsk &&
      modOn &&
      this.state.approve &&
      this.state.openAdminHeader === false
    ) {
      setTimeout(() => {
        this.closeConfirm()
      }, 5000)
      return (
        <TouchableOpacity
          style={[s.listContainer, this.backgroundPrimaryColor()]}
          onPress={this.closeConfirm}
        >
          <Image
            style={{ width: 20, height: 20 }}
            source={{
              uri:
                'https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/check_circle_white.png',
            }}
          />
          <Text style={{ marginLeft: 5, fontSize: 14, color: 'white' }}>
            {t('question_approved')}
          </Text>
        </TouchableOpacity>
      )
    }

    if (
      this.state.questionAsk &&
      modOn &&
      this.state.approve === false &&
      this.state.openAdminHeader === false
    ) {
      setTimeout(() => {
        this.closeConfirm()
      }, 5000)
      return (
        <TouchableOpacity
          style={[s.listContainer, this.backgroundPrimaryColor()]}
          onPress={this.closeConfirm}
        >
          <Image
            style={{ width: 20, height: 20 }}
            source={{
              uri:
                'https://dml2n2dpleynv.cloudfront.net/extensions/question-and-answer/check_circle_white.png',
            }}
          />
          <Text style={{ marginLeft: 5, fontSize: 14, color: 'white' }}>
            {t('question_submitted')}
          </Text>
        </TouchableOpacity>
      )
    }
  }

  closeConfirm = () => {
    this.setState({ questionAsk: false, approve: false })
  }

  changeQuestionStatus = (question, variable) => {
    const { fbc } = this.props
    const time = new Date().getTime()
    if (variable === 'approve')
      fbc.database.public
        .allRef('questions')
        .child(question.session)
        .child(question.key)
        .update({ approve: true, block: false, new: false, answered: false, lastEdit: time })
    if (variable === 'answer')
      fbc.database.public
        .allRef('questions')
        .child(question.session)
        .child(question.key)
        .update({ answered: true, block: false, new: false, pin: false, lastEdit: time })
    if (variable === 'block')
      fbc.database.public
        .allRef('questions')
        .child(question.session)
        .child(question.key)
        .update({
          block: true,
          answered: false,
          approve: false,
          new: false,
          pin: false,
          lastEdit: time,
        })
  }

  showAdminPanel = () => {
    const current = this.state.openAdminHeader
    let currentSort = 'Popular'
    if (current === false) {
      currentSort = 'New'
    }
    this.setState({ openAdminHeader: !current, currentSort })
  }

  originalOrder = questions => {
    if (this.state.showRecent === false) {
      this.dateSort(questions)
      questions.sort((a, b) => b.score - a.score)
    }
    if (this.state.showRecent === true) {
      this.dateSort(questions)
    }
  }

  dateSort = questions => {
    questions.sort((a, b) => b.dateCreate - a.dateCreate)
  }

  renderFilterSelect = () => {
    const current = this.state.showFilterSelect
    this.setState({ showFilterSelect: !current })
  }

  findOrder = () => {
    this.setState({ showRecent: false, showAnswer: false })
  }

  findOrderDate = () => {
    this.setState({ showRecent: true, showAnswer: false })
  }

  createSharedTask = (question, anom) =>
    this.createQuestion(this.props.fbc.database.public.allRef, question, anom)

  createQuestion = (ref, question, anom) => {
    const time = new Date().getTime()
    const questionName = question.trim()
    if (questionName.length === 0) {
      this.setState({ showError: true })
    }
    let approveVar = true
    let newVar = false
    if (this.state.moderator[0].approve) {
      approveVar = false
      newVar = true
    }
    if (this.user && questionName.length > 0) {
      ref('questions')
        .child(this.state.session.key)
        .push({
          text: questionName,
          creator: anom
            ? { firstName: '', lastName: 'Anonymous', email: '', id: '' }
            : this.state.currentUser,
          score: 0,
          dateCreate: time,
          anom,
          approve: approveVar,
          block: false,
          new: newVar,
          answered: false,
          pin: false,
          lastEdit: time,
          session: this.state.session.key,
          sessionName: this.state.session.sessionName,
        })
        .then(() => {
          this.setState({ question: '', showError: false })
          setTimeout(() => {
            this.hideModal()
            this.setState({ questionAsk: this.state.moderator[0].approve })
          }, 250)
        })
        .catch(error => this.setState({ questionError: t('retry') }))
    }
  }

  newVote = question => {
    const { fbc } = this.props
    const { currentUser } = this.state
    if (question.myVote === true) {
      fbc.database.public
        .allRef('votes')
        .child(question.key)
        .child(currentUser.id)
        .remove()
    } else {
      fbc.database.public
        .allRef('votes')
        .child(question.key)
        .child(currentUser.id)
        .set(1)
        .then(() => this.setState({ vote: '' }))
        .catch(x => console.error(x))
    }
  }

  borderBottomPrimaryColor = () => ({ borderBottomColor: this.state.primaryColor })

  backgroundPrimaryColor = () => ({ backgroundColor: this.state.primaryColor })
}

export default provideFirebaseConnectorToReactComponent(
  client,
  'questionanswer',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  textBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  listContainer: {
    flexDirection: 'row',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  checkmark: {
    height: 16,
    width: 16,
    marginTop: 4,
  },
  circleBox: {
    marginTop: 20,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#9B9B9B',
    paddingLeft: 8,
    paddingRight: 8,
    height: 22,
    borderRadius: 50,
  },
  whiteText: {
    fontSize: 18,
    color: 'white',
  },
})
