import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import lodable from '@loadable/component';

const Login = lodable(() => import('@pages/Login'));
const SignUp = lodable(() => import('@pages/SignUp'));

export default function App() {
  return (
    <Switch>
      <Redirect exact path='/' to='/login' />
      <Route path='/login' component={Login} />
      <Route path='/signup' component={SignUp} />
    </Switch>
  );
}
