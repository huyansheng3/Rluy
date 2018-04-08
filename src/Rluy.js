import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { fork, take, select, call, all, put } from 'redux-saga/effects'

class Rluy {
    constructor() {
        this.sagaMiddleware = {}
        this.appReducers = {}
        this.actionStategy = []
        this.effects = {}
        this.JsxElement = {}
        this.errorFn = void 666
    }
    onError(fn) {
        this.errorFn = fn
    }

    *rootWatcher() {
        while (1) {
            const { type, ...others } = yield take(this.actionStategy)
            const fn = this.effects[type]
            if (fn !== void 666) {
                try {
                    yield call(fn, { fork, take, select, call, put }, others)
                } catch (e) {
                    this.errorFn(e)
                }
            }
        }
    }
    *rootSaga() {
        yield all([fork(this.rootWatcher.bind(this))])
    }

    init() {
        this.sagaMiddleware = createSagaMiddleware(this.rootSaga)
    }
    model(Module) {
        const model = Module.default
        const namespace = model.namespace
        if (namespace === void 666) {
            throw new SyntaxError('module needs a namespace')
        }
        if (this.appReducers[namespace]) {
            throw new SyntaxError(`module for name '${namespace}' exist`)
        }

        Object.keys(model.effects).forEach(key => {
            this.actionStategy.push(key)
            this.effects[key] = model.effects[key]
        })

        const modelState = model.state || {}
        const reducer = (state = modelState, { type, payload }) => {
            const func = model.reducer[type]
            if (func) {
                return func(state, { type, payload })
            }
            return state
        }
        this.appReducers[namespace] = reducer
    }

    injectRun(JsxElement) {
        const store = createStore(
            combineReducers(this.appReducers),
            applyMiddleware(this.sagaMiddleware)
        )
        this.sagaMiddleware.run(this.rootSaga.bind(this))

        return <Provider store={store}>{JsxElement}</Provider>
    }

    router(RouterModel) {
        const _RouterModel = RouterModel.default
        this.JsxElement =
            typeof _RouterModel === 'function' ? _RouterModel() : _RouterModel
    }

    run(DOMNode) {
        const store = createStore(
            combineReducers(this.appReducers),
            applyMiddleware(this.sagaMiddleware)
        )
        this.sagaMiddleware.run(this.rootSaga.bind(this))

        ReactDOM.render(
            <Provider store={store}>{this.JsxElement}</Provider>,
            DOMNode
        )
    }
}

export default new Rluy()
