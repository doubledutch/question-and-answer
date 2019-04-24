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

const TableHeader = ({
  questions,
  status,
  modOff,
  handleApproved,
  handleApprovedPop,
  handleClick,
  handleAnswer,
}) => {
  const newQuestions = questions
  const approveQuestions = modOff
    ? newQuestions.filter(item => !item.block && !item.answered)
    : newQuestions.filter(item => !item.block && !item.answered)
  const blockedQuestions = modOff
    ? newQuestions.filter(item => item.block && !item.new)
    : newQuestions.filter(item => item.block && !item.new && !item.answered)
  const answeredQuestions = newQuestions.filter(item => item.answered)

  return (
    <span className="buttonSpan2">
      <button
        className={status === 'recent' ? 'listButton' : 'listButton2'}
        onClick={handleApproved}
      >
        {t('header_approved_recent', { count: approveQuestions.length })}
      </button>
      <button
        className={status === 'popular' ? 'listButton' : 'listButton2'}
        onClick={handleApprovedPop}
      >
        {t('header_approved_pop', { count: approveQuestions.length })}
      </button>
      <button className={status === 'blocked' ? 'listButton' : 'listButton2'} onClick={handleClick}>
        {t('header_blocked', { count: blockedQuestions.length })}
      </button>
      <button
        className={status === 'answered' ? 'listButton' : 'listButton2'}
        onClick={handleAnswer}
      >
        {t('header_answered', { count: answeredQuestions.length })}
      </button>
      <span className="spacer" />
    </span>
  )
}

export default memo(TableHeader)
