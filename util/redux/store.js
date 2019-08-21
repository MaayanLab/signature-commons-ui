import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from 'redux-saga'
import rootReducer from "./reducers";
import rootSaga from '../sagas'

const storeEnhancers = (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const sagaMiddleware = createSagaMiddleware()
const middleware = [sagaMiddleware]

// Add the Redux dev tools and middleware code together
const enhancers = storeEnhancers(
  applyMiddleware(...middleware)
);

const store = createStore(
  rootReducer,
  enhancers,
);

sagaMiddleware.run(rootSaga);
export default store;