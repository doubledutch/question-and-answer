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
import { translate as t } from '@doubledutch/admin-client'

export default class ModIcon extends Component {
  render() {
    const { moderation } = this.props
    if (moderation) {
      if (moderation.approve) {
        return (
          <span className="modIcons">
            <button className="modButtonAbs">{t('on')}</button>
            <button className="modButton50Left" onClick={this.props.offApprove}>
              {t('off')}
            </button>
          </span>
        )
      }
    }

    return (
      <span className="modIcons">
        <button className="modButton50" onClick={this.props.onApprove}>
          {t('on')}
        </button>
        <button className="modButtonLeft">{t('off')}</button>
      </span>
    )
  }
}
