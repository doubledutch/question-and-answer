import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'

export default class FilterSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sortList: ['New', 'Approved', 'Blocked', 'Answered'],
      sortListUser: ['Popular', 'Answered', 'Recent'],
      search: false,
      originalSort: '',
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this.topicsHeader()}
        {this.sortTable()}
      </View>
    )
  }

  sortTable = () => {
    const tableData = this.props.openAdminHeader ? this.state.sortList : this.state.sortListUser
    return (
      <View style={s.table}>
        {tableData.map((item, i) => (
          <TouchableOpacity style={s.row} key={i} onPress={() => this.onSortChange(item)}>
            <Text
              style={item === this.props.currentSort ? [s.rowText, this.primaryColor()] : s.rowText}
            >
              {item} ({this.findQuestionTotals(item)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  topicsHeader = () => (
    <View style={s.buttonContainer}>
      <TouchableOpacity onPress={this.revertSort}>
        <Text style={[s.closeButton, this.primaryColor()]}>X</Text>
      </TouchableOpacity>
      <Text style={s.title}>Lists</Text>
      <TouchableOpacity onPress={() => this.props.handleChange('showFilterSelect', false)}>
        <Text style={[s.closeButton, this.primaryColor()]}>Save</Text>
      </TouchableOpacity>
    </View>
  )

  revertSort = () => {
    const originalSort = this.state.originalSort ? this.state.originalSort : this.props.currentSort
    this.props.handleChange('showFilterSelect', false)
    this.props.handleChange('currentSort', originalSort)
    if (originalSort === 'Recent') {
      this.props.findOrderDate()
    } else {
      this.props.findOrder()
    }
  }

  onSortChange = item => {
    if (!this.state.originalSort) this.setState({ originalSort: this.props.currentSort })
    if (this.props.currentSort !== item) {
      if (item === 'Recent') this.props.findOrderDate()
      else this.props.findOrder()
      this.props.handleChange('currentSort', item)
    }
  }

  findQuestionTotals = sort => {
    const { questions, session } = this.props
    let orderedQuestions = questions
    switch (sort) {
      case 'Answered':
        orderedQuestions = questions.filter(item => item.answered && item.session === session.key)
        return orderedQuestions.length
      case 'Blocked':
        orderedQuestions = questions.filter(
          item => item.block && item.new === false && item.session === session.key,
        )
        return orderedQuestions.length
      case 'New':
        orderedQuestions = questions.filter(
          item => item.approve === false && item.new && item.session === session.key,
        )
        return orderedQuestions.length
      default:
        orderedQuestions = questions.filter(
          item =>
            item.block === false &&
            item.answered === false &&
            item.approve &&
            item.new === false &&
            item.session === session.key,
        )
        return orderedQuestions.length
    }
  }

  primaryColor = () => ({ color: this.props.primaryColor })
}

const s = StyleSheet.create({
  table: {
    flexDirection: 'column',
  },
  row: {
    paddingTop: 20,
    paddingBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },
  rowText: {
    fontSize: 20,
    color: '#404040',
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },
  title: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    color: '#9B9B9B',
  },
  closeButton: {
    marginLeft: 5,
    padding: 15,
  },
})
