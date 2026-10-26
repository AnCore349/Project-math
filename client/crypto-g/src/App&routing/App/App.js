import React, {useEffect} from 'react';
import {MainComponent} from './App.style'
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import {NoMatChUrl} from "../../pages/404/404";
import {Redirect} from "react-router";
import GlobalStore from "../../store/GlobalStore/global.store";
import {observer} from "mobx-react-lite";
import {MainPage} from "../../pages/mainPage/mainPage";
import {UserPage} from "../../pages/userPage/userPage";
import JwtCheckingStore from "../../store/jwtChecking/jwtChecking.store";
import {Loader} from "../../Components/common/Loader/Loader";

const App = observer( () => {
    useEffect(() => {
        JwtCheckingStore.restoreSession()
    }, [])

    const isAuthed = !!GlobalStore.globalStorageForAuth?.nickName
    if (!JwtCheckingStore.isInitialized || JwtCheckingStore.isRestoring) return <Loader />
    if (JwtCheckingStore.error) {
        return (
            <MainComponent>
                <div role="alert">
                    <p>{JwtCheckingStore.error}</p>
                    <button type="button" onClick={() => JwtCheckingStore.restoreSession()}>
                        Повторить
                    </button>
                </div>
            </MainComponent>
        )
    }

    return (
      <Router>
          <MainComponent>
              <Switch>
                  <Route exact path="/user"  >
                      {!isAuthed ? <Redirect to="/" /> : <UserPage /> }
                  </Route>
                  <Route path="/user/*" component={NoMatChUrl} />
                  <Route path="/" >
                      {isAuthed ? <Redirect to="/user" /> : <MainPage />}
                  </Route>
                  {/*<Route path="/forgotPassword">*/}
                  {/*    <ForgotPasswordPage />*/}
                  {/*</Route>*/}
              </Switch>
          </MainComponent>
      </Router>
  );
})

export default App;