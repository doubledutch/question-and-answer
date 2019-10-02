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

import React, { memo } from 'react'
import { translate as t } from '@doubledutch/admin-client'
import Select from 'react-select'
import ModIcon from './ModIcon'
import PresentationDriver from './PresentationDriver'

const ContainerHeader = ({
  handleSessionChange,
  disabled,
  moderation,
  offApprove,
  onApprove,
  session,
  fbc,
  answerAll,
  launchPresentation,
  launchDisabled,
  bigScreenUrl,
  currentSession,
  questions,
  sessions,
}) => {
  const sample = { value: t('all'), label: t('all_sessions'), className: 'dropdownText' }
  const localSessions = []
  const sessionName = currentSession
    ? { value: '', label: currentSession.sessionName || '', className: 'dropdownText' }
    : sample
  localSessions.push(sample)
  sessions.forEach(session =>
    localSessions.push(
      Object.assign(
        {},
        { value: session.key, label: session.sessionName, className: 'dropdownText' },
      ),
    ),
  )

  const approveQuestions = questions.filter(item => !item.block && !item.answered && item.approve)

  return (
    <span className="buttonSpan">
      <h2 className="noPadding">{t('moderation')}</h2>
      <Select
        className="dropdownMenu"
        name="session"
        value={sessionName}
        onSelectResetsInput={false}
        onBlurResetsInput
        onChange={handleSessionChange}
        clearable={false}
        options={localSessions}
        disabled={disabled}
      />
      <p className="boxTitleBoldMargin">{t('moderation')}: </p>
      <ModIcon moderation={moderation} offApprove={offApprove} onApprove={onApprove} />
      {session === 'All' ? (
        <span className="buttonSpanMargin">
          <div style={{ flex: 1 }} />
          <button className="overlay-button-opaque" disabled>
            {t('launch_tab')}
          </button>
        </span>
      ) : (
        <span className="buttonSpanMargin">
          <PresentationDriver fbc={fbc} session={session} />
          <button
            className="overlay-button"
            onClick={launchPresentation}
            disabled={launchDisabled || !bigScreenUrl()}
          >
            {t('launch_tab')}
          </button>
          <button
            className={approveQuestions.length === 0 ? 'overlay-button-opaque' : 'overlay-button'}
            disabled={approveQuestions.length === 0}
            onClick={answerAll}
          >
            {t('mark_all_answered')}
          </button>
        </span>
      )}
    </span>
  )
}

export default memo(ContainerHeader)
