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
import './App.css'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CustomCell from './cell'
import CustomButtons from './buttons';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (draggableStyle, isDragging) => ({
  userSelect: 'none',
  display: 'flex',
  flexFlow: "nowrap",
  margin: `0px`,
  width: '100%',
  background: isDragging ? 'white' : 'white',
  ...draggableStyle,
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'white' : 'white',
});

class SortableTable extends Component {
  constructor(props) {
    super(props)
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items,
    }); 
  } 
  
  renderCell = (provided, snapshot, task, i, pin, approve, difference) => {
    return (
      <Draggable key={i} draggableId={i}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getItemStyle(
              provided.draggableStyle,
              snapshot.isDragging
              )}
            {...provided.dragHandleProps}
          >
            <img className='sortIcon' data-tip="Use to sort your pinned questions" src={require('./icons/reordericon.png')} alt="block"/> 
            <CustomCell
            task = {task}
            difference = {difference}
            />
            <CustomButtons
            task = {task}
            pin = {pin}
            approve = {approve}
            makeApprove = {this.props.makeApprove}
            blockQuestion = {this.props.blockQuestion}
            canPin = {this.props.canPin}
            makePin = {this.props.makePin}
            makeAnswer = {this.props.makeAnswer}
            />        
          </div>
        )}
      </Draggable>
    )
  }

  showOrder = () => {
    const items = this.props.items
    return (
      <div className="listBox">
        <DragDropContext onDragEnd={this.props.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              { items.map((task, i) => {
                var origQuestion = this.props.origItems.find(question => question.key === task.key)
                task.score = origQuestion.score || 0
                var pin = true
                var approve = true
                var difference = this.doDateMath(task.dateCreate, this.props.time)
                return (
                  <li className='cellBox' key={task.key}>
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

  render(){
    return (
      <div className="outerContainer">
        {this.showOrder()}
      </div>
    )
  }

  doDateMath = (date, time) => {
    const minutesAgo = Math.floor((time - date) / (1000*60))
    if (minutesAgo < 60) {
      if (minutesAgo === 1) {
        return minutesAgo + " minute ago"
      }
      if (minutesAgo > 1) {
        return minutesAgo + " minutes ago"
      }
      else {
        return "0 minutes ago"
      }
    } else if (minutesAgo > 60 && minutesAgo < 1440) {
      const hoursAgo = Math.floor(minutesAgo / 60) 
      if (hoursAgo === 1) {
        return hoursAgo + " hour ago"
      }
      if (hoursAgo > 1) {
        return hoursAgo + " hours ago"
      }
    } else if (minutesAgo >= 1440) {
      const daysAgo = Math.floor(minutesAgo / 1440) 
      if (daysAgo === 1) {
        return daysAgo + " day ago"
      }
      if (daysAgo > 1) {
        return daysAgo + " days ago"
      }
    }
  }

}


export default SortableTable