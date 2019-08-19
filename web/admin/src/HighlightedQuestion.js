import React, { useState, useEffect } from 'react'
import './App.css'
import { Avatar } from '@doubledutch/react-components'
import client, { translate as t } from '@doubledutch/admin-client'

const HighlightedQuestion = ({ session, questions }) => {
  console.log(session, questions)
  const pinnedQuestions = questions
    .filter(
      item =>
        item.pin === true &&
        item.approve &&
        item.block === false &&
        item.answered === false &&
        item.session === session,
    )
    .sort((a, b) => a.order - b.order)
  const otherQuestions = questions
    .filter(
      item =>
        item.pin === false &&
        item.approve &&
        item.block === false &&
        item.answered === false &&
        item.session === session,
    )
    .sort((a, b) => b.score - a.score)
  const newQuestions = pinnedQuestions.concat(otherQuestions)
  console.log(newQuestions)
  const highlightedQuestion = newQuestions.length ? newQuestions[0] : null
  if (highlightedQuestion)
    return (
      <div className="single-box">
        <div className="box-content" key={highlightedQuestion.key}>
          <p className="question-title">"{highlightedQuestion.text}"</p>
          {!highlightedQuestion.anom ? (
            <div className="cellName">
              <Avatar user={highlightedQuestion.creator} size={25} />
              <p className="name">
                {highlightedQuestion.creator.firstName} {highlightedQuestion.creator.lastName}
              </p>
              <img className="box-icon" src={require('./icons/Inactive.png')} alt="inactive" />
              <p className="vote">{highlightedQuestion.score}</p>
            </div>
          ) : (
            <div className="cellName">
              <p className="name">-Anonymous</p>
              <img className="box-icon" src={require('./icons/Inactive.png')} alt="inactive" />
              <p className="vote">{highlightedQuestion.score}</p>
            </div>
          )}
        </div>
      </div>
    )
  return (
    <div className="single-box">
      <div className="empty-box-content">
        <p className="question-title">No Questions Available</p>
      </div>
    </div>
  )
}

export default HighlightedQuestion
