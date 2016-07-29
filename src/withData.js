import React, { Component, PropTypes } from "react"
import { keys, isFunction } from "lodash"
import { connect } from "react-redux"

const mergeProps = mapStateToRequests => (stateProps, dispatchProps, ownProps) => {
  return {
    ...ownProps,
    ...dispatchProps,
    __requests: mapStateToRequests(stateProps, dispatchProps, ownProps)
  }
}

const withData = (mapDispatchToProps, mapStateToRequests, LoadingComponent = false) => WrappedComponent => {
  class WithData extends Component {
    static displayName = `withData(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

    static propTypes = {
      __requests: PropTypes.object
    }

    state = {
      loading: []
    }

    componentWillMount() {
      this.checkData()
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps === this.props) return

      this.checkData(nextProps)
    }

    checkData(props = this.props) {
      const callbacks = props.__requests
          , loadingKeys = keys(callbacks).filter(k => isFunction(callbacks[k]))

      loadingKeys.forEach(k => !~this.state.loading.indexOf(k) && callbacks[k]())

      this.setState({ loading: loadingKeys })
    }

    render() {
      if (this.state.loading.length === 0) {
        const { __requests: _, ...props } = this.props
        return React.Children.only(<WrappedComponent {...props} />)
      } else {
        return LoadingComponent && React.Children.only(<LoadingComponent loading={this.state.loading}/>)
      }
    }
  }

  return connect(state => state, mapDispatchToProps, mergeProps(mapStateToRequests))(WithData)
}

export default withData