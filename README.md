# redux-withdata

> higher-order react component that manages data fetching with redux
  
> A central place to decide what data needs to be fetched for a component and what not.  
	Does not render before everything is loaded.

[![npm version](https://img.shields.io/npm/v/redux-withdata.svg?style=flat-square)](https://www.npmjs.com/package/redux-withdata)

This is WIP and needs tests and more detailed examples. Already seems to do fine in production, though :grin:

## Installation

requires react >= 0.14. You also need to install `react-redux@4.x` if you haven’t already.

```
$ npm i -S redux-withdata
```

## Usage

Just use [redux](https://github.com/reactjs/redux) like you would usually do. Define conditions for executing actions using the `withData` HOC. Use [`compose`](http://redux.js.org/docs/api/compose.html) from redux together with [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) from react-redux. The original component will not be rendered before the object returned from `mapStateToRequests` does not have any callbacks as values anymore.

```js
import { compose } from "redux"
import { connect } from "react-redux"
import withData from "redux-withdata"

class TodoApp extends React.Component {
  // …
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

function mapStateToRequests(stateProps, dispatchProps, ownProps) {
  // store state -> action creator callbacks
  // returned keys are arbitrary and passed to LoadingComponent as an array (example will follow)
  // only values that are callbacks will be executed
  // if no callbacks are left we assume that loading has finished and render the original component
  
  // roll your own conditions below
  // in this example, the reducer should set `loaded` to true upon successful fetching
  return {
    // do not execute the action creator here, just pass it as a callback
    // this expression is false if `loaded` is false.
    todos: !stateProps.todos.loaded && dispatchProps.actions.requestTodos
  }
}

function mapStateToProps(state) {
  // our "original" component is the `connect()`ed component
  // it won't be rendered and this won't get called until the data has loaded and all conditions have met
  // state.todos.byId has already been populated and we can do some transforms
  return {
    todos: _.mapValues(state.todos.byId, v => /* ... */)
  }
}

compose(withData(mapDispatchToProps, mapStateToRequests), connect(mapStateToProps))(TodoApp)
```

## API

### `withData(mapDispatchToProps, mapStateToRequests, [LoadingComponent])`

#### Arguments

##### **`mapDispatchToProps(dispatch, [ownProps])`** (object or function)
internally, this is passed directly to [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) and works just the same. check out the react-redux api for more details.

##### **`mapStateToRequests(stateProps, dispatchProps, ownProps)`** (function)
This function is similar to [`mergeProps`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options). You may use data from the store (`stateProps`), action props that you defined in `mapDispatchToProps` (`dispatchProps`) and props passed directly to the HOC (`ownProps`). This is the place to define conditions for actions to be executed in order to satisfy those same conditions after the store has been updated accordingly.

Return an object with arbitrary keys and values. All values that are callbacks are assumed to be action creators that are already bound to `dispatch`, other values are ignored.

##### **[`LoadingComponent`]** (react component)
If passed, this component will be used to create a „loading“ view. All currently loading keys are passed to the component in an array through a `loading` prop. You may use this prop to display a detailed loading status.