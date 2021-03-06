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

import React, { Component } from 'react'
import { CSVDownload } from '@doubledutch/react-csv'
import client, { translate as t } from '@doubledutch/admin-client'
import moment from 'moment'
import CustomCell from './cell'
import SettingsContainer from './SettingsContainer'
import TableHeader from './TableHeader'
import ContainerHeader from './ContainerHeader'
import CustomButtons from './buttons'
import SortableTable from './sortableTable'
import SessionBox from './SessionBox'
import Moderator from './Moderator'
import ModeratorModal from './ModeratorModal'
import 'react-select/dist/react-select.css'
import { openTab } from './utils'

const reorder = (fbc, list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  result.forEach((question, i) => {
    fbc.database.public
      .allRef('questions')
      .child(question.session)
      .child(question.key)
      .update({ order: i })
  })
  return result
}

export default class Admin extends Component {
  constructor() {
    super()
    this.state = {
      value: '',
      session: 'All',
      question: '',
      vote: '',
      questions: [],
      pinnedQuestions: [],
      admins: [],
      adminData: {},
      attendees: [],
      sessions: [],
      showRecent: false,
      modalVisible: false,
      color: 'white',
      marginTop: 18,
      moderation: null,
      anom: [],
      showBlock: false,
      showAnswer: false,
      newQuestions: 0,
      openVar: false,
      modalColor: '#FAFAFA',
      hideSessions: false,
      hideSettings: false,
      hideAdmins: false,
      showModal: false,
      message: 'enter_valid_session_name',
      backgroundUrl: '',
      isExporting: false,
      exportList: [],
      headerStatus: 'recent',
      selectedAdmin: null,
    }
  }

  backgroundUrlRef = () => this.props.fbc.database.public.adminRef('backgroundUrl')

  publicUsersRef = () => this.props.fbc.database.public.usersRef()

  componentDidMount() {
    const { client } = this.props
    client.getAttendees().then(users => {
      this.setState({ attendees: users })
      const { fbc } = this.props
      const modRef = fbc.database.public.adminRef('moderators')
      const sessRef = fbc.database.public.adminRef('sessions')
      const anomRef = fbc.database.public.adminRef('askAnom')
      const adminableUsersRef = () => fbc.database.private.adminableUsersRef()

      this.backgroundUrlRef = () => fbc.database.public.adminRef('backgroundUrl')
      this.backgroundUrlRef().on('value', data =>
        this.setState({ backgroundUrl: data.val() || '' }),
      )
      fbc.getLongLivedAdminToken().then(longLivedToken => this.setState({ longLivedToken }))

      adminableUsersRef().on('value', data => {
        const users = data.val() || {}
        this.setState({
          admins: Object.keys(users).filter(id => users[id].adminToken),
          adminData: users,
        })
      })

      sessRef.on('child_added', data => {
        this.setState({ sessions: [{ ...data.val(), key: data.key }, ...this.state.sessions] })
        const session = data
        fbc.database.public
          .allRef('questions')
          .child(session.key)
          .on('child_added', data => {
            let { pinnedQuestions } = this.state
            if (data.val().pin) {
              pinnedQuestions = [...this.state.pinnedQuestions, { ...data.val(), key: data.key }]
            }
            pinnedQuestions.sort((a, b) => a.order - b.order)
            this.setState({
              questions: [...this.state.questions, { ...data.val(), key: data.key }],
              pinnedQuestions,
            })

            fbc.database.public
              .allRef('votes')
              .child(data.key)
              .on('child_added', vote => {
                const questions = this.state.questions.map(question =>
                  question.key === data.key ? { ...question, score: question.score + 1 } : question,
                )
                this.setState({ questions })
              })
            fbc.database.public
              .allRef('votes')
              .child(data.key)
              .on('child_removed', vote => {
                const questions = this.state.questions.map(question =>
                  question.key === data.key ? { ...question, score: question.score - 1 } : question,
                )
                this.setState({ questions })
              })
          })
        fbc.database.public
          .allRef('questions')
          .child(session.key)
          .on('child_changed', data => {
            this.setState(prevState => {
              let { questions, pinnedQuestions } = prevState
              questions = questions.slice()
              pinnedQuestions = pinnedQuestions.slice()
              const isInPinned = pinnedQuestions.find(question => question.key === data.key)
              for (const q in questions) {
                if (questions[q].key === data.key) {
                  const { score } = questions[q]
                  questions[q] = data.val()
                  questions[q].score = score
                  questions[q].key = data.key
                  break
                }
              }
              for (const i in pinnedQuestions) {
                if (pinnedQuestions[i].key === data.key) {
                  const { score } = questions[i]
                  pinnedQuestions[i] = data.val()
                  pinnedQuestions[i].score = score
                  pinnedQuestions[i].key = data.key
                  pinnedQuestions.sort((a, b) => a.order - b.order)
                  break
                }
              }
              if (data.val().pin && !isInPinned) {
                pinnedQuestions = [...pinnedQuestions, { ...data.val(), key: data.key }]
              }
              if (data.val().pin === false && isInPinned) {
                pinnedQuestions = pinnedQuestions.filter(x => x.key !== data.key)
              }
              return { pinnedQuestions, questions }
            })
          })
      })

      sessRef.on('child_changed', data => {
        const { sessions } = this.state
        for (const i in sessions) {
          if (sessions[i].key === data.key) {
            sessions[i] = data.val()
            sessions[i].key = data.key
            this.setState({ sessions })
          }
        }
      })

      sessRef.on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.session !== data.key) })
        this.setState({ sessions: this.state.sessions.filter(x => x.key !== data.key) })
      })

      modRef.on('child_added', data => {
        this.setState({ moderation: { ...data.val(), key: data.key } })
      })

      modRef.on('child_changed', data => {
        const { questions } = this.state
        if (!data.val().approve) {
          questions.forEach((item, i) => {
            if (!questions[i].approve && questions[i].new) {
              this.makeApprove(questions[i])
            }
          })
        }
        this.setState({ moderation: { ...data.val(), key: data.key } })
      })

      anomRef.on('child_added', data => {
        this.setState({ anom: [...this.state.anom, { ...data.val(), key: data.key }] })
      })

      anomRef.on('child_changed', data => {
        const anom = this.state.anom.slice()
        for (const i in anom) {
          if (anom[i].key === data.key) {
            anom[i] = data.val()
            anom[i].key = data.key
            this.setState({ anom })
          }
        }
      })
    })
  }

  questionsInCurrentSession = questions => {
    const { session } = this.state
    if (session === 'All') return questions
    return questions.filter(question => question.session === session)
  }

  render() {
    const { questions, sessions, backgroundUrl, showModal } = this.state
    questions.sort((a, b) => b.dateCreate - a.dateCreate)
    const newQuestions = this.questionsInCurrentSession(questions)
    const pinnedQuestions = this.questionsInCurrentSession(this.state.pinnedQuestions)
    return (
      <div className="App">
        <ModeratorModal
          isOpen={showModal}
          closeModal={() => this.setState({ showModal: false, selectedAdmin: null })}
          sessions={sessions || []}
          admin={this.state.selectedAdmin || {}}
          adminData={this.state.adminData}
          onDeselected={this.onAdminDeselected}
          saveModerator={this.saveModerator}
          moderators={this.state.attendees.filter(a => this.isAdmin(a.id))}
        />
        <div className="containerSmall">
          <SessionBox
            openVar={this.state.openVar}
            closeModal={this.closeModal}
            newSession={this.newSession}
            sessions={this.state.sessions}
            confirmDelete={this.confirmDelete}
            confirmEdit={this.confirmEdit}
            modalColor={this.state.modalColor}
            message={`* ${t(this.state.message)}`}
            hideSection={this.hideSection}
            hideSessions={this.state.hideSessions}
          />
        </div>
        <div className="container">
          <ContainerHeader
            questions={newQuestions}
            handleSessionChange={this.handleSessionChange}
            sessions={this.state.sessions}
            disabled={this.state.disabled}
            moderation={this.state.moderation}
            offApprove={this.offApprove}
            onApprove={this.onApprove}
            session={this.state.session}
            fbc={this.props.fbc}
            answerAll={this.answerAll}
            launchPresentation={this.launchPresentation}
            launchDisabled={this.state.launchDisabled}
            bigScreenUrl={this.bigScreenUrl}
            currentSession={this.state.currentSession}
          />
          <div className="questionsContainer">
            {this.renderLeft(newQuestions, sessions)}
            {this.renderRight(newQuestions, pinnedQuestions)}
          </div>
          <div className="csvLinkBox">
            <button className="csvButton" onClick={this.formatDataForExport}>
              Export Questions
            </button>
            {this.state.isExporting ? (
              <CSVDownload data={this.state.exportList} filename="results.csv" target="_blank" />
            ) : null}
          </div>
        </div>
        <SettingsContainer
          hideSettings={this.state.hideSettings}
          hideSection={this.hideSection}
          anom={this.state.anom}
          offApprove={this.offAnom}
          onApprove={this.onAnom}
          backgroundUrl={backgroundUrl}
          onBackgroundUrlChange={this.onBackgroundUrlChange}
        />
        <Moderator
          adminData={this.state.adminData}
          onDeselected={this.onAdminDeselected}
          moderators={this.state.attendees.filter(a => this.isAdmin(a.id))}
          openModal={() => this.setState({ showModal: true })}
          selectMod={user => this.setState({ selectedAdmin: user, showModal: true })}
        />
      </div>
    )
  }

  formatDataForExport = () => {
    const originalQuestions = this.questionsInCurrentSession(this.state.questions)
    const attendeeQuestionPromises = originalQuestions.map(question =>
      client
        .getAttendee(question.creator.id)
        .then(attendee => ({ ...question, ...attendee }))
        .catch(err => question),
    )

    Promise.all(attendeeQuestionPromises).then(questions => {
      const exportList = questions.map(questionForCsv)
      this.setState({ exportList, isExporting: true })
      setTimeout(() => this.setState({ isExporting: false }), 3000)
    })
  }

  isAdmin(id) {
    return this.state.admins.includes(id)
  }

  getAttendees = query => this.props.client.getAttendees(query)

  renderLeft = questions => {
    let totalQuestions = questions.filter(item => !item.approve && item.new)
    if (totalQuestions === undefined) {
      totalQuestions = ['']
    }
    const header = true
    if (this.state.moderation) {
      if (this.state.moderation.approve) {
        return (
          <div className="questionContainer">
            <span className="buttonSpan">
              <p className="boxTitle">{t('header_new', { count: totalQuestions.length })}</p>
              <span className="spacer" />
              {totalQuestions.length ? (
                <button className="approveButton" onClick={() => this.approveAll(questions)}>
                  {t('mark_all_approved')}
                </button>
              ) : null}
            </span>
            <span className="questionBox">
              <ul className="listBox">
                {questions
                  .filter(task => task.new)
                  .map(task => {
                    const difference = doDateMath(task.dateCreate)
                    return (
                      <li className="cellBox" key={task.key}>
                        <CustomCell task={task} difference={difference} />
                        <CustomButtons
                          task={task}
                          header={header}
                          makeApprove={this.makeApprove}
                          blockQuestion={this.blockQuestion}
                          canPin={this.canPin}
                          makePin={this.makePin}
                          makeAnswer={this.makeAnswer}
                        />
                      </li>
                    )
                  })}
              </ul>
            </span>
          </div>
        )
      }

      return (
        <div className="questionContainer">
          <span className="buttonSpan">
            <p className="boxTitle">{t('header_new', { count: totalQuestions.length })}</p>
          </span>
          <span className="questionBox">
            <div className="modTextBox">
              <p className="bigModText">{t('moderation_off')}</p>
              <p className="smallModText">{t('moderation_off_desc_1')}</p>
              <p className="smallModText">{t('moderation_off_desc_2')}</p>
            </div>
          </span>
        </div>
      )
    }

    return (
      <div className="questionContainer">
        <span className="buttonSpan">
          <p className="boxTitle">{t('header_new', { count: totalQuestions.length })}</p>
        </span>
        <span className="questionBox">
          <div className="modTextBox">
            <p className="bigModText">{t('create_session')}</p>
            <p className="smallModText">{t('questions_below')}</p>
          </div>
        </span>
      </div>
    )
  }

  renderBlocked = questions => (
    <span className="questionBox2">
      {questions.filter(task => !task.new && task.block).length ? (
        <ul className="listBox">
          {questions
            .filter(task => task.block)
            .map(task => {
              const block = true
              const difference = doDateMath(task.dateCreate)
              return (
                <li className="cellBox" key={task.key}>
                  <CustomCell task={task} difference={difference} />
                  <CustomButtons
                    task={task}
                    block={block}
                    makeApprove={this.makeApprove}
                    blockQuestion={this.blockQuestion}
                    canPin={this.canPin}
                    makePin={this.makePin}
                    makeAnswer={this.makeAnswer}
                  />
                </li>
              )
            })}
        </ul>
      ) : (
        this.renderMessage(
          t('blocked_questions'),
          t('blocked_questions_desc_1'),
          t('blocked_questions_desc_2'),
        )
      )}
    </span>
  )

  renderAnswered = questions => {
    questions.sort((a, b) => b.lastEdit - a.lastEdit)
    return (
      <span className="questionBox2">
        {questions.filter(task => task.answered === true).length ? (
          <ul className="listBox">
            {questions
              .filter(task => task.answered)
              .map(task => {
                const difference = doDateMath(task.dateCreate)
                return (
                  <li className="cellBox" key={task.key}>
                    <CustomCell task={task} difference={difference} />
                    <CustomButtons
                      task={task}
                      answered
                      blockQuestion={this.blockQuestion}
                      makeApprove={this.makeApprove}
                    />
                  </li>
                )
              })}
          </ul>
        ) : (
          this.renderMessage(
            t('answered_questions'),
            t('answered_questions_desc_1'),
            t('answered_questions_desc_2'),
          )
        )}
      </span>
    )
  }

  renderPinned = questions => {
    questions = questions.filter(question => !question.answered && !question.block)
    if (this.state.session !== 'All') {
      return (
        <span>
          <SortableTable
            items={questions}
            origItems={this.state.questions}
            onDragEnd={this.onDragEnd}
            makeApprove={this.makeApprove}
            blockQuestion={this.blockQuestion}
            canPin={this.canPin}
            makePin={this.makePin}
            makeAnswer={this.makeAnswer}
          />
        </span>
      )
    }
    return questions.map(task => {
      const pin = true
      const approve = true
      const difference = doDateMath(task.dateCreate)
      const origQuestion = this.state.questions.find(question => question.key === task.key)
      task.score = origQuestion.score || 0
      return (
        <li className="cellBox" key={task.key}>
          <CustomCell task={task} difference={difference} />
          <CustomButtons
            task={task}
            pin={pin}
            approve={approve}
            makeApprove={this.makeApprove}
            blockQuestion={this.blockQuestion}
            canPin={this.canPin}
            makePin={this.makePin}
            makeAnswer={this.makeAnswer}
          />
        </li>
      )
    })
  }

  saveModerator = (host, sessions) => {
    const tokenRef = this.props.fbc.database.private.adminableUsersRef(host.id).child('adminToken')
    const sessionsRef = this.props.fbc.database.private
      .adminableUsersRef(host.id)
      .child('adminSessions')
    this.props.fbc.getLongLivedAdminToken().then(token => tokenRef.set(token))
    sessionsRef.set(sessions)
    this.setState({ showModal: false, selectedAdmin: null })
  }

  onAdminSelected = attendee => {
    const tokenRef = this.props.fbc.database.private
      .adminableUsersRef(attendee.id)
      .child('adminToken')
    this.setState()
    this.props.fbc.getLongLivedAdminToken().then(token => tokenRef.set(token))
  }

  onAdminDeselected = attendee => {
    const tokenRef = this.props.fbc.database.private
      .adminableUsersRef(attendee.id)
      .child('adminToken')
    const sessionsRef = this.props.fbc.database.private
      .adminableUsersRef(attendee.id)
      .child('adminSessions')
    tokenRef.remove()
    sessionsRef.remove()
    this.setState({ selectedAdmin: null })
  }

  onDragEnd = result => {
    let items = this.questionsInCurrentSession(this.state.pinnedQuestions)
    if (!result.destination) {
      return
    }
    items = reorder(this.props.fbc, items, result.source.index, result.destination.index)

    this.setState({ pinnedQuestions: items })
  }

  renderMessage = (m1, m2, m3) => (
    <div className="modTextBox">
      <p className="bigModText">{m1}</p>
      <p className="smallModText">{m2}</p>
      <p className="smallModText">{m3}</p>
    </div>
  )

  renderRight = (otherQuestions, pinnedQuestions) => {
    const { moderation, showBlock, showAnswer, headerStatus } = this.state
    const questions =
      headerStatus === 'popular' ? otherQuestions.sort((a, b) => b.score - a.score) : otherQuestions
    if (moderation) {
      if (!moderation.approve) {
        if (!showBlock && !showAnswer) {
          const approve = true
          return (
            <div className="questionContainer">
              <TableHeader
                questions={questions}
                handleClick={this.handleClick}
                handleAnswer={this.handleAnswer}
                answerAll={this.answerAll}
                status={headerStatus}
                handleApproved={this.handleApprovedRecent}
                handleApprovedPop={this.handleApprovedPop}
                modOff
              />
              <span className="questionBox2">
                {questions.filter(task => !task.block && !task.answered).length ? (
                  <ul className="listBox">
                    {this.renderPinned(pinnedQuestions)}
                    {questions
                      .filter(t => !t.block && !t.pin && !t.answered)
                      .map(task => {
                        const difference = doDateMath(task.dateCreate)
                        return (
                          <li className="cellBox" key={task.key}>
                            <CustomCell task={task} difference={difference} />
                            <CustomButtons
                              task={task}
                              approve={approve}
                              makeApprove={this.makeApprove}
                              blockQuestion={this.blockQuestion}
                              canPin={this.canPin}
                              makePin={this.makePin}
                              makeAnswer={this.makeAnswer}
                            />
                          </li>
                        )
                      })}
                  </ul>
                ) : (
                  this.renderMessage(
                    t('approved_questions'),
                    t('approved_questions_desc_1'),
                    t('approved_questions_desc_2'),
                  )
                )}
              </span>
            </div>
          )
        }

        return (
          <div className="questionContainer">
            <TableHeader
              questions={questions}
              handleClick={this.handleClick}
              handleAnswer={this.handleAnswer}
              answerAll={this.answerAll}
              status={headerStatus}
              handleApproved={this.handleApprovedRecent}
              handleApprovedPop={this.handleApprovedPop}
              modOff
            />
            {showAnswer ? this.renderAnswered(questions) : this.renderBlocked(questions)}
          </div>
        )
      }

      if (moderation.approve) {
        if (showBlock === false && showAnswer === false) {
          return (
            <div className="questionContainer">
              <TableHeader
                questions={questions}
                handleClick={this.handleClick}
                handleAnswer={this.handleAnswer}
                answerAll={this.answerAll}
                handleApproved={this.handleApprovedRecent}
                handleApprovedPop={this.handleApprovedPop}
                status={headerStatus}
              />
              <span className="questionBox2">
                {questions.filter(
                  task => !task.block && !task.answered && task.approve && !task.new,
                ).length ? (
                  <ul className="listBox">
                    {this.renderPinned(pinnedQuestions)}
                    {questions
                      .filter(t => t.approve && !t.block && !t.pin && !t.answered)
                      .map(task => (
                        <li className="cellBox" key={task.key}>
                          <CustomCell task={task} difference={doDateMath(task.dateCreate)} />
                          <CustomButtons
                            task={task}
                            approve
                            makeApprove={this.makeApprove}
                            blockQuestion={this.blockQuestion}
                            canPin={this.canPin}
                            makePin={this.makePin}
                            makeAnswer={this.makeAnswer}
                          />
                        </li>
                      ))}
                  </ul>
                ) : (
                  this.renderMessage(
                    t('approved_questions'),
                    t('approved_questions_desc_1'),
                    t('approved_questions_desc_2'),
                  )
                )}
              </span>
            </div>
          )
        }
        return (
          <div className="questionContainer">
            <TableHeader
              questions={questions}
              handleClick={this.handleClick}
              handleAnswer={this.handleAnswer}
              answerAll={this.answerAll}
              handleApproved={this.handleApprovedRecent}
              handleApprovedPop={this.handleApprovedPop}
              status={headerStatus}
            />
            {this.state.showAnswer ? this.renderAnswered(questions) : this.renderBlocked(questions)}
          </div>
        )
      }
    } else {
      return (
        <div className="questionContainer">
          <TableHeader
            questions={questions}
            handleClick={this.handleClick}
            handleAnswer={this.handleAnswer}
            answerAll={this.answerAll}
            handleApproved={this.handleApprovedRecent}
            handleApprovedPop={this.handleApprovedPop}
            status={headerStatus}
          />
          {this.renderBlocked(questions)}
        </div>
      )
    }
  }

  confirmEdit = (task, value) => {
    this.props.fbc.database.public
      .adminRef('sessions')
      .child(task.key)
      .update({ sessionName: value })
      .catch(error => {
        alert(t('retry_session'))
      })
  }

  confirmDelete = task => {
    const status = task.archive || false
    this.props.fbc.database.public
      .adminRef('sessions')
      .child(task.key)
      .update({ archive: !status })
  }

  handleClick = () => {
    this.setState({
      showAnswer: false,
      showBlock: true,
      headerStatus: 'blocked',
    })
  }

  handleAnswer = () => {
    this.setState({
      showAnswer: true,
      showBlock: false,
      headerStatus: 'answered',
    })
  }

  handleApprovedPop = () => {
    this.setState({
      showAnswer: false,
      showBlock: false,
      headerStatus: 'popular',
    })
  }

  handleApprovedRecent = () => {
    this.setState({
      showAnswer: false,
      showBlock: false,
      headerStatus: 'recent',
    })
  }

  openModal = () => {
    this.setState({ openVar: true, modalColor: '#FAFAFA', message: 'enter_session_name' })
  }

  closeModal = () => {
    this.setState({ openVar: false })
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSessionChange = selected => {
    if (selected) {
      const currentSession = this.state.sessions.find(session => session.key === selected.value)
      this.setState({ session: selected.value, currentSession })
    }
  }

  clearValue = e => {
    this.select.setInputValue('')
    this.setState({ session: 'All' })
  }

  hideSection = section => {
    const currentSection = `hide${section}`
    const currentState = this.state[currentSection]
    this.setState({ [currentSection]: !currentState })
  }

  newSession = newSession => {
    if (!this.state.moderation) {
      this.props.fbc.database.public.adminRef('moderators').push({ approve: false })
    }
    this.props.fbc.database.public
      .adminRef('sessions')
      .push({ sessionName: newSession })
      .catch(error => {
        alert(t('retry_session'))
      })
  }

  onApprove = () => {
    if (!this.state.moderation) {
      this.props.fbc.database.public.adminRef('moderators').push({ approve: true })
    } else {
      const mod = this.state.moderation
      this.props.fbc.database.public
        .adminRef('moderators')
        .child(mod.key)
        .update({ approve: true })
    }
  }

  offApprove = () => {
    const mod = this.state.moderation
    this.props.fbc.database.public
      .adminRef('moderators')
      .child(mod.key)
      .update({ approve: false })
  }

  onAnom = () => {
    // On initial launching of the app this fbc object would not exist. In that case the default is to be on. On first action we would set the object to the expected state and from there use update.
    if (this.state.anom.length === 0) {
      this.props.fbc.database.public.adminRef('askAnom').push({ allow: true })
    } else {
      const anom = this.state.anom[0]
      this.props.fbc.database.public
        .adminRef('askAnom')
        .child(anom.key)
        .update({ allow: true })
    }
  }

  offAnom = () => {
    // Same logic as onAnom
    if (this.state.anom.length === 0) {
      this.props.fbc.database.public.adminRef('askAnom').push({ allow: false })
    } else {
      const anom = this.state.anom[0]
      this.props.fbc.database.public
        .adminRef('askAnom')
        .child(anom.key)
        .update({ allow: false })
    }
  }

  makeApprove = question => {
    const time = new Date().getTime()
    this.props.fbc.database.public
      .allRef('questions')
      .child(question.session)
      .child(question.key)
      .update({
        approve: true,
        block: false,
        new: false,
        lastEdit: time,
        answered: false,
        pin: false,
      })
  }

  canPin = () => {
    if (this.state.session === 'All') return false
    const pinned = this.state.pinnedQuestions.filter(
      question =>
        question.answered === false &&
        question.block === false &&
        this.state.session === question.session,
    )
    return pinned.length < 5
  }

  makePin = question => {
    const pinned = this.state.pinnedQuestions
    const order = pinned.length
    if (this.canPin()) {
      this.props.fbc.database.public
        .allRef('questions')
        .child(question.session)
        .child(question.key)
        .update({ pin: true, approve: true, block: false, new: false, order })
    }
  }

  makeAnswer = question => {
    const time = new Date().getTime()
    this.props.fbc.database.public
      .allRef('questions')
      .child(question.session)
      .child(question.key)
      .update({ answered: true, block: false, new: false, pin: false, lastEdit: time })
  }

  blockQuestion = question => {
    this.props.fbc.database.public
      .allRef('questions')
      .child(question.session)
      .child(question.key)
      .update({ block: true, answered: false, approve: false, new: false, pin: false })
  }

  approveAll = questions => {
    if (questions.length) {
      questions.forEach(question => {
        if (question.new) {
          this.props.fbc.database.public
            .allRef('questions')
            .child(question.session)
            .child(question.key)
            .update({ new: false, approve: true })
        }
      })
    }
  }

  answerAll = () => {
    const { questions } = this.state
    let modOn = false
    if (this.state.moderation) {
      if (this.state.moderation.approve) {
        modOn = true
      }
    }
    if (questions) {
      questions.forEach(question => {
        if (modOn) {
          if (question.block !== true && question.approve) {
            this.props.fbc.database.public
              .allRef('questions')
              .child(question.session)
              .child(question.key)
              .update({ answered: true, new: false, pin: false })
          }
        } else if (question.block !== true) {
          this.props.fbc.database.public
            .allRef('questions')
            .child(question.session)
            .child(question.key)
            .update({ answered: true, new: false, pin: false })
        }
      })
    }
  }

  onBackgroundUrlChange = e => this.backgroundUrlRef().set(e.target.value)

  launchPresentation = () => {
    this.setState({ launchDisabled: true })
    setTimeout(() => this.setState({ launchDisabled: false }), 2000)
    openTab(this.bigScreenUrl())
  }

  getSession = () => {
    const session = this.state.sessions.find(item => item.key === this.state.session)
    return session.sessionName
  }

  bigScreenUrl = () =>
    this.state.longLivedToken
      ? `?page=bigScreen&session=${encodeURIComponent(
          this.state.session,
        )}&sessionName=${encodeURIComponent(this.getSession())}&token=${encodeURIComponent(
          this.state.longLivedToken,
        )}`
      : null
}

function questionForCsv(q) {
  const Status = findStatus(q)
  return {
    Question: q.text,
    Status,
    Session: q.sessionName,
    First_Name: q.anom ? 'Anonymous' : q.firstName,
    Last_Name: q.anom ? 'Anonymous' : q.lastName,
    Email: q.anom ? 'N/A' : q.email,
    Votes: q.score,
  }
}

function findStatus(item) {
  if (item.block) return 'Blocked'
  if (item.answered && !item.block) return 'Answered'
  if (item.approve && !item.answered && !item.block) return 'Approved'
  return 'Pending'
}

const doDateMath = date => ` ${moment(date).fromNow()}`
