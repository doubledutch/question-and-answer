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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import moment from 'moment'
import { translate as t } from '@doubledutch/admin-client'
import CustomCell from './cell'
import CustomButtons from './buttons'

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

const getItemStyle = (draggableStyle, isDragging) => ({
  userSelect: 'none',
  display: 'flex',
  flexFlow: 'nowrap',
  margin: `0px`,
  width: '100%',
  background: isDragging ? 'white' : 'white',
  ...draggableStyle,
})
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'white' : 'white',
})

class SortableTable extends Component {
  constructor(props) {
    super(props)
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    const items = reorder(this.state.items, result.source.index, result.destination.index)

    this.setState({
      items,
    })
  }

  renderCell = (provided, snapshot, task, i, pin, approve, difference) => (
    <Draggable key={i} draggableId={i}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getItemStyle(provided.draggableStyle, snapshot.isDragging)}
          {...provided.dragHandleProps}
        >
          <img
            className="sortIcon"
            data-tip={t('reorder_pinned')}
            src={require('./icons/reordericon.png')}
            alt={t('reorder')}
          />
          <CustomCell task={task} difference={difference} />
          <CustomButtons
            task={task}
            pin={pin}
            approve={approve}
            makeApprove={this.props.makeApprove}
            blockQuestion={this.props.blockQuestion}
            canPin={this.props.canPin}
            makePin={this.props.makePin}
            makeAnswer={this.props.makeAnswer}
          />
        </div>
      )}
    </Draggable>
  )

  showOrder = () => {
    const items = this.props.items
    return (
      <div className="listBox">
        <DragDropContext onDragEnd={this.props.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                {items.map((task, i) => {
                  const origQuestion = this.props.origItems.find(
                    question => question.key === task.key,
                  )
                  task.score = origQuestion.score || 0
                  const pin = true
                  const approve = true
                  const difference = doDateMath(task.dateCreate)
                  return (
                    <li className="cellBox" key={task.key}>
                      {this.renderCell(provided, snapshot, task, i, pin, approve, difference)}
                    </li>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }

  render() {
    return <div className="outerContainer">{this.showOrder()}</div>
  }
}

const doDateMath = date => ` ${moment(date).fromNow()}`

export default SortableTable
